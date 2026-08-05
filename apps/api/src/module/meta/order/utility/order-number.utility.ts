import { brand } from '@linq/site-config';
import { utcNow } from '../../../../common/utility/date.utility';

export function createOrderNumber(prefix = brand.orderPrefix): string {
  return `${prefix}-${utcNow().getTime()}`;
}
