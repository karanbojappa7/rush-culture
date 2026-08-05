import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { BaseRepo } from '../../../../common/base/base.repo';
import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class RoleRepo extends BaseRepo<
  Role,
  Prisma.RoleCreateInput,
  Prisma.RoleUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, RoleRepo.name);
  }

  protected get model() {
    return this.prisma.role;
  }

  async findByCode(code: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: this.notDeletedWhere({ code }),
    });
  }
}
