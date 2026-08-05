import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BaseService } from '../../../common/base/base.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleService } from './role/role.service';
import { UserTypeService } from './user-type/user-type.service';
import { UserRepo } from './user.repo';

@Injectable()
export class UserService extends BaseService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly roleService: RoleService,
    private readonly userTypeService: UserTypeService,
  ) {
    super(UserService.name);
  }

  async create(payload: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findByEmail(payload.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    if (payload.phoneNumber) {
      const byPhone = await this.userRepo.findByPhoneNumber(payload.phoneNumber);
      if (byPhone) {
        throw new ConflictException('User with this phone number already exists');
      }
    }

    const role = await this.roleService.findByCode(payload.roleCode ?? 'STAFF');
    const userType = await this.userTypeService.findByCode(
      payload.userTypeCode ?? 'INTERNAL',
    );
    const passwordHash = payload.password
      ? await bcrypt.hash(payload.password, 10)
      : null;

    return this.userRepo.create({
      email: payload.email.toLowerCase(),
      name: payload.name,
      phoneNumber: payload.phoneNumber,
      passwordHash,
      role: { connect: { id: role.id } },
      userType: { connect: { id: userType.id } },
    });
  }

  async findById(payload: { id: string }): Promise<User> {
    const user = await this.userRepo.findByIdWithIdentity(payload.id);
    if (!user) {
      throw new NotFoundException(`User ${payload.id} not found`);
    }
    return user;
  }

  async findAll(pageQuery: {
    page: number;
    limit: number;
    skip: number;
  }) {
    return this.userRepo.findAllWithIdentity(pageQuery);
  }

  async update(payload: { id: string; data: UpdateUserDto }): Promise<User> {
    await this.findById({ id: payload.id });

    if (payload.data.email) {
      const existing = await this.userRepo.findByEmail(payload.data.email);
      if (existing && existing.id !== payload.id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (payload.data.phoneNumber) {
      const byPhone = await this.userRepo.findByPhoneNumber(
        payload.data.phoneNumber,
      );
      if (byPhone && byPhone.id !== payload.id) {
        throw new ConflictException(
          'User with this phone number already exists',
        );
      }
    }

    const data: Record<string, unknown> = {};
    if (payload.data.email !== undefined) {
      data.email = payload.data.email.toLowerCase();
    }
    if (payload.data.name !== undefined) data.name = payload.data.name;
    if (payload.data.phoneNumber !== undefined) {
      data.phoneNumber = payload.data.phoneNumber;
    }
    if (payload.data.image !== undefined) data.image = payload.data.image;
    if (payload.data.password) {
      data.passwordHash = await bcrypt.hash(payload.data.password, 10);
    }

    if (payload.data.roleCode) {
      const role = await this.roleService.findByCode(payload.data.roleCode);
      data.role = { connect: { id: role.id } };
    }

    if (payload.data.userTypeCode) {
      const userType = await this.userTypeService.findByCode(
        payload.data.userTypeCode,
      );
      data.userType = { connect: { id: userType.id } };
    }

    return this.userRepo.update(payload.id, data);
  }

  async softDelete(payload: {
    id: string;
    actorUserId?: string;
  }): Promise<User> {
    const user = await this.findById({ id: payload.id });
    if (payload.actorUserId && payload.actorUserId === payload.id) {
      throw new BadRequestException('You cannot delete your own account');
    }
    const roleCode =
      (user as User & { role?: { code: string } }).role?.code ?? null;
    if (roleCode === 'SUPER_ADMIN') {
      const remaining = await this.userRepo.countByRoleCode('SUPER_ADMIN');
      if (remaining <= 1) {
        throw new BadRequestException(
          'Cannot delete the last Super Admin account',
        );
      }
    }
    return this.userRepo.softDelete(payload.id);
  }
}
