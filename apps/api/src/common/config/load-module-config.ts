import { readFileSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';
import { ModuleConfig } from './module-config.types';

export function loadModuleConfig(moduleDir: string): ModuleConfig {
  const candidates = [
    join(moduleDir, 'config', 'module.yml'),
    join(moduleDir, 'config', 'module.yaml'),
  ];

  for (const filePath of candidates) {
    try {
      const raw = readFileSync(filePath, 'utf8');
      const parsed = load(raw) as ModuleConfig;
      if (!parsed?.name) {
        throw new Error(`Invalid module config at ${filePath}`);
      }
      return parsed;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as NodeJS.ErrnoException).code === 'ENOENT'
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(`module.yml not found under ${moduleDir}/config`);
}

export function loadModuleConfigFromFilename(filename: string): ModuleConfig {
  return loadModuleConfig(join(__dirname, '..', '..', filename));
}
