import { BaseEntity } from '../../../../common/entities/base.entity';

export class SessionEntity extends BaseEntity {
  sessionToken!: string;
  expires!: Date;
}
