'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { BookMinus, ChevronRight, Lock } from 'lucide-react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import {
    Breadcrumb,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getParamBatchId, useLazyLoadedStudentData } from '@/store/store'
import { BreadcrumbItem, CircularProgress } from '@nextui-org/react'
import Loader from '../../../_components/Loader'
import Image from 'next/image'
import { api } from '@/utils/axios.config'
import { Button } from '@/components/ui/button'
import ClassCard from '@/app/admin/courses/[courseId]/_components/classCard'
import CourseCard from '@/app/_components/courseCard'
import BreadcrumbCmponent from '@/app/_components/breadcrumbCmponent'
import SubmissionCard from '@/app/admin/courses/[courseId]/_components/SubmissionCard'
import { progress } from 'framer-motion'
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

function Page({
    params,
}: {
    params: { viewcourses: string; batchId: number; moduleID: string }
}) {
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const [modulesProgress, setModulesProgress] = useState([])
    const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(
        null
    )
    const { setIsParamBatchId } = getParamBatchId()
    const [instructorDetails, setInstructorDetails] = useState<any>()
    const [allClasses, setAllClasses] = useState<any[]>([])
    const [upcomingClasses, setUpcomingClasses] = useState([])
    const [ongoingClasses, setOngoingClasses] = useState([])
    const [upcomingAssignments, setUpcomingAssignments] = useState([])
    const [lateAssignments, setLateAssignments] = useState([])
    const [isCourseStarted, setIsCourseStarted] = useState(false)
    const [progres, setProgres] = useState<number>()

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

    // setIsParamBatchId(params.batchId)
    const getUpcomingClassesHandler = useCallback(async () => {
        const response = await api.get(
            `/student/Dashboard/classes/?batch_id=${params.batchId}`
        )
        if (Array.isArray(response.data.data)) {
            setIsCourseStarted(false)
        } else {
            setIsCourseStarted(true)
            const classes = [
                ...response.data.data.filterClasses.ongoing,
                ...response.data.data.filterClasses.upcoming,
            ]
            setAllClasses(classes)
            await api
                .get(
                    `/student/Dashboard/classes/?batch_id=${params.batchId}&limit=2&offset=0`
                )
                .then((res) => {
                    setUpcomingClasses(res.data.data.filterClasses.upcoming)
                    setOngoingClasses(res.data.data.filterClasses.ongoing)
                })
        }
    }, [params.batchId])
    const getAttendanceHandler = useCallback(async () => {
        await api.get(`/student/Dashboard/attendance`).then((res) => {
            setAttendenceData(res.data)
        })
    }, [])
    const getUpcomingSubmissionHandler = useCallback(async () => {
        await api
            .get(
                `/tracking/allupcomingSubmission?bootcampId=${params.viewcourses}`
            )
            .then((res) => {
                setUpcomingAssignments(res.data?.data?.upcomingAssignments)
                setLateAssignments(res.data?.data?.lateAssignments)
            })
    }, [params.viewcourses])
    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                getUpcomingClassesHandler(),
                getAttendanceHandler(),
                getUpcomingSubmissionHandler(),
            ])
        }
        setIsParamBatchId(params.batchId)

        fetchData()
    }, [
        getUpcomingSubmissionHandler,
        getUpcomingClassesHandler,
        params.batchId,
        getAttendanceHandler,
        setIsParamBatchId,
    ])

    useEffect(() => {
        const getModulesProgress = async () => {
            try {
                const response = await api.get(
                    `/tracking/allModulesForStudents/${params.viewcourses}`
                )
                response.data.map((module: any) => {
                    const modules = response.data.filter(
                        (module: any) =>
                            module.articlesCount +
                                module.assignmentCount +
                                module.codingProblemsCount +
                                module.formCount >
                            0
                    )
                    setModulesProgress(modules)
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
                    `/tracking/bootcampProgress/${params.viewcourses}`
                )
                setCourseProgress(response.data.data)
                setProgres(response.data.data.progress)

                setInstructorDetails(response.data.instructorDetails)
            } catch (error) {
                console.error('Error getting course progress:', error)
            }
        }
        if (userID) getCourseProgress()
    }, [userID, params.viewcourses])

    console.log('modulesProgress', modulesProgress)

    return (
        <MaxWidthWrapper>
            <BreadcrumbCmponent crumbs={crumbs} />

            <div className="md:grid grid-cols-2 lg:grid-cols-3 gap-10  my-10">
                <div className="lg:col-span-2 w-full">
                    <div className="flex items-center gap-3 mt-2 mb-10">
                        <div>
                            <Image
                                src={'/course.svg'}
                                alt="Course"
                                width={'50'}
                                height={'50'}
                            />
                        </div>
                        <div className="grow text-start lg:max-w-[790px]">
                            <p className="text-xl font-bold mb-2">
                                {courseProgress?.bootcampTracking?.name}
                            </p>
                            <div className="relative flex items-center justify-center group">
                                {/* Percentage Text */}

                                <div className="w-full flex items-start">
                                    <Loader
                                        progress={courseProgress?.progress}
                                    />
                                </div>

                                {/* Circular Progress */}
                                <div className="absolute -top-16 invisible group-hover:visible">
                                    <CircularProgress
                                        classNames={{
                                            svg: 'w-9 h-9',
                                            indicator: 'text-gray-400',
                                            track: 'stroke-green-500',
                                            value: 'text-sm font-bold',
                                        }}
                                        value={progres}
                                        strokeWidth={4}
                                        showValueLabel={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="gap-y-3 flex flex-col">
                        <div className="flex left-0">
                            <p className="text-lg p-1 font-bold">
                                Upcoming Classes
                            </p>
                        </div>
                        <div className="flex flex-col justify-between">
                            {isCourseStarted && allClasses?.length > 0 ? (
                                <div className="flex flex-col">
                                    <div className="w-full lg:max-w-[850px]">
                                        {ongoingClasses.map(
                                            (classData: any, index) => (
                                                <ClassCard
                                                    classData={classData}
                                                    classType={classData.status}
                                                    key={index}
                                                    activeTab={'ongoing'}
                                                    studentSide={true}
                                                    getClasses={() =>
                                                        console.log('')
                                                    }
                                                />
                                            )
                                        )}
                                        {upcomingClasses.map(
                                            (classData: any, index) => (
                                                <ClassCard
                                                    classData={classData}
                                                    classType={classData.status}
                                                    key={index}
                                                    activeTab={'Upcoming'}
                                                    studentSide={true}
                                                    getClasses={() =>
                                                        console.log('')
                                                    }
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
                        </div>

                        {allClasses?.length > 2 && (
                            <div className="flex justify-center mt-3 w-3/4">
                                <Link
                                    href={`/student/courses/${params.viewcourses}/batch/${params.batchId}/classes`}
                                >
                                    <div className="flex items-center border rounded-md border-secondary px-3 py-1 text-secondary">
                                        <h1 className="text-lg p-1 font-bold">
                                            See All Upcoming Classes
                                        </h1>
                                        <ChevronRight size={20} />
                                    </div>
                                </Link>
                            </div>
                        )}
                        <div className="flex flex-col flex-start">
                            <div className="w-full lg:max-w-[850px]">
                                {upcomingAssignments &&
                                    upcomingAssignments.length > 0 && (
                                        <div className="flex flex-col">
                                            {upcomingAssignments.length > 0 && (
                                                <h1 className="text-lg p-1 text-start font-bold mb-4">
                                                    Upcoming Assignments
                                                </h1>
                                            )}
                                            {upcomingAssignments.map(
                                                (data: any, index) => (
                                                    <SubmissionCard
                                                        classData={data}
                                                        key={index}
                                                        status={
                                                            'upcomingAssignment'
                                                        }
                                                        view={'course'}
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 w-full lg:max-w-[860px]">
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
                                    typeId,
                                    projectId,
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
                                    typeId: number
                                    projectId: number
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
                                        typeId={typeId}
                                        projectId={projectId}
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
                    <div className="bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl">
                        {instructorDetails ? (
                            <div className="flex flex-col items-center justify-center p-4 gap-3">
                                <Image
                                    src={
                                        instructorDetails.instructorProfilePicture ||
                                        'https://avatar.iran.liara.run/public/boy?username=Ash'
                                    }
                                    className="rounded-full "
                                    alt="instructor profile pic"
                                    width={40}
                                    height={10}
                                />
                                <span className="text-lg font-semibold">
                                    {instructorDetails.instructorName}
                                </span>
                                <p>
                                    Ask doubts or general questions about the
                                    programs anytime and get answers within a
                                    few hours
                                </p>
                                <Button
                                    disabled
                                    className="px-4 py-2 rounded-lg mt-2 w-[200px] "
                                >
                                    Start New Chat
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-4 gap-3">
                                <p className="text-lg font-semibold">
                                    Instructor details not available
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col flex-start mt-5">
                        <div className="w-full">
                            {lateAssignments && (
                                <div className="flex flex-col w-full lg:max-w-[860px]">
                                    {lateAssignments.length > 0 && (
                                        <h1 className="text-lg p-1 text-start font-bold mb-4">
                                            Late Assignments
                                        </h1>
                                    )}
                                    {lateAssignments.map((data: any, index) => (
                                        <SubmissionCard
                                            classData={data}
                                            key={index}
                                            status={'lateAssignmet'}
                                            view={'course'}
                                        />
                                    ))}
                                </div>
                            )}
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
        //   </div> */}
                </div>
            </div>
        </MaxWidthWrapper>
    )
}

export default Page
