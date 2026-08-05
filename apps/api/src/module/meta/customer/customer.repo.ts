import { Injectable } from '@nestjs/common';
import { Customer, Prisma } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class CustomerRepo extends BaseRepo<
  Customer,
  Prisma.CustomerUncheckedCreateInput,
  Prisma.CustomerUncheckedUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, CustomerRepo.name);
  }

  protected get model() {
    return this.prisma.customer;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.prisma.customer.findFirst({
      where: this.notDeletedWhere({ email: email.toLowerCase() }),
    });
  }
}
