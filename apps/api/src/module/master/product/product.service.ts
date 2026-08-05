import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { brand, collections, products } from '@linq/site-config';
import { utcNow } from '../../../common/utility/date.utility';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { BaseService } from '../../../common/base/base.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepo } from './product.repo';
import {
  mapCatalogCategoryToCreateInput,
  mapCatalogProductToCreateInput,
} from './utility/catalog-seed.utility';
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
    if ((await this.prisma.category.count()) === 0) {
      await this.prisma.$transaction(
        collections.map((collection) =>
          this.prisma.category.create({
            data: mapCatalogCategoryToCreateInput(collection),
          }),
        ),
      );
    }

    if ((await this.prisma.product.count()) === 0) {
      const categories = await this.prisma.category.findMany({
        where: { isDeleted: false },
      });
      const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));
      await this.prisma.$transaction(
        products.map((product) =>
          this.prisma.product.create({
            data: mapCatalogProductToCreateInput(
              product,
              categoryBySlug.get(product.collection),
            ),
          }),
        ),
      );
    }
  }

  async create(payload: CreateProductDto) {
    const { variants = [], images = [], categoryId, ...product } = payload;
    const stamp = utcNow();
    return this.productRepo.createWithDetails({
      ...product,
      slug: resolveProductSlug(product.name, product.slug),
      brand: product.brand ?? brand.name,
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
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
              payload.data.slug ?? existing.slug,
            ),
          }
        : {}),
    };
    return this.productRepo.update(payload.id, data);
  }

  async softDelete(payload: { id: string }) {
    await this.findById(payload);
    return this.productRepo.softDelete(payload.id);
  }

  async replaceVariants(payload: {
    id: string;
    variants: CreateProductDto['variants'];
  }) {
    await this.findById({ id: payload.id });
    const stamp = utcNow();
    await this.prisma.productVariant.updateMany({
      where: { productId: payload.id, isDeleted: false },
      data: { isDeleted: true, updatedAt: stamp },
    });
    if (!payload.variants?.length) {
      return this.findById({ id: payload.id });
    }
    await this.prisma.productVariant.createMany({
      data: payload.variants.map((variant) => ({
        productId: payload.id,
        ...variant,
        createdAt: stamp,
        updatedAt: stamp,
        isDeleted: false,
        userId: null,
        createdBy: null,
        updatedBy: null,
      })),
    });
    return this.findById({ id: payload.id });
  }

  async replaceImages(payload: {
    id: string;
    images: CreateProductDto['images'];
  }) {
    await this.findById({ id: payload.id });
    const stamp = utcNow();
    await this.prisma.productImage.updateMany({
      where: { productId: payload.id, isDeleted: false },
      data: { isDeleted: true, updatedAt: stamp },
    });
    if (!payload.images?.length) {
      return this.findById({ id: payload.id });
    }
    await this.prisma.productImage.createMany({
      data: payload.images.map((image, sortOrder) => ({
        productId: payload.id,
        url: image.url,
        alt: image.alt,
        sortOrder: image.sortOrder ?? sortOrder,
        isPrimary: image.isPrimary ?? sortOrder === 0,
        createdAt: stamp,
        updatedAt: stamp,
        isDeleted: false,
        userId: null,
        createdBy: null,
        updatedBy: null,
      })),
    });
    return this.findById({ id: payload.id });
  }
}
