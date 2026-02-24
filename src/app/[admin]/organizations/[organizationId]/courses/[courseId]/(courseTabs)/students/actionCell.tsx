'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation' // Add usePathname
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { getUser } from '@/store/store'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import EditModal from './components/editModal'
import { AlertDialogDemo } from './components/deleteModalNew'
import DeleteModalDialog from './components/deleteModal'
import { ActionCellProps } from './studentComponentTypes'

const ActionCell: React.FC<ActionCellProps> = ({ student }) => {
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin';
    const orgId = isSuperAdmin ? organizationId : user?.orgId 
    const { userId, bootcampId, name, email, status, batchId } = student
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const router = useRouter()

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary hover:text-white">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                        onClick={() => {
                            setDropdownOpen(false)
                            router.push(`/${userRole}/organizations/${orgId}/courses/${bootcampId}/${userId}`)
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
                        className="text-destructive focus:text-primary"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Student
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Modal - Updated with batchId */}
            <EditModal
                userId={Number(userId)}
                bootcampId={Number(bootcampId)}
                name={name}
                email={email}
                status={status}
                batchId={Number(batchId)} // Pass batchId
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
            />

            {/* Delete Modal - Outside dropdown */}
            <DeleteModalDialog
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