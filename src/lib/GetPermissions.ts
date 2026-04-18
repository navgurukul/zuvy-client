const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizePermissionMap = (
  value: unknown
): Record<string, boolean> => {
  if (!isRecord(value)) return {}

  const normalized: Record<string, boolean> = {}
  Object.entries(value).forEach(([key, permissionValue]) => {
    normalized[key] = Boolean(permissionValue)
  })

  return normalized
}

export async function getPermissions(): Promise<Record<string, boolean>> {
  if (typeof window === 'undefined') {
    return {}
  }

  const rawStoredPermissions = localStorage.getItem('AUTH_PERMISSIONS')
  if (rawStoredPermissions) {
    try {
      const parsedPermissions = JSON.parse(rawStoredPermissions)
      const normalizedPermissions = normalizePermissionMap(parsedPermissions)
      if (Object.keys(normalizedPermissions).length > 0) {
        return normalizedPermissions
      }
    } catch (error) {
      console.error('Failed to parse AUTH_PERMISSIONS:', error)
    }
  }

  const rawAuth = localStorage.getItem('AUTH')
  if (!rawAuth) {
    return {}
  }

  try {
    const parsedAuth = JSON.parse(rawAuth)
    return normalizePermissionMap(parsedAuth?.permissions)
  } catch (error) {
    console.error('Failed to parse AUTH user:', error)
    return {}
  }
}
