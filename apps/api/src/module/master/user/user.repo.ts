import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import { PrismaService } from '../../../common/prisma/prisma.service';

const identityInclude = {
  role: true,
  userType: true,
} satisfies Prisma.UserInclude;

@Injectable()
export class UserRepo extends BaseRepo<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, UserRepo.name);
  }

  protected get model() {
    return this.prisma.user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: this.notDeletedWhere({ email }),
      include: identityInclude,
    });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: this.notDeletedWhere({ phoneNumber }),
      include: identityInclude,
    });
  }

  async findByIdWithIdentity(id: string) {
    return this.prisma.user.findFirst({
      where: this.notDeletedWhere({ id }),
      include: identityInclude,
    });
  }

  async findAllWithIdentity() {
    return this.prisma.user.findMany({
      where: this.notDeletedWhere(),
      include: identityInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateByPhoneNumber(
    phoneNumber: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { phoneNumber },
      data: this.withUpdateAudit(data),
      include: identityInclude,
    });
  }
}
