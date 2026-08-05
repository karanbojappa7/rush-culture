import { BaseEntity } from '../../../../common/entities/base.entity';

export class CustomerEntity extends BaseEntity {
  email!: string;
  phoneNumber!: string | null;
  name!: string | null;
}
