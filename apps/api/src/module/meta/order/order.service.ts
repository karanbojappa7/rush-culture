import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Order, PaymentStatus } from '@prisma/client';
import { BASE_ENTITY_DEFAULTS } from '../../../common/entities/base.entity';
import { BaseService } from '../../../common/base/base.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { utcNow } from '../../../common/utility/date.utility';
import { CustomerService } from '../customer/customer.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderRepo } from './order.repo';
import { createOrderNumber } from './utility/order-number.utility';
import { computeLineTotal, computeOrderTotals } from './utility/order-totals.utility';

@Injectable()
export class OrderService extends BaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderRepo: OrderRepo,
    private readonly customerService: CustomerService,
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

    return this.prisma.$transaction(async (tx) => {
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
  }

  async findAll(pageQuery: {
    page: number;
    limit: number;
    skip: number;
    q?: string;
  }) {
    return this.orderRepo.findAllWithItems(pageQuery);
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

  async summary() {
    const where = { isDeleted: false };
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
    };
  }
}
