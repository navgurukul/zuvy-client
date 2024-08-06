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
    const [upcomingAssignments, setUpcomingAssignments] = useState([])
    const [lateAssignments, setLateAssignments] = useState([])
    const [attendanceData, setAttendanceData] = useState<any[]>([])
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
                setResumeCourse(response.data.latestCourse)
                setNextChapterId(response.data.latestCourse.newChapter.id)
                // If we get res, then course started, hence courseStarted: true;
                if (response?.data?.code === 200) {
                    setCourseStarted(true)
                } else {
                    setCourseStarted(false)
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
        await api
            .get(`/student/Dashboard/classes?limit=2&offset=0`)
            .then((res) => {
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
        await api.get(`/tracking/allupcomingSubmission`).then((res) => {
            setUpcomingAssignments(res.data.upcomingAssignments)
            setLateAssignments(res.data.lateAssignments)
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
            <div className="flex flex-col items-start mt-6">
                <h1 className="text-xl p-1 text-start font-bold mb-4">
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

                <div className="w-full flex flex-col items-center lg:flex-row lg:justify-between gap-8">
                    {upcomingClasses?.length > 0 ? (
                        <div className="flex flex-col w-full lg:max-w-[860px]">
                            {ongoingClasses.map((classData: any, index) => (
                                <ClassCard
                                    classData={classData}
                                    classType={classData.status}
                                    key={index}
                                    getClasses={() => console.log('')}
                                    activeTab={'ongoing'}
                                    studentSide={true}
                                />
                            ))}
                            {upcomingClasses.map((classData: any, index) => (
                                <ClassCard
                                    classData={classData}
                                    classType={classData.status}
                                    key={index}
                                    getClasses={() => console.log('')}
                                    activeTab={'ongoing'}
                                    studentSide={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center mt-12 lg:w-[870px]">
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
                </div>
                {upcomingClasses?.length > 0 && (
                    <div className="flex justify-center mt-3 bg-blue-200">
                        <Link href="/student/classes">
                            <div className="flex items-center border rounded-md border-secondary px-3 py-1 text-secondary">
                                <h1 className="text-lg p-1 font-bold">
                                    See All Classes
                                </h1>
                                <ChevronRight size={20} />
                            </div>
                        </Link>
                    </div>
                )}
            </div>

            {/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */}

            {courseStarted && (
                <div className="flex flex-col flex-start mt-6">
                    <h1 className="text-xl p-1 text-start font-bold mb-4">
                        Start From Where You Left Off
                    </h1>
                    <div className="hidden lg:flex flex-row justify-between gap-6">
                        <div className="flex flex-col">
                            <div className="lg:w-[860px]">
                                <Card className="w-full mb-3 border-none p-5 shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F]">
                                    <div className="flex flex-row justify-between items-center gap-6">
                                        <div>
                                            <div className="flex flex-row gap-3">
                                                <BookOpenText className="hidden sm:block mt-2" />
                                                <h1 className="text-md mt-2 text-start font-bold">
                                                    {
                                                        resumeCourse.newChapter
                                                            ?.title
                                                    }
                                                </h1>
                                            </div>
                                            <div className="flex flex-row gap-4">
                                                <p className="text-md text-start mt-3 mb-2 ">
                                                    {resumeCourse?.bootcampName}
                                                </p>
                                                <span className="w-[5px] h-[5px] bg-gray-500 rounded-full self-center"></span>
                                                <p className="text-md text-start mt-3 mb-2 ">
                                                    {resumeCourse?.moduleName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex item-center text-end">
                                            <Button
                                                variant={'ghost'}
                                                className="text-lg font-bold"
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
                    <div className="block lg:hidden flex flex-col justify-between gap-6">
                        <div className="flex flex-col">
                            <div className="w-full">
                                <Card className="w-full mb-3 border-none p-5 shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F]">
                                    <div>
                                        <div className="flex flex-row gap-3">
                                            <BookOpenText className="mt-2" />
                                            <h1 className="text-md mt-2 text-start font-bold">
                                                {resumeCourse.newChapter?.title}
                                            </h1>
                                        </div>
                                        <div className="flex flex-row">
                                            <p className="text-md text-start mt-3 mb-2 ">
                                                {resumeCourse?.bootcampName}
                                                &nbsp;-&nbsp;
                                                {resumeCourse?.moduleName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <Button
                                            variant={'ghost'}
                                            className="text-lg font-bold"
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
            <div className="flex flex-col items-start mt-6">
                {lateAssignments.length < 1 &&
                    upcomingAssignments.length < 1 && (
                        <h1 className="text-xl p-1 text-start font-bold mb-4">
                            Upcoming Submissions
                        </h1>
                    )}
                <div className="flex flex-col w-full lg:max-w-[860px]">
                    {lateAssignments.length > 0 ||
                    upcomingAssignments.length > 0 ? (
                        <div className="flex flex-col w-full lg:max-w-[860px]">
                            {lateAssignments.length > 0 && (
                                <h1 className="text-xl p-1 text-start font-bold mb-4">
                                    Late Assignments
                                </h1>
                            )}
                            {lateAssignments.map((data: any, index) => (
                                <SubmissionCard classData={data} key={data} />
                            ))}
                            {upcomingAssignments.length > 0 && (
                                <h1 className="text-xl p-1 text-start font-bold mb-4">
                                    Upcoming Assignments
                                </h1>
                            )}
                            {upcomingAssignments.map((data: any, index) => (
                                <SubmissionCard classData={data} key={data} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center mt-12 lg:w-[870px]">
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
