'use client'

import { useEffect, useState, useCallback } from 'react'
// import { Calendar } from "@/components/ui/calendar";
import { Card } from '@/components/ui/card'
import { cn, getAttendanceColorClass } from '@/lib/utils'
import { ChevronRight, Video } from 'lucide-react'
import { BookOpenText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import { useLazyLoadedStudentData } from '@/store/store'
import Link from 'next/link'
import ClassCard from '@/app/admin/courses/[courseId]/_components/classCard'
import Image from 'next/image'
import SubmissionCard from '@/app/admin/courses/[courseId]/_components/SubmissionCard'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface ResumeCourse {
    bootcampName?: string
    moduleName?: string
    bootcampId?: number
    newChapter?: any
    moduleId?: number
}

interface EnrolledCourse {
    id: number
    name: string
}

type ScheduleProps = React.ComponentProps<typeof Card>

function Schedule({ className, ...props }: ScheduleProps) {
    const [courseStarted, setCourseStarted] = useState<boolean>(false)
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const [resumeCourse, setResumeCourse] = useState<ResumeCourse>({})
    const [nextChapterId, setNextChapterId] = useState([])
    const [upcomingClasses, setUpcomingClasses] = useState([])
    const [ongoingClasses, setOngoingClasses] = useState([])
    const [attendanceData, setAttendanceData] = useState<any[]>([])
    const [submission, setSubmission] = useState<any[]>([])
    const [enrolledCourse, setEnrolledCourse] = useState([])
    const [selectedCourse, setSelectedCourse] =
        useState<EnrolledCourse | null>()

    // const [ongoingClasses, setOngoingClasses] = useState([])
    // const [completedClasses, setCompletedClasses] = useState([])
    // useEffect(() => {
    //     if (userID) {
    //         api.get(`/student/${userID}`)
    //             .then((res) => {
    //                 api.get(`/bootcamp/studentClasses/${res.data[0].id}`, {
    //                     params: {
    //                         userId: userID,
    //                     },
    //                 })
    //                     .then((response) => {
    //                         const {
    //                             upcomingClasses,
    //                             ongoingClasses,
    //                             completedClasses,
    //                         } = response.data
    //                         setUpcomingClasses(upcomingClasses)
    //                         setOngoingClasses(ongoingClasses)
    //                         setCompletedClasses(completedClasses)
    //                     })
    //                     .catch((error) => {
    //                         console.log('Error fetching classes:', error)
    //                     })
    //             })
    //             .catch((error) => {
    //                 console.log('Error fetching classes:', error)
    //             })
    //     }
    // }, [userID])

    // useEffect(() => {}, [upcomingClasses, ongoingClasses, completedClasses])

    useEffect(() => {
        const getResumeCourse = async () => {
            try {
                const response = await api.get('/tracking/latestUpdatedCourse')
                setResumeCourse(response.data)
                setNextChapterId(response.data.newChapter.id)
                // If we get res, then course started, hence courseStarted: true;
                if (response?.data?.code === 404) {
                    setCourseStarted(false)
                } else {
                    setCourseStarted(true)
                }
            } catch (error) {
                console.error('Error getting resume course:', error)
                if (
                    (error as any)?.response?.data?.message ===
                    `Cannot read properties of undefined (reading 'moduleId')`
                ) {
                    setCourseStarted(false)
                }
            }
        }
        if (userID) getResumeCourse()
    }, [userID])

    const getUpcomingClassesHandler = useCallback(async () => {
        await api.get(`/student/Dashboard/classes/`).then((res) => {
            setUpcomingClasses(res.data.upcoming)
            setOngoingClasses(res.data.ongoing)
        })
    }, [])
    const getAttendanceHandler = useCallback(async () => {
        await api.get(`/student/Dashboard/attendance`).then((res) => {
            const attendance = res.data.filter(
                (course: any) => selectedCourse?.id === course.bootcampId
            )
            setAttendanceData(attendance)
        })
    }, [selectedCourse?.id])
    const getUpcomingSubmissionHandler = useCallback(async () => {
        await api.get(`/tracking/upcomingSubmission/9`).then((res) => {
            setSubmission(res.data)
        })
    }, [])

    useEffect(() => {
        const getEnrolledCourses = async () => {
            try {
                const response = await api.get(`/student`)
                setEnrolledCourse(response.data)
                setSelectedCourse(response.data[0])
            } catch (error) {
                console.error('Error getting enrolled courses:', error)
            }
        }
        if (userID) getEnrolledCourses()
    }, [userID])

    const handleCourseChange = (selectedCourseId: any) => {
        const newSelectedCourse: any = enrolledCourse.find(
            (course: any) => course.id === +selectedCourseId
        )
        setSelectedCourse(newSelectedCourse)
    }

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                getUpcomingClassesHandler(),
                getAttendanceHandler(),
                getUpcomingSubmissionHandler(),
            ])
        }

        fetchData()
    }, [
        getAttendanceHandler,
        getUpcomingClassesHandler,
        getUpcomingSubmissionHandler,
    ])

    return (
        <div>
            <div className="flex flex-col flex-start mt-6">
                <h1 className="text-xl p-1 text-start font-bold">
                    Upcoming Classes
                </h1>

                {/* Proper alignment of the classes and attendance data */}
                {/* <div className="flex">
                    <div className="w-[64%] bg-red-500 flex flex-row-reverse mr-10">
                        <div>01</div>
                    </div>
                    <div className="w-[32%] bg-blue-500 flex">
                        <div>04</div>
                        <div>05</div>
                        <div>06</div>
                    </div>
                </div> */}

                <div className="flex flex-row justify-between gap-6">
                    {upcomingClasses?.length > 0 ? (
                        <div className="flex flex-col">
                            <div className="w-[800px]">
                                {ongoingClasses.map((classData: any, index) => (
                                    <ClassCard
                                        classData={classData}
                                        classType={classData.status}
                                        key={index}
                                    />
                                ))}
                                {upcomingClasses.map(
                                    (classData: any, index) => (
                                        <ClassCard
                                            classData={classData}
                                            classType={classData.status}
                                            key={index}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex w-full flex-col items-center mt-12">
                            <Image
                                src="/no-class.svg"
                                alt="No classes"
                                width={240}
                                height={240}
                            />
                            <p className="text-lg mt-3 text-center">
                                There are no upcoming classes
                            </p>
                        </div>
                    )}
                    {enrolledCourse?.length > 0 && (
                        <div className="w-1/3 h-full p-6 bg-gray-100 rounded-lg items-center justify-center ">
                            <h1 className=" text-xl text-start font-semibold">
                                Attendance
                            </h1>
                            <Select
                                onValueChange={(e) => {
                                    handleCourseChange(e)
                                }}
                            >
                                <SelectTrigger className="w-[300px] border-0 shadow-none focus:ring-0 bg-gray-100 mb-3">
                                    <SelectValue
                                        placeholder={
                                            selectedCourse?.name ||
                                            'Select a course'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Courses</SelectLabel>
                                        {enrolledCourse.map((course: any) => (
                                            <SelectItem
                                                key={course.id}
                                                value={course.id.toString()}
                                            >
                                                <p className="text-lg">   {/* Font size not getting increased */}
                                                    {course.name}
                                                </p>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <div className=" gap-2 items-center">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-[10px] h-[10px] rounded-full  ${getAttendanceColorClass(
                                            attendanceData[0]?.attendance
                                        )}`}
                                    />
                                    <h1>{attendanceData[0]?.attendance}%</h1>
                                </div>
                                <div className="flex">
                                    <p className="text-md font-semibold">
                                        {' '}
                                        {
                                            attendanceData[0]?.attendedClasses
                                        } of {attendanceData[0]?.totalClasses}{' '}
                                        Classes Attended
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */}

            {courseStarted && (
                <div className="flex flex-col flex-start mt-6">
                    <h1 className="text-xl p-1 text-start font-bold">
                        Start From Where You Left Off
                    </h1>
                    <div className="flex flex-row justify-between gap-6">
                        <div className="flex flex-col">
                            <div className="w-[800px]">
                                <Card className="w-full mb-3 border-none shadow p-6">
                                    <div className="flex flex-row justify-between gap-6">
                                        <div>
                                            <div className="flex flex-row gap-6">
                                                {/* <Video size={25} /> */}
                                                <BookOpenText className="hidden sm:block mt-2" />
                                                <h1 className="text-lg p-1 text-start font-bold">
                                                    {/* Video - Intro to Variables */}
                                                    {
                                                        resumeCourse.newChapter
                                                            ?.title
                                                    }
                                                </h1>
                                            </div>
                                            <div className="flex flex-row gap-6">
                                                <p className="text-md text-start mt-3 mb-2 ">
                                                    {resumeCourse?.bootcampName}
                                                </p>
                                                <span className="w-2 h-2 bg-gray-500 rounded-full mt-5"></span>
                                                <p className="text-md text-start mt-3 mb-2 ">
                                                    {resumeCourse?.moduleName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <Button
                                                variant={'ghost'}
                                                className="text-xl font-bold"
                                            >
                                                <Link
                                                    className="gap-3 flex items-center text-secondary"
                                                    // href={`/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse.moduleId}`}
                                                    href={{
                                                        pathname: `/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse.moduleId}`,
                                                        query: {
                                                            nextChapterId,
                                                        },
                                                    }}
                                                >
                                                    <p>Resume Learning</p>
                                                    <ChevronRight size={15} />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */}

            {/* <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      /> */}
            <div className="flex flex-col flex-start mt-6">
                <h1 className="text-xl p-1 text-start font-bold">
                    Upcoming Submissions
                </h1>
                {/* <div className="flex flex-row"> */}
                <div
                    className={
                        upcomingClasses?.length < 1
                            ? 'w-[75%]'
                            : 'flex flex-row'
                    }
                >
                    {submission.length > 0 ? (
                        submission.map((data) => {
                            return (
                                <SubmissionCard classData={data} key={data} />
                            )
                        })
                    ) : (
                        <div className="flex w-full flex-col items-center mt-12">
                            <Image
                                src="/no-submission.svg"
                                alt="No Submission"
                                width={240}
                                height={240}
                            />
                            <p className="text-lg mt-3 text-center">
                                There are no upcoming Submission
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Schedule
