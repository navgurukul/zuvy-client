'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Edit, Trash2 } from 'lucide-react'
import { UserRole } from '@/utils/types/type'
import { useRoles } from '@/hooks/useRoles'
import AddUserModal from './_components/AddUserModal'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { OFFSET, POSITION } from '@/utils/constant'
import { useSearchParams } from 'next/navigation'
import { useAllUsers } from '@/hooks/useAllUsers'
import { useUser } from '@/hooks/useSingleUser'
import DeleteUser from './_components/DeleteUser'

type roleCellProps = {
  role: string;
  roles: any; 
  rolesLoading: boolean;
};

// Role Cell Component
const RoleCell = ({ role, roles, rolesLoading }: roleCellProps) => {

    return (
        <Select defaultValue={role?.toLowerCase()}>
            <SelectTrigger className="w-auto min-w-28 bg-white border-gray-200 h-8 text-sm">
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

export interface User {
    id: number
    roleId: number
    userId: number
    name: string
    email: string
    roleName: string
    dateAdded?: string
}

// Export a function that creates columns
export const createColumns = (
    roles: any[],
    rolesLoading: boolean,
    onRoleChange: (userId: number, roleId: number, roleName: string) => void,
    onEdit: (userId: number) => void,
    onDelete: (userId: number) => void
): ColumnDef<User>[] => [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
            <div className="font-medium text-gray-900">
                {row.getValue('name')}
            </div>
        ),
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
            <div className="text-gray-600">{row.getValue('email')}</div>
        ),
    },
    {
        accessorKey: 'roleName',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.getValue('roleName') as string
            return <RoleCell role={role} roles={roles} rolesLoading={rolesLoading}/>
        },
    },
    {
        accessorKey: 'dateAdded',
        header: 'Date Added',
        cell: ({ row }) => (
            <div className="text-gray-600">{row.getValue('dateAdded')}</div>
        ),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const selectedUser = row.original
            // console.log('selectedUser', selectedUser)
            return (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-7 w-7 hover:bg-gray-100"
                        onClick={() => onEdit(selectedUser.userId)}
                    >
                        <Edit className="w-4 h-4 text-gray-700" />
                    </Button>

                    {/* <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-7 w-7 hover:bg-red-50"
                        onClick={() => onDelete(selectedUser.userId)}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button> */}
                    <DeleteUser 
                        userId={selectedUser.userId}
                        title="Are you absolutely sure?"
                        description="This action cannot be undone. This will permanently remove the student from the bootcamp"
                    />
                </div>
            )
        },
    },
]
