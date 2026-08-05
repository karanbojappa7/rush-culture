import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { BaseService } from '../../../common/base/base.service';
import {
  PageQuery,
  PageResult,
} from '../../../common/pagination/pagination.utility';
import { buildContainsOr } from '../../../common/utility/search.utility';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepo } from './category.repo';
import { resolveCategorySlug } from './utility/category-slug.utility';

@Injectable()
export class CategoryService extends BaseService {
  constructor(private readonly categoryRepo: CategoryRepo) {
    super(CategoryService.name);
  }

  async create(payload: CreateCategoryDto): Promise<Category> {
    const slug = resolveCategorySlug(payload.name, payload.slug);
    await this.ensureSlugAvailable(slug);
    return this.categoryRepo.create({ ...payload, slug });
  }

  async findById(payload: { id: string }): Promise<Category> {
    const category = await this.categoryRepo.findById(payload.id);
    if (!category) {
      throw new NotFoundException(`Category ${payload.id} not found`);
    }
    return category;
  }

  async findAll(
    pageQuery: PageQuery & { q?: string },
  ): Promise<PageResult<Category>> {
    const { q, ...page } = pageQuery;
    return this.categoryRepo.findPage(page, {
      where: buildContainsOr(q, ['name', 'slug', 'description'] as const),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(payload: { slug: string }): Promise<Category> {
    const category = await this.categoryRepo.findBySlug(payload.slug);
    if (!category) {
      throw new NotFoundException(`Category ${payload.slug} not found`);
    }
    return category;
  }

  async update(payload: {
    id: string;
    data: UpdateCategoryDto;
  }): Promise<Category> {
    const category = await this.findById({ id: payload.id });
    const slug =
      payload.data.name || payload.data.slug
        ? resolveCategorySlug(
            payload.data.name ?? category.name,
            payload.data.slug,
          )
        : undefined;

    if (slug && slug !== category.slug) {
      await this.ensureSlugAvailable(slug);
    }

    return this.categoryRepo.update(payload.id, {
      ...payload.data,
      ...(slug ? { slug } : {}),
    });
  }

  async softDelete(payload: { id: string }): Promise<Category> {
    await this.findById(payload);
    return this.categoryRepo.softDelete(payload.id);
  }

  private async ensureSlugAvailable(slug: string): Promise<void> {
    const existing = await this.categoryRepo.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Category with slug ${slug} already exists`);
    }
  }
}
