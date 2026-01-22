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

// Management Type Cell Component

type roleCellProps = {
  managementType: string;
  management: any; 
};

export const UpdateManagementType = ({ managementType, management }: roleCellProps) => {
    const [isUpdating, setIsUpdating] = useState(false)
    const [originalRole, setOriginalRole] = useState(managementType)

    // Update original managementType when prop changes
    useEffect(() => {
        setOriginalRole(managementType)
    }, [managementType])

    const handleRoleChange = async (newRoleName: string) => {
        // Only save if the managementType actually changed
        if (newRoleName === originalRole) {
            return // No change, don't call API
        }

        try {
            setIsUpdating(true)
            // Find the roleId from the roles array based on the selected managementType name
            const selectedRole = management.find((r: any) => r.name.toLowerCase() === newRoleName.toLowerCase())
            if (!selectedRole) return

            // await api.post('/users/users/assign-role', {
            //     userId: userId,
            //     roleId: selectedRole.id
            // })

            // Update original management type after successful save
            setOriginalRole(newRoleName)
            // onRoleUpdate?.()

            toast.success({
                title: 'Management Type Updated',
                description: `User management type has been updated to ${selectedRole.name}.`,
            })
        } catch (error) {
            console.error('Error updating user management type:', error)
            toast.error({
                title: 'Error Updating Management Type',
                description: 'There was an error updating the user management type. Please try again later.',
            })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <Select 
            value={managementType} 
            onValueChange={handleRoleChange} 
            disabled={isUpdating}
        >
            <SelectTrigger className="w-auto min-w-28 bg-white border-gray-200 h-8 text-sm capitalize">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {/* {rolesLoading ? (
                    <SelectItem value="loading" disabled>
                        Loading...
                    </SelectItem>
                ) : ( */}
                    {management.map((roleOption: any) => (
                        <SelectItem
                            key={roleOption.id}
                            value={roleOption.name}
                            className="capitalize"
                        >
                            {roleOption.name}
                        </SelectItem>
                    ))}
                {/* )} */}
            </SelectContent>
        </Select>
    )
}