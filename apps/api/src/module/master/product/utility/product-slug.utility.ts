import { slugify } from '../../../../common/utility/slug.utility';

export function resolveProductSlug(name: string, slug?: string): string {
  return slugify(slug || name);
}
