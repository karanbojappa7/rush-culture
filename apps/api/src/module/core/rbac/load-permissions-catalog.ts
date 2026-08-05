import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export type PermissionDefinition = {
  code: string;
  name: string;
  description?: string;
  module: string;
  moduleName: string;
};

export type PermissionsCatalog = {
  permissions: PermissionDefinition[];
  roleDefaults: Record<string, string[]>;
  modules: Array<{ key: string; name: string }>;
};

type YamlShape = {
  modules: Array<{
    key: string;
    name: string;
    permissions: Array<{
      code: string;
      name: string;
      description?: string;
    }>;
  }>;
  role_defaults: Record<string, string[]>;
};

export function loadPermissionsCatalog(): PermissionsCatalog {
  const candidates = [
    path.join(__dirname, 'permissions.yml'),
    path.join(process.cwd(), 'src/module/core/rbac/permissions.yml'),
    path.join(process.cwd(), 'dist/module/core/rbac/permissions.yml'),
  ];
  let raw = '';
  for (const file of candidates) {
    if (fs.existsSync(file)) {
      raw = fs.readFileSync(file, 'utf8');
      break;
    }
  }
  if (!raw) {
    throw new Error('permissions.yml not found');
  }
  const parsed = yaml.load(raw) as YamlShape;
  const permissions: PermissionDefinition[] = [];
  for (const module of parsed.modules || []) {
    for (const permission of module.permissions || []) {
      permissions.push({
        code: permission.code,
        name: permission.name,
        description: permission.description,
        module: module.key,
        moduleName: module.name,
      });
    }
  }
  return {
    permissions,
    roleDefaults: parsed.role_defaults || {},
    modules: (parsed.modules || []).map((module) => ({
      key: module.key,
      name: module.name,
    })),
  };
}
