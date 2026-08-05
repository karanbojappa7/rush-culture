import { BaseEntity } from '../../../../common/entities/base.entity';

export class AddressEntity extends BaseEntity {
  customerId!: string;
  fullName!: string;
  phone!: string;
  line1!: string;
  line2!: string | null;
  city!: string;
  state!: string;
  postalCode!: string;
  country!: string;
  isDefault!: boolean;
}
