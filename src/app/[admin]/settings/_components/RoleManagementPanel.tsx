'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, AlertTriangle, ChevronDown, Info, GraduationCap, BookOpen, Users, UserCheck, 
    FileText, Settings, List, Code, MessageSquare } from 'lucide-react'
import { useRbacResources } from '@/hooks/useRbacResources'
import { useRbacPermissions } from '@/hooks/useRbacPermissions'
import { useRoles } from '@/hooks/useRoles'
import { useAssignPermissions } from '@/hooks/useAssignPermissions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface RoleAction {
    id: number
    title: string
    description: string
    isSelected?: boolean
    permissions?: string[]
}

interface RoleManagementPanelProps {
    selectedRole: string | undefined
    onRoleChange: (role: string) => void
}

// Permission tier type
type PermissionTier = 0 | 1 | 2 | 3 | 4

// Permission level types
type PermissionLevel = 
    | 'No access'
    | 'Viewer'
    | 'Editor'
    | 'Creator'
    | 'Manager'

// Permission mapping for each level
const PERMISSION_LEVELS: Record<PermissionLevel, { view: boolean; create: boolean; edit: boolean; delete: boolean }> = {
    'No access': { view: false, create: false, edit: false, delete: false },
    'Viewer': { view: true, create: false, edit: false, delete: false },
    'Editor': { view: true, create: false, edit: true, delete: false },
    'Creator': { view: true, create: true, edit: true, delete: false },
    'Manager': { view: true, create: true, edit: true, delete: true },
}

// Permission tier configuration
const PERMISSION_TIERS: Record<PermissionTier, {
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
const RESOURCE_ICONS: Record<string, React.ReactNode> = {
    // Course Studio children
    'general details': <Info className="h-4 w-4" />,
    'curriculum': <BookOpen className="h-4 w-4" />,
    'student': <Users className="h-4 w-4" />,
    'batch': <UserCheck className="h-4 w-4" />,
    'submission': <FileText className="h-4 w-4" />,
    'setting': <Settings className="h-4 w-4" />,
    
    // Content Bank children
    'mcqs': <List className="h-4 w-4" />,
    'coding questions': <Code className="h-4 w-4" />,
    'open ended': <MessageSquare className="h-4 w-4" />,
}

// Helper function to determine permission level from permissions
function getPermissionLevelFromPermissions(
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

// Helper function to convert permission level to tier
function permissionLevelToTier(level: PermissionLevel): PermissionTier {
    const mapping: Record<PermissionLevel, PermissionTier> = {
        'No access': 0,
        'Viewer': 1,
        'Editor': 2,
        'Creator': 3,
        'Manager': 4,
    }
    return mapping[level]
}

const RoleManagementPanel: React.FC<RoleManagementPanelProps> = ({
    selectedRole,
    onRoleChange,
}) => {
    const searchParams = useSearchParams()
    const { roles } = useRoles()
    const { assignPermissions, loading: assigning } = useAssignPermissions()
    const [roleId, setRoleId] = useState<number | undefined>(undefined)
    
    // Store permissions for each resource: { resourceId: { permissionId: boolean } }
    const [resourcePermissions, setResourcePermissions] = useState<Record<number, Record<number, boolean>>>({})
    const [originalResourcePermissions, setOriginalResourcePermissions] = useState<Record<number, Record<number, boolean>>>({})
    
    // Store permission level for each resource
    const [permissionLevels, setPermissionLevels] = useState<Record<number, PermissionLevel>>({})
    
    // Store fetched permissions data: { resourceId: Array<{id, name}> }
    const [permissionsData, setPermissionsData] = useState<Record<number, Array<{ id: number; name: string; granted?: boolean }>>>({})

    // Unsaved changes warning modal state
    const [showWarningModal, setShowWarningModal] = useState(false)
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

    // Route change detection
    const router = useRouter()
    const pathname = usePathname()
    const [currentPath, setCurrentPath] = useState<string>(pathname)
    const [pendingRoute, setPendingRoute] = useState<string | null>(null)

    // Fetch RBAC resources from API
    const { resources, loading, error } = useRbacResources(true)
    
    // Use the hook's fetchAllPermissions function
    const { fetchAllPermissions } = useRbacPermissions()

    // Memoize resource IDs to prevent unnecessary re-fetches
    const resourceIds = useMemo(() => resources.map(r => r.id), [resources])

    // Track the last fetched roleId to prevent duplicate fetches
    const [lastFetchedRoleId, setLastFetchedRoleId] = useState<number | undefined>(undefined)

    // Track expanded modules
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
    
    // Track hovered row for showing labels on hover
    const [hoveredRowId, setHoveredRowId] = useState<number | null>(null)
    
    // Track modules where parent was explicitly set to No Access
    const [parentLockedModules, setParentLockedModules] = useState<Set<string>>(new Set())

    // Fetch permissions for all resources when role changes
    useEffect(() => {
        if (roleId && resourceIds.length > 0 && roleId !== lastFetchedRoleId) {
            const loadAllPermissions = async () => {
                const newPermissionsData = await fetchAllPermissions(resourceIds, roleId)
                
                const newResourcePermissions: Record<number, Record<number, boolean>> = {}
                const newPermissionLevels: Record<number, PermissionLevel> = {}

                // Process permissions for each resource
                for (const resourceId of Object.keys(newPermissionsData).map(Number)) {
                    const permissions = newPermissionsData[resourceId] || []
                    
                    // Map permissions to view/create/edit/delete
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

    // Check if there are unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(resourcePermissions) !== JSON.stringify(originalResourcePermissions)
    }, [resourcePermissions, originalResourcePermissions])

    // Route change detection and prevention
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

    // Update current path when pathname changes
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

    // Group resources by main module
    const groupedResources = useMemo(() => {
        const groups: Record<string, { id: string; children: RoleAction[] }> = {}
        
        roleActions.forEach(action => {
            let mainModule = 'Course Studio'
            
            const title = (action.title || '').toLowerCase()
            const description = (action.description || '').toLowerCase()
            
            // Determine main module based on title and description
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

    // Handle permission level change
    const handlePermissionChange = (resourceId: number, tier: PermissionTier, isParent: boolean = false) => {
        const tierToLevel: Record<PermissionTier, PermissionLevel> = {
            0: 'No access',
            1: 'Viewer',
            2: 'Editor',
            3: 'Creator',
            4: 'Manager',
        }
        
        const level = tierToLevel[tier]
        const levelPermissions = PERMISSION_LEVELS[level]
        
        // Function to update permissions for a single resource
        const updateResourcePermissions = (resId: number) => {
            const permissions = permissionsData[resId] || []
            const newPerms: Record<number, boolean> = {}
            
            permissions.forEach((perm: any) => {
                const permName = (perm.name || '').toLowerCase()
                if (permName.includes('view') || permName.includes('read')) {
                    newPerms[perm.id] = levelPermissions.view
                } else if (permName.includes('create') || permName.includes('add')) {
                    newPerms[perm.id] = levelPermissions.create
                } else if (permName.includes('edit') || permName.includes('update')) {
                    newPerms[perm.id] = levelPermissions.edit
                } else if (permName.includes('delete') || permName.includes('remove')) {
                    newPerms[perm.id] = levelPermissions.delete
                } else {
                    newPerms[perm.id] = resourcePermissions[resId]?.[perm.id] || false
                }
            })
            
            return newPerms
        }

        // If this is a parent module click, update all children
        if (isParent) {
            const newResourcePermissions: Record<number, Record<number, boolean>> = { ...resourcePermissions }
            const newPermissionLevels: Record<number, PermissionLevel> = { ...permissionLevels }
            
            // Find the module containing this resource
            for (const [moduleName, module] of Object.entries(groupedResources)) {
                if (module.children.some(child => child.id === resourceId)) {
                    // Update all children in this module
                    module.children.forEach(child => {
                        newResourcePermissions[child.id] = updateResourcePermissions(child.id)
                        newPermissionLevels[child.id] = level
                    })
                    // If parent explicitly set to No access, mark module as locked
                    if (level === 'No access') {
                        setParentLockedModules((prev) => {
                            const next = new Set(prev)
                            next.add(module.id)
                            return next
                        })
                    } else {
                        // ensure module is not locked when parent given other tiers
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
            // Single resource update
            const newPerms = updateResourcePermissions(resourceId)
            
            setResourcePermissions((prev) => ({
                ...prev,
                [resourceId]: newPerms,
            }))
            
            setPermissionLevels((prev) => ({
                ...prev,
                [resourceId]: level,
            }))
            // If a child is changed, ensure parent lock is not set (child overrides)
            // Find the module containing this resource and remove lock if present
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

    // Handle navigation with unsaved changes check
    const handleNavigationWithCheck = (action: () => void) => {
        if (hasUnsavedChanges) {
            setPendingAction(() => action)
            setShowWarningModal(true)
        } else {
            action()
        }
    }

    const handleRoleChange = (roleName: string, newRoleId: number) => {
        const changeRole = () => {
            onRoleChange(roleName)
            setRoleId(newRoleId)
            const newParams = new URLSearchParams(searchParams);
            newParams.set('role', roleName);
            router.push(`?${newParams.toString()}`, { scroll: false });
            // Reset permissions when changing roles
            setResourcePermissions({})
            setOriginalResourcePermissions({})
            setPermissionLevels({})
        }

        handleNavigationWithCheck(changeRole)
    }

    // Initialize role from URL on mount
    useEffect(() => {
        const roleFromUrl = searchParams.get('role');
        if (roleFromUrl && roles.length > 0) {
            const matchingRole = roles.find(role => role.name === roleFromUrl);
            if (matchingRole) {
                onRoleChange(matchingRole.name);
                setRoleId(matchingRole.id);
            }
        }
    }, [roles, searchParams, onRoleChange]);

    // Select first role by default when roles are loaded
    useEffect(() => {
        if (roles.length > 0 && !selectedRole) {
            const roleFromUrl = searchParams.get('role');
            if (!roleFromUrl) {
                onRoleChange(roles[0].name);
                setRoleId(roles[0].id);
            }
        }
    }, [roles, selectedRole, onRoleChange, searchParams]);

    const resolveRoleId = (): number | undefined => {
        const match = roles.find(
            (r) => r.name?.toLowerCase() === selectedRole?.toLowerCase()
        )
        return match?.id
    }

    // Save all permissions for all resources
    const handleSaveAllPermissions = async () => {
        const currentRoleId = resolveRoleId()
        if (!currentRoleId) return

        try {
            // Only save permissions for resources that have changed
            for (const resourceId of Object.keys(resourcePermissions).map(Number)) {
                const currentPerms = resourcePermissions[resourceId] || {}
                const originalPerms = originalResourcePermissions[resourceId] || {}
                
                // Check if permissions have changed for this resource
                const hasChanged = JSON.stringify(currentPerms) !== JSON.stringify(originalPerms)
                
                if (hasChanged && Object.keys(currentPerms).length > 0) {
                    await assignPermissions({
                        resourceId,
                        roleId: currentRoleId,
                        permissions: currentPerms,
                    })
                }
            }
            
            // Update original permissions after successful save
            setOriginalResourcePermissions(JSON.parse(JSON.stringify(resourcePermissions)))
        } catch (error) {
            console.error('Error saving permissions:', error)
        }
    }

    // Handle warning modal actions
    const handleDiscardChanges = () => {
        // First revert to original permissions
        setResourcePermissions(JSON.parse(JSON.stringify(originalResourcePermissions)))
        
        // Recalculate permission levels
        const newLevels: Record<number, PermissionLevel> = {}
        for (const resourceId of Object.keys(originalResourcePermissions).map(Number)) {
            const perms = originalResourcePermissions[resourceId] || {}
            const permissions = permissionsData[resourceId] || []
            
            let view = false
            let create = false
            let edit = false
            let deletePerm = false

            permissions.forEach((perm: any) => {
                const granted = perms[perm.id] || false
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
            
            newLevels[resourceId] = getPermissionLevelFromPermissions(view, create, edit, deletePerm)
        }
        setPermissionLevels(newLevels)

        // Close the modal first
        setShowWarningModal(false)

        // Use setTimeout to ensure modal closes before navigation
        setTimeout(() => {
            if (pendingAction) {
                pendingAction()
                setPendingAction(null)
            } else if (pendingRoute) {
                // Handle route navigation
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

    const handleCancelNavigation = () => {
        setShowWarningModal(false)
        setPendingAction(null)
        setPendingRoute(null)
    }

    // Check if Admin role (cannot modify)
    const isAdminRole = selectedRole?.toLowerCase() === 'admin'

    const toggleModuleExpansion = (moduleId: string) => {
        setExpandedModules((prev) => {
            const next = new Set(prev)
            if (next.has(moduleId)) {
                next.delete(moduleId)
            } else {
                next.add(moduleId)
            }
            return next
        })
    }

    // Get parent permission level by checking all children
    // Use the highest tier among children so parent reflects any elevated child access
    const getParentPermissionLevel = (moduleChildren: RoleAction[]): PermissionLevel => {
        if (moduleChildren.length === 0) return 'No access'

        let maxTier: PermissionTier = 0

        moduleChildren.forEach(child => {
            const lvl = permissionLevels[child.id] || 'No access'
            const tier = permissionLevelToTier(lvl)
            if (tier > maxTier) maxTier = tier
        })

        // Map back to PermissionLevel
        const tierToLevel: Record<PermissionTier, PermissionLevel> = {
            0: 'No access', 1: 'Viewer', 2: 'Editor', 3: 'Creator', 4: 'Manager',
        }

        return tierToLevel[maxTier]
    }

    const renderPermissionButtons = (resourceId: number, isChild: boolean = false, moduleChildren?: RoleAction[], maxAllowedTier?: PermissionTier) => {
        let currentLevel: PermissionLevel
        
        if (!isChild && moduleChildren) {
            // For parent rows, calculate the level based on all children
            currentLevel = getParentPermissionLevel(moduleChildren)
        } else {
            // For child rows, use the stored level
            currentLevel = permissionLevels[resourceId] || 'No access'
        }
        
        const currentTier = permissionLevelToTier(currentLevel)

        return (
            <div className="flex gap-8 flex-shrink-0" style={{ width: '620px' }}>
                {Object.values(PERMISSION_TIERS)
                    .sort((a, b) => a.tier - b.tier)
                    .map((tier) => {
                        const isActive = currentTier === tier.tier
                        const isDisabledByParent = isChild && typeof maxAllowedTier === 'number' && tier.tier > maxAllowedTier
                        // Show label for: parent rows (always), active buttons (always), or when row is hovered
                        const showLabel = !isChild || isActive || hoveredRowId === resourceId
                        
                        return (
                            <button
                                key={tier.tier}
                                onClick={() => {
                                    if (!isAdminRole) {
                                        // Prevent clicks for tiers higher than parent's allowed tier
                                        if (!isDisabledByParent) {
                                            handlePermissionChange(resourceId, tier.tier, !isChild)
                                        }
                                    }
                                }}
                                disabled={isAdminRole || isDisabledByParent}
                                className={cn(
                                    'transition-all duration-200 rounded-md',
                                    'h-10 flex items-center justify-center flex-1',
                                    'text-xs font-semibold uppercase',
                                    'min-w-0 relative group',
                                    (isAdminRole || isDisabledByParent) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                                    isActive
                                        ? cn(
                                            'border-2',
                                            tier.borderColorClass,
                                            tier.backgroundColor,
                                            tier.textColorClass
                                        )
                                        : cn(
                                            isChild ? 'bg-white hover:bg-gray-100' : 'bg-muted-light hover:bg-gray-200',
                                            tier.textColorClass
                                        )
                                )}
                            >
                                {showLabel ? (
                                    <span className="truncate px-2">{tier.label}</span>
                                ) : (
                                    <span className="text-muted-foreground text-lg">•</span>
                                )}
                                {/* Tooltip on hover with delay */}
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity delay-500 pointer-events-none z-50">
                                    {tier.label} - {tier.description}
                                </span>
                            </button>
                        )
                    })}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Unsaved Changes Warning Modal */}
            <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            You have unsaved changes for <strong>{selectedRole}</strong>. Do you want to discard them?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={handleCancelNavigation}
                        >
                            Keep Changes
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDiscardChanges}
                        >
                            Discard Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Header and Legend in same row */}
            <div className="flex items-start justify-between gap-10">
                {/* Left side - Header and subtitle */}
                <div className="space-y-2 flex-1 mt-2">
                    <h2 className="text-2xl text-left font-semibold tracking-tight">Manage Role Functions</h2>
                    <p className="text-muted-foreground text-left">
                        Configure role permissions and manage system actions
                    </p>
                </div>

                {/* Right side - Legend */}
                <div className="flex-1">
                    <div className="bg-card rounded-lg border border-border px-8 py-5">
                        <p className="text-sm font-medium text-left text-muted-foreground font-body mb-6">
                            Access Levels Definition
                        </p>
                        <div className="flex flex-nowrap gap-12 pt-0 pl-0">
                            {Object.values(PERMISSION_TIERS).map((item, index) => (
                                <React.Fragment key={item.tier}>
                                    <div className={cn('flex items-start gap-3 flex-shrink-0', index === 0 ? 'pl-0' : (index === Object.values(PERMISSION_TIERS).length - 1 ? 'px-8' : 'px-3'))}>
                                        <div className={cn('h-3 w-3 rounded-full flex-shrink-0 mt-1', item.dotColorClass)} />
                                        <div className="flex flex-col gap-0.5">
                                            <span className={cn('text-sm font-semibold whitespace-nowrap', item.colorClass)}>
                                                {item.label.charAt(0) + item.label.slice(1).toLowerCase()}
                                            </span>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">{item.description}</span>
                                        </div>
                                    </div>
                                    {index < Object.values(PERMISSION_TIERS).length - 1 && (
                                        <div className="w-px h-6 bg-border flex-shrink-0" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Role Selector */}
                <div>
                    <div className="bg-card rounded-lg border border-border overflow-hidden sticky top-6">
                        {/* Header */}
                        <div className="bg-background px-4 py-4 border-b border-border">
                            <p className="text-sm font-medium text-left text-muted-foreground font-body">
                                Select Role
                            </p>
                        </div>

                        {/* Role List */}
                        <div className="divide-y divide-border">
                            {roles.map((role) => {
                                const isSelected = selectedRole === role.name
                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleChange(role.name, role.id)}
                                        className={cn(
                                            'w-full text-left px-4 py-4 transition-all duration-200 flex items-center justify-between gap-2',
                                            isSelected
                                                ? 'bg-success-light border-l-4 border-l-success'
                                                : 'bg-white hover:bg-muted border-l-4 border-l-transparent'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'text-sm font-medium truncate',
                                                isSelected
                                                    ? 'text-success-dark'
                                                    : 'text-foreground'
                                            )}
                                        >
                                            {role.name}
                                        </div>
                                        {isSelected && (
                                            <svg className="h-4 w-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Permission Matrix */}
                    <div className="relative">
                        <div className="bg-card rounded-lg border border-border overflow-hidden">
                            {/* Header Row */}
                            <div className="bg-background px-6 py-4 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-muted-foreground font-body">
                                        Feature Module
                                    </p>
                                    <p className="text-sm font-medium text-muted-foreground font-body">
                                        Permission Tier
                                    </p>
                                </div>
                            </div>

                            {/* Matrix Content */}
                            {loading ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    Loading resources...
                                </div>
                            ) : roleActions.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No resources found.
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {Object.entries(groupedResources).map(([moduleName, module]) => {
                                        const isExpanded = expandedModules.has(module.id)

                                        return (
                                            <React.Fragment key={module.id}>
                                                {/* Parent Row */}
                                                <div className="flex gap-2 items-center justify-between px-6 py-3 border-b border-border bg-muted-light">
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <button
                                                            onClick={() => toggleModuleExpansion(module.id)}
                                                            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            <ChevronDown
                                                                className={cn(
                                                                    'h-5 w-5 transition-transform',
                                                                    !isExpanded && '-rotate-90'
                                                                )}
                                                            />
                                                        </button>
                                                       <div className="flex-shrink-0 text-muted-foreground">
                                                          {moduleName === 'Course Studio' ? (
                                                            <GraduationCap className="h-5 w-5" />
                                                             ) : moduleName === 'Content Bank' ? (
                                                             <BookOpen className="h-5 w-5" />
                                                            ) : (
                                                            <Info className="h-5 w-5" />
                                                            )}
                                                        </div>
                                                        <span className="text-base font-semibold text-foreground truncate">
                                                            {moduleName}
                                                        </span>
                                                    </div>
                                                    {renderPermissionButtons(module.children[0]?.id || 0, false, module.children)}
                                                </div>

                                                {/* Child Rows */}
                                                {isExpanded && (() => {
                                                    const parentLevel = getParentPermissionLevel(module.children)
                                                    const isParentLocked = parentLockedModules.has(module.id)
                                                    const showDisabledMessage = isParentLocked && parentLevel === 'No access'

                                                    return module.children.map((child) => (
                                                        <div key={child.id} className="bg-white">
                                                            <div 
                                                                className="flex gap-2 items-center justify-between px-6 py-3 border-b border-border last:border-b-0"
                                                                onMouseEnter={() => setHoveredRowId(child.id)}
                                                                onMouseLeave={() => setHoveredRowId(null)}
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                    <div className="w-5 flex-shrink-0" />
                                                                   <div className={cn('flex-shrink-0', showDisabledMessage ? 'text-muted-foreground/50' : 'text-muted-foreground')}>
                                                                        {RESOURCE_ICONS[child.title.toLowerCase()] || <Info className="h-4 w-4" />}
                                                                    </div>
                                                                    <span className={cn('text-sm font-normal truncate', showDisabledMessage ? 'text-muted-foreground' : 'text-foreground')}>
                                                                        {child.title}
                                                                    </span>
                                                                </div>

                                                                {showDisabledMessage ? (
                                                                    <div className="flex items-center justify-end text-sm text-muted-foreground italic" style={{ width: '620px' }}>
                                                                        Enable Parent Access to configure
                                                                    </div>
                                                                ) : (
                                                                    renderPermissionButtons(child.id, true, undefined, permissionLevelToTier(parentLevel))
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                })()}
                                            </React.Fragment>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Footer Row */}
                            <div className="bg-background px-6 py-4 border-t border-border">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Permissions cascade down</span>
                                    </div>
                                    <Button
                                        onClick={handleSaveAllPermissions}
                                        disabled={!hasUnsavedChanges || assigning || isAdminRole}
                                        size="lg"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {assigning ? 'Saving...' : 'Save Configuration'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoleManagementPanel