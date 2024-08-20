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
    const { setDeleteModalOpen, isDeleteModalOpen } = getDeleteStudentStore()

    const handleOpenDialog = () => setIsDialogOpen(true)
    const handleCloseDialog = () => setIsDialogOpen(false)

    const handleDelete = async () => {
        try {
            await api
                .delete(`/classes/delete/${classData.meetingId}`, {})
                .then(() => {
                    toast({
                        title: 'Session deleted',
                        description: 'Session delete successfully',
                        variant: 'default',
                        className:
                            'text-start capitalize border border-secondary',
                    })
                    getClasses()
                })
            setDeleteModalOpen(false)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Unable to delete the Session',
                variant: 'destructive',
            })
        }
    }
    const onclick = () => {
        console.log(classData.id)
    }

    return (
        <>
            <Card
                className="w-full mb-6 border-none p-5 shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F] relative"
                key={classData.id}
            >
                <div
                    className="flex items-center justify-between truncate"
                    onClick={onclick}
                >
                    <div className="flex items-center space-x-6">
                        <div className="font-bold text-lg flex flex-col border rounded-md py-3 px-5 text-muted-foreground border-muted-foreground">
                            <Moment format="DD">{classData.startTime}</Moment>{' '}
                            <Moment format="MMM">{classData.startTime}</Moment>
                        </div>
                        <div className="text-start">
                            {/* {classType === 'ongoing' ? (
                                <Badge variant="yellow" className="mb-3">
                                    Ongoing
                                </Badge>
                            ) : null} */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <h3 className="font-semibold">
                                            {classData.title}
                                        </h3>
                                    </TooltipTrigger>
                                    <TooltipContent className="font-semibold">
                                        {classData.title}
                                    </TooltipContent>
                                </Tooltip>
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
                            <Badge variant="yellow" className="mb-3">
                                Ongoing
                            </Badge>
                        ) : null}

                        <div className="hidden lg:flex text-end">
                            <Button
                                variant={'ghost'}
                                className="text-lg font-bold"
                                // disabled={classType === 'ongoing' ? false : true}
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
                    </div>
                </div>
                <div className="block lg:hidden text-end">
                    <Button
                        variant={'ghost'}
                        className="text-lg font-bold"
                        // disabled={classType === 'ongoing' ? false : true}
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
                <div className="absolute top-4 right-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            {activeTab === 'ongoing' ? null : (
                                <MoreVertical
                                    size={20}
                                    className="text-secondary cursor-pointer "
                                />
                            )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={handleOpenDialog}
                                    className="cursor-pointer flex flex-row justify-between "
                                >
                                    <span>Edit</span>
                                    <Edit
                                        size={18}
                                        className="text-secondary"
                                    />
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setDeleteModalOpen(true)}
                                    className="cursor-pointer flex flex-row justify-between "
                                >
                                    <span>Delete</span>
                                    <Trash2Icon
                                        size={18}
                                        className="text-destructive"
                                    />
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </Card>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
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
                    />
                </DialogContent>
            </Dialog>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                modalText="This action will Permanatly Delete the Session"
                modalText2=""
                input={false}
                buttonText="Delete Session"
                instructorInfo={''}
            />
        </>
    )
}

export default ClassCard
