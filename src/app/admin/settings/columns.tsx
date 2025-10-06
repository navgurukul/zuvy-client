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

// Role Cell Component
const RoleCell = ({ role }: { role: string }) => {
    const { roles, loading: rolesLoading } = useRoles()

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
                    roles.map((roleOption) => (
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
        accessorKey: 'roleName',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.getValue('roleName') as string
            return <RoleCell role={role} />
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
            console.log('Here one')
            const selectedUser = row.original
            // const searchParams = useSearchParams()
            // const offset = Number(searchParams.get('offset') || OFFSET)
            // const limitParam = searchParams.get('limit')
            // const position: number =
            //     Number(limitParam ?? POSITION) || Number(POSITION)
            // const { refetchUsers } = useAllUsers({
            //     initialFetch: false,
            //     limit: position,
            //     searchTerm: '',
            //     offset,
            // })
            // console.log('selectedUser details:', selectedUser)
            // console.log('fetched user details:', user)

            return (
                <div className="flex gap-1">
                    {/* <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-7 w-7 hover:bg-gray-100"
                                onClick={() => {
                                    console.log('Edit user:', selectedUser.id)
                                }}
                            >
                                <Edit className="w-4 h-4 text-gray-700" />
                            </Button>
                        </DialogTrigger>
                        <AddUserModal
                            refetchUsers={() => refetchUsers(offset)}
                            selectedId={selectedUser.id}
                        />
                    </Dialog> */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-7 w-7 hover:bg-gray-100"
                        onClick={() => {
                            console.log('Edit user:', selectedUser.id)
                        }}
                    >
                        <Edit className="w-4 h-4 text-gray-700" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-7 w-7 hover:bg-red-50"
                        onClick={() => {
                            console.log('Delete user:', selectedUser.id)
                        }}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            )
        },
    },
]
