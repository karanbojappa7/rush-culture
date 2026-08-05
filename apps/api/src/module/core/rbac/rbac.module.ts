import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { AccessController } from './access.controller';
import { PermissionsGuard } from './permissions.guard';
import { RbacService } from './rbac.service';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AccessController],
  providers: [RbacService, PermissionsGuard],
  exports: [RbacService, PermissionsGuard],
})
export class RbacModule {}
