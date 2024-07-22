import React, { useState } from 'react';
import { ChevronRight, MoreVertical } from 'lucide-react';
import Moment from 'react-moment';
import Link from 'next/link';
import { Menu } from '@headlessui/react';
import EditSessionDialog from '../(courseTabs)/sessions/EditSessionDialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/utils/axios.config';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

function ClassCard({
    classData,
    classType,
}: {
    classData: any;
    classType: any;
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleOpenDialog = () => setIsDialogOpen(true);
    const handleCloseDialog = () => setIsDialogOpen(false);

    const handleDelete = async () => {
        try {
            const response = await api.delete(`/classes/delete/${classData.meetingId}`, {
            });
            if (response.status === 200) {
                toast({
                    title: 'Session delete',
                    description: 'Session delete successfully',
                    variant: 'default',
                    className: 'text-start capitalize border border-secondary',
                });
            } else {
                console.error('Failed to delete class');
            }
        } catch (error) {
            console.error('Error deleting class:', error);
        }
    };

    return (
        <>
            <Card className="w-full mb-6 border-none shadow p-8 relative" key={classData.id}>
                <div className="flex items-center justify-between truncate">
                    <div className="flex items-center space-x-6">
                        <div className="font-bold text-lg flex flex-col border rounded-md py-3 px-5 text-muted-foreground border-muted-foreground">
                            <Moment format="DD">{classData.startTime}</Moment>{' '}
                            <Moment format="MMM">{classData.startTime}</Moment>
                        </div>
                        <div className="text-start">
                            {classType === 'ongoing' ? (
                                <Badge variant="yellow" className="mb-3">
                                    Ongoing
                                </Badge>
                            ) : null}
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
                </div>
                <div className="text-end mt-4">
                    <Button
                        variant={'ghost'}
                        className="text-xl font-bold"
                    >
                        <Link
                            target="_blank"
                            href={classData.hangoutLink}
                            className="gap-3 flex items-center text-secondary"
                        >
                            <p>Join Class</p>
                            <ChevronRight size={15} />
                        </Link>
                    </Button>
                </div>
                <Menu as="div" className="absolute top-4 right-4">
                    <Menu.Button className="flex items-center h-10">
                        <MoreVertical size={20} />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 top-1/2 transform -translate-y-1/2 w-56 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={`${
                                        active ? 'bg-gray-100' : ''
                                    } w-full text-left px-4 py-2 text-sm text-gray-700 h-10`}
                                    onClick={handleOpenDialog}
                                >
                                    Edit
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={`${
                                        active ? 'bg-gray-100' : ''
                                    } w-full text-left px-4 py-2 text-sm text-gray-700`}
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            )}
                        </Menu.Item>
                    </Menu.Items>
                </Menu>
            </Card>

            {isDialogOpen && (
                <EditSessionDialog
                    meetingId={classData.meetingId}
                    initialData={{
                        sessionTitle: classData.title,
                        description: classData.description,
                        startTime: classData.startTime,
                        endTime: classData.endTime
                    }}
                    getClasses={() => console.log('Classes updated')}
                    open={isDialogOpen}
                    onClose={handleCloseDialog}
                />
            )}
        </>
    );
}

export default ClassCard;