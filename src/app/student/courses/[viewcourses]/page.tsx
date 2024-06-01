'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookMinus, ChevronRight, Lock } from 'lucide-react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import {
    Breadcrumb,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useLazyLoadedStudentData } from '@/store/store'
import { BreadcrumbItem, CircularProgress } from '@nextui-org/react'
import Loader from '../_components/Loader'
import Image from 'next/image'
import { api } from '@/utils/axios.config'
import { Button } from '@/components/ui/button'

interface CourseProgress {
    status: string
    progress: number
    bootcampTracking: {
        name: string
    }
    code: number
}
interface Instructor {
    instructorId: number
    instructorName: string
    instructorPicture: string
}

// Define the initial state type as an array of instructors
type InstructorDetailsState = Instructor[]

// Initial state object
const initialInstructorDetailsState: InstructorDetailsState = []

import ClassCard from '@/app/admin/courses/[courseId]/_components/classCard'
import CourseCard from '@/app/_components/courseCard'
import BreadcrumbCmponent from '@/app/_components/breadcrumbCmponent'

function Page({
    params,
}: {
    params: { viewcourses: string; moduleID: string }
}) {
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const [modulesProgress, setModulesProgress] = useState([])
    const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(
        null
    )
    const [instructorDetails, setInstructorDetails] =
        useState<InstructorDetailsState>(initialInstructorDetailsState)
    const [upcomingClasses, setUpcomingClasses] = useState([])
    const [attendenceData, setAttendenceData] = useState<any[]>([])
    // const [completedClasses, setCompletedClasses] = useState([])
    const crumbs = [
        { crumb: 'My Courses', href: '/student/courses', isLast: false },
        {
            crumb: courseProgress?.bootcampTracking?.name || 'Course',
            // href: `/student/courses/${params.viewcourses}`,
            isLast: true,
        },
    ]
    const getAttendanceColorClass = (attendance: any) => {
        if (attendance === 100) {
            return 'bg-green-500 text-white'
        } else if (attendance >= 75) {
            return 'bg-yellow-500 text-black'
        } else if (attendance < 50) {
            return 'bg-red-500 text-white'
        } else {
            return 'bg-gray-500 text-white' // Default color for other cases
        }
    }

    const getUpcomingClassesHandler = async () => {
        await api.get(`/student/Dashboard/classes`).then((res) => {
            setUpcomingClasses(res.data)
        })
    }
    const getAttendenceHandler = async () => {
        await api.get(`/student/Dashboard/attendance`).then((res) => {
            setAttendenceData(res.data)
        })
    }
    useEffect(() => {
        getUpcomingClassesHandler()
        getAttendenceHandler()
    }, [])
    // useEffect(() => {
    //     // const userIdLocal = JSON.parse(localStorage.getItem("AUTH") || "");
    //     if (userID) {
    //         api.get(`/bootcamp/studentClasses/${params.viewcourses}`, {
    //             params: {
    //                 userId: userID,
    //             },
    //         })
    //             .then((response) => {
    //                 const { upcomingClasses, ongoingClasses } = response.data
    //                 setUpcomingClasses(upcomingClasses)
    //                 setOngoingClasses(ongoingClasses)
    //                 // setCompletedClasses(completedClasses)
    //             })
    //             .catch((error) => {
    //                 console.log('Error fetching classes:', error)
    //             })
    //     }
    // }, [userID])

    useEffect(() => {
        const getModulesProgress = async () => {
            try {
                const response = await api.get(
                    `/tracking/allModulesForStudents/${params.viewcourses}/${userID}`
                )
                response.data.map((module: any) => {
                    setModulesProgress(response.data)
                })
            } catch (error) {
                console.error('Error getting modules progress', error)
            }
        }
        if (userID) getModulesProgress()
    }, [userID, params.viewcourses])

    useEffect(() => {
        const getCourseProgress = async () => {
            try {
                const response = await api.get(
                    `/tracking/bootcampProgress/${params.viewcourses}/${userID}`
                )
                setCourseProgress(response.data.data)
                setInstructorDetails(response.data.instructorDetails)
                console.log('first', response.data.instructorDetails)
            } catch (error) {
                console.error('Error getting course progress:', error)
            }
        }
        if (userID) getCourseProgress()
    }, [userID])

    return (
        <MaxWidthWrapper>
            <BreadcrumbCmponent crumbs={crumbs} />

            <div className="md:grid grid-cols-2 lg:grid-cols-3 gap-10  my-10">
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mt-2 mb-10">
                        <div>
                            <Image
                                src={'/course.svg'}
                                alt="Course"
                                width={'50'}
                                height={'50'}
                            />
                        </div>
                        <div className="grow text-start">
                            <p className="text-xl font-bold mb-2">
                                {courseProgress?.bootcampTracking?.name}
                            </p>
                            <Loader progress={courseProgress?.progress} />
                        </div>
                    </div>

                    <div className="gap-y-3 flex flex-col">
                        <div className="flex left-0  ">
                            <p
                                className="text-lg p-1 font-bold"
                                onClick={() =>
                                    console.log('first', upcomingClasses)
                                }
                            >
                                Upcoming Classes
                            </p>
                        </div>
                        <div className="flex flex-row justify-between">
                            {upcomingClasses?.length > 0 ? (
                                <div className="flex flex-col">
                                    <p className="text-lg p-1 text-start font-bold">
                                        Upcoming Classes
                                    </p>
                                    <div className="w-[800px]">
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
                                <div className="flex flex-col items-center mt-12">
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

                            {/* Other components can be placed here */}

                            {/* Example card component for future use */}
                            {/* <Card className="text-start">
            <CardHeader className="bg-muted">
                <CardTitle>Pick up where you left</CardTitle>
            </CardHeader>
            <CardContent className="p-3 grid gap-4">
                <div className="flex flex-wrap items-center p-4 justify-between gap-8">
                    <div className="flex items-center">
                        <BookOpenText className="hidden sm:block" />
                        <div className="flex-1 ml-2 space-y-1">
                            <p className="text-sm font-medium leading-none">
                            {resumeCourse?.bootcamp_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {resumeCourse.module_name}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse.moduleId}`}
                    >
                        <Button>Continue</Button>
                        </Link>
                        </div>
                        </CardContent>
                    </Card> */}

                            {/* <div className="w-[400px] h-[200px] flex flex-col bg-gray-100 rounded-lg items-center justify-center ">
                                <h1 className="mt-6 text-xl font-semibold">
                                    Attendance
                                </h1>
                                <div className="flex flex-col gap-2 items-center">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-[10px] h-[10px] rounded-full  ${getAttendanceColorClass(
                                                attendenceData[0]?.attendance
                                            )}`}
                                        />
                                        <h1>
                                            {attendenceData[0]?.attendance}%
                                        </h1>
                                    </div>
                                    <div className="flex">
                                        <p className="text-md font-semibold">
                                            {' '}
                                            {
                                                attendenceData[0]
                                                    ?.attendedClasses
                                            }{' '}
                                            of {attendenceData[0]?.totalClasses}{' '}
                                            Classes Attended
                                        </p>
                                    </div>
                                </div>
                            </div> */}
                        </div>

                        <div className="flex justify-center mt-3">
                            <Link
                                href={`/student/courses/${params.viewcourses}/recordings`}
                            >
                                <div className="flex items-center border rounded-md border-secondary px-3 py-1 text-secondary">
                                    <h1 className="text-lg p-1 font-bold">
                                        See All Classes
                                    </h1>
                                    <ChevronRight size={20} />
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-10">
                        <div className="flex flex-start">
                            <p className="text-lg p-1 font-bold">
                                Course Modules
                            </p>
                        </div>

                        {modulesProgress?.length > 0 ? (
                            modulesProgress.map(
                                ({
                                    name,
                                    description,
                                    id,
                                    isLock,
                                    progress,
                                    timeAlloted,
                                    articlesCount,
                                    assignmentCount,
                                    codingProblemsCount,
                                    quizCount,
                                }: {
                                    name: string
                                    description: string
                                    id: number
                                    isLock: boolean
                                    progress: number
                                    timeAlloted: number
                                    articlesCount: number
                                    assignmentCount: number
                                    codingProblemsCount: number
                                    quizCount: number
                                }) => (
                                    <CourseCard
                                        key={id}
                                        param={params.viewcourses}
                                        name={name}
                                        description={description}
                                        id={id}
                                        isLock={isLock}
                                        progress={progress}
                                        timeAlloted={timeAlloted}
                                        articlesCount={articlesCount}
                                        assignmentCount={assignmentCount}
                                        codingProblemsCount={
                                            codingProblemsCount
                                        }
                                        quizCount={quizCount}
                                    />
                                )
                            )
                        ) : (
                            <div>No Modules Found</div>
                        )}
                    </div>
                </div>

                <div className="gap-y-3 flex flex-col">
                    <div className="flex flex-start">
                        <h1 className="text-lg p-1 font-semibold">
                            Instructor
                        </h1>
                    </div>
                    <div className="bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl  ">
                        <div className="flex flex-col items-center justify-center p-4 gap-3">
                            <Image
                                src={
                                    instructorDetails[0]?.instructorPicture ||
                                    'https://avatar.iran.liara.run/public/boy?username=Ash'
                                }
                                className="rounded-full "
                                alt="instructor profile pic"
                                width={40}
                                height={10}
                            />
                            <span className="text-lg font-semibold">
                                {instructorDetails[0]?.instructorName}
                            </span>
                            <p>
                                Ask doubts or general questions about the
                                programs anytime and get answers within a few
                                hours
                            </p>
                            <Button
                                disabled
                                className="px-4 py-2 rounded-lg mt-2 w-[200px] "
                            >
                                Start New Chat
                            </Button>
                            {/* <Button disabled className="px-4 py-2 rounded-lg mt-2 w-[200px] ">
                View Past Chat
              </Button> */}
                        </div>
                    </div>

                    {/* <div className="flex flex-start">
            <h1 className="text-lg p-1 font-semibold">Upcoming Assignments</h1>
          </div> */}
                    {/* <div>
            <div className="bg-gradient-to-bl mb-3 text-start p-5 from-blue-50 to-violet-50 rounded-xl  ">
              <Link
                href={"/"}
                className="text-md font-semibold capitalize text-black "
              >
                Intro to vairables
              </Link>

              <p className="text-md font-semibold capitalize text-gray-600 mt-2">
                Deadline 5 Feb 2024
              </p>
            </div>
            <div className="bg-gradient-to-bl mb-3 text-start p-5 from-blue-50 to-violet-50 rounded-xl  ">
              <Link
                href={"/"}
                className="text-md font-semibold capitalize text-black"
              >
                Intro to vairables
              </Link>
              <p className="text-md font-semibold capitalize text-gray-600 mt-2">
                Deadline 5 Feb 2024
              </p>
            </div>
          </div> */}
                </div>
            </div>
        </MaxWidthWrapper>
    )
}

export default Page
