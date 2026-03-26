// RBAC types and helpers
export type PermissionTier = 0 | 1 | 2 | 3 | 4

export type PermissionLevel =
  | 'No access'
  | 'Viewer'
  | 'Editor'
  | 'Creator'
  | 'Manager'

export const PERMISSION_LEVELS: Record<PermissionLevel, { view: boolean; create: boolean; edit: boolean; delete: boolean }> = {
  'No access': { view: false, create: false, edit: false, delete: false },
  Viewer: { view: true, create: false, edit: false, delete: false },
  Editor: { view: true, create: false, edit: true, delete: false },
  Creator: { view: true, create: true, edit: true, delete: false },
  Manager: { view: true, create: true, edit: true, delete: true },
}

export const PERMISSION_TIERS: Record<PermissionTier, {
  tier: PermissionTier
  label: string
  description: string
  colorClass: string
  textColorClass: string
  borderColorClass: string
  backgroundColor: string
  dotColorClass: string
}> = {
  0: {
    tier: 0,
    label: 'NO ACCESS',
    description: 'No visibility',
    colorClass: 'text-slate-600',
    textColorClass: 'text-slate-700',
    borderColorClass: 'border-slate-400',
    backgroundColor: 'bg-slate-100',
    dotColorClass: 'bg-slate-400',
  },
  1: {
    tier: 1,
    label: 'VIEWER',
    description: 'Read Only',
    colorClass: 'text-info',
    textColorClass: 'text-info',
    borderColorClass: 'border-info',
    backgroundColor: 'bg-info-light',
    dotColorClass: 'bg-info',
  },
  2: {
    tier: 2,
    label: 'EDITOR',
    description: 'View + Edit',
    colorClass: 'text-warning',
    textColorClass: 'text-warning',
    borderColorClass: 'border-warning',
    backgroundColor: 'bg-warning-light',
    dotColorClass: 'bg-warning',
  },
  3: {
    tier: 3,
    label: 'CREATOR',
    description: 'View + Edit + Create',
    colorClass: 'text-secondary-dark',
    textColorClass: 'text-secondary-dark',
    borderColorClass: 'border-secondary-dark',
    backgroundColor: 'bg-secondary-light',
    dotColorClass: 'bg-secondary-dark',
  },
  4: {
    tier: 4,
    label: 'MANAGER',
    description: 'Full Access',
    colorClass: 'text-success',
    textColorClass: 'text-success',
    borderColorClass: 'border-success',
    backgroundColor: 'bg-success-light',
    dotColorClass: 'bg-success',
  },
}

export function getPermissionLevelFromPermissions(
  view: boolean,
  create: boolean,
  edit: boolean,
  deletePerm: boolean
): PermissionLevel {
  if (!view && !create && !edit && !deletePerm) return 'No access'
  if (view && !create && !edit && !deletePerm) return 'Viewer'
  if (view && !create && edit && !deletePerm) return 'Editor'
  if (view && create && edit && !deletePerm) return 'Creator'
  if (view && create && edit && deletePerm) return 'Manager'
  return 'No access'
}

export function permissionLevelToTier(level: PermissionLevel): PermissionTier {
  const mapping: Record<PermissionLevel, PermissionTier> = {
    'No access': 0,
    Viewer: 1,
    Editor: 2,
    Creator: 3,
    Manager: 4,
  }
  return mapping[level]
}
