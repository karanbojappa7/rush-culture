import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { BaseService } from '../../../../common/base/base.service';
import {
  PageQuery,
  PageResult,
} from '../../../../common/pagination/pagination.utility';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleRepo } from './role.repo';

@Injectable()
export class RoleService extends BaseService {
  constructor(private readonly roleRepo: RoleRepo) {
    super(RoleService.name);
  }

  async create(payload: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepo.findByCode(payload.code);
    if (existing) {
      throw new ConflictException(`Role ${payload.code} already exists`);
    }
    return this.roleRepo.create({
      code: payload.code.toUpperCase(),
      name: payload.name,
      description: payload.description,
      isSystem: false,
      isActive: true,
    });
  }

  async findById(payload: { id: string }): Promise<Role> {
    const role = await this.roleRepo.findById(payload.id);
    if (!role) throw new NotFoundException(`Role ${payload.id} not found`);
    return role;
  }

  async findByCode(code: string): Promise<Role> {
    const role = await this.roleRepo.findByCode(code.toUpperCase());
    if (!role) throw new NotFoundException(`Role ${code} not found`);
    return role;
  }

  async findAll(pageQuery: PageQuery): Promise<PageResult<Role>> {
    return this.roleRepo.findPage(pageQuery, {
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async update(payload: { id: string; data: UpdateRoleDto }): Promise<Role> {
    const role = await this.findById({ id: payload.id });
    if (role.isSystem && payload.data.code && payload.data.code !== role.code) {
      throw new BadRequestException('System role code cannot be changed');
    }
    if (payload.data.code) {
      const existing = await this.roleRepo.findByCode(payload.data.code);
      if (existing && existing.id !== payload.id) {
        throw new ConflictException(`Role ${payload.data.code} already exists`);
      }
    }
    return this.roleRepo.update(payload.id, {
      ...payload.data,
      ...(payload.data.code
        ? { code: payload.data.code.toUpperCase() }
        : {}),
    });
  }

  async softDelete(payload: { id: string }): Promise<Role> {
    const role = await this.findById(payload);
    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }
    return this.roleRepo.softDelete(payload.id);
  }
}
