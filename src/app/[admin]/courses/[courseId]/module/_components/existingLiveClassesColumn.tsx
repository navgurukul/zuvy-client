import { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { cn } from '@/lib/utils'
import CheckboxAndDeleteHandler from '@/app/[admin]/resource/_components/CheckBoxAndDeleteCombo'
import { Checkbox } from '@/components/ui/checkbox'

export const existingClassColumns: ColumnDef<any>[] = [
    {
        id: 'select',
        header: ({ table }) => {
            // Check if all enabled rows are selected
            const allEnabledRowsSelected = table
                .getRowModel()
                .rows.filter((row) => row.original.moduleId === null)
                .every((row) => row.getIsSelected())

            // Check if some enabled rows are selected
            const someEnabledRowsSelected = table
                .getRowModel()
                .rows.filter((row) => row.original.moduleId === null)
                .some((row) => row.getIsSelected())

            return (
                <Checkbox
                    checked={
                        allEnabledRowsSelected ||
                        (someEnabledRowsSelected && 'indeterminate')
                    }
                    onCheckedChange={(value) => {
                        table.getRowModel().rows.forEach((row) => {
                            if (row.original.moduleId === null) {
                                row.toggleSelected(!!value)
                            }
                        })
                    }}
                    aria-label="Select all"
                />
            )
        },

        cell: ({ table, row }) => {
            const cls = row.original
            const isDisabled = cls.moduleId !== null
            return (
                <CheckboxAndDeleteHandler
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => {
                        row.toggleSelected(!!value)
                    }}
                    aria-label="Select row"
                    disabled={isDisabled}
                    className={isDisabled ? 'cursor-not-allowed' : ''}
                />
            )
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="w-[160px]"
                column={column}
                title="Class Title"
            />
        ),
        cell: ({ row }) => {
            const cls = row.original
            return (
                <div className="w-[160px] text-left truncate">{cls.title}</div>
            )
        },
        enableSorting: false,
        enableHiding: true,
    },
    // {
    //   accessorKey: 'startTime',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader className="w-[140px]" column={column} title="Start Time" />
    //   ),
    //   cell: ({ row }) => {
    //     const cls = row.original
    //     return <div className="w-[140px] text-left truncate">{new Date(cls.startTime).toLocaleString()}</div>
    //   },
    //   enableSorting: false,
    //   enableHiding: true,
    // },
    // {
    //   accessorKey: 'endTime',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader className="w-[140px]" column={column} title="End Time" />
    //   ),
    //   cell: ({ row }) => {
    //     const cls = row.original
    //     return <div className="w-[140px] text-left truncate">{new Date(cls.endTime).toLocaleString()}</div>
    //   },
    //   enableSorting: false,
    //   enableHiding: true,
    // },
    // {
    //   accessorKey: 'status',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader className="w-[100px]" column={column} title="Status" />
    //   ),
    //   cell: ({ row }) => {
    //     const cls = row.original
    //     return (
    //       <div className="w-[100px] text-green-600 text-left font-semibold capitalize truncate">
    //         {cls.status}
    //       </div>
    //     )
    //   },
    //   enableSorting: false,
    //   enableHiding: true,
    // },
    {
        accessorKey: 'moduleName',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="w-[140px]"
                column={column}
                title="Module Name"
            />
        ),
        cell: ({ row }) => {
            const cls = row.original
            return (
                <div className="w-[140px] text-left truncate">
                    {cls.moduleName}
                </div>
            )
        },
        enableSorting: false,
        enableHiding: true,
    },
    {
        accessorKey: 'batchName',
        header: ({ column }) => (
            <DataTableColumnHeader
                className="w-[120px]"
                column={column}
                title="Batch"
            />
        ),
        cell: ({ row }) => {
            const cls = row.original
            return (
                <div className="w-[120px] text-left truncate">
                    {cls.batchName}
                </div>
            )
        },
        enableSorting: false,
        enableHiding: true,
    },
    //   {
    //     id: 'preview',
    //     header: ({ column }) => (
    //       <DataTableColumnHeader className="w-[80px] text-right" column={column} title="Preview" />
    //     ),
    //     cell: ({ row }) => {
    //       const cls = row.original
    //       return (
    //         <div className="flex justify-end w-[80px]">
    //           <Dialog>
    //             <DialogTrigger asChild>
    //               <button>
    //                 <Eye className="cursor-pointer" size={18} />
    //               </button>
    //             </DialogTrigger>
    //             <DialogContent className="w-full">
    //               <DialogHeader>
    //                 <DialogTitle>Class Preview</DialogTitle>
    //               </DialogHeader>
    //               <div>
    //                 <p><strong>Title:</strong> {cls.title}</p>
    //                 <p><strong>Start:</strong> {new Date(cls.startTime).toLocaleString()}</p>
    //                 <p><strong>End:</strong> {new Date(cls.endTime).toLocaleString()}</p>
    //                 <p><strong>Status:</strong> {cls.status}</p>
    //                 <p><strong>Batch:</strong> {cls.batchName}</p>
    //               </div>
    //             </DialogContent>
    //           </Dialog>
    //         </div>
    //       )
    //     }
    //   },
    // {
    //   id: 'actions',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader className="w-[100px] text-left" column={column} title="" />
    //   ),
    //   cell: ({ row }) => {
    //     const cls = row.original

    //     const handleEdit = () => {
    //       // logic to edit
    //     }

    //     const handleDelete = () => {
    //       // logic to delete
    //     }

    //     return (
    //       <div className="flex justify-end gap-3 w-[100px]">
    //         <Trash2
    //           className="text-destructive cursor-pointer"
    //           size={18}
    //           onClick={handleDelete}
    //         />
    //       </div>
    //     )
    //   },
    //   enableSorting: false,
    //   enableHiding: true,
    // },
]
