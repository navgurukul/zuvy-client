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
import { setStoreBatchValue } from '@/store/store'
import { Spinner } from '@/components/ui/spinner'

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
        path: ['endDate'],
    })

const CreateSessionDialog: React.FC<CreateSessionProps> = (props) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState(false)
    const [formIsOpen, setFormIsOpen] = useState<boolean>(false)
    const { batchValueData } = setStoreBatchValue()

    const toggleForm = () => {
        setFormIsOpen(!formIsOpen)
        form.clearErrors()
    }
    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)

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
        mode: 'onChange',
    })

    const {
        sessionTitle,
        description,
        startDate,
        endDate,
        startTime,
        endTime,
        batch,
    } = form.watch()
    const isSubmitDisabled =
        isLoading ||
        !(
            sessionTitle &&
            description &&
            startDate &&
            endDate &&
            startTime &&
            endTime &&
            batch
        )
    async function onSubmit(values: z.infer<typeof formSchema>) {
        openModal()
        setIsLoading(true)

        const combineDateTime = (dateStr: any, timeStr: string) => {
            const selectedDate = new Date(dateStr)
            const today = new Date()

            const isToday = selectedDate.toDateString() === today.toDateString()

            const adjustedDate = isToday
                ? selectedDate
                : new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) // Add 1 day

            const dateString = adjustedDate.toISOString().split('T')[0]
            const dateTimeStr = `${dateString}T${timeStr}:00.000Z`

            return dateTimeStr
        }
        const startDateTime = combineDateTime(
            values.startDate,
            values.startTime
        )
        const endDateTime = combineDateTime(values.endDate, values.endTime)

        const transformedData = {
            title: values.sessionTitle,
            batchId: +values.batch,
            bootcampId: +props.courseId,
            description: values.description,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            timeZone: 'Asia/Kolkata',
        }

        // console.log(transformedData)
        await api.post(`/classes`, transformedData).then((res) => {
            toast({
                title: res.data.status,
                description: res.data.message,
                variant: 'default',
                className: 'text-start capitalize border border-secondary',
            })
            props.getClasses()
        })

        closeModal()
        setIsLoading(false)
    }

    function generateUniqueLabels(data: any) {
        const labelCount: { [key: string]: number } = {}
        return data.map((item: any) => {
            if (labelCount[item.label]) {
                labelCount[item.label]++
                item.label = `${item.label} (${labelCount[item.label]})`
            } else {
                labelCount[item.label] = 1
            }
            return item
        })
    }

    const uniqueLabelData = generateUniqueLabels(props.bootcampData)
    useEffect(() => {
        form.setValue('sessionTitle', '')
        form.setValue('description', '')
        form.setValue('startDate', new Date())
        form.setValue('endDate', new Date())
        form.setValue('startTime', '')
        form.setValue('endTime', '')
        form.setValue('batch', '')

        uniqueLabelData.length === 1
            ? form.setValue('batch', uniqueLabelData[0].value)
            : form.setValue('batch', batchValueData)
    }, [formIsOpen, form, batchValueData])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    onClick={toggleForm}
                    className="text-white bg-secondary"
                >
                    Create Session
                </Button>
            </DialogTrigger>
            <DialogOverlay />

            <DialogContent className="">
                <DialogHeader className="text-lg font-semibold">
                    New Session
                </DialogHeader>
                {props.bootcampData.length === 0 && (
                    <p className="text-left text-red-500 ">
                        You need to create batches first and assign students to
                        the batches
                    </p>
                )}
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
                                                        addDays(new Date(), 0)
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
                                        <PopoverContent className=" flex items-center justify-center  w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search Batch..." />
                                                <CommandEmpty>
                                                    No Batch Found
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {uniqueLabelData.map(
                                                        (language: any) => (
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
                                <Button
                                    disabled={isSubmitDisabled}
                                    variant={'secondary'}
                                    onClick={form.handleSubmit(onSubmit)}
                                    className={`w-1/3`}
                                >
                                    {isLoading ? (
                                        <div className="flex flex-row justify-between items-center">
                                            <Spinner className="text-secondary h-4 w-4 " />{' '}
                                            Create Session
                                        </div>
                                    ) : (
                                        'Create Session'
                                    )}
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
