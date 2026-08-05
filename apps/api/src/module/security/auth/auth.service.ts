import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { BaseService } from '../../../common/base/base.service';
import { RbacService } from '../../../common/rbac/rbac.service';
import { RoleService } from '../../core/user/role/role.service';
import { UserTypeService } from '../../core/user/user-type/user-type.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from './guards/auth.guard';

const STAFF_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'STAFF']);

@Injectable()
export class AuthService extends BaseService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly roleService: RoleService,
    private readonly userTypeService: UserTypeService,
    private readonly rbacService: RbacService,
  ) {
    super(AuthService.name);
  }

  async onModuleInit() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return;

    const superRole = await this.roleService.findByCode('SUPER_ADMIN');
    const existing = await this.prisma.user.findFirst({
      where: { email, isDeleted: false },
      include: { role: true },
    });
    if (existing) {
      if (existing.role.code !== 'SUPER_ADMIN') {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: { roleId: superRole.id },
        });
        this.logger.log(`Upgraded ${email} to SUPER_ADMIN`);
      }
      return;
    }

    const userType = await this.userTypeService.findByCode('INTERNAL');
    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.user.create({
      data: {
        email,
        name: 'Super Admin',
        passwordHash,
        roleId: superRole.id,
        userTypeId: userType.id,
        isDeleted: false,
      },
    });
    this.logger.log(`Bootstrapped super admin user ${email}`);
  }

  async login(payload: LoginDto): Promise<{ token: string; user: AuthUser }> {
    const user = await this.prisma.user.findFirst({
      where: { email: payload.email.toLowerCase(), isDeleted: false },
      include: { role: true },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const ok = await bcrypt.compare(payload.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!STAFF_ROLES.has(user.role.code)) {
      throw new UnauthorizedException('Staff access required');
    }
    const permissions = await this.rbacService.getRolePermissionCodes(
      user.role.code,
    );
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      roleCode: user.role.code,
      permissions,
    };
    const token = await this.jwtService.signAsync({
      sub: authUser.id,
      email: authUser.email,
      name: authUser.name,
      roleCode: authUser.roleCode,
    });
    return { token, user: authUser };
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    const permissions = await this.rbacService.getRolePermissionCodes(
      user.role.code,
    );
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleCode: user.role.code,
      permissions,
    };
  }
}
