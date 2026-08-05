import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { brand, collections, products } from '@linq/site-config';
import { utcNow } from '../../../common/utility/date.utility';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { BaseService } from '../../../common/base/base.service';
import { CheckStockDto } from './dto/check-stock.dto';
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

  async checkStock(payload: CheckStockDto) {
    const ids = [...new Set(payload.items.map((item) => item.variantId))];
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: ids }, isDeleted: false },
      select: {
        id: true,
        sku: true,
        size: true,
        color: true,
        stock: true,
        product: { select: { name: true, slug: true } },
      },
    });
    const byId = new Map(variants.map((variant) => [variant.id, variant]));

    const items = payload.items.map((item) => {
      const variant = byId.get(item.variantId);
      if (!variant) {
        return {
          variantId: item.variantId,
          sku: null,
          productName: null,
          productSlug: null,
          size: null,
          color: null,
          stock: 0,
          requested: item.quantity,
          available: 0,
          status: 'unavailable' as const,
        };
      }
      const available = Math.max(0, Math.min(variant.stock, item.quantity));
      const status =
        variant.stock <= 0
          ? ('sold_out' as const)
          : variant.stock < item.quantity
            ? ('adjusted' as const)
            : ('ok' as const);
      return {
        variantId: variant.id,
        sku: variant.sku,
        productName: variant.product.name,
        productSlug: variant.product.slug,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        requested: item.quantity,
        available,
        status,
      };
    });

    return {
      ok: items.every((item) => item.status === 'ok'),
      items,
    };
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

  async findAll(
    filters: ProductFilters & {
      page?: number;
      limit?: number;
      skip?: number;
    } = {},
  ) {
    const { page = 1, limit = 20, skip = 0, ...productFilters } = filters;
    return this.productRepo.findPageWithDetails(productFilters, {
      page,
      limit,
      skip,
    });
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
    const incoming = payload.variants ?? [];

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.productVariant.findMany({
        where: { productId: payload.id, isDeleted: false },
        select: { id: true, sku: true, size: true, color: true },
      });

      for (const variant of existing) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            isDeleted: true,
            sku: `${variant.sku}__del__${variant.id}`,
            size: `${variant.size}__del__${variant.id}`,
            color: `${variant.color}__del__${variant.id}`,
            updatedAt: stamp,
          },
        });
      }

      if (!incoming.length) return;

      await tx.productVariant.createMany({
        data: incoming.map((variant) => ({
          productId: payload.id,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          priceInPaise: variant.priceInPaise,
          compareAtPriceInPaise: variant.compareAtPriceInPaise,
          stock: variant.stock ?? 0,
          isActive: variant.isActive ?? true,
          createdAt: stamp,
          updatedAt: stamp,
          isDeleted: false,
          userId: null,
          createdBy: null,
          updatedBy: null,
        })),
      });
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
