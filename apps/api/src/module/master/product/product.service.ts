import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { brand, products } from '@linq/site-config';
import { utcNow } from '../../../common/utility/date.utility';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { BaseService } from '../../../common/base/base.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepo } from './product.repo';
import { mapCatalogProductToCreateInput } from './utility/catalog-seed.utility';
import { ProductFilters } from './utility/product-filter.utility';
import { resolveProductSlug } from './utility/product-slug.utility';

@Injectable()
export class ProductService extends BaseService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productRepo: ProductRepo,
  ) {
    super(ProductService.name);
  }

  async onModuleInit() {
    if ((await this.prisma.product.count()) === 0) {
      await this.prisma.$transaction(
        products.map((product) =>
          this.prisma.product.create({ data: mapCatalogProductToCreateInput(product) }),
        ),
      );
    }
  }

  async create(payload: CreateProductDto) {
    const { variants = [], images = [], ...product } = payload;
    const stamp = utcNow();
    return this.productRepo.createWithDetails({
      ...product,
      slug: resolveProductSlug(product.name, product.slug),
      brand: product.brand ?? brand.name,
      variants: {
        create: variants.map((variant) => ({
          ...variant,
          createdAt: stamp,
          updatedAt: stamp,
          isDeleted: false,
        })),
      },
      images: {
        create: images.map((image) => ({
          ...image,
          createdAt: stamp,
          updatedAt: stamp,
          isDeleted: false,
        })),
      },
    });
  }

  async findAll(filters: ProductFilters = {}) {
    return this.productRepo.findAllWithDetails(filters);
  }

  async findById(payload: { id: string }) {
    const product = await this.productRepo.findByIdWithDetails(payload.id);
    if (!product) throw new NotFoundException(`Product ${payload.id} not found`);
    return product;
  }

  async findBySlug(payload: { slug: string }) {
    const product = await this.productRepo.findBySlugWithDetails(payload.slug);
    if (!product) throw new NotFoundException(`Product ${payload.slug} not found`);
    return product;
  }

  async update(payload: { id: string; data: UpdateProductDto }) {
    const existing = await this.findById({ id: payload.id });
    const data = {
      ...payload.data,
      ...(payload.data.slug || payload.data.name
        ? {
            slug: resolveProductSlug(
              payload.data.name ?? existing.name,
              payload.data.slug,
            ),
          }
        : {}),
    };
    return this.productRepo.updateWithDetails(payload.id, data);
  }

  async softDelete(payload: { id: string }) {
    await this.findById(payload);
    return this.productRepo.softDelete(payload.id);
  }
}
