import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BaseController } from '../../../common/base/base.controller';
import { parsePageQuery } from '../../../common/pagination/pagination.utility';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { StaffAuth } from '../../security/auth/guards/staff-auth.decorator';
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
  @StaffAuth()
  create(@Body() payload: CreateCategoryDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.categoryService.create(data),
      payload,
      'Category created',
    );
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.categoryService.findAll(data),
      { ...parsePageQuery(page, limit), q, from, to },
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
  @StaffAuth()
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
  @StaffAuth()
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.categoryService.softDelete(data),
      { id },
      'Category deleted',
    );
  }
}
