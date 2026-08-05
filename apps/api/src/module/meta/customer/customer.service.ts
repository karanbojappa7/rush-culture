import { Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from '@prisma/client';
import { BaseService } from '../../../common/base/base.service';
import {
  PageQuery,
  PageResult,
} from '../../../common/pagination/pagination.utility';
import { buildCreatedAtFilter } from '../../../common/utility/date-range.utility';
import { buildContainsOr } from '../../../common/utility/search.utility';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerRepo } from './customer.repo';

@Injectable()
export class CustomerService extends BaseService {
  constructor(private readonly customerRepo: CustomerRepo) {
    super(CustomerService.name);
  }

  async create(payload: CreateCustomerDto): Promise<Customer> {
    return this.customerRepo.create({
      email: payload.email.toLowerCase(),
      phoneNumber: payload.phoneNumber,
      name: payload.name,
    });
  }

  async findOrCreateByEmail(payload: {
    email: string;
    phoneNumber?: string;
    name?: string;
  }): Promise<Customer> {
    const email = payload.email.toLowerCase();
    const existing = await this.customerRepo.findByEmail(email);
    if (existing) {
      const patch: UpdateCustomerDto = {};
      if (payload.name && !existing.name) patch.name = payload.name;
      if (payload.phoneNumber && !existing.phoneNumber) {
        patch.phoneNumber = payload.phoneNumber;
      }
      if (Object.keys(patch).length > 0) {
        return this.customerRepo.update(existing.id, patch);
      }
      return existing;
    }
    return this.create({
      email,
      phoneNumber: payload.phoneNumber,
      name: payload.name,
    });
  }

  async findById(payload: { id: string }): Promise<Customer> {
    const customer = await this.customerRepo.findById(payload.id);
    if (!customer) {
      throw new NotFoundException(`Customer ${payload.id} not found`);
    }
    return customer;
  }

  async findAll(
    pageQuery: PageQuery & { q?: string; from?: string; to?: string },
  ): Promise<PageResult<Customer>> {
    const { q, from, to, ...page } = pageQuery;
    return this.customerRepo.findPage(page, {
      where: {
        ...buildContainsOr(q, ['email', 'name', 'phoneNumber'] as const),
        ...buildCreatedAtFilter(from, to),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(payload: {
    id: string;
    data: UpdateCustomerDto;
  }): Promise<Customer> {
    await this.findById({ id: payload.id });
    const data = {
      ...payload.data,
      ...(payload.data.email
        ? { email: payload.data.email.toLowerCase() }
        : {}),
    };
    return this.customerRepo.update(payload.id, data);
  }

  async softDelete(payload: { id: string }): Promise<Customer> {
    await this.findById(payload);
    return this.customerRepo.softDelete(payload.id);
  }
}
