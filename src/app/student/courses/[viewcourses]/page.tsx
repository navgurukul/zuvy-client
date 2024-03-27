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
import api from '@/utils/axios.config'
import { Button } from '@/components/ui/button'

interface CourseProgress {
    status: string
    info: {
        progress: number
        bootcamp_name: string
        instructor_name: string
        instructor_profile_picture: string
    }
    code: number
}

import ClassCard from '@/app/admin/courses/[courseId]/_components/classCard'
import CourseCard from '@/app/_components/courseCard'
type PageProps = {
    params: {
        viewcourses: string
    }
}

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
    const [upcomingClasses, setUpcomingClasses] = useState([])
    const [ongoingClasses, setOngoingClasses] = useState([])
    const [completedClasses, setCompletedClasses] = useState([])
    const crumbs = [
        { crumb: 'My Courses', href: '/student/courses' },
        {
            crumb: courseProgress?.info?.bootcamp_name || 'Course',
            href: `/student/courses/${params.viewcourses}`,
        },
    ]
    useEffect(() => {
        // const userIdLocal = JSON.parse(localStorage.getItem("AUTH") || "");

        api.get(`/bootcamp/studentClasses/${params.viewcourses}`, {
            params: {
                userId: userID,
            },
        })
            .then((response) => {
                const { upcomingClasses, ongoingClasses, completedClasses } =
                    response.data
                setUpcomingClasses(upcomingClasses)
                setOngoingClasses(ongoingClasses)
                setCompletedClasses(completedClasses)
            })
            .catch((error) => {
                console.log('Error fetching classes:', error)
            })
    }, [userID])

    useEffect(() => {
        const getModulesProgress = async () => {
            try {
                const response = await api.get(
                    `/Content/modules/${params.viewcourses}?user_id=${userID}`
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
                    `/bootcamp/${userID}/progress?bootcamp_id=${params.viewcourses}`
                )
                setCourseProgress(response.data)
            } catch (error) {
                console.error('Error getting course progress:', error)
            }
        }
        if (userID) getCourseProgress()
    }, [userID])

    return (
        <MaxWidthWrapper>
            <Breadcrumb>
                <BreadcrumbList>
                    {crumbs?.map((item, index) => (
                        <>
                            <BreadcrumbItem key={item.crumb}>
                                <BreadcrumbLink href={item.href}>
                                    {item.crumb}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            {index < crumbs.length - 1 && (
                                <BreadcrumbSeparator />
                            )}
                        </>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>

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
                                {courseProgress?.info?.bootcamp_name}
                            </p>
                            <Loader progress={courseProgress?.info?.progress} />
                        </div>
                    </div>

                    <div className="gap-y-3 flex flex-col">
                        <div className="flex left-0  ">
                            <p className="text-lg p-1 font-bold">
                                Upcoming Classes
                            </p>
                        </div>
                        {ongoingClasses?.length > 0 ||
                        upcomingClasses?.length > 0 ? null : (
                            <div className="flex flex-col items-center mt-12">
                                <Image
                                    src={'/no-class.svg'}
                                    alt="party popper"
                                    width={'240'}
                                    height={'240'}
                                />
                                <p className="text-lg mt-3">
                                    There are no upcoming classes
                                </p>
                            </div>
                        )}

                        {ongoingClasses?.length > 0
                            ? ongoingClasses.map((classObj, index) => (
                                  <ClassCard
                                      classData={classObj}
                                      key={index}
                                      classType="ongoing"
                                  />
                              ))
                            : null}

                        {upcomingClasses?.length > 0
                            ? upcomingClasses.map((classObj, index) => (
                                  <ClassCard
                                      classData={classObj}
                                      key={index}
                                      classType="Upcoming"
                                  />
                              ))
                            : null}

                        <div className="flex justify-center mt-3">
                            <Link
                                href={`/student/courses/${params.viewcourses}/recordings`}
                            >
                                <div className="flex items-center border rounded-md border-secondary px-3 py-1 text-secondary">
                                    <h1 className="text-lg p-1 font-bold">
                                        See All Classes and Recording
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
                                    id,
                                    lock,
                                    progress,
                                }: {
                                    name: string
                                    id: number
                                    lock: boolean
                                    progress: number
                                }) => (
                                    <CourseCard
                                        key={id}
                                        param={params.viewcourses}
                                        name={name}
                                        id={id}
                                        lock={lock}
                                        progress={progress}
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
                                    courseProgress?.info
                                        ?.instructor_profile_picture ?? ''
                                }
                                className="rounded-full "
                                alt="instructor profile pic"
                                width={40}
                                height={10}
                            />
                            <span className="text-lg font-semibold">
                                {courseProgress?.info?.instructor_name}
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
