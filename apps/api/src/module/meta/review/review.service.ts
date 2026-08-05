import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../../../common/base/base.service';
import { CustomerService } from '../customer/customer.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewRepo } from './review.repo';
import { assertValidRating } from './utility/review-rating.utility';

@Injectable()
export class ReviewService extends BaseService {
  constructor(
    private readonly reviewRepo: ReviewRepo,
    private readonly customerService: CustomerService,
  ) {
    super(ReviewService.name);
  }

  async create(payload: CreateReviewDto) {
    assertValidRating(payload.rating);
    const customer = await this.customerService.findOrCreateByEmail({
      email: payload.email,
      name: payload.name.trim(),
    });
    const existing = await this.reviewRepo.findByProductAndCustomer(
      payload.productId,
      customer.id,
    );
    if (existing) {
      throw new ConflictException(
        'A review already exists for this product and email',
      );
    }
    return this.reviewRepo.create({
      productId: payload.productId,
      customerId: customer.id,
      displayName: payload.name.trim(),
      rating: payload.rating,
      title: payload.title?.trim() || null,
      body: payload.body?.trim() || null,
      isApproved: false,
    });
  }

  async findAll(payload: {
    productId?: string;
    page: number;
    limit: number;
    skip: number;
    approvedOnly?: boolean;
    approved?: boolean;
    q?: string;
    from?: string;
    to?: string;
  }) {
    const {
      productId,
      page,
      limit,
      skip,
      approvedOnly = true,
      approved,
      q,
      from,
      to,
    } = payload;
    return this.reviewRepo.findPageByProductId(
      { page, limit, skip },
      productId,
      approvedOnly
        ? { approvedOnly: true, q, from, to }
        : { approved, q, from, to },
    );
  }

  async findAllAdmin(payload: {
    productId?: string;
    page: number;
    limit: number;
    skip: number;
    status?: 'pending' | 'approved' | 'all';
    q?: string;
    from?: string;
    to?: string;
  }) {
    const status = payload.status ?? 'pending';
    const approved =
      status === 'pending' ? false : status === 'approved' ? true : undefined;
    return this.findAll({
      ...payload,
      approvedOnly: false,
      approved,
      q: payload.q,
      from: payload.from,
      to: payload.to,
    });
  }

  async summary(payload: { productId: string }) {
    return this.reviewRepo.summaryByProductId(payload.productId);
  }

  async findById(payload: { id: string }) {
    const review = await this.reviewRepo.findById(payload.id);
    if (!review) throw new NotFoundException(`Review ${payload.id} not found`);
    return review;
  }

  async update(payload: { id: string; data: UpdateReviewDto }) {
    await this.findById({ id: payload.id });
    if (payload.data.rating !== undefined) {
      assertValidRating(payload.data.rating);
    }
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
