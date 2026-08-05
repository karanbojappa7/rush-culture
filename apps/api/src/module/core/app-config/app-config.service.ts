import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppConfig } from '@prisma/client';
import { BaseService } from '../../../common/base/base.service';
import {
  PageQuery,
  PageResult,
} from '../../../common/pagination/pagination.utility';
import { CreateAppConfigDto } from './dto/create-app-config.dto';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';
import { AppConfigRepo } from './app-config.repo';
import { normalizeKey } from './utility/app-config-key.utility';

@Injectable()
export class AppConfigService extends BaseService {
  constructor(private readonly appConfigRepo: AppConfigRepo) {
    super(AppConfigService.name);
  }

  async create(payload: CreateAppConfigDto): Promise<AppConfig> {
    const key = normalizeKey(payload.key);
    const existing = await this.appConfigRepo.findByKey(key);
    if (existing) {
      throw new ConflictException(`App config ${key} already exists`);
    }

    return this.appConfigRepo.create({
      key,
      value: payload.value,
      description: payload.description,
      isActive: payload.isActive,
    });
  }

  async findById(payload: { id: string }): Promise<AppConfig> {
    const appConfig = await this.appConfigRepo.findById(payload.id);
    if (!appConfig) {
      throw new NotFoundException(`App config ${payload.id} not found`);
    }
    return appConfig;
  }

  async findByKey(key: string): Promise<AppConfig> {
    const normalizedKey = normalizeKey(key);
    const appConfig = await this.appConfigRepo.findByKey(normalizedKey);
    if (!appConfig) {
      throw new NotFoundException(`App config ${normalizedKey} not found`);
    }
    return appConfig;
  }

  async findAll(pageQuery: PageQuery): Promise<PageResult<AppConfig>> {
    return this.appConfigRepo.findPage(pageQuery, {
      orderBy: { key: 'asc' },
    });
  }

  async update(payload: {
    id: string;
    data: UpdateAppConfigDto;
  }): Promise<AppConfig> {
    const appConfig = await this.findById({ id: payload.id });
    const key = payload.data.key ? normalizeKey(payload.data.key) : undefined;

    if (key && key !== appConfig.key) {
      const existing = await this.appConfigRepo.findByKey(key);
      if (existing) {
        throw new ConflictException(`App config ${key} already exists`);
      }
    }

    return this.appConfigRepo.update(payload.id, {
      ...payload.data,
      key,
    });
  }

  async softDelete(payload: { id: string }): Promise<AppConfig> {
    await this.findById(payload);
    return this.appConfigRepo.softDelete(payload.id);
  }
}
