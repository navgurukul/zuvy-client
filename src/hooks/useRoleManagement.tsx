"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRbacResources } from '@/hooks/useRbacResources'
import { useRbacPermissions } from '@/hooks/useRbacPermissions'
import { useRoles } from '@/hooks/useRoles'
import { useAssignPermissions } from '@/hooks/useAssignPermissions'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { getPermissionLevelFromPermissions, permissionLevelToTier, PERMISSION_TIERS, PERMISSION_LEVELS } from '@/utils/types/rbac'

import type { PermissionLevel, PermissionTier } from '@/utils/types/rbac'

export interface RoleAction {
    id: number
    title: string
    description: string
    isSelected?: boolean
    permissions?: string[]
}

export const useRoleManagement = (selectedRole?: string, onRoleChange?: (role: string) => void) => {
    const searchParams = useSearchParams()
    const { roles } = useRoles()
    const { assignPermissions, loading: assigning } = useAssignPermissions()
    const [roleId, setRoleId] = useState<number | undefined>(undefined)

    const [resourcePermissions, setResourcePermissions] = useState<Record<number, Record<number, boolean>>>({})
    const [originalResourcePermissions, setOriginalResourcePermissions] = useState<Record<number, Record<number, boolean>>>({})
    const [permissionLevels, setPermissionLevels] = useState<Record<number, PermissionLevel>>({})
    const [permissionsData, setPermissionsData] = useState<Record<number, Array<{ id: number; name: string; granted?: boolean }>>>({})

    const [showWarningModal, setShowWarningModal] = useState(false)
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

    const router = useRouter()
    const pathname = usePathname()
    const [currentPath, setCurrentPath] = useState<string>(pathname)
    const [pendingRoute, setPendingRoute] = useState<string | null>(null)

    const { resources, loading, error } = useRbacResources(true)
    const { fetchAllPermissions } = useRbacPermissions()

    const resourceIds = useMemo(() => (resources || []).map(r => r.id), [resources])
    const [lastFetchedRoleId, setLastFetchedRoleId] = useState<number | undefined>(undefined)

    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
    const [hoveredRowId, setHoveredRowId] = useState<number | null>(null)
    const [parentLockedModules, setParentLockedModules] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (roleId && resourceIds.length > 0 && roleId !== lastFetchedRoleId) {
            const loadAllPermissions = async () => {
                const newPermissionsData = await fetchAllPermissions(resourceIds, roleId)

                const newResourcePermissions: Record<number, Record<number, boolean>> = {}
                const newPermissionLevels: Record<number, PermissionLevel> = {}

                for (const resourceId of Object.keys(newPermissionsData).map(Number)) {
                    const permissions = newPermissionsData[resourceId] || []
                    const permMap: Record<number, boolean> = {}
                    let view = false
                    let create = false
                    let edit = false
                    let deletePerm = false

                    permissions.forEach((perm: any) => {
                        const granted = perm.granted || false
                        permMap[perm.id] = granted

                        const permName = (perm.name || '').toLowerCase()
                        if (permName.includes('view') || permName.includes('read')) {
                            view = granted
                        } else if (permName.includes('create') || permName.includes('add')) {
                            create = granted
                        } else if (permName.includes('edit') || permName.includes('update')) {
                            edit = granted
                        } else if (permName.includes('delete') || permName.includes('remove')) {
                            deletePerm = granted
                        }
                    })

                    newResourcePermissions[resourceId] = permMap
                    newPermissionLevels[resourceId] = getPermissionLevelFromPermissions(view, create, edit, deletePerm)
                }

                setPermissionsData(newPermissionsData)
                setResourcePermissions(newResourcePermissions)
                setOriginalResourcePermissions(JSON.parse(JSON.stringify(newResourcePermissions)))
                setPermissionLevels(newPermissionLevels)
                setLastFetchedRoleId(roleId)
            }

            loadAllPermissions()
        }
    }, [roleId, resourceIds, fetchAllPermissions, lastFetchedRoleId])

    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(resourcePermissions) !== JSON.stringify(originalResourcePermissions)
    }, [resourcePermissions, originalResourcePermissions])

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
                return e.returnValue
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [hasUnsavedChanges])

    useEffect(() => {
        setCurrentPath(pathname)
    }, [pathname])

    const roleActions: RoleAction[] = useMemo(
        () =>
            (resources || []).map((r) => ({
                id: r.id,
                title: r.title,
                description: r.description,
                permissions: r.permissions || [],
            })),
        [resources]
    )

    const groupedResources = useMemo(() => {
        const groups: Record<string, { id: string; children: RoleAction[] }> = {}

        roleActions.forEach(action => {
            let mainModule = 'Course Studio'

            const title = (action.title || '').toLowerCase()
            const description = (action.description || '').toLowerCase()

            if (title.includes('mcq') || 
                title.includes('question') || 
                title.includes('coding') ||
                description.includes('content bank') ||
                description.includes('mcq') ||
                description.includes('question')) {
                mainModule = 'Content Bank'
            }

            if (!groups[mainModule]) {
                groups[mainModule] = {
                    id: mainModule.toLowerCase().replace(/\s+/g, '-'),
                    children: []
                }
            }

            groups[mainModule].children.push(action)
        })

        return groups
    }, [roleActions])

    const handlePermissionChange = (resourceId: number, tier: PermissionTier, isParent: boolean = false) => {
        const tierToLevel: Record<PermissionTier, PermissionLevel> = {
            0: 'No access',
            1: 'Viewer',
            2: 'Editor',
            3: 'Creator',
            4: 'Manager',
        }

        const level = tierToLevel[tier]
            const levelPermissions = PERMISSION_LEVELS
        // build new permissions for a resource
        const updateResourcePermissions = (resId: number) => {
            const permissions = permissionsData[resId] || []
            const newPerms: Record<number, boolean> = {}

            const levelPerms = PERMISSION_LEVELS
            permissions.forEach((perm: any) => {
                const permName = (perm.name || '').toLowerCase()
                if (permName.includes('view') || permName.includes('read')) {
                    newPerms[perm.id] = levelPerms ? levelPerms[level].view : false
                } else if (permName.includes('create') || permName.includes('add')) {
                    newPerms[perm.id] = levelPerms ? levelPerms[level].create : false
                } else if (permName.includes('edit') || permName.includes('update')) {
                    newPerms[perm.id] = levelPerms ? levelPerms[level].edit : false
                } else if (permName.includes('delete') || permName.includes('remove')) {
                    newPerms[perm.id] = levelPerms ? levelPerms[level].delete : false
                } else {
                    newPerms[perm.id] = resourcePermissions[resId]?.[perm.id] || false
                }
            })

            return newPerms
        }

        if (isParent) {
            const newResourcePermissions: Record<number, Record<number, boolean>> = { ...resourcePermissions }
            const newPermissionLevels: Record<number, PermissionLevel> = { ...permissionLevels }

            for (const [moduleName, module] of Object.entries(groupedResources)) {
                if (module.children.some(child => child.id === resourceId)) {
                    module.children.forEach(child => {
                        newResourcePermissions[child.id] = updateResourcePermissions(child.id)
                        newPermissionLevels[child.id] = tierToLevel[tier]
                    })
                    if (tierToLevel[tier] === 'No access') {
                        setParentLockedModules((prev) => {
                            const next = new Set(prev)
                            next.add(module.id)
                            return next
                        })
                    } else {
                        setParentLockedModules((prev) => {
                            if (!prev.has(module.id)) return prev
                            const next = new Set(prev)
                            next.delete(module.id)
                            return next
                        })
                    }
                    break
                }
            }

            setResourcePermissions(newResourcePermissions)
            setPermissionLevels(newPermissionLevels)
        } else {
            const newPerms = updateResourcePermissions(resourceId)

            setResourcePermissions((prev) => ({
                ...prev,
                [resourceId]: newPerms,
            }))

            setPermissionLevels((prev) => ({
                ...prev,
                [resourceId]: tierToLevel[tier],
            }))

            for (const [moduleName, module] of Object.entries(groupedResources)) {
                if (module.children.some(child => child.id === resourceId)) {
                    setParentLockedModules((prev) => {
                        if (!prev.has(module.id)) return prev
                        const next = new Set(prev)
                        next.delete(module.id)
                        return next
                    })
                    break
                }
            }
        }
    }

    const handleSaveAllPermissions = async (resolveRoleId: () => number | undefined) => {
        const currentRoleId = resolveRoleId()
        if (!currentRoleId) return

        try {
            for (const resourceId of Object.keys(resourcePermissions).map(Number)) {
                const currentPerms = resourcePermissions[resourceId] || {}
                const originalPerms = originalResourcePermissions[resourceId] || {}

                const hasChanged = JSON.stringify(currentPerms) !== JSON.stringify(originalPerms)

                if (hasChanged && Object.keys(currentPerms).length > 0) {
                    await assignPermissions({
                        resourceId,
                        roleId: currentRoleId,
                        permissions: currentPerms,
                    })
                }
            }

            setOriginalResourcePermissions(JSON.parse(JSON.stringify(resourcePermissions)))
        } catch (error) {
            console.error('Error saving permissions:', error)
        }
    }

    const discardChanges = (recalculateLevels?: () => void) => {
        setResourcePermissions(JSON.parse(JSON.stringify(originalResourcePermissions)))
        if (recalculateLevels) recalculateLevels()
        setShowWarningModal(false)
        setTimeout(() => {
            if (pendingAction) {
                pendingAction()
                setPendingAction(null)
            } else if (pendingRoute) {
                if (pendingRoute === 'back') {
                    window.history.back()
                } else if (pendingRoute === 'forward') {
                    window.history.forward()
                } else {
                    if (pendingRoute.startsWith('http')) {
                        window.location.href = pendingRoute
                    } else {
                        router.push(pendingRoute)
                    }
                }
                setPendingRoute(null)
            }
        }, 100)
    }

    return {
        roles,
        resources,
        loading,
        error,
        assigning,
        roleId,
        setRoleId,
        resourcePermissions,
        originalResourcePermissions,
        permissionLevels,
        permissionsData,
        showWarningModal,
        setShowWarningModal,
        pendingAction,
        setPendingAction,
        currentPath,
        pendingRoute,
        setPendingRoute,
        expandedModules,
        setExpandedModules,
        hoveredRowId,
        setHoveredRowId,
        parentLockedModules,
        setParentLockedModules,
        resourceIds,
        lastFetchedRoleId,
        setLastFetchedRoleId,
        groupedResources,
        roleActions,
        handlePermissionChange,
        hasUnsavedChanges,
        handleSaveAllPermissions,
        discardChanges,
    }
}

export default useRoleManagement
