'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'

import { Edit, Trash2 } from 'lucide-react'
import DeleteUser from './_components/DeleteUser'
import { ChangeUserRole } from './_components/ChangeUserRole'
import { formatDate } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from '@/components/ui/tooltip'
  
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
      cell: ({ row }) => {
        const name = row.original.name
        const limit = 20
    
        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[180px] cursor-pointer text-left text-gray-900">
                  {name.length > limit
                    ? name.substring(0, limit) + '...'
                    : name}
                </div>
              </TooltipTrigger>
    
              {name.length > limit && (
                <TooltipContent side="top" align="start">
                  <p className="text-sm max-w-xs break-words">
                    {name}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )
      },
    }
    ,
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        const email = row.original.email
        const limit = 35
    
        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[220px] cursor-pointer text-left text-gray-600">
                  {email.length > limit
                    ? email.substring(0, limit) + '...'
                    : email}
                </div>
              </TooltipTrigger>
    
              {email.length > limit && (
                <TooltipContent side="top" align="start">
                  <p className="text-sm max-w-xs break-all">
                    {email}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )
      },
    }
    ,
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
                <div className="text-left text-gray-600">{formatDate(createdAt)}</div>
            )
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const selectedUser = row.original
            return (
                <div className="flex gap-1 text-left">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 mt-1 h-7 w-7 hover:bg-primary hover:text-white"
                        onClick={() => onEdit(selectedUser.userId)}
                    >
                        <Edit className="w-4 h-4" />
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
                        title="Delete user?"
                        description="This action cannot be undone. This will permanently delete this user."
                        onDeleteSuccess={(userId) => onDelete(userId)}
                    />
                </div>
            )
        },
    },
]
