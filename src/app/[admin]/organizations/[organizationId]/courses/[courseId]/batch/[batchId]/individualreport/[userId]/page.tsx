'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { getUser } from '@/store/store'
import useOverallAnalysis from '@/app/[admin]/hooks/useOverallAnalysis'
import ResumeView from './components/ResumeView'

type PageParams = {
    params: {
        organizationId: string
        courseId: string
        batchId: string
        userId: string
    }
}

const IndividualReportPage = ({ params }: PageParams) => {
    const pathname = usePathname()
    const { user } = getUser()

    const role = pathname.split('/')[1] || 'admin'
    const orgId = Number(params.organizationId) || user?.orgId
    const {
        data: reportData,
        loading,
    } = useOverallAnalysis({
        batchId: params.batchId,
        userId: params.userId,
    })

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
