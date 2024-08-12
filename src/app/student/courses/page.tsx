'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, Video } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpenText } from 'lucide-react'
import { useLazyLoadedStudentData } from '@/store/store'
import Loader from './_components/Loader'
import { api } from '@/utils/axios.config'
import OptimizedImageWithFallback from '@/components/ImageWithFallback'

interface EnrolledCourse {
    name: string
    coverImage: string
    id: number
    progress: number
    batchId: number
}

interface ResumeCourse {
    bootcampName?: string
    newChapter?: any
    title?: string
    moduleName?: string
    bootcampId?: number
    moduleId?: number
}

type pageProps = {}

const Page: React.FC<pageProps> = () => {
    // misc
    const { studentData } = useLazyLoadedStudentData()

    // state and variables
    const [enrolledCourse, setEnrolledCourse] = useState<EnrolledCourse[]>([])
    const [resumeCourse, setResumeCourse] = useState<ResumeCourse>({})
    const [courseStarted, setCourseStarted] = useState<boolean>(false)
    const userID = studentData?.id && studentData?.id

    // async
    useEffect(() => {
        const getEnrolledCourses = async () => {
            try {
                const response = await api.get(`/student`)
                setEnrolledCourse(response.data)
            } catch (error) {
                console.error('Error getting enrolled courses:', error)
            }
        }
        getEnrolledCourses()
    }, [])

    useEffect(() => {
        const getResumeCourse = async () => {
            try {
                const response = await api.get('tracking/latestUpdatedCourse')
                if (Array.isArray(response.data.data)) {
                    setCourseStarted(false)
                } else {
                    setCourseStarted(false)
                    setCourseStarted(true)
                    setResumeCourse(response.data.data)
                }
            } catch (error) {
                console.error('Error getting resume course:', error)
                setCourseStarted(false)
            }
        }
        if (userID) getResumeCourse()
    }, [userID])

    return (
        <>
            <div className="mx-2 p-5 flex  items-center justify-between bg-gradient-to-bl from-blue-50 to-violet-50 rounded-lg">
                <h1 className="p-1  text-xl font-semibold">My Courses</h1>
            </div>
            <div className="px-2 py-2 md:px-6 md:py-10 ">
                {/* If Course Already Started then Below Message will be displayed: */}
                {enrolledCourse?.length > 0 && courseStarted ? (
                    <div className="flex flex-col flex-start">
                        <h1 className="text-xl p-1 text-start font-bold mb-4">
                            Start From Where You Left Off
                        </h1>
                        <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                            <div className="flex flex-col">
                                <div className="w-full lg:w-[860px]">
                                    <Card className="w-full mb-3 border-none p-5 shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F]">
                                        {/* For Large screen like Laptop and large tab */}
                                        <div className="hidden lg:flex flex-row justify-between items-center gap-6">
                                            <div>
                                                <div className="flex flex-row gap-3">
                                                    <BookOpenText className="hidden sm:block mt-2 w-6 h-6" />
                                                    <h1 className="text-md mt-2 text-start font-bold">
                                                        {
                                                            resumeCourse
                                                                .newChapter
                                                                ?.title
                                                        }
                                                    </h1>
                                                </div>
                                                <div className="flex flex-row gap-4">
                                                    <p className="text-md text-start mt-3 mb-2">
                                                        {
                                                            resumeCourse?.bootcampName
                                                        }
                                                    </p>
                                                    <span className="w-[5px] h-[5px] bg-gray-500 rounded-full self-center"></span>
                                                    <p className="text-md text-start mt-3 mb-2">
                                                        {
                                                            resumeCourse?.moduleName
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-end">
                                                <Button
                                                    variant={'ghost'}
                                                    className="text-lg font-bold"
                                                >
                                                    <Link
                                                        className="gap-3 flex items-center text-secondary"
                                                        href={`/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse.moduleId}`}
                                                    >
                                                        <p>Resume Learning</p>
                                                        <ChevronRight
                                                            size={15}
                                                        />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                        {/* For Small screen like mobile and small tab */}
                                        <div className="lg:hidden">
                                            <div className="flex flex-row gap-4">
                                                <BookOpenText className="mt-2 w-6 h-6" />
                                                <h1 className="text-md mt-2 text-start font-bold">
                                                    {
                                                        resumeCourse.newChapter
                                                            ?.title
                                                    }
                                                </h1>
                                            </div>
                                            <div className="flex flex-row">
                                                <p className="text-md text-start mt-3 mb-2">
                                                    {resumeCourse?.bootcampName}
                                                    &nbsp;-&nbsp;
                                                    {resumeCourse?.moduleName}
                                                </p>
                                            </div>
                                            <div className="text-end">
                                                <Button
                                                    variant={'ghost'}
                                                    className="text-lg font-bold"
                                                >
                                                    <Link
                                                        className="gap-3 flex items-center text-secondary"
                                                        href={`/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse.moduleId}`}
                                                    >
                                                        <p>Resume Learning</p>
                                                        <ChevronRight
                                                            size={15}
                                                        />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : // If No Course Started then Below Message will be displayed:
                null}

                <div className=" flex flex-col items-center justify-center mt-6">
                    <div className="x-5 flex items-center justify-start w-full">
                        <h1 className="p-1 mx-4 text-xl font-semibold ">
                            Enrolled Courses
                        </h1>
                    </div>
                    <div className="container  mx-auto p-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                            {enrolledCourse.length > 0 ? (
                                enrolledCourse.map(
                                    ({
                                        name,
                                        coverImage,
                                        id,
                                        progress,
                                        batchId,
                                    }: {
                                        name: string
                                        coverImage: string
                                        id: number
                                        progress: number
                                        batchId: number
                                    }) => (
                                        <Link
                                            key={id}
                                            href={`courses/${id}/batch/${batchId}`}
                                            className="text-gray-900 text-base"
                                        >
                                            <div className="bg-muted flex justify-center h-[200px] relative overflow-hidden rounded-sm">
                                                <OptimizedImageWithFallback
                                                    src={coverImage}
                                                    alt="Placeholder Image"
                                                    // className="rounded-md object-cover"
                                                    // width={300}
                                                    // height={48}
                                                    fallBackSrc={
                                                        '/logo_white.png'
                                                    }
                                                />
                                            </div>
                                            <div className="px-1 py-4">
                                                {name}
                                            </div>
                                            <Loader progress={progress} />
                                        </Link>
                                    )
                                )
                            ) : (
                                <p>No courses available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Page
