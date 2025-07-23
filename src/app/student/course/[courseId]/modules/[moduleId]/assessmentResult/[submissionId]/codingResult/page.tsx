'use client'

import { useLazyLoadedStudentData } from '@/store/store'
import React, { useEffect } from 'react'
import CodingSubmission from '@/app/student/course/[courseId]/studentAssessment/_studentAssessmentComponents/CodingSubmission'
import { useSearchParams } from 'next/navigation'
import { useCodingSubmissions } from '@/hooks/useCodingSubmissions'
import {PageParams} from '@/app/student/course/[courseId]/modules/[moduleId]/assessmentResult/[submissionId]/codingResult/courseModuleStudentAssesmentQuizResultTypes.ts'

const Page = ({ params }: { params: PageParams }) => {
    const { studentData } = useLazyLoadedStudentData()
    const searchParams = useSearchParams()
    
    // Get query parameters
    const codingOutsourseId = searchParams.get('codingOutsourseId')
    const questionId = searchParams.get('questionId')
    
    // Use the custom hook for API call
    const { data: codingSubmissionsData, loading, error } = useCodingSubmissions({
        codingOutsourseId,
        assessmentSubmissionId: params.submissionId,
        questionId,
        enabled: !!studentData?.id // Only fetch when user data is available
    })    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
                <div className="text-center bg-card border border-border rounded-2xl p-8 shadow-lg">
                    <div className="animate-pulse mb-6">
                        <div className="w-12 h-12 bg-primary rounded-full mx-auto"></div>
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">Loading Submission</h2>
                    <p className="text-muted-foreground">Fetching your coding submission details...</p>
                </div>
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 flex items-center justify-center">
                <div className="max-w-lg w-full">
                    <div className="bg-card border border-destructive/20 rounded-2xl p-8 shadow-lg">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                                    <span className="text-destructive text-lg font-bold">!</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-destructive mb-3">Unable to Load Submission</h3>
                                <p className="text-muted-foreground">{error}</p>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
            <CodingSubmission codingSubmissionsData={codingSubmissionsData} />
        </div>
    )
}

export default Page
