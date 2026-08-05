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
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
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
    return this.executeMethod((data) => this.reviewService.create(data), payload, 'Review created');
  }

  @Get()
  findAll(@Query('productId') productId?: string): Promise<ResponseVm> {
    return this.executeMethod((data) => this.reviewService.findAll(data), { productId }, 'Reviews fetched');
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod((data) => this.reviewService.findById(data), { id }, 'Review fetched');
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod((data) => this.reviewService.approve(data), { id }, 'Review approved');
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateReviewDto): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.reviewService.update(payload),
      { id, data },
      'Review updated',
    );
  }

  @Delete(':id')
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod((data) => this.reviewService.softDelete(data), { id }, 'Review deleted');
  }
}
