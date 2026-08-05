import { BaseEntity } from '../../../../common/entities/base.entity';

export class VerificationTokenEntity extends BaseEntity {
  identifier!: string;
  token!: string;
  expires!: Date;
}
