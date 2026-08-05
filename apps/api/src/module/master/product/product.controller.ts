import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BaseController } from '../../../common/base/base.controller';
import { parsePageQuery } from '../../../common/pagination/pagination.utility';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { StaffAuth } from '../../security/auth/guards/staff-auth.decorator';
import { CheckStockDto } from './dto/check-stock.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('api/products')
export class ProductController extends BaseController {
  constructor(
    private readonly productService: ProductService,
    responseBuilder: ResponseBuilder,
  ) {
    super(ProductController.name, responseBuilder);
  }

  @Post()
  @StaffAuth()
  create(@Body() payload: CreateProductDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.productService.create(data),
      payload,
      'Product created',
    );
  }

  @Post('stock-check')
  checkStock(@Body() payload: CheckStockDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.productService.checkStock(data),
      payload,
      'Stock checked',
    );
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('size') size?: string,
    @Query('color') color?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('isActive') isActive?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<ResponseVm> {
    const pageQuery = parsePageQuery(page, limit);
    return this.executeMethod(
      (filters) => this.productService.findAll(filters),
      {
        ...pageQuery,
        q,
        categoryId,
        size,
        color,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        isActive: isActive === undefined ? undefined : isActive === 'true',
        from,
        to,
      },
      'Products fetched',
    );
  }

  @Get('id/:id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.productService.findById(data),
      { id },
      'Product fetched',
    );
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.productService.findBySlug(data),
      { slug },
      'Product fetched',
    );
  }

  @Patch(':id')
  @StaffAuth()
  update(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.productService.update(payload),
      { id, data },
      'Product updated',
    );
  }

  @Patch(':id/variants')
  @StaffAuth()
  replaceVariants(
    @Param('id') id: string,
    @Body() body: { variants: CreateProductDto['variants'] },
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.productService.replaceVariants(payload),
      { id, variants: body.variants },
      'Product variants updated',
    );
  }

  @Patch(':id/images')
  @StaffAuth()
  replaceImages(
    @Param('id') id: string,
    @Body() body: { images: CreateProductDto['images'] },
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.productService.replaceImages(payload),
      { id, images: body.images },
      'Product images updated',
    );
  }

  @Delete(':id')
  @StaffAuth()
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.productService.softDelete(data),
      { id },
      'Product deleted',
    );
  }
}
