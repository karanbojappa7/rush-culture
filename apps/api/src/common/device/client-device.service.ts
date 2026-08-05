import { Injectable, Logger } from '@nestjs/common';
import { DeviceType, Prisma } from '@prisma/client';
import {
  PageQuery,
  toPageResult,
} from '../pagination/pagination.utility';
import { PrismaService } from '../prisma/prisma.service';
import { buildCreatedAtFilter } from '../utility/date-range.utility';
import { buildContainsOr } from '../utility/search.utility';

const DEBOUNCE_MS = 5 * 60 * 1000;

type UpsertInput = {
  fingerprint: string;
  ip: string;
  userAgent: string;
  deviceType: DeviceType;
  os: string | null;
  browser: string | null;
  path: string;
  method: string;
  blocked?: boolean;
};

@Injectable()
export class ClientDeviceService {
  private readonly logger = new Logger(ClientDeviceService.name);
  private readonly lastWrite = new Map<string, number>();

  constructor(private readonly prisma: PrismaService) {}

  track(input: UpsertInput): void {
    const now = Date.now();
    const last = this.lastWrite.get(input.fingerprint) ?? 0;
    const force = Boolean(input.blocked);
    if (!force && now - last < DEBOUNCE_MS) {
      return;
    }
    this.lastWrite.set(input.fingerprint, now);
    void this.persist(input).catch((error) => {
      this.logger.warn(
        `ClientDevice upsert failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    });
  }

  async findPage(
    pageQuery: PageQuery,
    filters: {
      q?: string;
      deviceType?: DeviceType;
      from?: string;
      to?: string;
    } = {},
  ) {
    const where: Prisma.ClientDeviceWhereInput = {
      isDeleted: false,
      ...(filters.deviceType ? { deviceType: filters.deviceType } : {}),
      ...buildContainsOr(filters.q, [
        'ip',
        'userAgent',
        'os',
        'browser',
        'path',
        'fingerprint',
      ] as const),
      ...buildCreatedAtFilter(filters.from, filters.to),
    };
    const [items, total] = await Promise.all([
      this.prisma.clientDevice.findMany({
        where,
        orderBy: { lastSeenAt: 'desc' },
        skip: pageQuery.skip,
        take: pageQuery.limit,
      }),
      this.prisma.clientDevice.count({ where }),
    ]);
    return toPageResult(items, total, pageQuery.page, pageQuery.limit);
  }

  private async persist(input: UpsertInput) {
    const data: Prisma.ClientDeviceUncheckedCreateInput = {
      fingerprint: input.fingerprint,
      ip: input.ip,
      userAgent: input.userAgent,
      deviceType: input.deviceType,
      os: input.os,
      browser: input.browser,
      path: input.path,
      method: input.method,
      hitCount: 1,
      blockedCount: input.blocked ? 1 : 0,
      lastSeenAt: new Date(),
      isDeleted: false,
    };

    await this.prisma.clientDevice.upsert({
      where: { fingerprint: input.fingerprint },
      create: data,
      update: {
        ip: input.ip,
        userAgent: input.userAgent,
        deviceType: input.deviceType,
        os: input.os,
        browser: input.browser,
        path: input.path,
        method: input.method,
        lastSeenAt: new Date(),
        hitCount: { increment: 1 },
        ...(input.blocked ? { blockedCount: { increment: 1 } } : {}),
        isDeleted: false,
      },
    });
  }
}
