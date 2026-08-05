import { BaseEntity } from '../../../../common/entities/base.entity';

export class AccountEntity extends BaseEntity {
  type!: string;
  provider!: string;
  providerAccountId!: string;
}
