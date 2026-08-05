import { BaseEntity } from '../../../../common/entities/base.entity';

export class AppConfigEntity extends BaseEntity {
  key!: string;
  value!: string;
  description!: string | null;
  isActive!: boolean;
}
