import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import { BaseService } from '../../../../common/base/base.service';
import { CreateUserTypeDto } from '../dto/create-user-type.dto';
import { UpdateUserTypeDto } from '../dto/update-user-type.dto';
import { UserTypeRepo } from './user-type.repo';

const DEFAULT_USER_TYPES = [
  {
    code: 'INDIVIDUAL',
    name: 'Individual',
    description: 'Personal shopper account',
  },
  {
    code: 'BUSINESS',
    name: 'Business',
    description: 'Business / wholesale account',
  },
  {
    code: 'INTERNAL',
    name: 'Internal',
    description: 'Internal staff identity',
  },
] as const;

@Injectable()
export class UserTypeService extends BaseService implements OnModuleInit {
  constructor(private readonly userTypeRepo: UserTypeRepo) {
    super(UserTypeService.name);
  }

  async onModuleInit() {
    for (const type of DEFAULT_USER_TYPES) {
      const existing = await this.userTypeRepo.findByCode(type.code);
      if (!existing) {
        await this.userTypeRepo.create({ ...type });
      }
    }
  }

  async create(payload: CreateUserTypeDto): Promise<UserType> {
    const existing = await this.userTypeRepo.findByCode(payload.code);
    if (existing) {
      throw new ConflictException(`User type ${payload.code} already exists`);
    }
    return this.userTypeRepo.create({
      code: payload.code.toUpperCase(),
      name: payload.name,
      description: payload.description,
    });
  }

  async findById(payload: { id: string }): Promise<UserType> {
    const type = await this.userTypeRepo.findById(payload.id);
    if (!type) throw new NotFoundException(`User type ${payload.id} not found`);
    return type;
  }

  async findByCode(code: string): Promise<UserType> {
    const type = await this.userTypeRepo.findByCode(code.toUpperCase());
    if (!type) throw new NotFoundException(`User type ${code} not found`);
    return type;
  }

  async findAll(): Promise<UserType[]> {
    return this.userTypeRepo.findAll({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async update(payload: {
    id: string;
    data: UpdateUserTypeDto;
  }): Promise<UserType> {
    await this.findById({ id: payload.id });
    if (payload.data.code) {
      const existing = await this.userTypeRepo.findByCode(payload.data.code);
      if (existing && existing.id !== payload.id) {
        throw new ConflictException(
          `User type ${payload.data.code} already exists`,
        );
      }
    }
    return this.userTypeRepo.update(payload.id, {
      ...payload.data,
      ...(payload.data.code
        ? { code: payload.data.code.toUpperCase() }
        : {}),
    });
  }

  async softDelete(payload: { id: string }): Promise<UserType> {
    await this.findById(payload);
    return this.userTypeRepo.softDelete(payload.id);
  }
}
