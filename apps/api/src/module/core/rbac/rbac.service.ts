import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseService } from '../../../common/base/base.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  loadPermissionsCatalog,
  type PermissionDefinition,
} from './load-permissions-catalog';

const SYSTEM_ROLES = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Full platform and access-control management',
  },
  {
    code: 'ADMIN',
    name: 'Admin',
    description: 'Operations: revenue, catalog, queries, reviews',
  },
  {
    code: 'STAFF',
    name: 'Staff',
    description: 'Day-to-day store operations',
  },
  {
    code: 'CUSTOMER',
    name: 'Customer',
    description: 'Storefront shopper (non-staff)',
  },
] as const;

@Injectable()
export class RbacService extends BaseService implements OnModuleInit {
  private catalog = loadPermissionsCatalog();
  private permissionCache = new Map<string, string[]>();

  constructor(private readonly prisma: PrismaService) {
    super(RbacService.name);
  }

  async onModuleInit() {
    await this.syncCatalog();
    await this.seedSystemRoles();
    await this.seedDefaultRolePermissions();
  }

  getCatalog() {
    return this.catalog;
  }

  listPermissionDefinitions(): PermissionDefinition[] {
    return this.catalog.permissions;
  }

  async listPermissions() {
    return this.prisma.permission.findMany({
      where: { isDeleted: false, isActive: true },
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });
  }

  async getRolePermissionCodes(roleCode: string): Promise<string[]> {
    const code = roleCode.toUpperCase();
    if (code === 'SUPER_ADMIN') {
      return this.catalog.permissions.map((permission) => permission.code);
    }
    const cached = this.permissionCache.get(code);
    if (cached) return cached;

    const role = await this.prisma.role.findFirst({
      where: { code, isDeleted: false },
      include: {
        rolePermissions: {
          where: { isDeleted: false },
          include: { permission: true },
        },
      },
    });
    const codes =
      role?.rolePermissions
        .filter((row) => !row.permission.isDeleted && row.permission.isActive)
        .map((row) => row.permission.code) ?? [];
    this.permissionCache.set(code, codes);
    return codes;
  }

  clearPermissionCache(roleCode?: string) {
    if (roleCode) this.permissionCache.delete(roleCode.toUpperCase());
    else this.permissionCache.clear();
  }

  async roleHasPermission(
    roleCode: string,
    required: string | string[],
  ): Promise<boolean> {
    if (roleCode.toUpperCase() === 'SUPER_ADMIN') return true;
    const codes = await this.getRolePermissionCodes(roleCode);
    const needed = Array.isArray(required) ? required : [required];
    return needed.some((code) => codes.includes(code));
  }

  async getPermissionMatrix() {
    const catalog = this.catalog;
    const [roles, permissions, mappings] = await Promise.all([
      this.prisma.role.findMany({
        where: {
          isDeleted: false,
          isActive: true,
          code: { not: 'CUSTOMER' },
        },
        orderBy: { code: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          isSystem: true,
        },
      }),
      this.listPermissions(),
      this.prisma.rolePermission.findMany({
        where: { isDeleted: false },
        include: {
          permission: true,
          role: true,
        },
      }),
    ]);

    const grants: Record<string, string[]> = {};
    for (const role of roles) {
      if (role.code === 'SUPER_ADMIN') {
        grants[role.id] = permissions.map((permission) => permission.code);
      } else {
        grants[role.id] = [];
      }
    }
    for (const mapping of mappings) {
      if (mapping.role.code === 'SUPER_ADMIN') continue;
      if (mapping.role.isDeleted || mapping.permission.isDeleted) continue;
      if (!grants[mapping.roleId]) grants[mapping.roleId] = [];
      grants[mapping.roleId].push(mapping.permission.code);
    }

    const groupMap = new Map<
      string,
      {
        key: string;
        name: string;
        permissions: Array<{
          id: string;
          code: string;
          name: string;
          description: string | null;
        }>;
      }
    >();

    for (const module of catalog.modules) {
      groupMap.set(module.key, {
        key: module.key,
        name: module.name,
        permissions: [],
      });
    }

    for (const permission of permissions) {
      const moduleName =
        catalog.modules.find((module) => module.key === permission.module)
          ?.name ?? permission.module;
      if (!groupMap.has(permission.module)) {
        groupMap.set(permission.module, {
          key: permission.module,
          name: moduleName,
          permissions: [],
        });
      }
      groupMap.get(permission.module)!.permissions.push({
        id: permission.id,
        code: permission.code,
        name: permission.name,
        description: permission.description,
      });
    }

    return {
      roles,
      groups: [...groupMap.values()].filter(
        (group) => group.permissions.length > 0,
      ),
      grants,
    };
  }

  async setPermissionMatrix(
    grants: Array<{ roleId: string; permissionCodes: string[] }>,
  ) {
    for (const grant of grants) {
      await this.setRolePermissions(grant.roleId, grant.permissionCodes);
    }
    this.clearPermissionCache();
    return this.getPermissionMatrix();
  }

  async getRolePermissions(roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, isDeleted: false },
      include: {
        rolePermissions: {
          where: { isDeleted: false },
          include: { permission: true },
        },
      },
    });
    return role;
  }

  async setRolePermissions(roleId: string, permissionCodes: string[]) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, isDeleted: false },
    });
    if (!role) return null;
    if (role.code === 'SUPER_ADMIN') {
      return this.getRolePermissions(roleId);
    }

    const permissions = await this.prisma.permission.findMany({
      where: {
        code: { in: permissionCodes },
        isDeleted: false,
      },
    });
    const permissionIds = new Set(permissions.map((item) => item.id));

    const existing = await this.prisma.rolePermission.findMany({
      where: { roleId, isDeleted: false },
    });

    for (const row of existing) {
      if (!permissionIds.has(row.permissionId)) {
        await this.prisma.rolePermission.update({
          where: { id: row.id },
          data: { isDeleted: true },
        });
      }
    }

    const existingIds = new Set(existing.map((row) => row.permissionId));
    for (const permission of permissions) {
      if (existingIds.has(permission.id)) continue;
      const soft = await this.prisma.rolePermission.findFirst({
        where: { roleId, permissionId: permission.id },
      });
      if (soft) {
        await this.prisma.rolePermission.update({
          where: { id: soft.id },
          data: { isDeleted: false },
        });
      } else {
        await this.prisma.rolePermission.create({
          data: {
            roleId,
            permissionId: permission.id,
            isDeleted: false,
          },
        });
      }
    }

    this.clearPermissionCache(role.code);
    return this.getRolePermissions(roleId);
  }

  async dashboard() {
    const [roles, permissions, staffUsers, mappings] = await Promise.all([
      this.prisma.role.count({
        where: { isDeleted: false, code: { not: 'CUSTOMER' } },
      }),
      this.prisma.permission.count({ where: { isDeleted: false } }),
      this.prisma.user.count({
        where: {
          isDeleted: false,
          role: { code: { in: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] } },
        },
      }),
      this.prisma.rolePermission.count({ where: { isDeleted: false } }),
    ]);
    return {
      roles,
      permissions,
      staffUsers,
      mappings,
      modules: this.catalog.modules,
    };
  }

  private async syncCatalog() {
    this.catalog = loadPermissionsCatalog();
    for (const definition of this.catalog.permissions) {
      const existing = await this.prisma.permission.findFirst({
        where: { code: definition.code },
      });
      if (!existing) {
        await this.prisma.permission.create({
          data: {
            code: definition.code,
            name: definition.name,
            description: definition.description,
            module: definition.module,
            isActive: true,
            isDeleted: false,
          },
        });
      } else if (existing.isDeleted) {
        await this.prisma.permission.update({
          where: { id: existing.id },
          data: {
            isDeleted: false,
            isActive: true,
            name: definition.name,
            description: definition.description,
            module: definition.module,
          },
        });
      } else {
        await this.prisma.permission.update({
          where: { id: existing.id },
          data: {
            name: definition.name,
            description: definition.description,
            module: definition.module,
          },
        });
      }
    }
    this.logger.log(
      `Synced ${this.catalog.permissions.length} permissions from YAML`,
    );
  }

  private async seedSystemRoles() {
    for (const role of SYSTEM_ROLES) {
      const existing = await this.prisma.role.findFirst({
        where: { code: role.code },
      });
      if (!existing) {
        await this.prisma.role.create({
          data: {
            ...role,
            isSystem: true,
            isActive: true,
            isDeleted: false,
          },
        });
      } else {
        await this.prisma.role.update({
          where: { id: existing.id },
          data: {
            name: role.name,
            description: role.description,
            isSystem: true,
            isDeleted: false,
            isActive: true,
          },
        });
      }
    }
  }

  private async seedDefaultRolePermissions() {
    for (const [roleCode, codes] of Object.entries(this.catalog.roleDefaults)) {
      if (roleCode === 'SUPER_ADMIN') continue;
      const role = await this.prisma.role.findFirst({
        where: { code: roleCode, isDeleted: false },
      });
      if (!role) continue;
      const existingCount = await this.prisma.rolePermission.count({
        where: { roleId: role.id, isDeleted: false },
      });
      if (existingCount > 0) continue;
      const expanded =
        codes.includes('*')
          ? this.catalog.permissions.map((item) => item.code)
          : codes;
      await this.setRolePermissions(role.id, expanded);
      this.logger.log(`Seeded default permissions for ${roleCode}`);
    }
  }
}
