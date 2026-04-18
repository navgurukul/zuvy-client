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
import useOrgSettings from '@/hooks/useOrgSettings'

type AddUserModalProps = {
    isEditMode: boolean;
    management: any[];
    user?: any | null;
    refetchUsers?: () => void;
    selectedId?: number;
    onClose?: () => void;
    isOpen?: boolean;
};

type NewUser = {
    orgName: string;
    name: string;
    email: string;
    assigneeName: string;
    assigneeEmail: string;
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
            className={`w-full text-left border rounded-lg p-4 transition-colors ${selected
                ? 'border-primary bg-primary-light'
                : 'border-gray-200 hover:border-gray-300'
                }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${selected
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


const AddOrganization: React.FC<AddUserModalProps> = ({
    isEditMode,
    management,
    user,
    refetchUsers,
    onClose,
    isOpen = false,
}) => {
    const { fetchOrgById, uploadOrgLogo, completeOrgSetup, updateOrgById } = useOrgSettings()
    const [pendingUserRole, setPendingUserRole] = useState<number | null>(null)
    const [freshUserData, setFreshUserData] = useState<any>(null)
    const [isFetchingFreshData, setIsFetchingFreshData] = useState(false)
    const [newUser, setNewUser] = useState<NewUser>({
        orgName: '',
        name: '',
        email: '',
        assigneeName: '',
        assigneeEmail: '',
    })
    // Store original values to track changes
    const [originalUser, setOriginalUser] = useState<{ name: string; email: string; roleId: number | null }>({
        name: '',
        email: '',
        roleId: null,
    })

    // Fetch fresh organization data when entering edit mode
    useEffect(() => {
        if (isEditMode && user?.id && isOpen) {
            const fetchFreshOrgData = async () => {
                setIsFetchingFreshData(true)
                try {
                    const data = await fetchOrgById(user.id)
                    setFreshUserData(data)
                    const fetchedOrgName = data.title || ''
                    const fetchedPocName = data.pocName || ''
                    const fetchedPocEmail = data.pocEmail || ''
                    const fetchedAssigneeName = data.zuvyPocName || ''
                    const fetchedAssigneeEmail = data.zuvyPocEmail || ''
                    // Mapping isManagedByZuvy to role id (1: Self, 2: Zuvy)
                    const fetchedRoleId = user.managementType || data.isManagedByZuvy ? 2 : 1

                    setNewUser({
                        orgName: fetchedOrgName,
                        name: fetchedPocName,
                        email: fetchedPocEmail,
                        assigneeName: fetchedAssigneeName,
                        assigneeEmail: fetchedAssigneeEmail,
                    })
                    setPendingUserRole(fetchedRoleId)
                    // Store original values for change detection
                    setOriginalUser({
                        name: fetchedPocName,
                        email: fetchedPocEmail,
                        roleId: fetchedRoleId,
                    })
                } catch (error) {
                    console.error('Error fetching fresh organization data:', error)
                    const fallbackOrgName = user.name || ''
                    const fallbackPocName = user.poc?.name || ''
                    const fallbackPocEmail = user.poc?.email || ''
                    const fallbackAssigneeName = user.assignee?.name || ''
                    const fallbackAssigneeEmail = user.assignee?.email || ''
                    const fallbackRoleId = user.managementType === 'Zuvy Managed' ? 2 : 1

                    setNewUser({
                        orgName: fallbackOrgName,
                        name: fallbackPocName,
                        email: fallbackPocEmail,
                        assigneeName: fallbackAssigneeName,
                        assigneeEmail: fallbackAssigneeEmail,
                    })

                    setPendingUserRole(fallbackRoleId)
                    setOriginalUser({
                        name: fallbackPocName,
                        email: fallbackPocEmail,
                        roleId: fallbackRoleId,
                    })
                } finally {
                    setIsFetchingFreshData(false)
                }
            }

            fetchFreshOrgData()
        } else if (!isEditMode && isOpen) {
            // Reset form for add mode
            setNewUser({
                orgName: '',
                name: '',
                email: '',
                assigneeName: '',
                assigneeEmail: '',
            })
            setPendingUserRole(null)
            setFreshUserData(null)
            setOriginalUser({
                name: '',
                email: '',
                roleId: null,
            })
        }
    }, [isEditMode, user?.id, isOpen, fetchOrgById])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNewUser((prev) => ({ ...prev, [name]: value }))
    }

    // Check if form is valid (for add mode)
    const isZuvyManaged =
        pendingUserRole === 2 // Zuvy Managed has ID 2 in the management list in page.tsx

    useEffect(() => {
        if (!isZuvyManaged) {
            setNewUser((prev) => ({
                ...prev,
                assigneeName: '',
                assigneeEmail: '',
            }))
        }
    }, [isZuvyManaged])

    const MAX_NAME_LENGTH = 30

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email.toLowerCase())
    }

    const isFormValid =
        newUser.orgName.trim().length > 0 && newUser.orgName.trim().length <= MAX_NAME_LENGTH &&
        newUser.name.trim().length > 0 &&
        newUser.name.trim().length <= MAX_NAME_LENGTH &&
        validateEmail(newUser.email.trim()) &&
        !!pendingUserRole &&
        (!isZuvyManaged ||
            (newUser.assigneeName.trim().length > 0 &&
                newUser.assigneeName.trim().length <= MAX_NAME_LENGTH &&
                validateEmail(newUser.assigneeEmail.trim())))

    // Check if there are changes (for edit mode)
    const hasChanges = isEditMode && (
        newUser.orgName.trim() !== (freshUserData?.title?.trim() || '') ||
        newUser.name.trim() !== originalUser.name.trim() ||
        newUser.email.trim() !== originalUser.email.trim() ||
        pendingUserRole !== originalUser.roleId ||
        newUser.assigneeName.trim() !== (freshUserData?.zuvyPocName?.trim() || '') ||
        newUser.assigneeEmail.trim() !== (freshUserData?.zuvyPocEmail?.trim() || '')
    )

    // In edit mode, button should be enabled only if there are changes AND the form is valid
    // In add mode, button should be enabled if form is valid
    const canSubmit = isFormValid && (isEditMode ? hasChanges : true)

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
            title: newUser.orgName.trim(),
            displayName: newUser.orgName.trim(),
            logoUrl: '',
            pocName: newUser.name.trim(),
            pocEmail: newUser.email.trim(),
            isManagedByZuvy: isZuvyManaged,
            zuvyPocName: isZuvyManaged ? newUser.assigneeName.trim() : null,
            zuvyPocEmail: isZuvyManaged ? newUser.assigneeEmail.trim() : null,
        }

        try {
            const response = await api.post('/org/create', payload)

            if (response.data?.status === 'success') {
                toast.success({
                    title: 'Organisation created',
                    description: response.data.message,
                })
            }
        } catch (error: any) {
            toast.error({
                title: 'Error creating organisation',
                description:
                    error?.response?.data?.message ||
                    'There was an issue creating the organisation.',
            })
            console.error('Create org error:', error)
            return
        }

        // Reset form
        setNewUser({
            orgName: '',
            name: '',
            email: '',
            assigneeName: '',
            assigneeEmail: '',
        })
        setPendingUserRole(null)

        refetchUsers && refetchUsers()
        onClose && onClose()
    }


    const handleEditUser = async () => {
        if (!canSubmit || !user?.id) return

        const payload = {
            title: newUser.orgName.trim(),
            pocName: newUser.name.trim(),
            pocEmail: newUser.email.trim(),
            isManagedByZuvy: isZuvyManaged,
            zuvyPocName: isZuvyManaged ? newUser.assigneeName.trim() : null,
            zuvyPocEmail: isZuvyManaged ? newUser.assigneeEmail.trim() : null,
        }

        try {
            const response = await updateOrgById(user.id, payload)
            if (response.status === 200) {
                // Update the cached fresh data immediately
                setFreshUserData({
                    ...freshUserData,
                    ...payload,
                })
                // Update original values after successful save
                setOriginalUser({
                    name: payload.pocName,
                    email: payload.pocEmail,
                    roleId: isZuvyManaged ? 2 : 1,
                })
                toast.success({
                    title: 'Organisation updated successfully',
                    description: 'The organisation details have been updated.',
                })
            }
        } catch (error: any) {
            toast.error({
                title: 'Error updating organisation',
                description: error?.response?.data?.message || 'There was an issue updating the organisation details.',
            })
            console.error('Error updating organisation:', error)
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
                    {isEditMode ? 'Edit Organisation' : 'Add Organisation'}
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
                    <div className="text-left">
                        <Label className="text-[14px] font-medium">
                            Organisation Name *
                        </Label>
                        <Input
                            id="name"
                            name="orgName"
                            value={newUser.orgName}
                            onChange={handleInputChange}
                            placeholder="Enter Organisation Name"
                            className={`mt-2 ${newUser.orgName.trim().length > MAX_NAME_LENGTH ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        />
                        {newUser.orgName.trim().length > MAX_NAME_LENGTH && (
                            <p className="text-red-500 text-xs mt-1">Organisation name cannot exceed {MAX_NAME_LENGTH} characters</p>
                        )}
                    </div>

                    <div className="text-left">
                        <Label className="text-[14px] font-medium">
                            Management Type  *
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            {management.map((role) => (
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
                    <div>
                        <Label className="block text-sm font-medium text-gray-900 mb-4 text-start">
                            Point of Contact <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="text-left">
                                <p className="text-[14px]">
                                    Point of Contact Name *
                                </p>
                                <Input
                                    id="name"
                                    name="name"
                                    value={newUser.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                    className={`mt-2 ${newUser.name.trim().length > MAX_NAME_LENGTH ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                />
                                {newUser.name.trim().length > MAX_NAME_LENGTH && (
                                    <p className="text-red-500 text-xs mt-1">Name cannot exceed {MAX_NAME_LENGTH} characters</p>
                                )}
                            </div>
                            <div className="text-left">
                                <p className="text-[14px]">
                                    Email *
                                </p>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                    className="mt-2"
                                />
                            </div>
                        </div>
                        {isZuvyManaged && (
                            <>
                                <Label className="block text-sm font-medium text-gray-900 my-4 text-start">
                                    Zuvy Assignee
                                </Label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="text-left">
                                        <p className="text-[14px]">Assignee Name *</p>
                                        <Input
                                            name="assigneeName"
                                            value={newUser.assigneeName}
                                            onChange={handleInputChange}
                                            placeholder="Enter full name"
                                            className={`mt-2 ${newUser.assigneeName.trim().length > MAX_NAME_LENGTH ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        />
                                        {newUser.assigneeName.trim().length > MAX_NAME_LENGTH && (
                                            <p className="text-red-500 text-xs mt-1">Name cannot exceed {MAX_NAME_LENGTH} characters</p>
                                        )}
                                    </div>

                                    <div className="text-left">
                                        <p className="text-[14px]">Email Id *</p>
                                        <Input
                                            name="assigneeEmail"
                                            type="email"
                                            value={newUser.assigneeEmail}
                                            onChange={handleInputChange}
                                            placeholder="Enter email address"
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

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
                        {isEditMode ? 'Save Change' : 'Add Organisation'}
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default AddOrganization