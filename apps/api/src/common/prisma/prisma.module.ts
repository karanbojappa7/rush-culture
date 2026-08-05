import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ResponseBuilder } from '../response/response.builder';

@Global()
@Module({
  providers: [PrismaService, ResponseBuilder],
  exports: [PrismaService, ResponseBuilder],
})
export class PrismaModule {}
