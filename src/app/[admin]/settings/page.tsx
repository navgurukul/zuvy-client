'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users, Settings, Plus, GraduationCap, Shield, Cog } from 'lucide-react'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { UserRole } from '@/utils/types/type'
import UserInviteSection from './_components/UserInviteSection'
import { UserManagementTable } from './_components/UserManagementTable'
// import { columns, User } from './columns'
import RoleManagementPanel from './_components/RoleManagementPanel'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAllUsers } from '@/hooks/useAllUsers'
import AddUserModal from './_components/AddUserModal'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { OFFSET, POSITION } from '@/utils/constant'
import { createColumns } from './columns'
import { useRoles } from '@/hooks/useRoles'
import { useUser } from '@/hooks/useSingleUser'

const SettingsPage: React.FC = () => {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialTab = searchParams.get('tab') || 'users'
    const [activeTab, setActiveTab] = useState(initialTab)
    const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const { roles, loading: rolesLoading } = useRoles()
    
    // Set the first role as selected once roles are loaded
    useEffect(() => {
        if (roles.length > 0 && !selectedRole) {
            setSelectedRole(roles[0].name);
        }
    }, [roles, selectedRole]);
    const [editingUserId, setEditingUserId] = useState<number | null>(null)

    // Pagination state - get from URL params
    const [offset, setOffset] = useState<number>(OFFSET)
    const limitParam = searchParams.get('limit')
    const position: number = Number(limitParam ?? POSITION) || Number(POSITION)

    // Fetch users from API
    const {
        users,
        loading: usersLoading,
        error: usersError,
        totalRows,
        totalPages,
        refetchUsers,
    } = useAllUsers({ initialFetch: true, limit: position, searchTerm: '', offset })
    const {
      user,
        loading: userLoading,
        error,
    } = useUser(editingUserId)

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab)
    }, [initialTab])

    const updateURL = useCallback(
        (newTab: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('tab', newTab)
            const newURL = `${window.location.pathname}${
                params.toString() ? '?' + params.toString() : ''
            }`
            router.replace(newURL, { scroll: false })
        },
        [router]
    )

    const handleTabChange = (tab: 'users' | 'roles') => {
        setActiveTab(tab)
        updateURL(tab)
    }

    const handleRoleChange = async (userId: number, roleId: number, roleName: string) => {
        // Call your API to update the user's role
        // await updateUserRole(userId, roleId)
        // refetchUsers()
    }

    const handleEdit = (userId: number) => {
        // Pehle modal ko open karo, fir editingUserId set karo
        setIsAddModalOpen(true)
        setIsEditMode(true)
        setEditingUserId(userId) 
    }

    const handleDelete = async (userId: number) => {

        // Call your API to delete the user
        // await deleteUser(userId)
        // refetchUsers()
    }

    // Create columns with the fetched roles and callbacks
    const columns = createColumns(
        roles,
        rolesLoading,
        handleRoleChange,
        handleEdit,
        handleDelete
    )

    const handleCloseModal = () => {
        setIsAddModalOpen(false)
        setEditingUserId(null)
        setIsEditMode(false)
    }

    return (
        <div className="py-2 bg-white min-h-screen">
            {/* Tab Navigation */}
            <div className="flex gap-1 mb-2">
                <Button
                    onClick={() => handleTabChange('users')}
                    className={`flex items-center gap-2 px-4 py-2 text-[1rem] rounded-lg font-medium transition-colors ${
                        activeTab === 'users'
                            ? 'bg-primary text-white'
                            : 'bg-transparent text-muted-foreground hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    Users
                </Button>
                <Button
                    onClick={() => handleTabChange('roles')}
                    className={`flex items-center gap-2 px-4 py-2 text-[1rem] rounded-lg font-medium transition-colors
                        ${
                            activeTab === 'roles'
                                ? 'bg-primary text-white'
                                : 'bg-transparent text-muted-foreground hover:text-gray-900 hover:bg-gray-100'
                        }
                    `}
                >
                    <Settings className="w-4 h-4" />
                    Manage Role Functions
                </Button>
            </div>

            {activeTab === 'users' && (
                <>
                    {/* Invite Users via Link Section */}
                    {/* <UserInviteSection
                        onInviteGenerated={handleInviteGenerated}
                    /> */}

                    {/* Users Management Section */}
                    <div className="py-8">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 text-start">
                                    Users ({users.length})
                                </h2>
                                <p className="text-muted-foreground text-[1.1rem] text-start">
                                    Manage all users and their roles in your
                                    organization
                                </p>
                            </div>
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => { setIsEditMode(false)}} className="bg-primary hover:bg-blue-700 text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add User
                                    </Button>
                                </DialogTrigger>
                                {isAddModalOpen && (
                                    <AddUserModal 
                                        isEditMode={isEditMode}
                                        user={user}
                                        isOpen={isAddModalOpen}
                                        refetchUsers={() => {
                                            refetchUsers(offset)
                                            handleCloseModal()
                                        }} 
                                        onClose={handleCloseModal}
                                    />
                                )}
                            </Dialog>
                        </div>

                        {/* User Management DataTable */}
                        {usersLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-pulse">
                                    Loading users...
                                </div>
                            </div>
                        ) : usersError ? (
                            <div className="flex flex-col items-center py-8 text-red-600">
                                <div>Error loading users</div>
                                <Button
                                    onClick={() => refetchUsers(offset)}
                                    variant="outline"
                                    className="mt-2"
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : (
                            <>
                                <UserManagementTable
                                    columns={columns}
                                    data={users}
                                />

                                {/* Pagination */}
                                <DataTablePagination
                                    totalStudents={totalRows}
                                    lastPage={totalPages}
                                    pages={totalPages}
                                    // fetchStudentData={handlePaginationChange}
                                    fetchStudentData={(
                                            newOffset: number
                                        ) => {
                                            setOffset(newOffset)
                                            refetchUsers(newOffset) // instead of getBootcamp(newOffset)
                                        }}
                                />
                            </>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'roles' && (
                <RoleManagementPanel
                    selectedRole={selectedRole}
                    onRoleChange={setSelectedRole}
                />
            )}
        </div>
    )
}

export default SettingsPage
