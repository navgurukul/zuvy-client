// RBAC types and helpers
export type PermissionTier = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type PermissionLevel =
  | 'No access'
  | 'View only'
  | 'View + Edit'
  | 'View + Delete'
  | 'View + Edit + Delete'
  | 'View + Create + Edit'
  | 'Full access'

export const PERMISSION_LEVELS: Record<PermissionLevel, { view: boolean; create: boolean; edit: boolean; delete: boolean }> = {
  'No access': { view: false, create: false, edit: false, delete: false },
  'View only': { view: true, create: false, edit: false, delete: false },
  'View + Edit': { view: true, create: false, edit: true, delete: false },
  'View + Delete': { view: true, create: false, edit: false, delete: true },
  'View + Edit + Delete': { view: true, create: false, edit: true, delete: true },
  'View + Create + Edit': { view: true, create: true, edit: true, delete: false },
  'Full access': { view: true, create: true, edit: true, delete: true },
}

export const PERMISSION_TIER_LEVELS: Record<PermissionTier, PermissionLevel> = {
  0: 'No access',
  1: 'View only',
  2: 'View + Edit',
  3: 'View + Delete',
  4: 'View + Edit + Delete',
  5: 'View + Create + Edit',
  6: 'Full access',
}

export const PERMISSION_TIERS: Record<PermissionTier, {
  tier: PermissionTier
  label: string
  description: string
  colorClass: string
  textColorClass: string
  borderColorClass: string
  backgroundColor: string
  darkBackgroundColor: string
  dotColorClass: string
}> = {
  0: {
    tier: 0,
    label: 'NO ACCESS',
    description: 'No visibility',
    colorClass: 'text-muted-dark/80',
    textColorClass: 'text-muted-dark/90',
    borderColorClass: 'border-slate-400',
    backgroundColor: 'bg-slate-100',
    darkBackgroundColor: 'dark:bg-muted/50',
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
    darkBackgroundColor: 'dark:bg-info/20',
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
    darkBackgroundColor: 'dark:bg-warning/20',
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
    darkBackgroundColor: 'dark:bg-secondary/20',
    dotColorClass: 'bg-secondary-dark',
  },
  4: {
    tier: 4,
    label: 'VIEW + EDIT + DELETE',
    description: 'View + Edit + Delete',
    colorClass: 'text-success',
    textColorClass: 'text-success',
    borderColorClass: 'border-success',
    backgroundColor: 'bg-success-light',
    darkBackgroundColor: 'dark:bg-success/20',
    dotColorClass: 'bg-success',
  },
  5: {
    tier: 5,
    label: 'VIEW + CREATE + EDIT',
    description: 'View + Create + Edit',
    colorClass: 'text-secondary-dark',
    textColorClass: 'text-secondary-dark',
    borderColorClass: 'border-secondary-dark',
    backgroundColor: 'bg-secondary-light',
    darkBackgroundColor: 'dark:bg-secondary/20',
    dotColorClass: 'bg-secondary-dark',
  },
  6: {
    tier: 6,
    label: 'FULL ACCESS',
    description: 'Full access',
    colorClass: 'text-success',
    textColorClass: 'text-success',
    borderColorClass: 'border-success',
    backgroundColor: 'bg-success-light',
    darkBackgroundColor: 'dark:bg-success/20',
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
  if (view && !create && !edit && !deletePerm) return 'View only'
  if (view && !create && edit && !deletePerm) return 'View + Edit'
  if (view && !create && !edit && deletePerm) return 'View + Delete'
  if (view && !create && edit && deletePerm) return 'View + Edit + Delete'
  if (view && create && edit && !deletePerm) return 'View + Create + Edit'
  if (view && create && edit && deletePerm) return 'Full access'
  return 'No access'
}

export function permissionLevelToTier(level: PermissionLevel): PermissionTier {
  const mapping: Record<PermissionLevel, PermissionTier> = {
    'No access': 0,
    'View only': 1,
    'View + Edit': 2,
    'View + Delete': 3,
    'View + Edit + Delete': 4,
    'View + Create + Edit': 5,
    'Full access': 6,
  }
  return mapping[level]
}

export function getEffectivePermissionTier(
  childTier: PermissionTier,
  parentTier: PermissionTier,
): PermissionTier {
  const childPermissions = PERMISSION_LEVELS[PERMISSION_TIER_LEVELS[childTier]]
  const parentPermissions = PERMISSION_LEVELS[PERMISSION_TIER_LEVELS[parentTier]]
  const isAllowed = (Object.keys(childPermissions) as Array<keyof typeof childPermissions>)
    .every((permission) => !childPermissions[permission] || parentPermissions[permission])

  return isAllowed ? childTier : 0
}
