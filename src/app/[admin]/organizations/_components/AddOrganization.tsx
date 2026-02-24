// 'use client';

// import { useState } from 'react';
// import { X } from 'lucide-react';

// type AddUserModalProps = {
//   isEditMode: boolean;
// //   user?: any | null;
// //   refetchUsers?: () => void;
//   selectedId?: number; 
//   onClose?: () => void;
//   isOpen?: boolean;
// };

// const AddOrganization: React.FC<AddUserModalProps> = ({ 
//     isEditMode, 
//     // user, 
//     // refetchUsers, 
//     onClose,
//     isOpen = false,
// }) => {
//     const [formData, setFormData] = useState({
//         organisationName: '',
//         managementType: 'Self Managed',
//         pointOfContactName: '',
//         emailId: '',
//     });

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const handleManagementTypeChange = (type: string) => {
//         setFormData((prev) => ({
//             ...prev,
//             managementType: type,
//         }));
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         console.log('Form submitted:', formData);
//     };

//     const handleCancel = () => {
//         console.log('Form cancelled');
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
//                 <div className="flex justify-between items-center mb-6">
//                     <h1 className="text-2xl font-bold text-gray-900">Add Organisation</h1>
//                     <button className="text-gray-500 hover:text-gray-700">
//                         <X size={24} />
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {/* Organisation Name */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-900 mb-2">
//                             Organisation Name <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="organisationName"
//                             placeholder="Enter organisation name"
//                             value={formData.organisationName}
//                             onChange={handleInputChange}
//                             required
//                             className="w-full px-4 py-2 border-2 border-green-600 rounded-lg focus:outline-none focus:border-green-700"
//                         />
//                     </div>

//                     {/* Management Type */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-900 mb-4">
//                             Management Type <span className="text-red-500">*</span>
//                         </label>
//                         <div className="grid grid-cols-2 gap-4">
//                             <button
//                                 type="button"
//                                 onClick={() => handleManagementTypeChange('Self Managed')}
//                                 className={`p-4 border-2 rounded-lg text-left transition ${
//                                     formData.managementType === 'Self Managed'
//                                         ? 'border-green-600 bg-green-50'
//                                         : 'border-gray-200'
//                                 }`}
//                             >
//                                 <h3 className="font-bold text-gray-900">Self Managed</h3>
//                                 <p className="text-sm text-gray-600">
//                                     Organisations who manage all functions on the platform
//                                 </p>
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={() => handleManagementTypeChange('Zuvy Managed')}
//                                 className={`p-4 border-2 rounded-lg text-left transition ${
//                                     formData.managementType === 'Zuvy Managed'
//                                         ? 'border-green-600 bg-green-50'
//                                         : 'border-gray-200'
//                                 }`}
//                             >
//                                 <h3 className="font-bold text-gray-900">Zuvy Managed</h3>
//                                 <p className="text-sm text-gray-600">
//                                     Organisations for whom Zuvy manages all functions on the platform
//                                 </p>
//                             </button>
//                         </div>
//                     </div>

//                     {/* Point of Contact */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-900 mb-4">
//                             Point of Contact <span className="text-red-500">*</span>
//                         </label>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm text-gray-700 mb-2">
//                                     Point of Contact Name <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="pointOfContactName"
//                                     placeholder="Enter name"
//                                     value={formData.pointOfContactName}
//                                     onChange={handleInputChange}
//                                     required
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm text-gray-700 mb-2">
//                                     Email Id <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="email"
//                                     name="emailId"
//                                     placeholder="Enter email"
//                                     value={formData.emailId}
//                                     onChange={handleInputChange}
//                                     required
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Buttons */}
//                     <div className="flex justify-end gap-4 mt-8">
//                         <button
//                             type="button"
//                             onClick={handleCancel}
//                             className="px-6 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             className="px-6 py-2 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition"
//                         >
//                             Add Organisation
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default AddOrganization

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
    const { roles, loading: rolesLoading } = useRoles()
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
                        orgName: '',
                        name: fetchedName,
                        email: fetchedEmail,
                        assigneeName: '',
                        assigneeEmail: '',
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
                        orgName: '',
                        name: fallbackName,
                        email: fallbackEmail,
                        assigneeName: '',
                        assigneeEmail: '',
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
    }, [isEditMode, user?.id, user?.name, user?.email, user?.roleId, isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNewUser((prev) => ({ ...prev, [name]: value }))
    }

    // Check if form is valid (for add mode)
    const isZuvyManaged =
        management.find((m) => m.id === pendingUserRole)?.name === 'Zuvy Managed'

    useEffect(() => {
        if (!isZuvyManaged) {
            setNewUser((prev) => ({
                ...prev,
                assigneeName: '',
                assigneeEmail: '',
            }))
        }
    }, [isZuvyManaged])

    const isFormValid =
        newUser.orgName.trim().length > 0 &&
        newUser.name.trim().length > 0 &&
        newUser.email.trim().length > 0 &&
        !!pendingUserRole &&
        (!isZuvyManaged ||
            (newUser.assigneeName.trim().length > 0 &&
                newUser.assigneeEmail.trim().length > 0))

    // Check if there are changes (for edit mode)
    const hasChanges = isEditMode && (
        newUser.name.trim() !== originalUser.name.trim() ||
        newUser.email.trim() !== originalUser.email.trim() ||
        pendingUserRole !== originalUser.roleId
    )

    // In edit mode, button should be enabled only if there are changes
    // In add mode, button should be enabled if form is valid
    const canSubmit = isEditMode ? hasChanges : isFormValid



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
        const selectedManagement = management.find(
            (m) => m.id === pendingUserRole
        )

        const isManagedByZuvy = selectedManagement?.name === 'Zuvy Managed'

        const payload = {
            title: newUser.orgName.trim(),
            displayName: newUser.orgName.trim(),
            logoUrl: '',
            pocName: newUser.name.trim(),
            pocEmail: newUser.email.trim(),
            isManagedByZuvy,
            zuvyPocName: isManagedByZuvy ? newUser.assigneeName.trim() : null,
            zuvyPocEmail: isManagedByZuvy ? newUser.assigneeEmail.trim() : null,
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
        if (!canSubmit) return

        const payload = {
            name: newUser.name.trim(),
            email: newUser.email.trim(),
            roleId: pendingUserRole,
        }

        try {
            const response = await api.put(`/users/updateUser/${user.id}`, payload)
            if (response.status === 200) {
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
        } catch (error: any) {
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
                            className="mt-2"
                        />
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
                                    className="mt-2"
                                />
                            </div>
                            <div className="text-left">
                                <p className="text-[14px]">
                                    Email *
                                </p>
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
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="text-left">
                                        <p className="text-[14px]">Email Id *</p>
                                        <Input
                                            name="assigneeEmail"
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