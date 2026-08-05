import { Body, Controller, Get, Put } from '@nestjs/common';
import { BaseController } from '../../../common/base/base.controller';
import { PermissionsAuth } from '../rbac/permissions.decorator';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { UpdatePoliciesSettingsDto } from './dto/update-policies-settings.dto';
import { PolicySettingsService } from './policy-settings.service';

@Controller('api/policy-settings')
export class PolicySettingsController extends BaseController {
  constructor(
    private readonly policySettingsService: PolicySettingsService,
    responseBuilder: ResponseBuilder,
  ) {
    super(PolicySettingsController.name, responseBuilder);
  }

  @Get()
  get(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.policySettingsService.get(),
      undefined as never,
      'Policy settings fetched',
    );
  }

  @Put()
  @PermissionsAuth('policies.manage')
  update(@Body() payload: UpdatePoliciesSettingsDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.policySettingsService.update(data),
      payload,
      'Policy settings updated',
    );
  }
}
