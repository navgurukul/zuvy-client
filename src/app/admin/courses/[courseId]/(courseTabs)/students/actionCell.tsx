'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import EditModal from './components/editModal'
import { AlertDialogDemo } from './components/deleteModalNew'

interface ActionCellProps {
    student: {
        userId: string
        bootcampId: string
        name: string
        email: string
    }
}

const ActionCell: React.FC<ActionCellProps> = ({ student }) => {
    const { userId, bootcampId, name, email } = student
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const router = useRouter()

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                        onClick={() => {
                            setDropdownOpen(false)
                            router.push(`/admin/courses/${bootcampId}/students?view=details&studentId=${userId}`)
                        }}
                        className="focus:text-blue-600"
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => {
                            setDropdownOpen(false)
                            setEditModalOpen(true)
                        }}
                        className="focus:text-blue-600"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Student
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => {
                            setDropdownOpen(false)
                            setDeleteModalOpen(true)
                        }}
                        className="text-red-600 focus:text-blue-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Student
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Modal - Outside dropdown */}
            <EditModal
                userId={Number(userId)}
                bootcampId={Number(bootcampId)}
                name={name}
                email={email}
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
            />

            {/* Delete Modal - Outside dropdown */}
            <AlertDialogDemo
                userId={[Number(userId)]}
                bootcampId={Number(bootcampId)}
                title="Delete Student"
                description={`Are you sure you want to delete ${name}? This action cannot be undone.`}
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
            />
        </>
    )
}

export default ActionCell