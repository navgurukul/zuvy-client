// lib/permissionsStorage.ts
import { db } from "./indexDb"; 

export interface PermissionRow {
  key: string;
  value: boolean;
}

/**
 * Returns permissions as a merged object:
 * { createCourse: true, viewCourse: false, ... }
 */
// add dummy data for the below function to work:
export async function getPermissions(): Promise<Record<string, boolean>> {
  const allPermissions: PermissionRow[] = await db.permissions.toArray();
  const permObjects = allPermissions.map((perm) => ({ [perm.key]: perm.value }));
  const mergedPermissions = Object.assign({}, ...permObjects);
  return mergedPermissions;
}
