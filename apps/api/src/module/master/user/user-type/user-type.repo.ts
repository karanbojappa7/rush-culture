import { Injectable } from '@nestjs/common';
import { Prisma, UserType } from '@prisma/client';
import { BaseRepo } from '../../../../common/base/base.repo';
import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class UserTypeRepo extends BaseRepo<
  UserType,
  Prisma.UserTypeCreateInput,
  Prisma.UserTypeUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, UserTypeRepo.name);
  }

  protected get model() {
    return this.prisma.userType;
  }

  async findByCode(code: string): Promise<UserType | null> {
    return this.prisma.userType.findFirst({
      where: this.notDeletedWhere({ code }),
    });
  }
}
