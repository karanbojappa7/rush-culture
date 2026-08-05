import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BaseController } from '../../../common/base/base.controller';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
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
  create(@Body() payload: CreateProductDto): Promise<ResponseVm> {
    return this.executeMethod((data) => this.productService.create(data), payload, 'Product created');
  }

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('size') size?: string,
    @Query('color') color?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('isActive') isActive?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (filters) => this.productService.findAll(filters),
      {
        q,
        categoryId,
        size,
        color,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        isActive: isActive === undefined ? undefined : isActive === 'true',
      },
      'Products fetched',
    );
  }

  @Get('id/:id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod((data) => this.productService.findById(data), { id }, 'Product fetched');
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
  update(@Param('id') id: string, @Body() data: UpdateProductDto): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.productService.update(payload),
      { id, data },
      'Product updated',
    );
  }

  @Delete(':id')
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod((data) => this.productService.softDelete(data), { id }, 'Product deleted');
  }
}
