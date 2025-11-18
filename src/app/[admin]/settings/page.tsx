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
    const [isSearching, setIsSearching] = useState(false)
    const [selectedRoleId, setSelectedRoleId] = useState<string>('all') 
    
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
    } = useAllUsers({ 
        initialFetch: true, 
        limit: position, 
        searchTerm: '', 
        offset,
        roleId: selectedRoleId === 'all' ? undefined : selectedRoleId
    })
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
        // After DeleteUser component successfully deletes the user on the server
        // refresh the users list so the table reflects the change immediately
        try {
            // refetchUsers is provided by the useAllUsers hook and accepts an offset
            await refetchUsers(offset)
        } catch (err) {
            // If refetch fails, swallow the error silently — the DeleteUser
            // component already shows success/error toasts for the delete call.
            // We could show an additional toast here if desired.
            console.error('Failed to refresh users after delete', err)
        }
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

    const handleRoleIdChange = (newRoleId: string) => {
        setSelectedRoleId(newRoleId)
        setOffset(0) // Reset to first page when changing role filter
        // The useAllUsers hook will automatically refetch when roleId changes
    }

    return (
        <div className="p-6 bg-background min-h-screen">
            {/* Tab Navigation */}
            <div className="flex gap-1 mb-2">
                <Button
                    onClick={() => handleTabChange('users')}
                    className={`flex items-center gap-2 px-4 py-2 text-[1rem] rounded-lg font-medium transition-colors ${
                        activeTab === 'users'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-gray-100'
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
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-gray-100'
                        }
                    `}
                >
                    <Shield className="w-4 h-4" />
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
                    <div className="py-4">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground text-start">
                                    Users ({users.length})
                                </h2>
                                <p className="text-muted-foreground text-[1.1rem] text-start">
                                    Manage all users and their roles in your
                                    organization
                                </p>
                            </div>
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => { setIsEditMode(false)}} >
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
                            <div className="flex flex-col items-center py-8 text-destructive">
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
                                    onSearchChange={setIsSearching}
                                    roleId={selectedRoleId}
                                    onRoleIdChange={handleRoleIdChange}
                                />
                                {!isSearching && (
                                    <DataTablePagination
                                        totalStudents={totalRows}
                                        lastPage={totalPages}
                                        pages={totalPages}
                                        // fetchStudentData={handlePaginationChange}
                                        fetchStudentData={(newOffset: number) => {
                                            setOffset(newOffset)
                                            refetchUsers(newOffset)
                                        }}
                                    />
                                )}
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
