'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRoles } from '@/hooks/useRoles'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import {
    GraduationCap,
    Shield,
    Cog,
    User,
    Briefcase,
    Users,
    Code,
    Palette,
    Headphones,
    CheckCircle,
    Edit,
    Eye,
    UserCircle,
    BarChart,
    Award,
    CalendarCheck,
    DollarSign,
    TrendingUp,
    Megaphone,
} from 'lucide-react'

type AddUserModalProps = {
    isEditMode: boolean
    user?: any | null
    refetchUsers?: () => void
    selectedId?: number
    onClose?: () => void
    isOpen?: boolean
}

type RoleCardProps = {
    id: number
    icon: React.ReactNode
    title: any
    description: string
    selected?: boolean
    onSelect?: (role: any) => void
}

const RoleCard: React.FC<RoleCardProps> = ({
    id,
    icon,
    title,
    description,
    selected,
    onSelect,
}) => {
    return (
        <button
            type="button"
            onClick={() => onSelect && onSelect(id)}
            className={`w-full text-left border rounded-lg p-4 transition-colors ${
                selected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
            }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                        selected
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    {icon}
                </div>
                <div>
                    <div className="font-medium text-gray-900 capitalize">
                        {title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        {description}
                    </div>
                </div>
            </div>
        </button>
    )
}

const AddUserModal: React.FC<AddUserModalProps> = ({
    isEditMode,
    user,
    refetchUsers,
    onClose,
    isOpen = false,
}) => {
    const { roles, loading: rolesLoading } = useRoles()
    const [pendingUserRole, setPendingUserRole] = useState<number | null>(null)
    const [freshUserData, setFreshUserData] = useState<any>(null)
    const [isFetchingFreshData, setIsFetchingFreshData] = useState(false)
    const [newUser, setNewUser] = useState<{ name: string; email: string }>({
        name: '',
        email: '',
    })

    // Fetch fresh user data when entering edit mode
    useEffect(() => {
        if (isEditMode && user?.id && isOpen) {
            const fetchFreshUserData = async () => {
                setIsFetchingFreshData(true)
                try {
                    const response = await api.get(`/users/${user.id}`)
                    setFreshUserData(response.data)
                    setNewUser({
                        name: response.data.name || '',
                        email: response.data.email || '',
                    })
                    setPendingUserRole(response.data.roleId || null)
                } catch (error) {
                    // Fallback to passed user data if fetch fails
                    console.error('Error fetching fresh user data:', error)
                    setNewUser({
                        name: user.name || '',
                        email: user.email || '',
                    })
                    setPendingUserRole(user.roleId || null)
                } finally {
                    setIsFetchingFreshData(false)
                }
            }

            fetchFreshUserData()
        } else if (!isEditMode && isOpen) {
            // Reset form for add mode
            setNewUser({
                name: '',
                email: '',
            })
            setPendingUserRole(null)
            setFreshUserData(null)
        }
    }, [isEditMode, user?.id, isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNewUser((prev) => ({ ...prev, [name]: value }))
    }

    const canSubmit =
        newUser.name.trim().length > 0 &&
        newUser.email.trim().length > 0 &&
        !!pendingUserRole

    // const getRoleIcon = useCallback((role: string) => {
    //     console.log('role', role)
    //     switch (role.toLowerCase()) {
    //         case 'admin':
    //             return <Shield className="w-5 h-5" />
    //         case 'ops':
    //             return <Cog className="w-5 h-5" />
    //         case 'instructor':
    //             return <GraduationCap className="w-5 h-5" />
    //         default:
    //             return  <Cog className="w-5 h-5" />
    //     }
    // }, [])

    const iconList = [
        User,
        Briefcase,
        Users,
        Code,
        Palette,
        Headphones,
        CheckCircle,
        Edit,
        Eye,
        UserCircle,
        BarChart,
        Award,
        CalendarCheck,
        DollarSign,
        TrendingUp,
        Megaphone,
    ]

    const getRoleIcon = useCallback((role: string) => {
        console.log('role', role)
        switch (role.toLowerCase()) {
            case 'admin':
                return <Shield className="w-5 h-5" />
            case 'ops':
                return <Cog className="w-5 h-5" />
            case 'instructor':
                return <GraduationCap className="w-5 h-5" />
            default:
                // Get icon sequentially from the list based on role name
                const roleIndex = role
                    .split('')
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
                const IconComponent = iconList[roleIndex % iconList.length]
                return <IconComponent className="w-5 h-5" />
        }
    }, [])

    const handleAddUser = async () => {
        if (!canSubmit) return

        const payload = {
            name: newUser.name.trim(),
            email: newUser.email.trim(),
            roleId: pendingUserRole,
        }

        try {
            const response = await api.post('/users/addUsers', payload)
            if (response.status === 201) {
                toast.success({
                    title: 'User added successfully',
                    description: 'The new user has been added.',
                })
            }
        } catch (error) {
            toast.error({
                title: 'Error adding user',
                description: 'There was an issue adding the new user.',
            })
            console.error('Error adding user:', error)
            return
        }

        // Reset form
        setNewUser({
            name: '',
            email: '',
        })
        setPendingUserRole(null)
        setFreshUserData(null)
        refetchUsers && refetchUsers()
        onClose && onClose()
    }

    const handleEditUser = async () => {
        if (!canSubmit) return

        const payload = {
            name: newUser.name.trim(),
            email: newUser.email.trim(),
            roleId: pendingUserRole,
        }

        try {
            const response = await api.put(
                `/users/updateUser/${user.id}`,
                payload
            )
            if (response.status === 200) {
                // Update the cached fresh data immediately
                setFreshUserData({
                    ...freshUserData,
                    ...payload,
                })
                toast.success({
                    title: 'User updated successfully',
                    description: 'The user details have been updated.',
                })
            }
        } catch (error) {
            toast.error({
                title: 'Error updating user',
                description: 'There was an issue updating the user details.',
            })
            console.error('Error updating user:', error)
            return
        }
        refetchUsers && refetchUsers()
        onClose && onClose()
    }

    const handleSubmit = () => {
        isEditMode ? handleEditUser() : handleAddUser()
    }

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader className="text-left">
                <DialogTitle className="text-[18px] font-semibold">
                    {isEditMode ? 'Edit User' : 'Add New User'}
                </DialogTitle>
            </DialogHeader>

            {/* Loading state for fresh data */}
            {isEditMode && isFetchingFreshData && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-pulse">Loading user data...</div>
                </div>
            )}

            {/* Form Body */}
            {!isFetchingFreshData && (
                <div className="space-y-6">
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-left">
                            <Label className="text-[14px] font-medium">
                                Name *
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={newUser.name}
                                onChange={handleInputChange}
                                placeholder="Enter full name"
                                className="mt-2"
                            />
                        </div>
                        <div className="text-left">
                            <Label className="text-[14px] font-medium">
                                Email *
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                value={newUser.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                className="mt-2"
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="text-left">
                        <Label className="text-[14px] font-medium">
                            Select Role *
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            {roles.map((role) => (
                                <RoleCard
                                    key={role.id}
                                    id={role.id}
                                    icon={getRoleIcon(role.name)}
                                    title={role.name}
                                    description={role.description}
                                    selected={pendingUserRole === role.id}
                                    onSelect={setPendingUserRole}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                    <Button variant="outline" className="bg-white">
                        Cancel
                    </Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        className="bg-primary hover:bg-blue-700"
                        disabled={!canSubmit || isFetchingFreshData}
                        onClick={handleSubmit}
                    >
                        {isEditMode ? 'Save Change' : 'Add User'}
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default AddUserModal
