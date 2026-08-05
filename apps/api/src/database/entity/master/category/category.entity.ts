import { BaseEntity } from '../../../../common/entities/base.entity';

export class CategoryEntity extends BaseEntity {
  name!: string;
  slug!: string;
  description!: string | null;
  imageUrl!: string | null;
  parentId!: string | null;
}
