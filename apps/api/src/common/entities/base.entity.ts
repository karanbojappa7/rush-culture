export abstract class BaseEntity {
  id!: string;
  userId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy!: string | null;
  updatedBy!: string | null;
  isDeleted!: boolean;
}

export type BaseEntityFields = Pick<
  BaseEntity,
  'userId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'
>;

export type AuditActor = {
  userId?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export const BASE_ENTITY_DEFAULTS = {
  isDeleted: false,
} as const;
