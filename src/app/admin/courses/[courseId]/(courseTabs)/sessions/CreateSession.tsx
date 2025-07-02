import React, { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Check, ChevronsUpDown, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    format,
    addDays,
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds,
} from 'date-fns'

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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn, ellipsis } from '@/lib/utils'
import { api } from '@/utils/axios.config'
import { setStoreBatchValue } from '@/store/store'
import { Spinner } from '@/components/ui/spinner'

interface CreateSessionProps {
    courseId: number
    bootcampData: { value: string; label: string }[]
    getClasses: any
    students: number
    onClick: () => void
    checkopenSessionForm: boolean
    modulesData: any
}

const formSchema = z
    .object({
        sessionTitle: z.string().min(2, {
            message: 'Session Title must be at least 2 characters.',
        }),
        description: z.string().optional(),
        startDate: z.date({
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
        daysOfWeek: z.array(z.string()).nonempty({
            message: 'Please select at least one day',
        }),
        totalClasses: z.number().min(1, {
            message: 'Total Classes must be at least 1.',
        }),
        modulesIds:  z.number().min(1, {
            message: 'Please select a module',
        }),
    })
    .refine((data) => data.startTime <= data.endTime, {
        message: 'Start Time cannot be after end Time',
        path: ['endTime'],
    })
    .refine(
        (data) => {
            // Check if selected date is today
            const isToday =
                new Date(data.startDate).toDateString() ===
                new Date().toDateString()

            if (isToday) {
                const now = new Date()
                const currentTime = `${String(now.getHours()).padStart(
                    2,
                    '0'
                )}:${String(now.getMinutes()).padStart(2, '0')}`

                // If today, start time should be in the future
                return data.startTime > currentTime
            }

            // If not today, any time is valid
            return true
        },
        {
            message: 'Start time cannot be in the past',
            path: ['startTime'],
        }
    )
    .refine((data) => data.totalClasses >= data.daysOfWeek.length, {
        message:
            'Total Classes must be at least equal to the number of selected days of week.',
        path: ['totalClasses'],
    })

const CreateSessionDialog: React.FC<CreateSessionProps> = (props) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState(false)
    const [formIsOpen, setFormIsOpen] = useState<boolean>(false)
    // const { batchValueData } = setStoreBatchValue()
    const [isCalendarOpen, setCalendarOpen] = useState(false)

    const toggleForm = () => {
        setFormIsOpen(!formIsOpen)
        form.clearErrors()
        props.onClick()
    }
    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),

        defaultValues: {
            sessionTitle: '',
            description: '',
            startDate: new Date(),
            // setHours(
            //     setMinutes(setSeconds(setMilliseconds(new Date(), 0), 0), 0),
            //     0
            // ),
            startTime: '',
            endTime: '',
            batch: '',
            daysOfWeek: [],
            totalClasses: 0,
            modulesIds:  props.modulesData?.[0]?.id || '',
        },
        mode: 'onChange',
    })
    useEffect(() => {
        const daysCount = form.watch('daysOfWeek').length
        form.setValue('totalClasses', daysCount)
        form.setValue('modulesIds', props.modulesData[0]?.id || '')
    }, [form.watch('daysOfWeek')])

    const weekDays = useMemo(
        () => [
            { value: 'Sunday', label: 'Sunday' },
            { value: 'Monday', label: 'Monday' },
            { value: 'Tuesday', label: 'Tuesday' },
            { value: 'Wednesday', label: 'Wednesday' },
            { value: 'Thursday', label: 'Thursday' },
            { value: 'Friday', label: 'Friday' },
            { value: 'Saturday', label: 'Saturday' },
        ],
        []
    )
    useEffect(() => {
        form.setValue('sessionTitle', '')
        form.setValue('description', '')
        form.setValue('startDate', new Date())
        form.setValue('startTime', '')
        form.setValue('endTime', '')
        form.setValue('batch', '')
        form.setValue('daysOfWeek', [''])
        form.setValue('totalClasses', 1)
        form.setValue('modulesIds', 0)
    }, [formIsOpen, form])
    useEffect(() => {
        const selectedDate = form.watch('startDate')
        if (selectedDate) {
            const dayOfWeek = format(selectedDate, 'EEEE')
            const dayValue =
                weekDays.find((day) => day.label === dayOfWeek)?.value || ''
            if (dayValue) {
                form.setValue('daysOfWeek', [dayValue])
            }
        }
    }, [form.watch('startDate')])

    const {
        sessionTitle,
        startDate,
        startTime,
        endTime,
        batch,
        daysOfWeek,
        totalClasses,
        modulesIds,
    } = form.watch()
    const isSubmitDisabled = !(
        sessionTitle &&
        startDate &&
        startTime &&
        endTime &&
        batch &&
        (daysOfWeek?.length || 0) > 0 &&
        totalClasses &&
        modulesIds
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
        const endDateTime = combineDateTime(values.startDate, values.endTime)
        let daysWeek = values.daysOfWeek.filter((day) => {
            return day !== ''
        })

        const transformedData = {
            title: values.sessionTitle,
            batchId: +values.batch,
            description: values.description,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            timeZone: 'Asia/Kolkata',
            daysOfWeek: daysWeek,
            totalClasses: values.totalClasses,
            moduleId: values.modulesIds,
        }
        // console.log(transformedData)

        try {
            await api.post(`/classes`, transformedData).then((res) => {
                toast.success({
                    title: res.data.status,
                    description: res.data.message,
                })

                props.getClasses()
                toggleForm()
            })
        } catch (error) {
            toast.error({
                title: 'Network error',
                description:
                    'Unable to create session. Please try again later.'
            })
        } finally {
            setIsOpen(false)
            setIsLoading(false)
        }
    }

    // Add these at the component level (inside the function)
    const isToday = useMemo(() => {
        const selectedDate = form.watch('startDate')
        return (
            selectedDate &&
            selectedDate.toDateString() === new Date().toDateString()
        )
    }, [form.watch('startDate')])

    const currentTimeString = useMemo(() => {
        const now = new Date()
        return `${String(now.getHours()).padStart(2, '0')}:${String(
            now.getMinutes()
        ).padStart(2, '0')}`
    }, [])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    onClick={toggleForm}
                    className="text-white bg-secondary lg:max-w-[150px] w-full lg:mt-2 mt-5"
                >
                    Create Session
                </Button>
            </DialogTrigger>

            {props.checkopenSessionForm && (
                <>
                    <DialogOverlay />
                    <DialogContent className="w-full p-2 mr-1 ">
                        <DialogHeader className="text-lg font-semibold">
                            New Session
                        </DialogHeader>

                        <div className="w-[490px] p-2">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="w-full flex flex-col gap-y-4 "
                                >
                                    <FormField
                                        control={form.control}
                                        name="sessionTitle"
                                        render={({ field }) => (
                                            <FormItem className="text-left">
                                                <FormLabel>
                                                    {' '}
                                                    Session Title
                                                    <span className="text-red-500">
                                                        *
                                                    </span>{' '}
                                                </FormLabel>
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

                                    <div className="flex items-center gap-x-3 gap-y-0 ">
                                        <FormField
                                            control={form.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col text-left">
                                                    <FormLabel className="p-0 my-2">
                                                        Classes start date
                                                        <span className="text-red-500">
                                                            *
                                                        </span>{' '}
                                                    </FormLabel>
                                                    <Dialog
                                                        open={isCalendarOpen}
                                                        onOpenChange={
                                                            setCalendarOpen
                                                        }
                                                    >
                                                        <DialogTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={
                                                                        'outline'
                                                                    }
                                                                    className={`w-[230px] text-left font-normal ${
                                                                        !field.value &&
                                                                        'text-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {field.value
                                                                        ? format(
                                                                              field.value,
                                                                              'EE MMM dd yyyy'
                                                                          )
                                                                        : 'Pick a date'}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </DialogTrigger>

                                                        <DialogContent className="w-auto p-4">
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    field.value ||
                                                                    new Date()
                                                                }
                                                                onSelect={(
                                                                    date
                                                                ) => {
                                                                    if (date) {
                                                                        field.onChange(
                                                                            date
                                                                        )
                                                                        setCalendarOpen(
                                                                            false
                                                                        )
                                                                    } else {
                                                                        field.onChange(
                                                                            new Date()
                                                                        ) // Handle case where selected date is undefined
                                                                    }
                                                                }}
                                                                disabled={(
                                                                    date: any
                                                                ) =>
                                                                    date <=
                                                                    addDays(
                                                                        new Date(),
                                                                        -1
                                                                    )
                                                                } // Disable past dates
                                                                initialFocus
                                                            />
                                                        </DialogContent>
                                                    </Dialog>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex justify-start w-[300px] gap-x-2">
                                            <FormField
                                                control={form.control}
                                                name="startTime"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col text-left  w-[112px] ">
                                                        <FormLabel className="p-0 my-2">
                                                            Start Time
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="time"
                                                                {...field}
                                                                className="w-full"
                                                                min={
                                                                    isToday
                                                                        ? currentTimeString
                                                                        : undefined
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    field.onChange(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                    // When start time changes, validate end time if needed
                                                                    if (
                                                                        form.getValues(
                                                                            'endTime'
                                                                        ) &&
                                                                        e.target
                                                                            .value >
                                                                            form.getValues(
                                                                                'endTime'
                                                                            )
                                                                    ) {
                                                                        form.setValue(
                                                                            'endTime',
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                }}
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
                                                    <FormItem className="flex flex-col text-left w-[112px]">
                                                        <FormLabel className="p-0 my-2 ">
                                                            End Time
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="time"
                                                                {...field}
                                                                className="w-full "
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField
                                            control={form.control}
                                            name="batch"
                                            render={({ field }) => (
                                                <FormItem className="text-left">
                                                    <FormLabel>
                                                        Batches
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    aria-expanded={
                                                                        formIsOpen
                                                                    }
                                                                    className={cn(
                                                                        'w-full justify-between',
                                                                        !field.value &&
                                                                            'text-muted-foreground'
                                                                    )}
                                                                >
                                                                    {field.value
                                                                        ? props.bootcampData.find(
                                                                              (
                                                                                  bootcamp
                                                                              ) =>
                                                                                  bootcamp.value ===
                                                                                  field.value
                                                                          )
                                                                              ?.label
                                                                        : 'Select batch...'}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </DialogTrigger>
                                                        <DialogClose asChild>
                                                            <DialogContent className="w-[300px] p-0">
                                                                <Command>
                                                                    <CommandInput placeholder="Search batch..." />
                                                                    <CommandEmpty>
                                                                        No batch
                                                                        found.
                                                                    </CommandEmpty>
                                                                    <CommandGroup>
                                                                        {props.bootcampData.map(
                                                                            (
                                                                                bootcamp
                                                                            ) => (
                                                                                <CommandItem
                                                                                    value={
                                                                                        bootcamp.value
                                                                                    }
                                                                                    key={
                                                                                        bootcamp.value
                                                                                    }
                                                                                    onSelect={() => {
                                                                                        form.setValue(
                                                                                            'batch',
                                                                                            bootcamp.value
                                                                                        )
                                                                                        form.clearErrors(
                                                                                            'batch'
                                                                                        )
                                                                                    }}
                                                                                >
                                                                                    <Check
                                                                                        className={cn(
                                                                                            'mr-2 h-4 w-4',
                                                                                            bootcamp.value ===
                                                                                                field.value
                                                                                                ? 'opacity-100'
                                                                                                : 'opacity-0'
                                                                                        )}
                                                                                    />
                                                                                    {
                                                                                        bootcamp.label
                                                                                    }
                                                                                </CommandItem>
                                                                            )
                                                                        )}
                                                                    </CommandGroup>
                                                                </Command>
                                                            </DialogContent>
                                                        </DialogClose>
                                                    </Dialog>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="daysOfWeek"
                                            render={({ field }) => (
                                                <FormItem className="text-left">
                                                    <FormLabel>
                                                        Days of Week
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    aria-expanded={
                                                                        formIsOpen
                                                                    }
                                                                    className={cn(
                                                                        'w-full justify-between',
                                                                        field
                                                                            .value
                                                                            .length ===
                                                                            0 &&
                                                                            'text-muted-foreground'
                                                                    )}
                                                                >
                                                                    {field.value
                                                                        .length >
                                                                    0 ? (
                                                                        <>
                                                                            {field.value
                                                                                .slice(
                                                                                    0,
                                                                                    2
                                                                                )
                                                                                .join(
                                                                                    ', '
                                                                                )}
                                                                            {field
                                                                                .value
                                                                                .length >
                                                                                2 &&
                                                                                ` + ${
                                                                                    field
                                                                                        .value
                                                                                        .length -
                                                                                    2
                                                                                } more`}
                                                                        </>
                                                                    ) : (
                                                                        'Select days...'
                                                                    )}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </DialogTrigger>
                                                        <DialogContent className="w-[300px] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Search days..." />
                                                                <CommandEmpty>
                                                                    No day
                                                                    found.
                                                                </CommandEmpty>
                                                                <CommandGroup>
                                                                    {weekDays.map(
                                                                        (
                                                                            day: any
                                                                        ) => (
                                                                            <CommandItem
                                                                                value={
                                                                                    day.value
                                                                                }
                                                                                key={
                                                                                    day.value
                                                                                }
                                                                                onSelect={() => {
                                                                                    const newValue: any =
                                                                                        field.value.includes(
                                                                                            day.value
                                                                                        )
                                                                                            ? field.value.filter(
                                                                                                  (
                                                                                                      value
                                                                                                  ) =>
                                                                                                      value !==
                                                                                                      day.value
                                                                                              )
                                                                                            : [
                                                                                                  ...field.value,
                                                                                                  day.value,
                                                                                              ]
                                                                                    form.setValue(
                                                                                        'daysOfWeek',
                                                                                        newValue
                                                                                    )
                                                                                    form.clearErrors(
                                                                                        'daysOfWeek'
                                                                                    )
                                                                                }}
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        'mr-2 h-4 w-4',
                                                                                        field.value.includes(
                                                                                            day.value
                                                                                        )
                                                                                            ? 'opacity-100'
                                                                                            : 'opacity-0'
                                                                                    )}
                                                                                />
                                                                                {
                                                                                    day.label
                                                                                }
                                                                            </CommandItem>
                                                                        )
                                                                    )}
                                                                </CommandGroup>
                                                            </Command>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="totalClasses"
                                            render={({ field }) => (
                                                <FormItem className="text-left flex flex-col">
                                                    <FormLabel className="p-0 my-2">
                                                        Total Classes
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Total Classes"
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="modulesIds"
                                            render={({ field }) => (
                                                <FormItem className="text-left">
                                                    <FormLabel>
                                                        Modules
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </FormLabel>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                type='button'
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    aria-expanded={
                                                                        formIsOpen
                                                                    }
                                                                    className={cn(
                                                                        'w-full justify-between',
                                                                        !field.value &&
                                                                            'text-muted-foreground'
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <span className="truncate">
                                                                                        {ellipsis(
                                                                                            props.modulesData.find(
                                                                                                (modules: any) =>
                                                                                                    modules.id === field.value
                                                                                            )?.description || '',
                                                                                            30
                                                                                        )}
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    {props.modulesData.find(
                                                                                        (modules: any) =>
                                                                                            modules.id === field.value
                                                                                    )?.description || ''}
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    ) : (
                                                                        'Select Modules...'
                                                                    )}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </DialogTrigger>
                                                        <DialogContent className="w-[300px] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Search modules..." />
                                                                <CommandEmpty>
                                                                    No modules
                                                                    found.
                                                                </CommandEmpty>
                                                                <CommandGroup>
                                                                    {props.modulesData.map(
                                                                        (
                                                                            modules: any
                                                                        ) => (
                                                                            <CommandItem
                                                                                value={
                                                                                    modules.description
                                                                                }
                                                                                key={
                                                                                    modules.id
                                                                                }
                                                                                onSelect={(e: any) => {
                                                                                    form.setValue(
                                                                                        'modulesIds',
                                                                                        modules.id
                                                                                    )
                                                                                    form.clearErrors(
                                                                                        'modulesIds'
                                                                                    )
                                                                                    // Close dialog after selection
                                                                                    setFormIsOpen(
                                                                                        false
                                                                                    )
                                                                                }}
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        'mr-2 h-4 w-4',
                                                                                        modules.id ===
                                                                                            field.value
                                                                                            ? 'opacity-100'
                                                                                            : 'opacity-0'
                                                                                    )}
                                                                                />
                                                                                <TooltipProvider>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger asChild>
                                                                                            <span className="truncate">
                                                                                                {ellipsis(modules.description, 40)}
                                                                                            </span>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>
                                                                                            {modules.description}
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>
                                                                            </CommandItem>
                                                                        )
                                                                    )}
                                                                </CommandGroup>
                                                            </Command>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <DialogClose asChild>
                                            {isLoading ? (
                                                <Button disabled>
                                                    <Spinner className="mr-2 text-black h-12  animate-spin w-1/3" />
                                                    Creating Session
                                                </Button>
                                            ) : (
                                                <Button
                                                    disabled={isSubmitDisabled}
                                                    variant={'secondary'}
                                                    onClick={form.handleSubmit(
                                                        onSubmit
                                                    )}
                                                    className={`w-1/3 mt-3`}
                                                >
                                                    Create Session
                                                </Button>
                                            )}
                                        </DialogClose>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </DialogContent>
                </>
            )}
        </Dialog>
    )
}

export default CreateSessionDialog
