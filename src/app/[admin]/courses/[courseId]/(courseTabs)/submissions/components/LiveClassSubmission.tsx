import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowDownToLine, ChevronRight, Play,Eye } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import Link from 'next/link'
import Image from 'next/image'
import moment from 'moment'
import {LiveClassSubmissionSkeleton} from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'
import useDownloadCsv from '@/hooks/useDownloadCsv'


interface LiveClassSubmissionsProps {
    courseId: string
    debouncedSearch: string
}

const LiveClassSubmissions: React.FC<LiveClassSubmissionsProps> = ({
    courseId,
    debouncedSearch,
}) => {
    const { downloadCsv } = useDownloadCsv()
    const [liveClassData, setLiveClassData] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)
    const [loading, setLoading] = useState(true)

    const getLiveClassData = useCallback(async () => {
        try {
            let url = `/submission/livesession/zuvy_livechapter_submissions?bootcamp_id=${courseId}`
            if (debouncedSearch) {
                url += `&searchTerm=${encodeURIComponent(debouncedSearch)}`
            }

            const res = await api.get(url)
            const trackingData = res.data?.data?.trackingData || []
            setLiveClassData(trackingData)
            setTotalStudents(res.data?.data?.totalStudents || 0)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching live class data:', error)
            setLiveClassData([])
            setTotalStudents(0)
            toast({
                title: 'Error',
                description: 'Failed to fetch live class data',
                variant: 'destructive',
            })
        } 
    }, [courseId, debouncedSearch])

    useEffect(() => {
        if (courseId) {
            getLiveClassData()
        }
    }, [courseId, debouncedSearch, getLiveClassData])
      
    const handleDownloadCsv = (liveClassId: string, liveClassTitle: string) => {
        if (!liveClassId) return
      
        downloadCsv({
          endpoint: `/submission/livesession/zuvy_livechapter_student_submission/${liveClassId}`,
          fileName: liveClassTitle || 'live-class-report',
      
          dataPath: 'data.data',
      
          columns: [
            { header: 'Name', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Status', key: 'status' },
            { header: 'Duration (min)', key: 'duration' },
            { header: 'Batch', key: 'batch' },
          ],
      
          mapData: (record: any) => ({
            name: record.user?.name || 'N/A',
            email: record.user?.email || 'N/A',
            status: record.status || 'N/A',
            duration: ((record.duration || 0) / 60).toFixed(2),
            batch: record.batchName || 'N/A',
          }),
        })
      }
      
    if (loading) {
         return <LiveClassSubmissionSkeleton/>
    }

    // Flatten all live classes from all modules
    const allLiveClasses = liveClassData.flatMap((module) =>
        (module.moduleChapterData || []).map((liveClass: any) => ({
            ...liveClass,
            moduleName: module.name,
            moduleId: module.id,
        }))
    )

    if (allLiveClasses.length === 0) {
        return (
            <div className="w-full flex flex-col justify-center items-center h-4/5">
                <p className="text-center text-muted-foreground max-w-md">
                    {debouncedSearch
                        ? `No Live Classes Found for "${debouncedSearch}"`
                        : ' No Live Classes submissions available from the students yet. Please wait until the first submission'}
                </p>
                <Image
                    src="/emptyStates/empty-submissions.png"
                    alt="No Live Classes Found"
                    width={120}
                    height={120}
                />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-4">
            {allLiveClasses.map((liveClass: any) => {
                const submissions = liveClass.submitStudents || 0

                return (
                    <div
                        key={liveClass.id}
                        className="relative bg-card border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow mb-5"
                    >
                        <div className="absolute top-2 right-2 z-10 flex items-center">
                        {submissions > 0 ? (
                            <button
                                onClick={() => handleDownloadCsv(liveClass.id, liveClass.title)}
                                className="hover:text-gray-700 cursor-pointer"
                                title="Download Report"
                            >
                                <ArrowDownToLine size={20} className="text-gray-500" />
                            </button>
                        ) : (
                            <div className="relative group inline-flex">
                            <span className="pointer-events-none">
                                <button disabled className="cursor-not-allowed">
                                <ArrowDownToLine size={20} className="text-gray-300" />
                                </button>
                            </span>

                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">
                                No submissions available   
                            </div>
                            </div>
                        )}
                        {submissions > 0 ? (
                            <Link
                                href={`/admin/courses/${courseId}/submissionLiveClass/${liveClass.id}`}
                            >
                                <Button
                                    variant="ghost"
                                    className="hover:bg-white-600 hover:text-gray-700 text-gray-500"
                                >
                                    <Eye size={20} />
                                </Button>
                            </Link>
                        ) : (
                            <div className="relative group inline-flex">
                                <span className="pointer-events-none">
                                    <Button
                                    variant="ghost"
                                    disabled
                                    className="cursor-not-allowed"
                                    >
                                    <Eye size={20} className="text-gray-400" />
                                    </Button>
                                </span>

                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">
                                    No submissions to view
                                </div>
                            </div>
                        )}
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-md">
                                    <Play className="w-4 h-4" />
                                </div>
                                <h3 className="font-medium text-base">
                                    {liveClass.title || 'Untitled Live Class'}
                                </h3>
                            </div>
                            <div className="flex items-center justify-between mt-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Badge
                                        variant="outline"
                                        className="text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                                    >
                                        {submissions} submissions
                                    </Badge>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                >
                                    {totalStudents - submissions} pending
                                </Badge>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default LiveClassSubmissions