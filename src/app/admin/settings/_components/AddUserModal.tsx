'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users, Settings, Plus, GraduationCap, Shield, Cog } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AddUserModalProps = {
  refetchUsers: () => void;
};

type RoleCardProps = {
    icon: React.ReactNode
    title: 'Admin' | 'Ops' | 'Instructor'
    description: string
    selected?: boolean
    onSelect?: (role: 'Admin' | 'Ops' | 'Instructor') => void
}

const RoleCard: React.FC<RoleCardProps> = ({
    icon,
    title,
    description,
    selected,
    onSelect,
}) => {
    return (
        <button
            type="button"
            onClick={() => onSelect && onSelect(title)}
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
                    <div className="font-medium text-gray-900">{title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                        {description}
                    </div>
                </div>
            </div>
        </button>
    )
}


const AddUserModal: React.FC<AddUserModalProps> = ({ refetchUsers }) => {
    const [pendingUserRole, setPendingUserRole] = useState<
        'Admin' | 'Ops' | 'Instructor' | null
    >(null)
    const [newUser, setNewUser] = useState<{ name: string; email: string }>({
        name: '',
        email: '',
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNewUser((prev) => ({ ...prev, [name]: value }))
    }

    const canSubmit =
        newUser.name.trim().length > 0 &&
        newUser.email.trim().length > 0 &&
        !!pendingUserRole

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader className="text-left">
                <DialogTitle className="text-[18px] font-semibold">
                    Add New User
                </DialogTitle>
            </DialogHeader>

            {/* Form Body */}
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
                        {/* Admin */}
                        <RoleCard
                            icon={
                                <Shield className="w-5 h-5" />
                            }
                            title="Admin"
                            description="Users who have full access to all functions of the platform"
                            selected={
                                pendingUserRole ===
                                'Admin'
                            }
                            onSelect={
                                setPendingUserRole
                            }
                        />
                        {/* Ops */}
                        <RoleCard
                            icon={
                                <Cog className="w-5 h-5" />
                            }
                            title="Ops"
                            description="Users who see day to day operations of the courses for Zuvy"
                            selected={
                                pendingUserRole ===
                                'Ops'
                            }
                            onSelect={
                                setPendingUserRole
                            }
                        />
                        {/* Instructor */}
                        <RoleCard
                            icon={
                                <GraduationCap className="w-5 h-5" />
                            }
                            title="Instructor"
                            description="Users who teach the live classes in the courses and check submissions"
                            selected={
                                pendingUserRole ===
                                'Instructor'
                            }
                            onSelect={
                                setPendingUserRole
                            }
                        />
                    </div>
                </div>
            </div>

            <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                    <Button
                        variant="outline"
                        className="bg-white"
                    >
                        Cancel
                    </Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        className="bg-primary hover:bg-blue-700"
                        disabled={!canSubmit}
                        onClick={async () => {
                            const payload = {
                                name: newUser.name.trim(),
                                email: newUser.email.trim(),
                                role: pendingUserRole,
                            }
                            console.log(
                                'Add User payload:',
                                payload
                            )

                            // TODO: Replace with actual API call to create user
                            // await api.post('/rbac/create/user', payload)

                            // Reset form
                            setNewUser({
                                name: '',
                                email: '',
                            })
                            setPendingUserRole(null)

                            // Refresh users list
                            // refetchUsers()
                        }}
                    >
                        Add User
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}


export default AddUserModal

