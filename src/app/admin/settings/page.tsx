'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users, Settings, Plus } from 'lucide-react'
import { UserRole } from '@/utils/types/type'
import UserInviteSection from './_components/UserInviteSection'
import { UserManagementTable } from './_components/UserManagementTable'
import { columns, User } from './columns'
import RoleManagementPanel from './_components/RoleManagementPanel'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const SettingsPage: React.FC = () => {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users')
    const [selectedRole, setSelectedRole] = useState<
        'Admin' | 'Ops' | 'Instructor'
    >('Admin')

    const handleInviteGenerated = (role: UserRole, inviteLink: string) => {
        console.log(`${role} invite link generated:`, inviteLink)
        // You can add additional logic here, such as updating state or making API calls
    }

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

    // Mock data for users table
    const users: User[] = [
        {
            id: 1,
            name: 'Sarah Johnson',
            email: 'sarah.johnson@zuvy.org',
            role: 'Admin',
            dateAdded: 'Jan 20, 2024',
        },
        {
            id: 2,
            name: 'Mike Chen',
            email: 'mike.chen@zuvy.org',
            role: 'Ops',
            dateAdded: 'Feb 1, 2024',
        },
        {
            id: 3,
            name: 'Emily Davis',
            email: 'emily.davis@zuvy.org',
            role: 'Ops',
            dateAdded: 'Feb 5, 2024',
        },
        {
            id: 4,
            name: 'Alex Rodriguez',
            email: 'alex.rodriguez@zuvy.org',
            role: 'Instructor',
            dateAdded: 'Feb 10, 2024',
        },
        {
            id: 5,
            name: 'Lisa Park',
            email: 'lisa.park@zuvy.org',
            role: 'Instructor',
            dateAdded: 'Feb 15, 2024',
        },
        {
            id: 6,
            name: 'David Wilson',
            email: 'david.wilson@zuvy.org',
            role: 'Instructor',
            dateAdded: 'Feb 20, 2024',
        },
        {
            id: 7,
            name: 'Anna Thompson',
            email: 'anna.thompson@zuvy.org',
            role: 'Ops',
            dateAdded: 'Feb 25, 2024',
        },
    ]

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
                            <Button className="bg-primary hover:bg-blue-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add User
                            </Button>
                        </div>

                        {/* User Management DataTable */}
                        <UserManagementTable columns={columns} data={users} />
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
