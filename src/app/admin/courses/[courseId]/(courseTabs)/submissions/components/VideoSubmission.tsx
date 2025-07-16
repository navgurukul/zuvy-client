'use client'
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'

const VideoSubmission = ({ courseId, debouncedSearch }: any) => {
    const [videoData, setVideoData] = useState<any>()

    const getVideoSubmission = useCallback(async () => {
        try {
            const url = debouncedSearch
                ? `/admin/bootcampModuleCompletion/bootcamp_id${courseId}?searchAssessment=${debouncedSearch}`
                : `/admin/bootcampModuleCompletion/bootcamp_id${courseId}`

            const res = await api.get(url)
            setVideoData(res.data)
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Error fetching assessments:',
            })
        }
    }, [courseId, debouncedSearch])

    useEffect(() => {
        getVideoSubmission()
    }, [getVideoSubmission])

    return (
        <div className="grid relative gap-8 mt-4 md:mt-8">
            {videoData && Object.hasOwn(videoData, 'message') ? (
                <div className="w-screen flex flex-col justify-center items-center h-4/5">
                    <h5 className="text-center font-semibold">
                        No Video Found
                    </h5>
                    <Image
                        src="/emptyStates/curriculum.svg"
                        alt="No Video Found"
                        width={400}
                        height={400}
                    />
                </div>
            ) : (
                videoData &&
                Object.keys(videoData).map(
                    (key) =>
                        key !== 'totalStudents' && (
                            <div key={key}>
                                {videoData[key].length && (
                                    <h2 className="text-lg text-start font-bold text-gray-900 dark:text-white">
                                        Module - {key}
                                    </h2>
                                )}
                                <div className="grid md:grid-cols-3 gap-3">
                                    {videoData[key].length &&
                                        videoData[key].map((video: any) => {
                                            const isDisabled =
                                                video.completedStudents === 0
                                            const chapterId = video.id

                                            const submissionPercentage =
                                                video.completedStudents > 0
                                                    ? videoData.totalStudents /
                                                      video.completedStudents
                                                    : 0
                                            return (
                                                <div
                                                    className="relative lg:flex py-5 h-[120px] w-full shadow-[0_4px_4px_rgb(1,1,0,0.12)] my-4 rounded-md p-3"
                                                    key={video.id}
                                                >
                                                    {/* Content */}
                                                    <div className="font-semibold pl-3 flex w-full flex-col justify-between">
                                                        <h1 className="w-1/2 text-start text-sm">
                                                            {video.title}
                                                        </h1>
                                                        <h2 className="w-1/2 flex mt-2">
                                                            <div className="text-start flex gap-x-2">
                                                                <div className="flex items-center justify-center">
                                                                    <div
                                                                        className={`w-2 h-2 rounded-full flex items-center justify-center ${
                                                                            submissionPercentage >=
                                                                            0.8
                                                                                ? 'bg-green-300'
                                                                                : submissionPercentage <=
                                                                                      0.8 &&
                                                                                  submissionPercentage >=
                                                                                      0.5
                                                                                ? 'bg-yellow-300'
                                                                                : 'bg-red-500'
                                                                        }`}
                                                                    ></div>
                                                                </div>
                                                                <p className="text-sm">
                                                                    {
                                                                        video.completedStudents
                                                                    }
                                                                    /
                                                                    {
                                                                        videoData.totalStudents
                                                                    }
                                                                </p>
                                                                <h3 className="text-gray-400 text-sm font-semibold cursor-not-allowed">
                                                                    Submissions
                                                                </h3>
                                                            </div>
                                                        </h2>

                                                        {/* Fix View Submissions button to right bottom corner */}
                                                        <div className="w-full flex justify-end">
                                                            {video.completedStudents >
                                                            0 ? (
                                                                <Button
                                                                    variant={
                                                                        'secondary'
                                                                    }
                                                                    className="flex items-center border-none text-green-700 hover:text-green-800 hover:bg-popover"
                                                                >
                                                                    <Link
                                                                        href={`/admin/courses/${courseId}/submissionVideo/${video.id}`}
                                                                    >
                                                                        View
                                                                        Submissions
                                                                    </Link>
                                                                    <ChevronRight
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant={
                                                                        'secondary'
                                                                    }
                                                                    className="flex items-center border-none text-green-700 hover:text-green-800 hover:bg-popover"
                                                                    disabled={
                                                                        true
                                                                    }
                                                                >
                                                                    View
                                                                    Submissions
                                                                    <ChevronRight
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>
                        )
                )
            )}
        </div>
    )
}

export default VideoSubmission
