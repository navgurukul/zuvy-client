'use client'

import { useState, useEffect } from 'react'
import { api } from '@/utils/axios.config'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast';

// Role Cell Component

type roleCellProps = {
  role: string;
  roles: any; 
  rolesLoading: boolean;
  onRoleUpdate?: () => void;
};

export const ChangeUserRole = ({ role, roles, rolesLoading, userId, roleId, onRoleUpdate }: roleCellProps & { userId: number; roleId: number }) => {
    const [isUpdating, setIsUpdating] = useState(false)
    const [originalRole, setOriginalRole] = useState(role)

    // Update original role when prop changes
    useEffect(() => {
        setOriginalRole(role)
    }, [role])

    const handleRoleChange = async (newRoleName: string) => {
        // Only save if the role actually changed
        if (newRoleName === originalRole) {
            return // No change, don't call API
        }

        try {
            setIsUpdating(true)
            // Find the roleId from the roles array based on the selected role name
            const selectedRole = roles.find((r: any) => r.name.toLowerCase() === newRoleName.toLowerCase())
            if (!selectedRole) return

            await api.post('/users/users/assign-role', {
                userId: userId,
                roleId: selectedRole.id
            })

            // Update original role after successful save
            setOriginalRole(newRoleName)
            onRoleUpdate?.()

            toast.success({
                title: 'Role Updated',
                description: `User role has been updated to ${selectedRole.name}.`,
            })
        } catch (error) {
            console.error('Error updating user role:', error)
            toast.error({
                title: 'Error Updating Role',
                description: 'There was an error updating the user role. Please try again later.',
            })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <Select 
            value={role} 
            onValueChange={handleRoleChange} 
            disabled={isUpdating}
        >
            <SelectTrigger className="w-auto min-w-28 bg-white border-gray-200 h-8 text-sm capitalize">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {rolesLoading ? (
                    <SelectItem value="loading" disabled>
                        Loading...
                    </SelectItem>
                ) : (
                    roles.map((roleOption: any) => (
                        <SelectItem
                            key={roleOption.id}
                            value={roleOption.name}
                            className="capitalize"
                        >
                            {roleOption.name}
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    )
}