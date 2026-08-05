import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Order, PaymentStatus } from '@prisma/client';
import { BASE_ENTITY_DEFAULTS } from '../../../common/entities/base.entity';
import { BaseService } from '../../../common/base/base.service';
import { EmailService } from '../../../common/email/email.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { utcNow } from '../../../common/utility/date.utility';
import { CustomerService } from '../customer/customer.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderRepo } from './order.repo';
import { toOrderConfirmationMailData } from './utility/order-confirmation-mail.mapper';
import { createOrderNumber } from './utility/order-number.utility';
import { computeLineTotal, computeOrderTotals } from './utility/order-totals.utility';

@Injectable()
export class OrderService extends BaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderRepo: OrderRepo,
    private readonly customerService: CustomerService,
    private readonly emailService: EmailService,
  ) {
    super(OrderService.name);
  }

  async create(payload: CreateOrderDto): Promise<Order> {
    if (payload.idempotencyKey) {
      const existing = await this.prisma.order.findFirst({
        where: {
          idempotencyKey: payload.idempotencyKey,
          isDeleted: false,
        },
        include: { items: true },
      });
      if (existing) return existing;
    }

    const customer = await this.customerService.findOrCreateByEmail({
      email: payload.customerEmail,
      phoneNumber: payload.shippingPhone,
      name: payload.shippingFullName,
    });

    const stamp = utcNow();
    const items = payload.items.map((item) => ({
      variantId: item.variantId,
      productSlug: item.productSlug,
      productName: item.productName,
      variantSku: item.variantSku,
      size: item.size,
      color: item.color,
      unitPriceInPaise: item.unitPriceInPaise,
      quantity: item.quantity,
      lineTotalInPaise: computeLineTotal(item),
      ...BASE_ENTITY_DEFAULTS,
      createdAt: stamp,
      updatedAt: stamp,
    }));
    const { subtotalInPaise, shippingInPaise, totalInPaise } =
      computeOrderTotals(items);

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of payload.items) {
        if (!item.variantId) {
          throw new BadRequestException(
            `Missing variant for ${item.productName}`,
          );
        }
        const reserved = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            isDeleted: false,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
            updatedAt: stamp,
          },
        });
        if (reserved.count === 0) {
          throw new BadRequestException(
            `${item.productName} (${item.size} / ${item.color}) is out of stock`,
          );
        }
      }

      return tx.order.create({
        data: {
          orderNumber: createOrderNumber(),
          customerId: customer.id,
          customerEmail: payload.customerEmail,
          shippingFullName: payload.shippingFullName,
          shippingPhone: payload.shippingPhone,
          shippingLine1: payload.shippingLine1,
          shippingLine2: payload.shippingLine2,
          shippingCity: payload.shippingCity,
          shippingState: payload.shippingState,
          shippingPostalCode: payload.shippingPostalCode,
          shippingCountry: payload.shippingCountry ?? 'IN',
          paymentMethod: payload.paymentMethod,
          paymentDetails: payload.paymentDetails,
          paymentStatus: PaymentStatus.PENDING,
          subtotalInPaise,
          shippingInPaise,
          totalInPaise,
          idempotencyKey: payload.idempotencyKey,
          ...BASE_ENTITY_DEFAULTS,
          createdAt: stamp,
          updatedAt: stamp,
          items: { create: items },
        },
        include: { items: { where: { isDeleted: false } } },
      });
    });

    await this.queueOrderConfirmation(order);
    return order;
  }

  private async queueOrderConfirmation(
    order: Order & {
      items: Array<{
        productName: string;
        size: string;
        color: string;
        quantity: number;
        unitPriceInPaise: number;
        lineTotalInPaise: number;
      }>;
    },
  ): Promise<void> {
    if (!order.customerEmail) return;
    const storeUrl =
      process.env.STOREFRONT_ORIGIN?.replace(/\/$/, '') ||
      'http://localhost:4001';
    try {
      await this.emailService.sendOrderConfirmation(
        toOrderConfirmationMailData(order, storeUrl),
      );
    } catch (error) {
      this.logger.error(
        `Order confirmation email threw for ${order.orderNumber}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async findAll(pageQuery: {
    page: number;
    limit: number;
    skip: number;
    q?: string;
    from?: string;
    to?: string;
  }) {
    return this.orderRepo.findAllWithItems(pageQuery);
  }

  async exportAll(filters: { q?: string; from?: string; to?: string }) {
    const orders = await this.orderRepo.findAllForExport(filters);
    return {
      items: orders.map((order) => ({
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentDetails: order.paymentDetails,
        customerEmail: order.customerEmail,
        shippingFullName: order.shippingFullName,
        shippingPhone: order.shippingPhone,
        shippingLine1: order.shippingLine1,
        shippingLine2: order.shippingLine2,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,
        shippingPostalCode: order.shippingPostalCode,
        subtotalInPaise: order.subtotalInPaise,
        shippingInPaise: order.shippingInPaise,
        totalInPaise: order.totalInPaise,
        itemCount: order.items.length,
        itemsSummary: order.items
          .map(
            (item) =>
              `${item.productName} (${item.color}/${item.size}) x${item.quantity}`,
          )
          .join('; '),
      })),
      total: orders.length,
    };
  }

  async findById(payload: { id: string }) {
    const order = await this.orderRepo.findByIdWithItems(payload.id);
    if (!order) throw new NotFoundException(`Order ${payload.id} not found`);
    return order;
  }

  async update(payload: { id: string; data: UpdateOrderDto }) {
    await this.findById({ id: payload.id });
    return this.orderRepo.update(payload.id, payload.data);
  }

  async softDelete(payload: { id: string }) {
    await this.findById(payload);
    return this.orderRepo.softDelete(payload.id);
  }

  async summary(filters: { from?: string; to?: string } = {}) {
    const where = this.orderRepo.buildListWhere(filters);
    const [orders, revenue, pending] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where,
        _sum: { totalInPaise: true },
      }),
      this.prisma.order.count({
        where: { ...where, paymentStatus: PaymentStatus.PENDING },
      }),
    ]);
    return {
      orders,
      pending,
      revenueInPaise: revenue._sum.totalInPaise ?? 0,
      from: filters.from ?? null,
      to: filters.to ?? null,
    };
  }
}
