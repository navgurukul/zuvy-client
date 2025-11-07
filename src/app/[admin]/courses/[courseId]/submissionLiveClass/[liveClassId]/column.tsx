'use client'
import Image from 'next/image'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { Badge } from '@/components/ui/badge'

const mockBatches = ['Batch A', 'Batch B', 'Batch C']

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'profilePicture',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Profile Picture" />
        ),
        cell: ({ row }) => {
            const student = row.original
            const profilePicture = student.user?.profilePicture
            const ImageContainer = () => {
                return profilePicture ? (
                    <Image
                        src={profilePicture}
                        alt="profilePic"
                        height={10}
                        width={30}
                        className="rounded-[100%] ml-2"
                    />
                ) : (
                    <Image
                        src={'https://avatar.iran.liara.run/public/boy?username=Ash'}
                        alt="profilePic"
                        height={35}
                        width={35}
                        className="rounded-[50%] ml-2"
                    />
                )
            }
            return <div className="flex items-center">{ImageContainer()}</div>
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Students Name" />
        ),
        cell: ({ row }) => {
            const name = row.original.user?.name || 'N/A'

            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                        {name}
                    </span>
                </div>
            )
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => {
            const email = row.original.user?.email || 'N/A'

            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                        {email}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'batch',
        header: 'Batch',
        cell: ({ row }) => {
            const index = row.index
            return (
                <div className="flex items-center justify-start">
                    <Badge variant="outline" className="text-black border-black-200">
                        {mockBatches[index % mockBatches.length]}
                    </Badge>
                </div>
            )
        },
    },
    {
        accessorKey: 'startTime',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Start Time" />
        ),
        cell: ({ row }) => {
            const startTime = row.original.startTime
            if (!startTime) return <span>N/A</span>
            
            const formattedTime = new Date(startTime)
                .toLocaleString('en-IN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })
            
            return (
                <div className="flex space-x-2">
                    <span className="font-medium">
                        {formattedTime}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'endTime',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="End Time" />
        ),
        cell: ({ row }) => {
            const endTime = row.original.endTime
            if (!endTime) return <span>N/A</span>
            
            const formattedTime = new Date(endTime)
                .toLocaleString('en-IN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })
            
            return (
                <div className="flex space-x-2">
                    <span className="font-medium">
                        {formattedTime}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.original.status || 'absent'
            const isPresent = status.toLowerCase() === 'present'
            
            return (
                <div className="flex space-x-2">
                    <Badge 
                        className={
                            isPresent 
                                ? "text-success bg-green-100" 
                                : "text-destructive bg-red-100"
                        }
                    >
                        {status}
                    </Badge>
                </div>
            )
        },
    },
]