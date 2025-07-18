import React, { useState } from 'react'
import { ChevronRight, Edit, MoreVertical, Trash2Icon } from 'lucide-react'
import Moment from 'react-moment'
import Link from 'next/link'
import EditSessionDialog from '../(courseTabs)/sessions/EditSessionDialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/utils/axios.config'
import { FlipVertical } from 'lucide-react'
import { getDeleteStudentStore } from '@/store/store'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import DeleteConfirmationModal from './deleteModal'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { usePathname } from 'next/navigation'
import { Popover } from '@/components/ui/popover'
import { AlertDialog, AlertDialogTrigger } from '@radix-ui/react-alert-dialog'
import {
    AlertDialogAction,
    AlertDialogContent,
} from '@/components/ui/alert-dialog'
import { ellipsis } from '@/lib/utils'

function ClassCard({
    classData,
    classType,
    getClasses,
    activeTab,
    studentSide,
}: {
    classData: any
    classType: any
    getClasses: any
    activeTab: any
    studentSide: any
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleOpenDialog = () => setIsDialogOpen(true)
    const handleCloseDialog = () => {
        setIsDialogOpen(false)
    }
    const pathname = usePathname()
    const dashboard = pathname === '/student'
    const admin = pathname.includes('/admin')

    const handleDelete = async () => {
        try {
            setLoading(true)
            await api
                .delete(`/classes/delete/${classData.meetingId}`, {})
                .then(() => {
                    toast.success({
                        title: 'Session deleted',
                        description: 'Session delete successfully',
                    })
                    getClasses()
                })
            setDeleteModalOpen(false)
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Unable to delete the Session',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Card
                className="w-full mb-6 border-none p-5 shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F] relative"
                key={classData.id}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="font-bold text-lg flex flex-col border rounded-md py-3 px-5 text-muted-foreground border-muted-foreground">
                            <Moment format="DD">{classData.startTime}</Moment>{' '}
                            <Moment format="MMM">{classData.startTime}</Moment>
                        </div>
                        <div className="text-start">
                            {classType === 'ongoing' ? (
                                <Badge
                                    variant="yellow"
                                    className="mb-3 inline-block lg:hidden"
                                >
                                    Ongoing
                                </Badge>
                            ) : null}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <h3 className="font-semibold">
                                            {ellipsis(classData.title, 30)}
                                        </h3>
                                    </TooltipTrigger>
                                    <TooltipContent className="font-semibold">
                                        {classData.title}
                                    </TooltipContent>
                                </Tooltip>
                                {dashboard && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <h3 className="font-semibold">
                                                Course: {classData.bootcampName}
                                            </h3>
                                        </TooltipTrigger>
                                        <TooltipContent className="font-semibold">
                                            Course: {classData.bootcampName}
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </TooltipProvider>
                            <div className="text-md flex w-[250px] capitalize items-center">
                                <Moment format="hh:mm A">
                                    {classData.startTime}
                                </Moment>
                                <p className="mx-2">-</p>
                                <Moment format="hh:mm A">
                                    {classData.endTime}
                                </Moment>
                            </div>
                        </div>
                    </div>
                    <div>
                        {classType === 'ongoing' ? (
                            <Badge
                                variant="yellow"
                                className="mb-3 hidden lg:inline-block absolute top-4 right-5"
                            >
                                Ongoing
                            </Badge>
                        ) : null}
                        {!admin && (
                            <div className="hidden lg:flex text-end absolute right-1">
                                <Button
                                    variant={'ghost'}
                                    className="text-lg font-bold"
                                    disabled={
                                        classType === 'ongoing' ? false : true
                                    }
                                >
                                    <Link
                                        target="_blank"
                                        href={classData.hangoutLink}
                                        className="gap-3 flex  items-center text-secondary"
                                    >
                                        <p>Join Class</p>
                                        <ChevronRight size={15} />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                {admin && (
                    <div className="hidden lg:flex justify-end">
                        <Button
                            variant={'ghost'}
                            className="text-lg font-bold"
                            disabled={classType === 'ongoing' ? false : true}
                        >
                            <Link
                                target="_blank"
                                href={classData.hangoutLink}
                                className="gap-3 flex  items-center text-secondary"
                            >
                                <p>Join Class</p>
                                <ChevronRight size={15} />
                            </Link>
                        </Button>
                    </div>
                )}
                <div className="block lg:hidden text-end">
                    <Button
                        variant={'ghost'}
                        className="text-lg font-bold"
                        disabled={classType === 'ongoing' ? false : true}
                    >
                        <Link
                            target="_blank"
                            href={classData.hangoutLink}
                            className="gap-3 flex  items-center text-secondary"
                        >
                            <p>Join Class</p>
                            <ChevronRight size={15} />
                        </Link>
                    </Button>
                </div>
                {!studentSide && classType !== 'ongoing' && (
                    <div className="absolute top-4  flex gap-2 right-4">
                        <AlertDialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                        >
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                            <Edit
                                                size={18}
                                                className="text-secondary"
                                            />
                                        </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Edit Session</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <AlertDialogContent>
                                <AlertDialogAction className="absolute top-4 right-4 w-6 h-6 bg-white text-black flex items-center justify-center">
                                    X
                                </AlertDialogAction>
                                <EditSessionDialog
                                    meetingId={classData.meetingId}
                                    initialData={{
                                        sessionTitle: classData.title,
                                        description: classData.description,
                                        startTime: classData.startTime,
                                        endTime: classData.endTime,
                                    }}
                                    getClasses={getClasses}
                                    open={isDialogOpen}
                                    onClose={handleCloseDialog}
                                    setIsDialogOpen={setIsDialogOpen}
                                />
                            </AlertDialogContent>
                        </AlertDialog>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Trash2Icon
                                        size={18}
                                        className="text-destructive"
                                        onClick={() => setDeleteModalOpen(true)}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete Session</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </Card>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                modalText="This action will Permanatly Delete the Session"
                modalText2=""
                input={false}
                buttonText="Delete Session"
                instructorInfo={''}
                loading={loading}
            />
        </>
    )
}

export default ClassCard
