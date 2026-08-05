import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BaseController } from '../../../common/base/base.controller';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { CreateAppConfigDto } from './dto/create-app-config.dto';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';
import { AppConfigService } from './app-config.service';

@Controller('api/app-configs')
export class AppConfigController extends BaseController {
  constructor(
    private readonly appConfigService: AppConfigService,
    responseBuilder: ResponseBuilder,
  ) {
    super(AppConfigController.name, responseBuilder);
  }

  @Post()
  create(@Body() payload: CreateAppConfigDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.appConfigService.create(data),
      payload,
      'App config created',
    );
  }

  @Get()
  findAll(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.appConfigService.findAll(),
      {},
      'App configs fetched',
    );
  }

  @Get('key/:key')
  findByKey(@Param('key') key: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.appConfigService.findByKey(data.key),
      { key },
      'App config fetched',
    );
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.appConfigService.findById(data),
      { id },
      'App config fetched',
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateAppConfigDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.appConfigService.update(payload),
      { id, data },
      'App config updated',
    );
  }

  @Delete(':id')
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.appConfigService.softDelete(data),
      { id },
      'App config deleted',
    );
  }
}
