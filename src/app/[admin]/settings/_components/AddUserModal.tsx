'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRoles } from '@/hooks/useRoles'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
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
  isEditMode: boolean;
  user?: any | null;
  refetchUsers?: () => void;
  selectedId?: number; 
  onClose?: () => void;
  isOpen?: boolean;
};

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
                    ? 'border-primary bg-primary-light'
                    : 'border-gray-200 hover:border-gray-300'
            }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                        selected
                            ? 'bg-blue-100 text-primary'
                            : 'bg-gray-100 text-foreground'
                    }`}
                >
                    {icon}
                </div>
                <div>
                    <div className="font-medium text-foreground capitalize">{title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
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
    // Store original values to track changes
    const [originalUser, setOriginalUser] = useState<{ name: string; email: string; roleId: number | null }>({
        name: '',
        email: '',
        roleId: null,
    })

    // Fetch fresh user data when entering edit mode
    useEffect(() => {
        if (isEditMode && user?.id && isOpen) {
            const fetchFreshUserData = async () => {
                setIsFetchingFreshData(true)
                try {
                    const response = await api.get(`/users/getUser/${user.id}`)
                    setFreshUserData(response.data)
                    const fetchedName = response.data.name || ''
                    const fetchedEmail = response.data.email || ''
                    const fetchedRoleId = response.data.roleId || null
                    
                    setNewUser({
                        name: fetchedName,
                        email: fetchedEmail,
                    })
                    setPendingUserRole(fetchedRoleId)
                    // Store original values
                    setOriginalUser({
                        name: fetchedName,
                        email: fetchedEmail,
                        roleId: fetchedRoleId,
                    })
                } catch (error) {
                    // Fallback to passed user data if fetch fails
                    console.error('Error fetching fresh user data:', error)
                    const fallbackName = user.name || ''
                    const fallbackEmail = user.email || ''
                    const fallbackRoleId = user.roleId || null
                    
                    setNewUser({
                        name: fallbackName,
                        email: fallbackEmail,
                    })
                    setPendingUserRole(fallbackRoleId)
                    // Store original values
                    setOriginalUser({
                        name: fallbackName,
                        email: fallbackEmail,
                        roleId: fallbackRoleId,
                    })
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
            setOriginalUser({
                name: '',
                email: '',
                roleId: null,
            })
        }
    }, [isEditMode, user?.id, isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNewUser((prev) => ({ ...prev, [name]: value }))
    }

    // Check if form is valid (for add mode)
    const isFormValid =
        newUser.name.trim().length > 0 &&
        newUser.email.trim().length > 0 &&
        !!pendingUserRole

    // Check if there are changes (for edit mode)
    const hasChanges = isEditMode && (
        newUser.name.trim() !== originalUser.name.trim() ||
        newUser.email.trim() !== originalUser.email.trim() ||
        pendingUserRole !== originalUser.roleId
    )

    // In edit mode, button should be enabled only if there are changes
    // In add mode, button should be enabled if form is valid
    const canSubmit = isEditMode ? hasChanges : isFormValid

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
            if(response.status === 201) {
                toast.success({
                    title: 'User added successfully',
                    description: 'The new user has been added.',
                })
            }
        } catch (error:any) {
            toast.error({
                title: 'Error adding user',
                description: error?.response?.data?.message || 'There was an issue adding the new user.',
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
            const response = await api.put(`/users/updateUser/${user.id}`, payload)
            if(response.status === 200) {
                // Update the cached fresh data immediately
                setFreshUserData({
                    ...freshUserData,
                    ...payload,
                })
                // Update original values after successful save
                setOriginalUser({
                    name: payload.name,
                    email: payload.email,
                    roleId: payload.roleId,
                })
                toast.success({
                    title: 'User updated successfully',
                    description: 'The user details have been updated.',
                })
            }
        } catch (error:any) {
            toast.error({
                title: 'Error updating user',
                description: error?.response?.data?.message || 'There was an issue updating the user details.',
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
                    <div className="animate-pulse">
                        Loading user data...
                    </div>
                </div>
            )}

            {/* Form Body */}
            {!isFetchingFreshData && (
                <div className="space-y-6 h-[25rem] overflow-y-auto pr-2 pl-2">
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