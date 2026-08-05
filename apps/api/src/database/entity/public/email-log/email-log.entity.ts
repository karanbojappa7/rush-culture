import { BaseEntity } from '../../../../common/entities/base.entity';

export class EmailLogEntity extends BaseEntity {
  toEmail!: string;
  toName!: string | null;
  fromEmail!: string;
  subject!: string;
  templateKey!: string;
  status!: string;
  providerMessageId!: string | null;
  errorMessage!: string | null;
  relatedType!: string | null;
  relatedId!: string | null;
  meta!: unknown;
  htmlBody!: string | null;
  textBody!: string | null;
  sentAt!: Date | null;
}
