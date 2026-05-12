'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, BookOpen, User, Mail, Calendar, BarChart3, ClipboardCheck, Users } from 'lucide-react'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { getUser } from '@/store/store'
import { api } from '@/utils/axios.config'
import ResumeView from './components/ResumeView'

type PageParams = {
    params: {
        organizationId: string
        courseId: string
        batchId: string
        userId: string
    }
}

type IndividualReportPayload = {
    courseName?: string
    batchName?: string
    students?: Array<{
        userId?: number | string
        name?: string
        email?: string
        overAllAttendance?: number | null
        numberOfAssessmentsAttempted?: number
        averageAssessmentPercentage?: number | null
        assessments?: unknown[]
        oneOnOneSessionsCompleted?: number
        profile?: string | null
    }>
}

const IndividualReportPage = ({ params }: PageParams) => {
    const pathname = usePathname()
    const { user } = getUser()
    const [loading, setLoading] = useState(true)
    const [reportData, setReportData] = useState<IndividualReportPayload | null>(
        null
    )
    const fetchedKeyRef = useRef<string>('')

    const role = pathname.split('/')[1] || 'admin'
    const orgId = Number(params.organizationId) || user?.orgId

    useEffect(() => {
        const fetchKey = `${params.batchId}-${params.userId}`
        if (fetchedKeyRef.current === fetchKey) {
            return
        }
        fetchedKeyRef.current = fetchKey

        const fetchIndividualReport = async () => {
            try {
                setLoading(true)
                const response = await api.get('/admin/overall-analysis', {
                    params: {
                        batchId: Number(params.batchId),
                        userId: Number(params.userId),
                    },
                })

                const apiData = response?.data?.data || {}
                const students = Array.isArray(apiData?.students)
                    ? apiData.students
                    : []

                const selectedStudent =
                    students.find(
                        (item: any) =>
                            String(item?.userId ?? item?.id ?? '') ===
                            String(params.userId)
                    ) || students[0]

                setReportData({
                    courseName: apiData?.courseName || '',
                    batchName: apiData?.batchName || '',
                    students: selectedStudent ? [selectedStudent] : [],
                })
            } catch (error) {
                console.error('Failed to fetch individual report', error)
                setReportData(null)
            } finally {
                setLoading(false)
            }
        }

        fetchIndividualReport()
    }, [params.batchId, params.userId])

    const student = reportData?.students?.[0]

    return (
        <>
            <Link
                href={`/${role}/organizations/${orgId}/courses/${params.courseId}/batch/${params.batchId}`}
                className="flex space-x-2 w-[220px] text-foreground mt-8 hover:text-primary"
            >
                <ArrowLeft size={20} />
                <p className="ml-1 inline-flex text-sm font-medium md:ml-2">
                    Back to Batch Students
                </p>
            </Link>

            <MaxWidthWrapper className="p-4 text-gray-600">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Spinner className="text-[rgb(81,134,114)]" />
                    </div>
                ) : reportData ? (
                    <ResumeView
                        student={student}
                        courseName={reportData?.courseName}
                        batchName={reportData?.batchName}
                    />
                ) : (
                    <Card className="mb-6">
                        <CardContent className="py-6 text-sm text-muted-foreground">
                            Report data is unavailable. Open this page from the batch table using View Report.
                        </CardContent>
                    </Card>
                )}
            </MaxWidthWrapper>
        </>
    )
}

export default IndividualReportPage
