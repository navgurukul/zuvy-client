'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit, Trash2, Plus, Users, AlertTriangle } from 'lucide-react'
import { useRbacResources } from '@/hooks/useRbacResources'
import { useRbacPermissions } from '@/hooks/useRbacPermissions'
import { useRoles } from '@/hooks/useRoles'
import { useAssignPermissions } from '@/hooks/useAssignPermissions'
import { COLOR_PALETTE } from '@/lib/utils'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import AddRoleModal from './AddRoleModal'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePathname } from 'next/navigation'

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

const RoleManagementPanel: React.FC<RoleManagementPanelProps> = ({
    selectedRole,
    onRoleChange,
}) => {
    const searchParams = useSearchParams()
    const { roles,refetchRoles } = useRoles()
    const { assignPermissions, loading: assigning } = useAssignPermissions()
    const [selectedAction, setSelectedAction] = useState<number>(12)
    const [roleId, setRoleId] = useState<number>(1)
    const [selectedPermissions, setSelectedPermissions] = useState<Record<number, boolean>>({})
    const [originalPermissions, setOriginalPermissions] = useState<Record<number, boolean>>({})
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    
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
    const {
        permissions: fetchedPermissions,
        loading: permissionsLoading,
        error: permissionsError,
    } = useRbacPermissions(selectedAction, roleId)

    // Initialize selected permissions when permissions are fetched
    useEffect(() => {
        if (fetchedPermissions) {
            const initialPermissions: Record<number, boolean> = {}
            fetchedPermissions.forEach((permission: any) => {
                initialPermissions[permission.id] = permission.granted || false
            })
            setSelectedPermissions(initialPermissions)
            setOriginalPermissions(initialPermissions) // Store original state
        }
    }, [fetchedPermissions])

    // Check if there are unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(selectedPermissions) !== JSON.stringify(originalPermissions)
    }, [selectedPermissions, originalPermissions])

    // Route change detection and prevention
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
                return e.returnValue
            }
        }

        const handleRouteChange = (url: string) => {
            if (hasUnsavedChanges && url !== currentPath) {
                setPendingRoute(url)
                setShowWarningModal(true)
                throw 'Route change cancelled'
            }
        }

        // Add beforeunload listener
        window.addEventListener('beforeunload', handleBeforeUnload)

        // Override router methods
        const originalPush = router.push
        const originalReplace = router.replace
        const originalBack = router.back
        const originalForward = router.forward

        router.push = (href: any, options?: any) => {
            const targetUrl = typeof href === 'string' ? href : href.pathname
            try {
                handleRouteChange(targetUrl)
                return originalPush.call(router, href, options)
            } catch {
                return Promise.resolve(false)
            }
        }

        router.replace = (href: any, options?: any) => {
            const targetUrl = typeof href === 'string' ? href : href.pathname
            try {
                handleRouteChange(targetUrl)
                return originalReplace.call(router, href, options)
            } catch {
                return Promise.resolve(false)
            }
        }

        router.back = () => {
            if (hasUnsavedChanges) {
                setPendingRoute('back')
                setShowWarningModal(true)
                return
            }
            return originalBack.call(router)
        }

        router.forward = () => {
            if (hasUnsavedChanges) {
                setPendingRoute('forward')
                setShowWarningModal(true)
                return
            }
            return originalForward.call(router)
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            // Restore original router methods
            router.push = originalPush
            router.replace = originalReplace
            router.back = originalBack
            router.forward = originalForward
        }
    }, [hasUnsavedChanges, currentPath, router])

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

    // Ensure a valid selected action when resources load
    useEffect(() => {
        if (roleActions.length > 0) {
            const exists = roleActions.some((a) => a.id === selectedAction)
            if (!exists) setSelectedAction(roleActions[0].id)
        }
    }, [roleActions, selectedAction])

    const getSelectedAction = () => {
        return roleActions.find((action) => action.id === selectedAction)
    }

    const handlePermissionToggle = (permission: { id: number } | number) => {
        const permissionId =
            typeof permission === 'number' ? permission : permission.id
        setSelectedPermissions((prev) => ({
            ...prev,
            [permissionId]: !prev[permissionId]
        }))
    }

    const formatPermissionName = (permission: string) => {
        return permission
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
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

    const handleActionSelect = (actionId: number) => {
        const navigateToAction = () => {
            setSelectedAction(actionId)
            // Reset selected permissions when switching actions
            setSelectedPermissions({})
            setOriginalPermissions({})
        }

        handleNavigationWithCheck(navigateToAction)
    }

    const handleRoleChange = (roleName: string, newRoleId: number) => {
        const changeRole = () => {
            onRoleChange(roleName)
            setRoleId(newRoleId)
            const newParams = new URLSearchParams(searchParams);
            newParams.set('role', roleName);
            router.push(`?${newParams.toString()}`, { scroll: false });
            // Reset permissions when changing roles
            setSelectedPermissions({})
            setOriginalPermissions({})
        }

        handleNavigationWithCheck(changeRole)
    }

    const handleSelectAll = () => {
        if (
            Array.isArray(fetchedPermissions) &&
            fetchedPermissions.length > 0
        ) {
            const allSelected: Record<number, boolean> = {}
            fetchedPermissions.forEach((permission: any) => {
                allSelected[permission.id] = true
            })
            setSelectedPermissions(allSelected)
        }
    }

    const handleDeselectAll = () => {
        if (
            Array.isArray(fetchedPermissions) &&
            fetchedPermissions.length > 0
        ) {
            const allDeselected: Record<number, boolean> = {}
            fetchedPermissions.forEach((permission: any) => {
                allDeselected[permission.id] = false
            })
            setSelectedPermissions(allDeselected)
        }
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
    }, [roles]);

    // Select first role by default when roles are loaded
    useEffect(() => {
        if (roles.length > 0 && !selectedRole) {
            // onRoleChange(roles[0].name);
            const roleFromUrl = searchParams.get('role');
            if (!roleFromUrl) {
                onRoleChange(roles[0].name);
                setRoleId(roles[0].id);
            }
        }
    }, [roles, selectedRole, onRoleChange]);

    const resolveRoleId = (): number | undefined => {
        const match = roles.find(
            (r) => r.name?.toLowerCase() === selectedRole?.toLowerCase()
        )
        return match?.id
    }

    const handleAssignPermissions = async () => {
        const roleId = resolveRoleId()
        const resourceId = selectedAction
        if (!roleId || !resourceId) return

        try {
            await assignPermissions({
                resourceId,
                roleId,
                permissions: selectedPermissions,
            })
            // Update original permissions after successful save
            setOriginalPermissions({ ...selectedPermissions })
        } catch (error) {
            console.error('Error saving permissions:', error)
        }
    }

    // Handle warning modal actions
    const handleDiscardChanges = () => {
        // First revert to original permissions
        setSelectedPermissions({ ...originalPermissions })
        
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
                    // Use window.location for external routes or router.push for internal routes
                    if (pendingRoute.startsWith('http')) {
                        window.location.href = pendingRoute
                    } else {
                        router.push(pendingRoute)
                    }
                }
                setPendingRoute(null)
            }
        }, 100) // Small delay to ensure modal closes
    }

    const handleCancelNavigation = () => {
        setShowWarningModal(false)
        setPendingAction(null)
        setPendingRoute(null)
    }

    return (
        <div className="space-y-6 py-4">
            {/* Unsaved Changes Warning Modal */}
            <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-warning" />
                            Unsaved Changes
                        </DialogTitle>
                        <DialogDescription>
                            You have unsaved changes to the permissions. Would you like to Discard the changes?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={handleCancelNavigation}
                        >
                            Cancel
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

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-lg text-start font-semibold text-gray-900">
                        Manage Role Functions
                    </h2>
                    <p className="text-muted-foreground text-[1.1rem]">
                        Configure role permissions and manage system actions
                    </p>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Role
                        </Button>
                    </DialogTrigger>
                    {isAddModalOpen && (
                        <AddRoleModal
                            onClose={() => setIsAddModalOpen(false)}
                            onRoleAdded={refetchRoles}
                         />
                    )}
                </Dialog>
            </div>

            {/* Role Selection Tabs */}
            <div className="flex gap-6 border-b border-gray-200">
                {
                    roles.map((role, index) => {
                        return (
                            <Button
                                key={role.id}
                                onClick={() => handleRoleChange(role.name, role.id)}
                                className={`flex items-center gap-3 pb-2 border-b-2 transition-colors bg-transparent ${selectedRole && selectedRole === role.name
                                    ? 'border-blue-500 text-gray-900 hover:bg-transparent'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <div className={`w-3 h-3 rounded-full ${COLOR_PALETTE[index].bg}`}></div>
                                <span className="font-medium text-[1rem] capitalize">{role.name}</span>
                                {/* Show unsaved indicator */}
                                {selectedRole === role.name && hasUnsavedChanges && (
                                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                                )}
                            </Button>
                        )
                    })
                }
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Role Actions */}
                <div className="col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 h-[calc(100vh-20rem)]  flex flex-col">

                        {/* Role Actions Title */}
                        <h4 className="font-semibold text-[1rem] text-start text-gray-900 mb-4 capitalize">
                            {selectedRole} Role Actions
                        </h4>

                        {/* Scrollable Actions List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {loading && (
                                <div className="text-sm text-gray-500 p-3">
                                    Loading resources...
                                </div>
                            )}
                            {!loading && roleActions.length === 0 && (
                                <div className="text-sm text-gray-500 p-3">
                                    No resources found.
                                </div>
                            )}
                            {!loading &&
                                roleActions.map((action) => (
                                    <div
                                        key={action.id}
                                        onClick={() => 
                                            // action.id is the resourceId
                                            handleActionSelect(action.id)
                                        }
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedAction === action.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        <h5 className="font-medium text-start text-[1rem] mb-1">
                                            {action.title}
                                        </h5>
                                        <p
                                            className={`text-sm text-start ${selectedAction === action.id
                                                ? 'text-blue-100'
                                                : 'text-gray-600'
                                                }`}
                                        >
                                            {action.description}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Permissions */}
                <div className="col-span-2">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 h-[calc(100vh-20rem)]  flex flex-col">
                        {/* Permissions Header */}
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-start text-[1rem] text-gray-900">
                                    Permissions for {getSelectedAction()?.title}
                                    {hasUnsavedChanges && (
                                        <span className="ml-2 text-xs bg-amber-100 text-warning px-2 py-1 rounded">
                                            Unsaved changes
                                        </span>
                                    )}
                                </h3>
                                <p className="text-gray-600 text-start text-sm mt-1">
                                    {getSelectedAction()?.description}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {fetchedPermissions &&
                                    fetchedPermissions.length > 0 && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleSelectAll}
                                                className="text-xs"
                                            >
                                                Select All
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleDeselectAll}
                                                className="text-xs"
                                            >
                                                Deselect All
                                            </Button>
                                        </>
                                    )}
                                {/* <Button
                                    variant="outline"
                                    className="hover:bg-blue-400 hover:border-blue-400 hover:text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Permission
                                </Button> */}
                            </div>
                        </div>

                        {/* Permissions List */}
                        <div className="flex-1 overflow-y-auto">
                            {permissionsLoading && (
                                <div className="text-sm text-gray-500 p-3">
                                    Loading permissions...
                                </div>
                            )}
                            {!permissionsLoading &&
                                fetchedPermissions &&
                                fetchedPermissions.length > 0 ? (
                                <div className="space-y-3">
                                    {fetchedPermissions?.map(
                                        (permission: any) => (
                                            <div
                                                key={permission.id}
                                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <label
                                                    htmlFor={permission.name}
                                                    className="flex-1 text-sm text-start font-medium text-gray-900 cursor-pointer"
                                                >
                                                    {permission.name}
                                                </label>
                                                <Checkbox
                                                    id={permission.id}
                                                    checked={selectedPermissions[permission.id] || false}
                                                    onCheckedChange={() =>
                                                        handlePermissionToggle(
                                                            permission.id
                                                        )
                                                    }
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center mt-8">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                                        No permissions available
                                    </h4>
                                    <p className="text-gray-500 max-w-md">
                                        This role action does not have any
                                        permissions defined yet
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Selected Permissions Summary */}
                        {Object.keys(selectedPermissions).length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        {Object.values(selectedPermissions).filter(Boolean).length} permission
                                        {Object.values(selectedPermissions).filter(Boolean).length !== 1
                                            ? 's'
                                            : ''}{' '}
                                        selected
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAssignPermissions}
                                        className="text-xs bg-accent text-white hover:bg-accent/90"
                                    // disabled={assigning}
                                    >
                                        {/* {assigning
                                            ? 'Saving...'
                                            : 'Save Changes'} */}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoleManagementPanel
