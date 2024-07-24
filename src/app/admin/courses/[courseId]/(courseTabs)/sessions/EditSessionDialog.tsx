import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { toast } from '@/components/ui/use-toast'
import { DialogTitle } from '@radix-ui/react-dialog'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogOverlay,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api } from '@/utils/axios.config'

interface EditSessionProps {
    meetingId: string
    initialData: {
        sessionTitle: string
        description: string
        startTime: string
        endTime: string
    }
    getClasses: () => void
    open: boolean // Controlled state
    onClose: () => void // Function to handle dialog close
}

const formSchema = z
    .object({
        sessionTitle: z.string().min(2, {
            message: 'Session Title must be at least 2 characters.',
        }),
        description: z.string().min(2, {
            message: 'Description must be at least 2 characters.',
        }),
        startDate: z.date({
            required_error: 'Start Date is required',
        }),
        startTime: z.string().min(1, {
            message: 'Start Time is required',
        }),
        endTime: z.string().min(1, {
            message: 'End Time is required',
        }),
    })
    .refine((data) => data.startTime <= data.endTime, {
        message: 'End time cannot be after start time',
        path: ['endTime'],
    })

const EditSessionDialog: React.FC<EditSessionProps> = (props) => {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sessionTitle: props.initialData.sessionTitle,
            description: props.initialData.description,
            startDate: new Date(props.initialData.startTime),
            startTime: formatTime(props.initialData.startTime),
            endTime: formatTime(props.initialData.endTime),
        },
        mode: 'onChange',
    })

    const { sessionTitle, description, startDate, startTime, endTime } =
        form.watch()
    console.log('endTime :', endTime)
    console.log('startTime:', startTime)
    const isSubmitDisabled = !(
        sessionTitle &&
        description &&
        startDate &&
        startTime &&
        endTime
    )

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const combineDateTime = (date: Date, timeStr: string) => {
            const [hours, minutes] = timeStr.split(':').map(Number)
            const dateTime = new Date(date)
            dateTime.setHours(hours, minutes, 0, 0)
            return dateTime.toISOString()
        }

        const startDateTime = combineDateTime(
            values.startDate,
            values.startTime
        )
        const endDateTime = combineDateTime(values.startDate, values.endTime)

        const transformedData = {
            title: values.sessionTitle,
            description: values.description,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
        }
        console.log('Submitting data:', transformedData)

        try {
            const response = await api.patch(
                `/classes/update/${props.meetingId}`,
                transformedData
            )
            console.log('API response:', response.data)

            if (response.status === 200) {
                toast({
                    title: 'Session Updated',
                    description: 'Session updated successfully',
                    variant: 'default',
                    className: 'text-start capitalize border border-secondary',
                })
                props.getClasses() // Refresh the class list
                props.onClose() // Close the dialog
            } else {
                console.error(
                    'API Error:',
                    response.status,
                    response.statusText
                )
            }
        } catch (error) {
            console.error('Error updating session:', error)
        }
    }

    return (
        <Dialog open={props.open} onOpenChange={props.onClose}>
            <DialogOverlay />
            <DialogContent>
                <DialogHeader className="text-lg font-semibold">
                    Edit Session
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="sessionTitle"
                            render={({ field }) => (
                                <FormItem className="text-left">
                                    <FormLabel>Session Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Session Title"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="text-left">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Description"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-x-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col text-left">
                                        <FormLabel>Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={'outline'}
                                                        className={`w-[230px] text-left font-normal ${
                                                            !field.value &&
                                                            'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {field.value ? (
                                                            format(
                                                                field.value,
                                                                'PPP'
                                                            )
                                                        ) : (
                                                            <span>
                                                                Pick a date
                                                            </span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date <=
                                                        addDays(new Date(), 0)
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex items-center gap-x-4">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem className="text-left flex flex-col">
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="startTime"
                                                {...field}
                                                type="time"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem className="text-left flex flex-col">
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="endTime"
                                                {...field}
                                                type="time"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                disabled={isSubmitDisabled}
                                variant={'secondary'}
                                type="submit"
                            >
                                Save Changes
                            </Button>
                            <DialogClose asChild>
                                <Button
                                    variant={'outline'}
                                    type="button"
                                    onClick={props.onClose}
                                >
                                    Close
                                </Button>
                            </DialogClose>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default EditSessionDialog
