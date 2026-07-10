'use client'

import { useState } from 'react'
import { useAssignUserRole } from '@/hooks/useAssignUserRole'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast';
import { getUser } from '@/store/store'
import { useParams } from 'next/navigation'

// Role Cell Component

type roleCellProps = {
  role: string;
  roles: any; 
  rolesLoading: boolean;
  onRoleUpdate?: () => void;
};

export const ChangeUserRole = ({ role, roles, rolesLoading, userId, onRoleUpdate }: roleCellProps & { userId: number }) => {
    const { organizationId } = useParams()
    const { user } = getUser()
    const orgId = Number(organizationId) || user?.orgId;
    const { assignUserRole, loading } = useAssignUserRole()
    const [originalRole, setOriginalRole] = useState(role)

    const handleRoleChange = async (newRoleName: string) => {
        // Only save if the role actually changed
        if (newRoleName === originalRole) {
            return // No change, don't call API
        }

        try {
            // Find the roleId from the roles array based on the selected role name
            const selectedRole = roles.find((r: any) => r.name.toLowerCase() === newRoleName.toLowerCase())
            if (!selectedRole) return

            await assignUserRole({
                userId: userId,
                roleId: selectedRole.id,
                orgId: orgId
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
        }
    }

    return (
        <Select 
            value={role} 
            onValueChange={handleRoleChange} 
            disabled={loading}
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