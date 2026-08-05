import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { BaseService } from '../../../../common/base/base.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleRepo } from './role.repo';

const DEFAULT_ROLES = [
  { code: 'CUSTOMER', name: 'Customer', description: 'Storefront shopper' },
  { code: 'STAFF', name: 'Staff', description: 'Store operations staff' },
  { code: 'ADMIN', name: 'Admin', description: 'Full platform access' },
] as const;

@Injectable()
export class RoleService extends BaseService implements OnModuleInit {
  constructor(private readonly roleRepo: RoleRepo) {
    super(RoleService.name);
  }

  async onModuleInit() {
    for (const role of DEFAULT_ROLES) {
      const existing = await this.roleRepo.findByCode(role.code);
      if (!existing) {
        await this.roleRepo.create({ ...role });
      }
    }
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

  async findAll(): Promise<Role[]> {
    return this.roleRepo.findAll({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async update(payload: { id: string; data: UpdateRoleDto }): Promise<Role> {
    await this.findById({ id: payload.id });
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
    await this.findById(payload);
    return this.roleRepo.softDelete(payload.id);
  }
}
