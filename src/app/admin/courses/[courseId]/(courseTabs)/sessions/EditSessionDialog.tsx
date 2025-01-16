import React, { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, format } from 'date-fns'
import { CalendarIcon, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { toast } from '@/components/ui/use-toast'

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

import { Input } from '@/components/ui/input'
import { api } from '@/utils/axios.config'
import { Spinner } from '@/components/ui/spinner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
} from '@/components/ui/alert-dialog'
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

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
    setIsDialogOpen: any
}

const formSchema = z
    .object({
        sessionTitle: z.string().min(2, {
            message: 'Session Title must be at least 2 characters.',
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
    const [loading, setLoading] = useState<boolean>(false)
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
            startDate: new Date(props.initialData.startTime),
            startTime: formatTime(props.initialData.startTime),
            endTime: formatTime(props.initialData.endTime),
        },
        mode: 'onChange',
    })

    const { sessionTitle, startDate, startTime, endTime } = form.watch()

    const isSubmitDisabled = !(
        sessionTitle &&
        startDate &&
        startTime &&
        endTime
    )

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
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
            startDateTime: startDateTime,
            endDateTime: endDateTime,
        }

        try {
            const response = await api.patch(
                `/classes/update/${props.meetingId}`,
                transformedData
            )

            if (response.status === 200) {
                toast({
                    title: 'Session Updated',
                    description: 'Session updated successfully',
                    variant: 'default',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
                props.getClasses() // Refresh the class list
                props.onClose()
                // Close the dialog
            } else {
                console.error(
                    'API Error:',
                    response.status,
                    response.statusText
                )
            }
        } catch (error) {
            console.error('Error updating session:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-1">
            <div className="text-lg text-left font-semibold mb-4">
                Edit Session
            </div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
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
                                        className="w-full"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="text-left">
                                    <FormLabel>Start Date</FormLabel>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={'outline'}
                                                    className={`w-full text-left font-normal ${
                                                        !field.value &&
                                                        'text-muted-foreground'
                                                    }`}
                                                >
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            'EE MMM dd yyyy'
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </DialogTrigger>
                                        <DialogContent className="w-auto p-2">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date <=
                                                    addDays(new Date(), -1)
                                                }
                                                initialFocus
                                            />
                                        </DialogContent>
                                    </Dialog>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field }) => (
                                <FormItem className="text-left">
                                    <FormLabel>Start Time</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Start Time"
                                            {...field}
                                            type="time"
                                            className="w-full"
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
                                <FormItem className="text-left">
                                    <FormLabel>End Time</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="End Time"
                                            {...field}
                                            type="time"
                                            className="w-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex justify-end mt-4">
                        {loading ? (
                            <Button disabled>
                                <Spinner className="mr-2 text-black h-5 animate-spin" />
                                Please wait
                            </Button>
                        ) : (
                            <Button
                                disabled={isSubmitDisabled}
                                variant={'secondary'}
                                type="submit"
                                className="w-full sm:w-auto"
                            >
                                Save Changes
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default EditSessionDialog
