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

export interface User {
    id: number
    name: string
    email: string
    role: UserRole
    dateAdded: string
}

export const columns: ColumnDef<User>[] = [
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
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.getValue('role') as UserRole

            return (
                <Select defaultValue={role.toLowerCase()}>
                    <SelectTrigger className="w-auto min-w-28 bg-white border-gray-200 h-8 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="ops">Ops</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                    </SelectContent>
                </Select>
            )
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
            const user = row.original

            return (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-7 w-7 hover:bg-gray-100"
                        onClick={() => {
                            console.log('Edit user:', user.id)
                        }}
                    >
                        <Edit className="w-4 h-4 text-gray-700" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-7 w-7 hover:bg-red-50"
                        onClick={() => {
                            console.log('Delete user:', user.id)
                        }}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            )
        },
    },
]
