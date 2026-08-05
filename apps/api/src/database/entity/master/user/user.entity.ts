import { BaseEntity } from '../../../../common/entities/base.entity';

export class RoleEntity extends BaseEntity {
  code!: string;
  name!: string;
  description!: string | null;
  isActive!: boolean;
}

export class UserTypeEntity extends BaseEntity {
  code!: string;
  name!: string;
  description!: string | null;
  isActive!: boolean;
}

export class UserEntity extends BaseEntity {
  email!: string;
  phoneNumber!: string | null;
  name!: string | null;
  image!: string | null;
  passwordHash!: string | null;
  emailVerified!: Date | null;
  roleId!: string;
  userTypeId!: string;
}

export class AccountEntity extends BaseEntity {
  type!: string;
  provider!: string;
  providerAccountId!: string;
}

export class SessionEntity extends BaseEntity {
  sessionToken!: string;
  expires!: Date;
}
