'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import OptimizedImageWithFallback from '@/components/ImageWithFallback'
import Link from 'next/link'

type Props = {}

interface EnrolledCourse {
    bootcampDetail: any
}

const Page = (props: Props) => {
    const [enrolledCourse, setEnrolledCourse] = useState<EnrolledCourse[]>([])

    useEffect(() => {
        const getEnrolledCourses = async () => {
            try {
                const response = await api.get(`/instructor/allCourses`)
                setEnrolledCourse(response.data.data)
            } catch (error) {
                console.error('Error getting enrolled courses:', error)
            }
        }
        getEnrolledCourses()
    }, [])

    return (
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
                            ({ bootcampDetail }: { bootcampDetail: any }) => (
                                <Link
                                    key={bootcampDetail.id}
                                    // href={`courses/${id}/batch/${batchId}`} /batch/${302}
                                    href={`courses/${bootcampDetail.id}`}
                                    className="text-gray-900 text-base"
                                >
                                    <div className="bg-muted flex justify-center h-[200px] relative overflow-hidden rounded-sm">
                                        <OptimizedImageWithFallback
                                            // src={coverImage}
                                            src={'/logo_white.png'}
                                            alt="Placeholder Image"
                                            fallBackSrc={'/logo_white.png'}
                                        />
                                    </div>
                                    <div className="px-1 py-4">
                                        {bootcampDetail.name}
                                    </div>
                                </Link>
                            )
                        )
                    ) : (
                        <p>No courses available.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Page
