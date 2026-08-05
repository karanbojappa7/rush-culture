import { Module } from '@nestjs/common';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { RoleController } from './role/role.controller';
import { RoleRepo } from './role/role.repo';
import { RoleService } from './role/role.service';
import { UserTypeController } from './user-type/user-type.controller';
import { UserTypeRepo } from './user-type/user-type.repo';
import { UserTypeService } from './user-type/user-type.service';
import { UserController } from './user.controller';
import { UserRepo } from './user.repo';
import { UserService } from './user.service';

@Module({
  controllers: [UserController, RoleController, UserTypeController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    UserService,
    UserRepo,
    RoleService,
    RoleRepo,
    UserTypeService,
    UserTypeRepo,
  ],
  exports: [
    UserService,
    UserRepo,
    RoleService,
    RoleRepo,
    UserTypeService,
    UserTypeRepo,
    MODULE_CONFIG,
  ],
})
export class UserModule {}
