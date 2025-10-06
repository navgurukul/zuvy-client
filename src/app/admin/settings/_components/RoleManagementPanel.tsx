'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit, Trash2, Plus, Users } from 'lucide-react'
import { useRbacResources } from '@/hooks/useRbacResources'
import { useRbacPermissions } from '@/hooks/useRbacPermissions'
import { useRoles } from '@/hooks/useRoles'
import { useAssignPermissions } from '@/hooks/useAssignPermissions'
import { COLOR_PALETTE } from '@/lib/utils'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import AddRoleModal from './AddRoleModal'

interface RoleAction {
    id: number
    title: string
    description: string
    isSelected?: boolean
    permissions?: string[]
}

interface RoleManagementPanelProps {
    selectedRole: string
    onRoleChange: (role: string) => void
}

const RoleManagementPanel: React.FC<RoleManagementPanelProps> = ({
    selectedRole,
    onRoleChange,
}) => {
    const [selectedAction, setSelectedAction] = useState<number>(1)
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(
        new Set()
    )
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Fetch RBAC resources from API
    const { resources, loading, error } = useRbacResources(true)
    const {
        permissions: fetchedPermissions,
        loading: permissionsLoading,
        error: permissionsError,
    } = useRbacPermissions(selectedAction)

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
        setSelectedPermissions((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(permissionId)) {
                newSet.delete(permissionId)
            } else {
                newSet.add(permissionId)
            }
            return newSet
        })
    }

    const formatPermissionName = (permission: string) => {
        return permission
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const handleActionSelect = (actionId: number) => {
        setSelectedAction(actionId)
        // Reset selected permissions when switching actions
        setSelectedPermissions(new Set())
    }

    const handleSelectAll = () => {
        if (
            Array.isArray(fetchedPermissions) &&
            fetchedPermissions.length > 0
        ) {
            setSelectedPermissions(
                new Set(fetchedPermissions.map((p: any) => p.id))
            )
        }
    }

    const handleDeselectAll = () => {
        setSelectedPermissions(new Set())
    }

    const { roles } = useRoles()
    const { assignPermissions, loading: assigning } = useAssignPermissions()

    const resolveRoleId = (): number | undefined => {
        const match = roles.find(
            (r) => r.name?.toLowerCase() === selectedRole.toLowerCase()
        )
        return match?.id
    }

    const handleAssignPermissions = async () => {
        const roleId = resolveRoleId()
        const resourceId = selectedAction
        if (!roleId || !resourceId) return

        const permissionsPayload: Record<number, boolean> = {}
        Array.from(selectedPermissions).forEach((pid) => {
            permissionsPayload[pid] = true
        })

        await assignPermissions({
            resourceId,
            roleId,
            permissions: permissionsPayload,
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl text-start font-bold text-gray-900 mb-2">
                        Manage Role Functions
                    </h2>
                    <p className="text-gray-600">
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
                            <AddRoleModal />
                        )}
                </Dialog>
            </div>

            {/* Role Selection Tabs */}
            <div className="flex gap-6 border-b border-gray-200">
                {
                    roles.map((role, index) => {
                        console.log('COLOR_PALETTE[index].bg', COLOR_PALETTE[index].bg);
                        return (
                        <Button
                            key={role.id}
                            onClick={() => onRoleChange(role.name)}
                            className={`flex items-center gap-3 pb-2 border-b-2 transition-colors bg-transparent ${
                                selectedRole === 'Admin'
                                    ? 'border-blue-500 text-gray-900 hover:bg-transparent'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <div className={`w-3 h-3 rounded-full ${COLOR_PALETTE[index].bg}`}></div>
                            <span className="font-medium text-[1rem] capitalize">{role.name}</span>
                        </Button>
                    )})
                }
                {/* <Button
                    onClick={() => onRoleChange('Admin')}
                    className={`flex items-center gap-3 pb-2 border-b-2 transition-colors bg-transparent ${
                        selectedRole === 'Admin'
                            ? 'border-blue-500 text-gray-900 hover:bg-transparent'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="font-medium text-[1rem]">Admin</span>
                </Button>
                <Button
                    onClick={() => onRoleChange('Ops')}
                    className={`flex items-center gap-3 pb-2 border-b-2 transition-colors bg-transparent ${
                        selectedRole === 'Ops'
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium text-[1rem]">Ops</span>
                </Button>
                <Button
                    onClick={() => onRoleChange('Instructor')}
                    className={`flex items-center gap-3 pb-2 border-b-2 transition-colors bg-transparent ${
                        selectedRole === 'Instructor'
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium text-[1rem]">Instructor</span>
                </Button> */}
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Role Actions */}
                <div className="col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 h-[600px] flex flex-col">
                        {/* Header with Edit/Delete */}
                        {/* <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-[1rem] text-muted-foreground">
                                {selectedRole}
                            </h3>
                            <div className="flex">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-8 w-8"
                                >
                                    <Edit className="w-4 h-4 text-gray-600" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-8 w-8"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        </div> */}

                        {/* Add Role Action Button */}
                        {/* <div className="mb-4 pb-4 border-b border-gray-200">
                            <Button variant="outline" className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Role Action
                            </Button>
                        </div> */}

                        {/* Role Actions Title */}
                        <h4 className="font-semibold text-[1rem] text-start text-gray-900 mb-4">
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
                                            handleActionSelect(action.id)
                                        }
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                            selectedAction === action.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white hover:bg-gray-50 border border-gray-200'
                                        }`}
                                    >
                                        <h5 className="font-medium text-start text-[1rem] mb-1">
                                            {action.title}
                                        </h5>
                                        <p
                                            className={`text-sm text-start ${
                                                selectedAction === action.id
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
                    <div className="bg-white rounded-lg border border-gray-200 p-6 h-[600px] flex flex-col">
                        {/* Permissions Header */}
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-start text-[1rem] text-gray-900">
                                    Permissions for {getSelectedAction()?.title}
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
                                                    checked={selectedPermissions.has(
                                                        permission.id
                                                    ) || permission.granted}
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
                        {selectedPermissions.size > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        {selectedPermissions.size} permission
                                        {selectedPermissions.size !== 1
                                            ? 's'
                                            : ''}{' '}
                                        selected
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAssignPermissions}
                                        className="text-xs"
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
