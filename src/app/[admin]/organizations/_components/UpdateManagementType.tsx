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
import useOrgSettings from '@/hooks/useOrgSettings'

// Management Type Cell Component

type roleCellProps = {
    org: any;
    managementType: string;
    management: any;
    onUpdateSuccess?: () => void;
};

export const UpdateManagementType = ({ org, managementType, management, onUpdateSuccess }: roleCellProps) => {
    const { updateOrgById } = useOrgSettings()
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

            const selectedRole = management.find((r: any) => r.name.toLowerCase() === newRoleName.toLowerCase())
            if (!selectedRole) return

            const isZuvyManaged = selectedRole.id === 2 

            const payload = {
                isManagedByZuvy: isZuvyManaged,
            }

            const response = await updateOrgById(org.id, payload)

            if (response.status === 200) {
                // Update original management type after successful save
                setOriginalRole(newRoleName)
                onUpdateSuccess?.()

                toast.success({
                    title: 'Management Type Updated',
                    description: `Organisation management type has been updated to ${selectedRole.name}.`,
                })
            }
        } catch (error) {
            console.error('Error updating organisation management type:', error)
            toast.error({
                title: 'Error Updating Management Type',
                description: 'There was an error updating the organisation management type. Please try again later.',
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
                {management.map((roleOption: any) => (
                    <SelectItem
                        key={roleOption.id}
                        value={roleOption.name}
                        className="capitalize"
                    >
                        {roleOption.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}