'use client'
import Link from 'next/link'
import Image from 'next/image'

import { FileText } from 'lucide-react'

import { Task } from '@/utils/data/schema'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'

import { getDeleteStudentStore, getStoreStudentData } from '@/store/store'

export const columns: ColumnDef<Task>[] = [
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
        enableSorting: false,
        enableHiding: false,
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
    {
        accessorKey: 'overallScore',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Overall Score" />
        ),
    },

    {
        accessorKey: 'proctoring',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Proctoring Report" />
        ),
    },
    {
        id: 'actions',
        // cell: ({ row }) => <DataTableRowActions row={row} />,
        cell: ({ row }) => {
            const student = row.original
            const { userId, bootcampId } = student
            // const { onDeleteHandler } = GetdataHandler(bootcampId);
            const {
                setDeleteModalOpen,
                isDeleteModalOpen,
                deleteStudentId,
                setDeleteStudentId,
            } = getDeleteStudentStore()
            const { setStoreStudentData } = getStoreStudentData()

            let deleteUser = null

            const handleTrashClick = () => {
                setDeleteModalOpen(true)
                setDeleteStudentId(userId)
            }

            return (
                <Link className="bg-secondary" href={''}>
                    <FileText />
                    <p className="text-white">View Report </p>
                    {/* <Trash2
                        onClick={() => {
                            handleTrashClick()
                        }}
                        className="text-destructive cursor-pointer"
                        size={20}
                    />
                    <DeleteConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={() => {
                            deleteStudentHandler(
                                deleteStudentId,
                                bootcampId,
                                setDeleteModalOpen,
                                setStoreStudentData
                            )
                        }}
                        modalText="This action cannot be undone. This will permanently delete the
              student from this bootcamp"
                        buttonText="Delete Student"
                        input={false}
                        modalText2=""
                        instructorInfo={{}}
                    /> */}
                </Link>
            )
        },
    },
]
