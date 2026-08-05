import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CustomerQuery,
  CustomerQueryStatus,
  CustomerQueryTopic,
} from '@prisma/client';
import { BaseService } from '../../../common/base/base.service';
import {
  PageQuery,
  PageResult,
} from '../../../common/pagination/pagination.utility';
import { CustomerRepo } from '../customer/customer.repo';
import { CreateCustomerQueryDto } from './dto/create-customer-query.dto';
import { UpdateCustomerQueryDto } from './dto/update-customer-query.dto';
import { CustomerQueryRepo } from './customer-query.repo';

@Injectable()
export class CustomerQueryService extends BaseService {
  constructor(
    private readonly customerQueryRepo: CustomerQueryRepo,
    private readonly customerRepo: CustomerRepo,
  ) {
    super(CustomerQueryService.name);
  }

  async create(payload: CreateCustomerQueryDto): Promise<CustomerQuery> {
    const email = payload.email.toLowerCase();
    const customer = await this.customerRepo.findByEmail(email);
    return this.customerQueryRepo.create({
      name: payload.name.trim(),
      email,
      phone: payload.phone?.trim() || null,
      topic: payload.topic,
      subject: payload.subject.trim(),
      message: payload.message.trim(),
      orderNumber: payload.orderNumber?.trim() || null,
      status: CustomerQueryStatus.OPEN,
      customerId: customer?.id ?? null,
    });
  }

  async findById(payload: { id: string }): Promise<CustomerQuery> {
    const query = await this.customerQueryRepo.findById(payload.id);
    if (!query) {
      throw new NotFoundException(`Customer query ${payload.id} not found`);
    }
    return query;
  }

  async findAll(
    payload: PageQuery & {
      status?: CustomerQueryStatus;
      topic?: CustomerQueryTopic;
      q?: string;
      from?: string;
      to?: string;
    },
  ): Promise<PageResult<CustomerQuery>> {
    const { status, topic, q, from, to, ...pageQuery } = payload;
    return this.customerQueryRepo.findPageFiltered(pageQuery, {
      status,
      topic,
      q,
      from,
      to,
    });
  }

  async update(payload: {
    id: string;
    data: UpdateCustomerQueryDto;
  }): Promise<CustomerQuery> {
    await this.findById({ id: payload.id });
    return this.customerQueryRepo.update(payload.id, payload.data);
  }

  async softDelete(payload: { id: string }): Promise<CustomerQuery> {
    await this.findById(payload);
    return this.customerQueryRepo.softDelete(payload.id);
  }

  async summary() {
    const [open, inProgress, resolved, closed] = await Promise.all([
      this.customerQueryRepo.countByStatus(CustomerQueryStatus.OPEN),
      this.customerQueryRepo.countByStatus(CustomerQueryStatus.IN_PROGRESS),
      this.customerQueryRepo.countByStatus(CustomerQueryStatus.RESOLVED),
      this.customerQueryRepo.countByStatus(CustomerQueryStatus.CLOSED),
    ]);
    return {
      open,
      inProgress,
      resolved,
      closed,
      total: open + inProgress + resolved + closed,
    };
  }
}
