import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { BaseController } from '../../../common/base/base.controller';
import { sealToken } from '../crypto/token-seal';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AUTH_COOKIE, AuthGuard, AuthUser } from './guards/auth.guard';

@Controller('api/auth')
export class AuthController extends BaseController {
  constructor(
    private readonly authService: AuthService,
    responseBuilder: ResponseBuilder,
  ) {
    super(AuthController.name, responseBuilder);
  }

  @Post('login')
  async login(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      async (data) => {
        const result = await this.authService.login(data);
        res.cookie(AUTH_COOKIE, sealToken(result.token), {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        });
        return { user: result.user };
      },
      payload,
      'Logged in',
    );
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): Promise<ResponseVm> {
    return this.executeMethod(
      async () => {
        res.clearCookie(AUTH_COOKIE, { path: '/' });
        return { ok: true };
      },
      {} as never,
      'Logged out',
    );
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: { user: AuthUser }): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.authService.me(data.id),
      req.user,
      'Session fetched',
    );
  }
}
