'use client'
import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { Spinner } from '@/components/ui/spinner'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { api } from '@/utils/axios.config'
import { getBatchData, getCourseData, getStoreStudentData } from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import { fetchStudentData } from '@/utils/students'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DataTable } from '@/app/_components/datatable/data-table'
import { useStudentData } from '@/app/admin/courses/[courseId]/(courseTabs)/students/components/useStudentData'
import { columns } from './columns'
import { useParams, useRouter } from 'next/navigation'
// import { DataTable } from './dataTable'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

export type StudentData = {
    id: any
    userId: any
    email: string
    name: string
    profilePicture: string
}

interface Student {
    email: string
    name: string
}

type StudentDataState = Student[]

const Page = ({ params }: { params: any }) => {
    const Page = ({ params }: { params: any }) => {
        const router = useRouter()
        const param = useParams()
        const courseId = param.courseId
        const [isCourseDeleted, setIsCourseDeleted] = useState(false)
        const { students } = useStudentData(params.courseId)
        const { courseData, fetchCourseDetails } = getCourseData()
        const { fetchBatches, batchData, setBatchData } = getBatchData()
        const { setStoreStudentData } = getStoreStudentData()
        const [loading, setLoading] = useState(true)
        const [assignStudents, setAssignStudents] = useState('')
        const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
        const [totalStudents, setTotalStudents] = useState([...students])
        const [searchStudent, setSearchStudent] = useState('')
        const [search, setSearch] = useState<string>('')
        const debouncedSearch = useDebounce(search, 1000)
        const debouncedSearchStudent = useDebounce(searchStudent, 1000)
        const [studentData, setStudentData] = useState<StudentDataState | any>(
            {}
        )

        const formSchema = z.object({
            name: z.string().min(2, {
                message: 'Batch name must be at least 2 characters.',
            }),
            instructorEmail: z.string().email(),
            bootcampId: z
                .string()
                .refine((bootcampId) => !isNaN(parseInt(bootcampId))),
            capEnrollment: z.string().refine(
                (capEnrollment) => {
                    const parsedValue = parseInt(capEnrollment)
                    return (
                        !isNaN(parsedValue) &&
                        parsedValue > 0 &&
                        parsedValue <= 100000
                    )
                },
                {
                    message:
                        'Cap Enrollment must be a positive number between 1 and 100,000',
                }
            ),
            assignLearners: z.string(),
        })

        const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                name: '',
                instructorEmail: '',
                bootcampId: courseData?.id.toString() ?? '',
                capEnrollment: '',
                assignLearners: 'all',
            },
            values: {
                name: '',
                instructorEmail: '',
                bootcampId: courseData?.id.toString() ?? '',
                capEnrollment: '',
                assignLearners: 'all',
            },
            mode: 'onChange',
        })
        const onSubmit = async (values: z.infer<typeof formSchema>) => {
            if (!courseId || isCourseDeleted) return
            try {
                const studentIds = selectedRows.map((student) => student.id)

                const convertedData = {
                    name: values.name,
                    instructorEmail: values.instructorEmail,
                    bootcampId: +values.bootcampId,
                    capEnrollment: +values.capEnrollment,
                    assignAll: studentIds.length > 0 ? false : true,
                    studentIds: studentIds,
                }
                const convertedName: string = convertedData.name
                    .replace(/\s+/g, '') // Remove all whitespace characters
                    .toLowerCase()
                const matchedBatchData = batchData?.find(
                    (batchDataItem) =>
                        convertedName === batchDataItem.name.toLowerCase()
                )

                if (matchedBatchData) {
                    toast.error({
                        title: 'Cannot Create New Batch',
                        description: 'This Batch Name Already Exists',
                    })
                } else {
                    const res = await api.post(`/batch`, convertedData)
                    setAssignStudents('')
                    if (params.courseId) {
                        fetchBatches(params.courseId)
                        fetchStudentData(params.courseId, setStoreStudentData)
                        fetchCourseDetails(params.courseId)
                    }
                    toast.success({
                        title: res.data.status,
                        description: res.data.message,
                    })
                    return true
                }
            } catch (error: any) {
                setAssignStudents('')
                if (isCourseDeleted) return
                toast.error({
                    title: 'Failed',
                    description:
                        error.response?.data?.message || 'An error occurred.',
                })
                console.error('Error creating batch:', error)
                return false
            }
        }

        useEffect(() => {
            const timer = setTimeout(() => {
                setLoading(false)
            }, 1000)

            return () => clearTimeout(timer)
        }, [])

        const checkIfCourseExists = async () => {
            if (!courseId) return

            try {
                await api.get(`/bootcamp/${courseId}`)
                setIsCourseDeleted(false)
            } catch (error) {
                setIsCourseDeleted(true)
                getCourseData.setState({ courseData: null }) // Zustand clear
            }
        }

        // ✅ 1. Initial mount check
        useEffect(() => {
            let interval: NodeJS.Timeout

            if (!isCourseDeleted) {
                interval = setInterval(() => {
                    checkIfCourseExists()
                }, 500)
            }

            return () => clearInterval(interval)
        }, [courseId, isCourseDeleted])

        useEffect(() => {
            if (!courseId || isCourseDeleted)
                fetchCourseDetails(params.courseId)
        }, [fetchCourseDetails, courseId, isCourseDeleted])

        const getUnAssignedStudents = useCallback(async () => {
            if (!courseId || isCourseDeleted) return

            try {
                const res = await api.get(
                    `/batch/allUnassignStudent/${params.courseId}?searchTerm=${debouncedSearchStudent}`
                )
                setTotalStudents(res.data.data)
            } catch (error) {
                if (isCourseDeleted) return
                console.error('Error fetching unassigned students:', error)
            }
        }, [debouncedSearchStudent, courseId, isCourseDeleted])

        useEffect(() => {
            getUnAssignedStudents()
        }, [getUnAssignedStudents, debouncedSearchStudent, params.courseId])

        useEffect(() => {
            const searchBatchHandler = async () => {
                if (!courseId || isCourseDeleted) return
                try {
                    const res = await api.get(
                        `/bootcamp/searchBatch/${params.courseId}?searchTerm=${debouncedSearch}`
                    )
                    setBatchData(res.data)
                } catch (error) {
                    if (isCourseDeleted) return
                    console.error('Error fetching batch:', error)
                }
            }

            if (debouncedSearch) searchBatchHandler()
            if (debouncedSearch.trim()?.length === 0 && !isCourseDeleted) {
                fetchBatches(params.courseId)
            }
        }, [
            courseId,
            debouncedSearch,
            fetchBatches,
            setBatchData,
            isCourseDeleted,
        ])

        const handleSearchStudents = (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {
            setSearchStudent(e.target.value)
        }

        const handleSetSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value)
        }

        const assignLearners = form.watch('assignLearners')

        const renderModal = (emptyState: boolean) => {
            if (courseData?.unassigned_students === 0) {
                return (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="lg:max-w-[150px] w-full mt-5">
                                {emptyState ? '+ Create Batch' : 'New Batch'}
                            </Button>
                        </DialogTrigger>
                        <DialogOverlay />
                        <AddStudentsModal
                            message={true}
                            id={courseData?.id || 0}
                            batch={false}
                            batchData={
                                batchData ? batchData?.length > 0 : false
                            }
                            batchId={0}
                            setStudentData={setStudentData}
                            studentData={studentData}
                        />
                    </Dialog>
                )
            } else {
                return (
                    <Dialog onOpenChange={(isOpen) => isOpen && form.reset()}>
                        <DialogTrigger asChild>
                            <Button className="lg:max-w-[150px] w-full mt-5">
                                {emptyState ? '+ Create Batch' : 'New Batch'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>New Batch</DialogTitle>
                                Unassigned Students in Records:{' '}
                                {courseData?.unassigned_students}
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        onError={(e) =>
                                            toast.error({
                                                title: 'Failed',
                                                description:
                                                    'Entered Corect values',
                                            })
                                        }
                                        className="space-y-8"
                                    >
                                        {assignStudents === 'manually' ? (
                                            <>
                                                <Input
                                                    type="search"
                                                    placeholder="Search"
                                                    className="w-full"
                                                    value={searchStudent}
                                                    onChange={
                                                        handleSearchStudents
                                                    }
                                                />
                                                <DataTable
                                                    data={totalStudents}
                                                    columns={columns}
                                                    setSelectedRows={
                                                        setSelectedRows
                                                    }
                                                    assignStudents={
                                                        assignStudents
                                                    }
                                                />
                                                <h1 className="pt-2">
                                                    Total Learners Selected:{' '}
                                                    {selectedRows.length}
                                                </h1>
                                                <div className="flex justify-between w-full pt-2">
                                                    <Button
                                                        className="w-3/2 bg-muted text-muted-foreground"
                                                        onClick={() =>
                                                            setAssignStudents(
                                                                ''
                                                            )
                                                        }
                                                    >
                                                        Back
                                                    </Button>
                                                    <DialogClose asChild>
                                                        <Button
                                                            className="w-3/2"
                                                            type="submit"
                                                            disabled={
                                                                !form.formState
                                                                    .isValid
                                                            }
                                                        >
                                                            Create batch
                                                        </Button>
                                                    </DialogClose>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Batch Name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Batch Name"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="instructorEmail"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Instructor Email
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="instructor@navgurukul.org"
                                                                    type="name"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="capEnrollment"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Cap Enrollment
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Cap Enrollment (max: 100,000)"
                                                                    type="name"
                                                                    {...field}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        // Prevent entering more than 6 digits
                                                                        const value =
                                                                            e
                                                                                .target
                                                                                .value
                                                                        if (
                                                                            value.length <=
                                                                            6
                                                                        ) {
                                                                            field.onChange(
                                                                                e
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
                                                    // name="capEnrollment"
                                                    name="assignLearners" // Changed name to make it unique
                                                    render={({ field }) => (
                                                        <FormItem className="text-start">
                                                            <FormLabel>
                                                                Assign Learners
                                                                to Batch
                                                            </FormLabel>
                                                            <FormControl>
                                                                <RadioGroup
                                                                    onValueChange={
                                                                        field.onChange
                                                                    }
                                                                    value={
                                                                        field.value ||
                                                                        ''
                                                                    } // Correct use of value
                                                                    className="flex gap-4"
                                                                >
                                                                    {/* Option: All learners */}
                                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <RadioGroupItem value="all" />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal">
                                                                            All
                                                                            learners
                                                                        </FormLabel>
                                                                    </FormItem>

                                                                    {/* Option: Assign manually */}
                                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <RadioGroupItem value="manually" />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal">
                                                                            Assign
                                                                            manually
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {assignLearners === 'all' && (
                                                    <FormDescription>
                                                        {
                                                            courseData?.unassigned_students
                                                        }{' '}
                                                        students will be added
                                                        to this batch (Maximum
                                                        current availability)
                                                    </FormDescription>
                                                )}
                                                <div className="w-full flex flex-col items-end gap-y-5 ">
                                                    {assignLearners ===
                                                    'all' ? (
                                                        <DialogClose asChild>
                                                            <Button
                                                                className="w-1/2"
                                                                type="submit"
                                                                disabled={
                                                                    !form
                                                                        .formState
                                                                        .isValid
                                                                }
                                                            >
                                                                Create batch
                                                            </Button>
                                                        </DialogClose>
                                                    ) : (
                                                        <Button
                                                            className="w-1/2"
                                                            onClick={() =>
                                                                setAssignStudents(
                                                                    'manually'
                                                                )
                                                            }
                                                            disabled={
                                                                !form.formState
                                                                    .isValid
                                                            }
                                                        >
                                                            Next: Assign
                                                            Learners to Batch
                                                        </Button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </form>
                                </Form>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                )
            }
        }

        if (isCourseDeleted) {
            return (
                <div className="flex flex-col justify-center items-center h-full mt-20">
                    <Image
                        src="\images\undraw_select-option_6wly.svg"
                        width={350}
                        height={350}
                        alt="Deleted"
                    />
                    <p className="text-lg text-red-600  mt-4">
                        This course has been deleted.
                    </p>
                    <Button
                        onClick={() => router.push('/admin/courses')}
                        className="mt-6 bg-secondary"
                    >
                        Back to Courses
                    </Button>
                </div>
            )
        }

        if (loading) {
            return (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-secondary" />
                </div>
            )
        }

        if (courseData?.id) {
            return (
                <div>
                    <div className="relative flex flex-col lg:flex-row items-center justify-between mb-6">
                        {batchData ? (
                            <Input
                                type="search"
                                placeholder="Search"
                                className="lg:w-[400px] w-full"
                                value={search}
                                onChange={handleSetSearch}
                            />
                        ) : null}
                        {renderModal(false)}
                    </div>

                    {loading ? (
                        <div className="my-5 flex justify-center items-center">
                            <div className="absolute h-screen">
                                <div className="relative top-[70%]">
                                    <Spinner className="text-secondary" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mt-2">
                            {batchData?.length ?? 0 > 0 ? (
                                batchData?.map((batch: any, index: number) => (
                                    <Link
                                        key={batch.name}
                                        href={`/admin/courses/${courseData?.id}/batch/${batch.id}`}
                                    >
                                        <Card
                                            key={batch.id}
                                            className="text-gray-900 text-base"
                                        >
                                            <div className="bg-white rounded-lg border p-4">
                                                <div className="px-1 py-4 flex flex-col items-start">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <CardTitle className="font-semibold capitalize cursor-pointer">
                                                                    {batch.name
                                                                        .length >
                                                                    25
                                                                        ? batch.name.substring(
                                                                              0,
                                                                              25
                                                                          ) +
                                                                          '...'
                                                                        : batch.name}
                                                                </CardTitle>
                                                            </TooltipTrigger>
                                                            {batch.name.length >
                                                                25 && (
                                                                <TooltipContent>
                                                                    {batch.name}
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <CardDescription className="capitalize">
                                                        {
                                                            batch.students_enrolled
                                                        }{' '}
                                                        <span>Learners</span>
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <div className="w-full flex flex-col items-center justify-center gap-y-3 absolute">
                                    <Image
                                        src="/batches.svg"
                                        alt="create batch"
                                        width={100}
                                        height={100}
                                    />
                                    <p>
                                        Start by creating the first batch for
                                        the course. Learners will get added
                                        automatically based on enrollment cap
                                    </p>
                                    {renderModal(true)}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )
        }
    }
}

export default Page
