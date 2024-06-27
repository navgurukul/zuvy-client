import React, { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns'
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { format, addDays } from 'date-fns'

import {
    Form,
    FormControl,
    FormDescription,
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
import { toast } from '@/components/ui/use-toast'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogOverlay,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { api } from '@/utils/axios.config'

interface CreateSessionProps {
    courseId: number
    bootcampData: { value: string; label: string }[]
    getClasses: any
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
            required_error: 'A start date is required.',
        }),
        endDate: z.date({
            required_error: 'A start date is required.',
        }),
        startTime: z.string().min(1, {
            message: 'Start Time is required',
        }),
        endTime: z.string().min(1, {
            message: 'End Time is required',
        }),
        batch: z.string({
            required_error: 'Please select a Batch.',
        }),
    })
    .refine((data) => data.startDate <= data.endDate, {
        message: 'Start date cannot be after end date',
        path: ['endDate'], // This will show the error message at the endDate field
    })

const CreateSessionDialog: React.FC<CreateSessionProps> = (props) => {
    const [formIsOpen, setFormIsOpen] = useState<boolean>(false)
    const toggleForm = () => {
        setFormIsOpen(!formIsOpen)
        form.clearErrors()
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sessionTitle: '',
            description: '',
            startDate: setHours(
                setMinutes(setSeconds(setMilliseconds(new Date(), 0), 0), 0),
                0
            ),
            endDate: setHours(
                setMinutes(setSeconds(setMilliseconds(new Date(), 0), 0), 0),
                0
            ),
            startTime: '',
            endTime: '',
            batch: '',
        },
    })
    useEffect(() => {
        form.setValue('sessionTitle', '')
        form.setValue('description', '')
        form.setValue('startDate', new Date())
        form.setValue('endDate', new Date())
        form.setValue('startTime', '')
        form.setValue('endTime', '')
        form.setValue('batch', '')
    }, [formIsOpen, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const userIdLocal = JSON.parse(localStorage.getItem('AUTH') || '')
        const combineDateTime = (dateStr: any, timeStr: string) => {
            const adjustedDate = addDays(dateStr, 1)
            const dateString =
                typeof adjustedDate === 'string'
                    ? adjustedDate
                    : adjustedDate.toISOString()
            const datePart = dateString.split('T')[0]
            const dateTimeStr = `${datePart}T${timeStr}:00.000Z`
            return dateTimeStr
        }
        const startDateTime = combineDateTime(
            values.startDate,
            values.startTime
        )
        const endDateTime = combineDateTime(values.endDate, values.endTime)
        //         {
        //   "title": "Live Broadcast Event",
        //   "batchId": 1,
        //   "bootcampId": 9,
        //   "description": "Description of the event",
        //   "startDateTime": "2022-03-01T00:00:00Z",
        //   "endDateTime": "2022-03-01T00:00:00Z",
        //   "timeZone": "Asia/Kolkata"
        // }
        const transformedData = {
            title: values.sessionTitle,
            batchId: +values.batch,
            bootcampId: +props.courseId,
            description: values.description,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            timeZone: 'Asia/Kolkata',
        }
        await api.post(`/classes`, transformedData).then((res) => {
            toast({
                title: res.data.status,
                description: res.data.message,
                variant: 'default',
                className: 'text-start capitalize border border-secondary',
            })
            props.getClasses()
        })
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    onClick={toggleForm}
                    className="text-white bg-secondary"
                >
                    Create Session
                </Button>
            </DialogTrigger>
            <DialogOverlay />
            <DialogContent>
                <DialogHeader className="text-lg font-semibold">
                    New Session
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
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
                        <div className="flex items-center gap-x-4 ">
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
                                                        className={`w-[230px]  text-left font-normal ${
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
                                                        addDays(new Date(), -1)
                                                    } // Disable past dates
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem className="text-left flex flex-col  ">
                                        <FormLabel>StartTime</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Time"
                                                {...field}
                                                type="time"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex items-center gap-x-4 ">
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col text-left">
                                        <FormLabel>End Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={'outline'}
                                                        className={`w-[230px] pl-3 text-left font-normal ${
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
                                                        addDays(new Date(), -1)
                                                    } // Disable past dates
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem className="text-left flex flex-col  ">
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Time"
                                                {...field}
                                                type="time"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="batch"
                            render={({ field }) => (
                                <FormItem className="flex flex-col text-left">
                                    <FormLabel>Select Batch</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        'w-full justify-between',
                                                        !field.value &&
                                                            'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value
                                                        ? props.bootcampData.find(
                                                              (language) =>
                                                                  language.value ===
                                                                  field.value
                                                          )?.label
                                                        : 'Select Batch'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className=" flex items-center justify-center  w-[500px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search Batch..." />
                                                <CommandEmpty>
                                                    No Batch Found
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {props.bootcampData.map(
                                                        (language) => (
                                                            <CommandItem
                                                                value={
                                                                    language.label
                                                                }
                                                                key={
                                                                    language.value
                                                                }
                                                                onSelect={() => {
                                                                    form.setValue(
                                                                        'batch',
                                                                        language.value
                                                                    )
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        language.value ===
                                                                            field.value
                                                                            ? 'opacity-100'
                                                                            : 'opacity-0'
                                                                    )}
                                                                />
                                                                {language.label}
                                                            </CommandItem>
                                                        )
                                                    )}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <DialogClose asChild>
                                <Button variant={'secondary'} type="submit">
                                    Create Class
                                </Button>
                            </DialogClose>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateSessionDialog
