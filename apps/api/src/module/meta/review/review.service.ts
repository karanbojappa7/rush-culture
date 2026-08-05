import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../../common/base/base.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewRepo } from './review.repo';
import { assertValidRating } from './utility/review-rating.utility';

@Injectable()
export class ReviewService extends BaseService {
  constructor(private readonly reviewRepo: ReviewRepo) {
    super(ReviewService.name);
  }

  async create(payload: CreateReviewDto) {
    assertValidRating(payload.rating);
    const existing = await this.reviewRepo.findAllByProductId(payload.productId);
    if (existing.some((review) => review.customerId === payload.customerId)) {
      throw new ConflictException(
        'A review already exists for this product and customer',
      );
    }
    return this.reviewRepo.create(payload);
  }

  async findAll(payload: { productId?: string }) {
    return this.reviewRepo.findAllByProductId(payload.productId);
  }

  async findById(payload: { id: string }) {
    const review = await this.reviewRepo.findById(payload.id);
    if (!review) throw new NotFoundException(`Review ${payload.id} not found`);
    return review;
  }

  async update(payload: { id: string; data: UpdateReviewDto }) {
    await this.findById({ id: payload.id });
    if (payload.data.rating !== undefined) assertValidRating(payload.data.rating);
    return this.reviewRepo.update(payload.id, payload.data);
  }

  async softDelete(payload: { id: string }) {
    await this.findById(payload);
    return this.reviewRepo.softDelete(payload.id);
  }

  async approve(payload: { id: string }) {
    await this.findById(payload);
    return this.reviewRepo.update(payload.id, { isApproved: true });
  }
}
