import { Injectable } from '@nestjs/common';
import { AppConfig, Prisma } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class AppConfigRepo extends BaseRepo<
  AppConfig,
  Prisma.AppConfigUncheckedCreateInput,
  Prisma.AppConfigUncheckedUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, AppConfigRepo.name);
  }

  protected get model() {
    return this.prisma.appConfig;
  }

  async findByKey(key: string): Promise<AppConfig | null> {
    return this.prisma.appConfig.findFirst({
      where: this.notDeletedWhere({ key }),
    });
  }
}
