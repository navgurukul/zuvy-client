'use client'
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, Play, Eye } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import {
    VideoSubmissions,
    VideoData,
} from '@/app/[admin]/courses/[courseId]/(courseTabs)/submissions/components/courseSubmissionComponentType'

const VideoSubmission = ({ courseId, debouncedSearch }: any) => {
    const [videoData, setVideoData] = useState<VideoData | null>(null)

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
                <div className="flex flex-col justify-center items-center">
                    <p className="text-center text-muted-foreground max-w-md">
                        No Video submissions available from the students yet.
                        Please wait until the first submission
                    </p>
                    <Image
                        src="/emptyStates/empty-submissions.png"
                        alt="No Video Found"
                        width={120}
                        height={120}
                        className="mb-6"
                    />
                </div>
            ) : (
                videoData &&
                Object.keys(videoData).map((key) => {
                    if (['totalStudents', 'totalRows', 'message'].includes(key))
                        return null
                    const videosArray: any[] = Array.isArray(videoData[key])
                        ? (videoData[key] as any[])
                        : []

                    const filteredVideos = videosArray.filter((video: any) =>
                        debouncedSearch
                            ? (video.title || '')
                                  .toLowerCase()
                                  .includes(debouncedSearch.toLowerCase())
                            : true
                    )
                    if (filteredVideos.length === 0) return null
                    return (
                        <div key={key}>
                            <h2 className="text-lg text-start font-bold text-gray-900 dark:text-white">
                                Module - {key}
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {filteredVideos.map(
                                    (video: VideoSubmissions) => {
                                        const isDisabled =
                                            video.completedStudents === 0
                                        const submissionPercentage =
                                            video.completedStudents > 0
                                                ? videoData.totalStudents /
                                                  video.completedStudents
                                                : 0
                                        return (
                                            <div
                                                className="relative bg-card border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                                                key={video.id}
                                            >
                                                {/* Content */}
                                                <div className="font-semibold  flex w-full flex-col justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 rounded-md">
                                                            <Play className="w-4 h-4" />
                                                        </div>
                                                        <h3 className="font-medium text-base">{video.title}</h3>
                                                    </div>
                                                </div>
                                                <div className="absolute top-3 right-3">
                                                    {video.completedStudents >
                                                        0 ? (
                                                            
                                                        <Link
                                                            href={`/admin/courses/${courseId}/submissionVideo/${video.id}`}
                                                        >
                                                            <Button
                                                            variant="ghost"
                                                            className="flex items-center text-gray-500  hover:text-gray-700 hover:bg-transparent"
                                                           
                                                        >
                                                             <Eye
                                                                    size={
                                                                        20
                                                                    }
                                                                    className="ml-1"
                                                                />
                                                        </Button>
                                                               
                                                           

                                                        </Link>

                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            className="hover:text-gray-400 transition-colors"
                                                            disabled={
                                                                true
                                                            }
                                                        >
                                                            <Eye
                                                                size={
                                                                    20
                                                                }
                                                                className="ml-1"
                                                            />
                                                        </Button>
                                                    )}
                                                </div>
                                               
                                                <div className="flex items-center justify-between mt-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                                                        >
                                                            {
                                                                video.completedStudents
                                                            }{' '}
                                                            submissions
                                                        </Badge>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                                    >
                                                        {videoData.totalStudents -
                                                            video.completedStudents}{' '}
                                                        pending
                                                    </Badge>
                                                </div>
                                            </div>
                                        )
                                    }
                                )}
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}

export default VideoSubmission
