import { slugify } from '../../../../common/utility/slug.utility';

export function resolveCategorySlug(name: string, slug?: string): string {
  return slugify(slug ?? name);
}
