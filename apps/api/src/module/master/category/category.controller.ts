import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BaseController } from '../../../common/base/base.controller';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('api/categories')
export class CategoryController extends BaseController {
  constructor(
    private readonly categoryService: CategoryService,
    responseBuilder: ResponseBuilder,
  ) {
    super(CategoryController.name, responseBuilder);
  }

  @Post()
  create(@Body() payload: CreateCategoryDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.categoryService.create(data),
      payload,
      'Category created',
    );
  }

  @Get()
  findAll(): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.categoryService.findAll(data),
      {},
      'Categories fetched',
    );
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.categoryService.findBySlug(data),
      { slug },
      'Category fetched',
    );
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.categoryService.findById(data),
      { id },
      'Category fetched',
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateCategoryDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.categoryService.update(payload),
      { id, data },
      'Category updated',
    );
  }

  @Delete(':id')
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.categoryService.softDelete(data),
      { id },
      'Category deleted',
    );
  }
}
