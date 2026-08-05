import { BaseEntity } from '../../../../common/entities/base.entity';

export class PermissionEntity extends BaseEntity {
  code!: string;
  name!: string;
  description!: string | null;
  module!: string | null;
  isActive!: boolean;
}

export class RolePermissionEntity extends BaseEntity {
  roleId!: string;
  permissionId!: string;
}
