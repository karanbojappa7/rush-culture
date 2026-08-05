import { Injectable, NotFoundException } from '@nestjs/common';
import { Address } from '@prisma/client';
import { BaseService } from '../../../common/base/base.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressRepo } from './address.repo';
import { clearOtherDefaults } from './utility/default-address.utility';

@Injectable()
export class AddressService extends BaseService {
  constructor(
    private readonly addressRepo: AddressRepo,
    private readonly prisma: PrismaService,
  ) {
    super(AddressService.name);
  }

  async create(payload: CreateAddressDto): Promise<Address> {
    if (payload.isDefault) {
      await clearOtherDefaults(this.prisma, payload.userId);
    }

    return this.addressRepo.create(payload);
  }

  async findById(payload: { id: string }): Promise<Address> {
    const address = await this.addressRepo.findById(payload.id);
    if (!address) {
      throw new NotFoundException(`Address ${payload.id} not found`);
    }
    return address;
  }

  async findAll(payload: { userId?: string } = {}): Promise<Address[]> {
    if (payload.userId) {
      return this.addressRepo.findByUserId(payload.userId);
    }
    return this.addressRepo.findAll({ orderBy: { createdAt: 'desc' } });
  }

  async update(payload: {
    id: string;
    data: UpdateAddressDto;
  }): Promise<Address> {
    const address = await this.findById({ id: payload.id });
    if (payload.data.isDefault) {
      await clearOtherDefaults(
        this.prisma,
        payload.data.userId ?? address.userId,
        address.id,
      );
    }

    return this.addressRepo.update(payload.id, payload.data);
  }

  async softDelete(payload: { id: string }): Promise<Address> {
    await this.findById(payload);
    return this.addressRepo.softDelete(payload.id);
  }
}
