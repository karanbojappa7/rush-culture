import { Injectable } from '@nestjs/common';
import { Address, Prisma } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class AddressRepo extends BaseRepo<
  Address,
  Prisma.AddressUncheckedCreateInput,
  Prisma.AddressUncheckedUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, AddressRepo.name);
  }

  protected get model() {
    return this.prisma.address;
  }

  async findByUserId(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: this.notDeletedWhere({ userId }),
      orderBy: { createdAt: 'desc' },
    });
  }
}
