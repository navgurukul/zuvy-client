'use client'

import Image from 'next/image'

import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../../../_components/datatable/data-table-column-header'

import DeleteConfirmationModal from '@/app/admin/courses/[courseId]/_components/deleteModal'
import { fetchStudentData } from '@/utils/students'
import { Task } from '@/utils/data/schema'
import {
    getBatchData,
    getDeleteStudentStore,
    getStoreStudentData,
} from '@/store/store'
import { getAttendanceColorClass } from '@/utils/students'
import { Checkbox } from '@/components/ui/checkbox'

export const columns: ColumnDef<Task>[] = [
    {
        id: 'select',
        header: ({ table }) => {
            return (
                <div>
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                                'indeterminate')
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                        className="translate-y-[2px]"
                    />
                </div>
            )
        },
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'profilePicture',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Profile Pitcure" />
        ),
        cell: ({ row }) => {
            const student = row.original
            const profilePitcure = student.profilePicture
            const ImageContainer = () => {
                return profilePitcure ? (
                    <Image
                        src={profilePitcure}
                        alt="profilePic"
                        height={10}
                        width={30}
                        className="rounded-[100%] ml-2"
                    />
                ) : (
                    <Image
                        src={
                            'https://avatar.iran.liara.run/public/boy?username=Ash'
                        }
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
        cell: ({ row }) => (
            <div className="w-[150px]">{row.getValue('name')}</div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label);

            return (
                <div className="flex space-x-2">
                    {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue('email')}
                    </span>
                </div>
            )
        },
    },
]

// export const columns: ColumnDef<Task>[] = [
//     {
//         id: 'select',
//         header: ({ table }) => (
//             <div>
//                 <Checkbox
//                     checked={
//                         table.getIsAllPageRowsSelected() ||
//                         (table.getIsSomePageRowsSelected() && 'indeterminate')
//                     }
//                     onCheckedChange={(value) =>
//                         table.toggleAllPageRowsSelected(!!value)
//                     }
//                     aria-label="Select all"
//                     className="translate-y-[2px]"
//                 />
//             </div>
//         ),
//         cell: ({ row }) => (
//             <Checkbox
//                 checked={row.getIsSelected()}
//                 onCheckedChange={(value) => row.toggleSelected(!!value)}
//                 aria-label="Select row"
//                 className="translate-y-[2px]"
//             />
//         ),
//         enableSorting: false,
//         enableHiding: false,
//         meta: { className: 'w-[50px]' }, // Adjust column width
//     },
//     {
//         accessorKey: 'profilePicture',
//         header: ({ column }) => (
//             <DataTableColumnHeader column={column} title="Profile Picture" />
//         ),
//         cell: ({ row }) => {
//             const student = row.original
//             const profilePicture = student.profilePicture
//             const ImageContainer = () => {
//                 return profilePicture ? (
//                     <Image
//                         src={profilePicture}
//                         alt="profilePic"
//                         height={10}
//                         width={30}
//                         className="rounded-[100%] ml-2"
//                     />
//                 ) : (
//                     <Image
//                         src={
//                             'https://avatar.iran.liara.run/public/boy?username=Ash'
//                         }
//                         alt="profilePic"
//                         height={35}
//                         width={35}
//                         className="rounded-[50%] ml-2"
//                     />
//                 )
//             }
//             return <div className="flex items-center">{ImageContainer()}</div>
//         },
//         enableSorting: false,
//         enableHiding: false,
//         meta: { className: 'w-[70px]' }, // Adjust column width
//     },
//     {
//         accessorKey: 'name',
//         header: ({ column }) => (
//             <DataTableColumnHeader column={column} title="Student's Name" />
//         ),
//         cell: ({ row }) => (
//             <div className="w-[150px] truncate">{row.getValue('name')}</div>
//         ),
//         enableSorting: true,
//         enableHiding: true,
//         meta: { className: 'w-[150px]' }, // Adjust column width
//     },
//     {
//         accessorKey: 'email',
//         header: ({ column }) => (
//             <DataTableColumnHeader column={column} title="Email" />
//         ),
//         cell: ({ row }) => {
//             return (
//                 <div className="flex space-x-2">
//                     <span className="max-w-[500px] truncate font-medium">
//                         {row.getValue('email')}
//                     </span>
//                 </div>
//             )
//         },
//         meta: { className: 'w-[300px]' }, // Wider column for Email
//     },
// ]

// export const columns: ColumnDef<Task>[] = [
//     {
//         id: 'select',
//         cell: ({ row }) => (
//             <Checkbox
//                 checked={row.getIsSelected()}
//                 onCheckedChange={(value) => row.toggleSelected(!!value)}
//                 aria-label="Select row"
//                 className="translate-y-[2px]"
//             />
//         ),
//         enableSorting: false,
//         enableHiding: false,
//         meta: { className: 'w-[50px]' },
//     },
//     {
//         accessorKey: 'profilePicture',
//         cell: ({ row }) => {
//             const student = row.original
//             const profilePicture = student.profilePicture
//             const ImageContainer = () => {
//                 return profilePicture ? (
//                     <Image
//                         src={profilePicture}
//                         alt="profilePic"
//                         height={10}
//                         width={30}
//                         className="rounded-[100%] ml-2"
//                     />
//                 ) : (
//                     <Image
//                         src={
//                             'https://avatar.iran.liara.run/public/boy?username=Ash'
//                         }
//                         alt="profilePic"
//                         height={35}
//                         width={35}
//                         className="rounded-[50%] ml-2"
//                     />
//                 )
//             }
//             return <div className="flex items-center">{ImageContainer()}</div>
//         },
//         enableSorting: false,
//         enableHiding: false,
//         meta: { className: 'w-[70px]' },
//     },
//     {
//         accessorKey: 'name',
//         cell: ({ row }) => (
//             <div className="w-[150px] truncate">{row.getValue('name')}</div>
//         ),
//         enableSorting: true,
//         enableHiding: true,
//         meta: { className: 'w-[150px]' },
//     },
//     {
//         accessorKey: 'email',
//         cell: ({ row }) => (
//             <div className="flex space-x-2">
//                 <span className="max-w-[500px] truncate font-medium">
//                     {row.getValue('email')}
//                 </span>
//             </div>
//         ),
//         meta: { className: 'w-[300px]' },
//     },
// ]
