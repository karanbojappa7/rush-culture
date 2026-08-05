import { BaseEntity } from '../../../../common/entities/base.entity';

export class ClientDeviceEntity extends BaseEntity {
  fingerprint!: string;
  ip!: string;
  userAgent!: string;
  deviceType!: string;
  os!: string | null;
  browser!: string | null;
  path!: string | null;
  method!: string | null;
  hitCount!: number;
  blockedCount!: number;
  lastSeenAt!: Date;
}
