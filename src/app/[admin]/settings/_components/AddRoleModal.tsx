'use client'

import React, { useState } from 'react'
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

type AddUserModalProps = {
    onClose: () => void
    onRoleAdded: () => void;
}
type AddRoleModalProps = {
    onClose: () => void;
    onRoleAdded: () => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ onClose, onRoleAdded })=> {
    const [newRole, setNewRole] = useState<{
        name: string
        description: string
    }>({
        name: '',
        description: '',
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNewRole((prev) => ({ ...prev, [name]: value }))
    }

    const canSubmit =
        newRole.name.trim().length > 0 && newRole.description.trim().length > 0

    const handleAddRole = async () => {
        try {
            if (!canSubmit) return

            const payload = {
                name: newRole.name.trim(),
                description: newRole.description.trim(),
            }

            const response = await api.post('/users/create/user/role', payload)
            onRoleAdded?.();

            // Reset form
            setNewRole({
                name: '',
                description: '',
            })
            toast.success({
                title: 'Role Added Successfully!',
                description: response.data.message,
            })
        } catch (error: any) {
            toast.error({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
            })
        }
    }

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader className="text-left">
                <DialogTitle className="text-[18px] font-semibold">
                    Add New Role
                </DialogTitle>
            </DialogHeader>

            {/* Form Body */}
            <div className="space-y-6">
                <div className="text-left">
                    <Label className="text-[14px] font-medium">
                        Role Name *
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={newRole.name}
                        onChange={handleInputChange}
                        placeholder="Enter role name"
                        className="mt-2"
                    />
                </div>
                <div className="text-left">
                    <Label className="text-[14px] font-medium">
                        Role Description *
                    </Label>
                    <Input
                        id="description"
                        name="description"
                        value={newRole.description}
                        onChange={handleInputChange}
                        placeholder="Enter role description"
                        className="mt-2"
                    />
                </div>
            </div>

            <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                    <Button variant="outline" className="bg-white">
                        Cancel
                    </Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        disabled={!canSubmit}
                        onClick={handleAddRole}
                    >
                        Add Role
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default AddRoleModal
