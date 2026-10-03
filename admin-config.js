import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

export function loadAdminPasswords(root = process.cwd()) {
  const file = path.join(root, 'data', 'admin-passwords.json');
  const local = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const result = {};
  for (const role of ['superadmin', 'auditadmin', 'applicationviewer', 'office', 'media', 'project', 'practice', 'dsj']) {
    const values = local[role] ?? [];
    if (!Array.isArray(values) || values.some(value => typeof value !== 'string' || !value.trim())) {
      throw new Error(`Invalid password configuration for ${role}`);
    }
    result[role] = values;
  }
  return result;
}
