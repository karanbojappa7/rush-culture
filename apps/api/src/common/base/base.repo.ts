import { Logger } from '@nestjs/common';
import {
  AuditActor,
  BASE_ENTITY_DEFAULTS,
} from '../entities/base.entity';
import { PrismaService } from '../prisma/prisma.service';
import { utcNow } from '../utility/date.utility';

export abstract class BaseRepo<
  TModel,
  TCreate extends Record<string, unknown>,
  TUpdate extends Record<string, unknown> = Partial<TCreate>,
> {
  protected readonly logger: Logger;

  constructor(
    protected readonly prisma: PrismaService,
    context: string,
  ) {
    this.logger = new Logger(context);
  }

  protected abstract get model(): {
    create: (args: { data: TCreate }) => Promise<TModel>;
    findFirst: (args: {
      where: Record<string, unknown>;
    }) => Promise<TModel | null>;
    findMany: (args?: object) => Promise<TModel[]>;
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => Promise<TModel>;
  };

  protected withCreateAudit(data: TCreate, actor?: AuditActor): TCreate {
    const stamp = utcNow();
    const userId =
      actor?.userId ??
      actor?.createdBy ??
      (data.userId as string | null | undefined) ??
      null;
    const createdBy =
      actor?.createdBy ??
      actor?.userId ??
      (data.createdBy as string | null | undefined) ??
      null;

    return {
      ...data,
      ...BASE_ENTITY_DEFAULTS,
      userId,
      createdBy,
      updatedBy: actor?.updatedBy ?? createdBy,
      isDeleted: false,
      createdAt: stamp,
      updatedAt: stamp,
    };
  }

  protected withUpdateAudit(
    data: TUpdate | Record<string, unknown>,
    actor?: AuditActor,
  ): Record<string, unknown> {
    return {
      ...data,
      updatedAt: utcNow(),
      updatedBy:
        actor?.updatedBy ??
        actor?.userId ??
        (data as AuditActor).updatedBy ??
        null,
    };
  }

  protected notDeletedWhere(extra: Record<string, unknown> = {}) {
    return { isDeleted: false, ...extra };
  }

  async create(data: TCreate, actor?: AuditActor): Promise<TModel> {
    return this.model.create({ data: this.withCreateAudit(data, actor) });
  }

  async findById(id: string): Promise<TModel | null> {
    return this.model.findFirst({
      where: this.notDeletedWhere({ id }),
    });
  }

  async findAll(args: Record<string, unknown> = {}): Promise<TModel[]> {
    const where = this.notDeletedWhere(
      (args.where as Record<string, unknown>) ?? {},
    );
    return this.model.findMany({
      ...args,
      where,
    });
  }

  async update(id: string, data: TUpdate, actor?: AuditActor): Promise<TModel> {
    return this.model.update({
      where: { id },
      data: this.withUpdateAudit(data, actor),
    });
  }

  async softDelete(id: string, actor?: AuditActor): Promise<TModel> {
    return this.model.update({
      where: { id },
      data: this.withUpdateAudit({ isDeleted: true }, actor),
    });
  }
}
