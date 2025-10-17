'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'

import { Edit, Trash2 } from 'lucide-react'
import DeleteUser from './_components/DeleteUser'
import { ChangeUserRole } from './_components/ChangeUserRole'
import { formatDate } from '@/lib/utils'

export interface User {
    createdAt: any
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
            const userId = row.original.userId
            const roleId = row.original.roleId
            return <ChangeUserRole role={role} roles={roles} rolesLoading={rolesLoading} userId={userId} roleId={roleId} />
        },
    },
    {
        accessorKey: 'dateAdded',
        header: 'Date Added',
        cell: ({ row }) => {
             const createdAt = row.original.createdAt
            return (
                <div className="text-gray-600">{formatDate(createdAt)}</div>
            )
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const selectedUser = row.original
            console.log('row', row)
            return (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-7 w-7 hover:bg-primary hover:text-white"
                        onClick={() => onEdit(selectedUser.userId)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <DeleteUser 
                        userId={selectedUser.userId}
                        title="Delete user?"
                        description="This action cannot be undone. This will permanently delete this user."
                        onDeleteSuccess={(userId) => onDelete(userId)}
                    />
                </div>
            )
        },
    },
]
