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
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';

@Controller('api/reviews')
export class ReviewController extends BaseController {
  constructor(
    private readonly reviewService: ReviewService,
    responseBuilder: ResponseBuilder,
  ) {
    super(ReviewController.name, responseBuilder);
  }

  @Post()
  create(@Body() payload: CreateReviewDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.reviewService.create(data),
      payload,
      'Review submitted',
    );
  }

  @Get('summary')
  summary(@Query('productId') productId: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.reviewService.summary(data),
      { productId },
      'Review summary fetched',
    );
  }

  @Get('admin')
  @StaffAuth()
  findAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('productId') productId?: string,
    @Query('status') status?: 'pending' | 'approved' | 'all',
    @Query('q') q?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.reviewService.findAllAdmin(data),
      {
        ...parsePageQuery(page, limit),
        productId,
        status,
        q,
      },
      'Reviews fetched',
    );
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('productId') productId?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.reviewService.findAll(data),
      {
        ...parsePageQuery(page, limit),
        productId,
        approvedOnly: true,
      },
      'Reviews fetched',
    );
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.reviewService.findById(data),
      { id },
      'Review fetched',
    );
  }

  @Patch(':id/approve')
  @StaffAuth()
  approve(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.reviewService.approve(data),
      { id },
      'Review approved',
    );
  }

  @Patch(':id')
  @StaffAuth()
  update(
    @Param('id') id: string,
    @Body() data: UpdateReviewDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.reviewService.update(payload),
      { id, data },
      'Review updated',
    );
  }

  @Delete(':id')
  @StaffAuth()
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.reviewService.softDelete(data),
      { id },
      'Review deleted',
    );
  }
}
