import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
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
// Removed modal dialog usage for selects
import { Input } from '@/components/ui/input'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/utils/axios.config'
import { useParams, useRouter } from 'next/navigation'
// Removed conflicting imported type CreateSessionDialogProps (local type declared below)

const formSchema = z
    .object({
        sessionTitle: z.string().min(2, {
            message: 'Session Title must be at least 2 characters.',
        })
        .max(50, { message: 'You can enter up to 50 characters only.' }),

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
        // Optional second batch selection
        secondBatch: z
            .string()
            .optional()
            .refine(
                (val) => {
                    // allow empty / undefined
                    return (
                        val === undefined || val === '' || !isNaN(Number(val))
                    )
                },
                { message: 'Invalid second batch' }
            ),
        platform: z.string({
            required_error: 'Please select a Platform.',
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
    .refine(
        (data) => {
            if (!data.secondBatch) return true
            return data.secondBatch !== data.batch
        },
        {
            message: 'Second batch must be different from first batch',
            path: ['secondBatch'],
        }
    )
type LocalCreateSessionDialogProps = {
    fetchingChapters: () => void
    onClose: () => void // <-- Add this
}
const CreateSessionDialog: React.FC<LocalCreateSessionDialogProps> = ({
    fetchingChapters,
    onClose,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const params = useParams()
    const router = useRouter()
    const [isCalendarOpen, setCalendarOpen] = useState(false)
    const [bootcampData, setBootcampData] = useState<any>([])
    // Reusable select styling helper
    const baseSelectClass =
        'w-full border border-input rounded-md px-3 py-2 bg-background text-gray-600 focus:outline-none focus:ring-2 focus:ring-[rgb(81,134,114)] focus:border-[rgb(81,134,114)] disabled:opacity-50 disabled:cursor-not-allowed'

    // Platform options
    const platformOptions = [
        { value: 'zoom', label: 'Zoom' },
        { value: 'google-meet', label: 'Google Meet' },
    ]
    const getHandleAllBootcampBatches = useCallback(async () => {
        if (params.courseId) {
            await api
                .get(`/bootcamp/batches/${params.courseId}`)
                .then((response) => {
                    const transformedData = response.data.data.map(
                        (item: { id: number; name: string }) => ({
                            value: item.id.toString(),
                            label: item.name,
                        })
                    )
                    setBootcampData(transformedData)
                })
                .catch((error) => {
                    console.error('Error fetching data:', error)
                })
        }
    }, [params.courseId])
    useEffect(() => {
        getHandleAllBootcampBatches()
    }, [getHandleAllBootcampBatches])

    // Removed toggleForm since dialog-based selects were replaced with native dropdowns

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sessionTitle: '',
            description: '',
            startDate: new Date(),
            startTime: '',
            endTime: '',
            batch: '',
            secondBatch: undefined,
            platform: 'zoom',
        },
        mode: 'onChange',
    })

    useEffect(() => {
        form.setValue('sessionTitle', '')
        form.setValue('description', '')
        form.setValue('startDate', new Date())
        form.setValue('startTime', '')
        form.setValue('endTime', '')
        form.setValue('batch', '')
        form.setValue('platform', 'zoom')
        form.setValue('secondBatch', undefined)
    }, [form])

    const {
        sessionTitle,
        startDate,
        startTime,
        endTime,
        batch,
        secondBatch,
        platform,
    } = form.watch()

    const isSubmitDisabled = !(
        sessionTitle &&
        startDate &&
        startTime &&
        endTime &&
        batch &&
        platform
    )

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)

        const combineDateTime = (date: Date, time: string) => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}T${time}:00`
        }

        const startDateTime = combineDateTime(
            values.startDate,
            values.startTime
        )
        const endDateTime = combineDateTime(values.startDate, values.endTime)

        const transformedData: any = {
            title: values.sessionTitle,
            batchId: +values.batch,
            secondBatchId: values.secondBatch ? +values.secondBatch : null,
            moduleId: +params.moduleId,
            description: values.description,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            timeZone: 'Asia/Kolkata',
            isZoomMeet: values.platform === 'zoom',
        }

        try {
            await api.post('/classes', transformedData)

            const chaptersRes = await api.get(
                `/Content/allChaptersOfModule/${params.moduleId}`
            )
            const chapters = chaptersRes?.data?.chapterWithTopic || []

            const latestChapter = chapters[chapters.length - 1]
            if (latestChapter) {
                router.push(
                    `/admin/courses/${params.courseId}/module/${params.moduleId}/chapters/${latestChapter.chapterId}`
                )
            }
            toast.success({
                title: 'Success',
                description: 'Class Created Successful',
            })
            fetchingChapters()
            form.reset()
            onClose()
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Class not created',
            })
        } finally {
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
        <div className="w-full ">
            <div className="text-lg text-left font-semibold mb-4 text-gray-600">
                Live Classes Chapter
            </div>
            {/* Removed stray baseSelectClass constant that was rendering as text */}

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full flex flex-col  "
                >
                    <FormField
                        control={form.control}
                        name="sessionTitle"
                        render={({ field }) => (
                            <FormItem className="text-left text-gray-600">
                                <FormLabel>
                                    Session Title
                                    <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Session Title"
                                        disabled={isLoading}
                                        {...field}
                                        onChange={(e) => {
                                             field.onChange(e.target.value)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center gap-x-3 gap-y-0">
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col text-left text-gray-600">
                                    <FormLabel className="p-0 my-2">
                                        Classes start date
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Dialog
                                        open={isCalendarOpen}
                                        onOpenChange={setCalendarOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    className={`w-full text-left font-normal text-gray-600 border border-input bg-background hover:border-[rgb(81,134,114)] ${
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
                                                    <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </DialogTrigger>

                                        <DialogContent className="w-auto">
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    field.value || new Date()
                                                }
                                                onSelect={(date) => {
                                                    if (date) {
                                                        field.onChange(date)
                                                        setCalendarOpen(false)
                                                    } else {
                                                        field.onChange(
                                                            new Date()
                                                        )
                                                    }
                                                }}
                                                disabled={(date: any) =>
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
                        <div className="flex justify-end w-full space-x-8  ">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col text-left text-gray-600">
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
                                                disabled={isLoading}
                                                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                                min={
                                                    isToday
                                                        ? currentTimeString
                                                        : undefined
                                                }
                                                onChange={(e) => {
                                                    // field.onChange(
                                                    //     e.target.value
                                                    // )

                                                    const newValue =
                                                        e.target.value
                                                    if (newValue.length <= 50) {
                                                        field.onChange(newValue)
                                                    } else {
                                                        toast.error({
                                                            title: 'Character Limit Reached',
                                                            description:
                                                                'Assignment title cannot exceed 50 characters.',
                                                        })
                                                    }

                                                    if (
                                                        form.getValues(
                                                            'endTime'
                                                        ) &&
                                                        e.target.value >
                                                            form.getValues(
                                                                'endTime'
                                                            )
                                                    ) {
                                                        form.setValue(
                                                            'endTime',
                                                            e.target.value
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
                                    <FormItem className="flex flex-col text-left text-gray-600">
                                        <FormLabel className="p-0 my-2">
                                            End Time
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                                disabled={isLoading}
                                                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <FormItem className="text-left text-gray-600">
                                    <FormLabel>
                                        Batches{' '}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <select
                                            className={cn(
                                                baseSelectClass,
                                                !field.value &&
                                                    'text-muted-foreground'
                                            )}
                                            value={field.value}
                                            disabled={isLoading}
                                            onChange={(e) => {
                                                field.onChange(e.target.value)
                                                if (
                                                    form.getValues(
                                                        'secondBatch'
                                                    ) === e.target.value
                                                ) {
                                                    form.setValue(
                                                        'secondBatch',
                                                        undefined
                                                    )
                                                }
                                                form.clearErrors('batch')
                                            }}
                                            aria-busy={isLoading}
                                        >
                                            <option value="">
                                                Select batch...
                                            </option>
                                            {bootcampData.map((b: any) => (
                                                <option
                                                    key={b.value}
                                                    value={b.value}
                                                >
                                                    {b.label}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="secondBatch"
                            render={({ field }) => (
                                <FormItem className="text-left text-gray-600">
                                    <FormLabel>
                                        Second Batch (optional)
                                    </FormLabel>
                                    <FormControl>
                                        <select
                                            className={baseSelectClass}
                                            value={field.value || ''}
                                            disabled={isLoading || !batch}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                field.onChange(val || undefined)
                                                form.clearErrors('secondBatch')
                                            }}
                                            aria-busy={isLoading}
                                        >
                                            {batch ? (
                                                <>
                                                    <option value="">
                                                        None
                                                    </option>
                                                    {bootcampData
                                                        .filter(
                                                            (b: any) =>
                                                                b.value !==
                                                                form.getValues(
                                                                    'batch'
                                                                )
                                                        )
                                                        .map((b: any) => (
                                                            <option
                                                                key={b.value}
                                                                value={b.value}
                                                            >
                                                                {b.label}
                                                            </option>
                                                        ))}
                                                </>
                                            ) : (
                                                <option value="">
                                                    Select primary batch first
                                                </option>
                                            )}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="platform"
                            render={({ field }) => (
                                <FormItem className="text-left text-gray-600">
                                    <FormLabel>
                                        Platform{' '}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <select
                                            className={cn(
                                                baseSelectClass,
                                                !field.value &&
                                                    'text-muted-foreground'
                                            )}
                                            value={field.value}
                                            disabled={isLoading}
                                            onChange={(e) => {
                                                field.onChange(e.target.value)
                                                form.clearErrors('platform')
                                            }}
                                            aria-busy={isLoading}
                                        >
                                            <option value="">
                                                Select platform...
                                            </option>
                                            {platformOptions.map((p) => (
                                                <option
                                                    key={p.value}
                                                    value={p.value}
                                                >
                                                    {p.label}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* <FormField
                        control={form.control}
                        name="totalClasses"
                        render={({ field }) => (
                            <FormItem className="text-left flex flex-col text-gray-600">
                                <FormLabel className="p-0 my-2">
                                    Total Classes
                                    <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Total Classes"
                                        type="number"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    /> */}

                    <div className="flex justify-end">
                        {isLoading ? (
                            <Button
                                disabled
                                className="w-1/3 mt-3 bg-background text-[rgb(81,134,114)] border-[rgb(81,134,114)] border"
                            >
                                <Spinner className="mr-2 text-black h-4 w-4 animate-spin" />
                                Creating Session
                            </Button>
                        ) : (
                            <Button
                                disabled={isSubmitDisabled}
                                onClick={form.handleSubmit(onSubmit)}
                                className="w-1/3 mt-3 bg-background text-[rgb(81,134,114)] border-[rgb(81,134,114)] border hover:bg-[rgb(81,134,114)] hover:text-white"
                            >
                                Create Session
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default CreateSessionDialog
