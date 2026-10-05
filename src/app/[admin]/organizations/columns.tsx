'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'

import { Edit, Trash2 } from 'lucide-react'
// import DeleteUser from './_components/DeleteUser'
import { UpdateManagementType } from './_components/UpdateManagementType'
import { formatDate } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Org } from '@/utils/data/schema'
import Link from 'next/link'
import { getUser } from '@/store/store'

export const createColumns = (
  management: any[],
  onEdit?: (org: any) => void,
  onDelete?: (org: any) => void,
  onUpdateSuccess?: () => void
): ColumnDef<Org>[] => [
    {
      accessorKey: 'organisation',
      header: 'Organisation',
      cell: ({ row }) => {
        const name = row.original.name
        const organizationId = row.original.id
        const limit = 20
        const { user } = getUser()
        const userRole = user?.rolesList?.[0]?.toLowerCase() || ''

        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/${userRole}/organizations/${organizationId}/courses`} className="max-w-[180px] cursor-pointer text-left text-foreground">
                  <p className='text-start'>
                    {name.length > limit
                      ? name.substring(0, limit) + '...'
                      : name}
                  </p>
                </Link>
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
    },
    {
      accessorKey: 'managementType',
      header: 'Management Type',
      cell: ({ row }) => {
        const managementType = row.original.managementType
        return (
          <UpdateManagementType
            org={row.original}
            managementType={managementType}
            management={management}
            onUpdateSuccess={onUpdateSuccess}
            onEdit={onEdit}
          />
        )
      },
    },
    {
      accessorKey: 'poc',
      header: 'Point of Contact',
      cell: ({ row }) => {
        const poc = row.original.poc

        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[220px] cursor-default text-left">
                  <div className="truncate font-medium text-foreground">{poc.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{poc.email}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" className="max-w-xs break-all">
                <div className="font-medium">{poc.name}</div>
                <div className="text-xs">{poc.email}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'assignee',
      header: 'Zuvy Assignee',
      cell: ({ row }) => {
        const assignee = row.original.assignee
        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[220px] cursor-default text-left">
                  <div className="truncate font-medium text-foreground">{assignee.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{assignee.email}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" className="max-w-xs break-all">
                <div className="font-medium">{assignee.name}</div>
                <div className="text-xs">{assignee.email}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'dateAdded',
      header: 'Date Added',
      cell: ({ row }) => {
        const createdAt = row.original.createdAt
        const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
        return (
          // <div className="text-left text-gray-600">{formatDate(createdAt)}</div>
          <div className="text-left text-muted-foreground">{createdAt}</div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const selectedOrg = row.original
        return (
          <div className="flex gap-1 text-left">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 mt-1 h-7 w-7 hover:bg-primary hover:text-white"
              onClick={() => onEdit && onEdit(selectedOrg)} // Uncomment this line
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )
      },
    },
  ]