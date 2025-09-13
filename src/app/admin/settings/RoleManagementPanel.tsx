'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit, Trash2, Plus, Users } from 'lucide-react'
// import SubPermissions from './_components/SubPermissions'

interface RoleAction {
    id: number
    title: string
    description: string
    isSelected?: boolean
    permissions?: string[]
}

interface RoleManagementPanelProps {
    selectedRole: 'Admin' | 'Ops' | 'Instructor'
    onRoleChange: (role: 'Admin' | 'Ops' | 'Instructor') => void
}

const RoleManagementPanel: React.FC<RoleManagementPanelProps> = ({
    selectedRole,
    onRoleChange,
}) => {
    const [selectedAction, setSelectedAction] = useState<number>(1)
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
        new Set()
    )

    // Mock data for role actions
    const roleActions: RoleAction[] = [
        {
            id: 1,
            title: 'User/Role Management',
            description: 'Manage users and their roles within the platform',
            isSelected: true,
            permissions: [
                'view_users',
                'add_user',
                'edit_user',
                'deactivate_user',
            ],
        },
        {
            id: 2,
            title: 'Create/Edit Roles & Permissions',
            description:
                'Create new roles and modify existing role permissions',
            permissions: [
                'create_role',
                'edit_role',
                'delete_role',
                'update_permissions',
            ],
        },
        {
            id: 3,
            title: 'Assign/Revoke Roles',
            description: 'Assign or revoke roles from users',
            permissions: ['assign_role', 'revoke_role'],
        },
        {
            id: 4,
            title: 'Access Review Reminders',
            description: 'Set up and manage access review reminders',
            permissions: [
                'create_reminder',
                'edit_reminder',
                'delete_reminder',
            ],
        },
        {
            id: 5,
            title: 'Create & Schedule Assessments',
            description: 'Create and schedule assessments for courses',
            permissions: [
                'create_assessment',
                'edit_assessment',
                'schedule_assessment',
                'delete_assessment',
            ],
        },
        {
            id: 6,
            title: 'View Analytics (Class Response)',
            description:
                'View class response analytics and student engagement metrics',
            permissions: ['view_class_responses', 'export_class_analytics'],
        },
        {
            id: 7,
            title: 'View Individual student grades',
            description:
                'View and access individual student grades and performance',
            permissions: ['view_student_grades', 'download_student_reports'],
        },
        {
            id: 8,
            title: 'Delete/Publish Courses',
            description: 'Delete or publish course content',
            permissions: [
                'publish_course',
                'unpublish_course',
                'delete_course',
            ],
        },
        {
            id: 9,
            title: 'View Assigned Courses Only',
            description: 'View only courses assigned to the user',
            permissions: ['view_assigned_courses'],
        },
        {
            id: 10,
            title: 'Instructor Analytics',
            description:
                'View instructor-specific analytics and performance metrics',
            permissions: [
                'view_instructor_dashboard',
                'download_instructor_reports',
            ],
        },
        {
            id: 11,
            title: 'Student Onboarding',
            description: 'Manage student onboarding processes and workflows',
            permissions: [
                'create_onboarding_tasks',
                'mark_onboarding_complete',
            ],
        },
        {
            id: 12,
            title: 'Request Technical Support (Self)',
            description: 'Request technical support for platform issues',
            permissions: [],
            // permissions: ['create_support_ticket', 'track_ticket_status'],
        },
    ]

    const getSelectedAction = () => {
        return roleActions.find((action) => action.id === selectedAction)
    }

    const handlePermissionToggle = (permission: string) => {
        setSelectedPermissions((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(permission)) {
                newSet.delete(permission)
            } else {
                newSet.add(permission)
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
        const currentAction = getSelectedAction()
        if (currentAction?.permissions) {
            setSelectedPermissions(new Set(currentAction.permissions))
        }
    }

    const handleDeselectAll = () => {
        setSelectedPermissions(new Set())
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Role
                </Button>
            </div>

            {/* Role Selection Tabs */}
            <div className="flex gap-6 border-b border-gray-200">
                <Button
                    onClick={() => onRoleChange('Admin')}
                    className={`flex items-center gap-3 pb-2 border-b-2 transition-colors bg-transparent ${
                        selectedRole === 'Admin'
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
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
                            : 'border-transparent text-gray-600 hover:text-gray-900'
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
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium text-[1rem]">Instructor</span>
                </Button>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Role Actions */}
                <div className="col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 h-[600px] flex flex-col">
                        {/* Header with Edit/Delete */}
                        <div className="flex justify-between items-center mb-4">
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
                        </div>

                        {/* Add Role Action Button */}
                        <div className="mb-4 pb-4 border-b border-gray-200">
                            <Button variant="outline" className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Role Action
                            </Button>
                        </div>

                        {/* Role Actions Title */}
                        <h4 className="font-semibold text-[1rem] text-start text-gray-900 mb-4">
                            Role Actions
                        </h4>

                        {/* Scrollable Actions List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {roleActions.map((action) => (
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
                                {getSelectedAction()?.permissions &&
                                    (getSelectedAction()?.permissions?.length ?? 0) > 0 && (
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
                                <Button
                                    variant="outline"
                                    className="hover:bg-blue-400 hover:border-blue-400 hover:text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Permission
                                </Button>
                            </div>
                        </div>

                        {/* Permissions List */}
                        <div className="flex-1 overflow-y-auto">
                            {Array.isArray(getSelectedAction()?.permissions) &&
                            (getSelectedAction()?.permissions?.length ?? 0) > 0 ? (
                                <div className="space-y-3">
                                    {getSelectedAction()?.permissions?.map(
                                        (permission: any) => (
                                            <div
                                                key={permission}
                                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <label
                                                    htmlFor={permission}
                                                    className="flex-1 text-sm text-start font-medium text-gray-900 cursor-pointer"
                                                >
                                                    {formatPermissionName(
                                                        permission
                                                    )}
                                                </label>
                                                <Checkbox
                                                    id={permission}
                                                    checked={selectedPermissions.has(
                                                        permission
                                                    )}
                                                    onCheckedChange={() =>
                                                        handlePermissionToggle(
                                                            permission
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
                                        This role action doesn't have any
                                        permissions defined yet
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* <div className="flex-1 overflow-y-auto">
                            <SubPermissions getSelectedAction={getSelectedAction}/>
                        </div> */}

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
                                        onClick={() =>
                                            console.log(
                                                'Save permissions:',
                                                Array.from(selectedPermissions)
                                            )
                                        }
                                        className="text-xs"
                                    >
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
