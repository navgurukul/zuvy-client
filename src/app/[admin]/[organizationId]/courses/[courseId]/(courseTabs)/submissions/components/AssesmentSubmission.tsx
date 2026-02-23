'use client'
import React, { useCallback, useEffect, useState } from 'react'
import AssesmentComponent from '../../../_components/AssesmentComponent'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'
import useDebounce from '@/hooks/useDebounce'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
    AssessmentSubmissions,
    StudentAssessmentSubmission,
    APIResponses,
} from '@/app/[admin]/[organizationId]/courses/[courseId]/(courseTabs)/submissions/components/courseSubmissionComponentType'
// import assesmentNotfound from @/public
import {AssessmentSubmissionSkeleton} from '@/app/[admin]/[organizationId]/courses/[courseId]/_components/adminSkeleton'
import useDownloadCsv from '@/hooks/useDownloadCsv'


const AssesmentSubmissionComponent = ({ courseId, searchTerm }: any) => {
    const { downloadCsv } = useDownloadCsv()
    const [assesments, setAssesments] = useState<AssessmentSubmissions | null>(
        null
    )
    const [loading, setLoading] = useState(true)
    const debouncedSearch = useDebounce(searchTerm, 300)

    const getAssessments = useCallback(async () => {
        try {
            const url = debouncedSearch
                ? `/admin/bootcampAssessment/bootcamp_id${courseId}?searchAssessment=${debouncedSearch}`
                : `/admin/bootcampAssessment/bootcamp_id${courseId}`

            const res = await api.get(url)
            setAssesments(res.data)
             setLoading(false)
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Error fetching assessments:',
            })
        }
    }, [courseId, debouncedSearch])

    useEffect(() => {
        getAssessments()
    }, [getAssessments])

    const handleDownloadCsv = (assessment: AssessmentSubmissions) => {
        if (!assessment) return
      
        downloadCsv({
          endpoint: `/admin/assessment/students/assessment_id${assessment.id}`,
          fileName: `${assessment.title}-Report`,
      
          dataPath: 'submitedOutsourseAssessments',
      
          columns: [
            { header: 'Name', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Qualified', key: 'qualified' },
            { header: 'Percentage', key: 'percentage' },
            ...(assessment.totalCodingQuestions > 0
              ? [{ header: 'Coding Score', key: 'codingScore' }]
              : []),
            ...(assessment.totalMcqQuestions > 0
              ? [{ header: 'MCQ Score', key: 'mcqScore' }]
              : []),
            { header: 'Tab Changed', key: 'tabChange' },
            { header: 'Copy Pasted', key: 'copyPaste' },
          ],
      
          mapData: (student) => ({
            name: student.name || 'N/A',
            email: student.email || 'N/A',
            qualified: student.isPassed ? 'Yes' : 'No',
            percentage: `${(student.percentage || 0).toFixed(2)}%`,
            codingScore: (student.codingScore ?? 0).toFixed(2),
            mcqScore: (student.mcqScore ?? 0).toFixed(2),
            tabChange: student.tabChange ?? 0,
            copyPaste: student.copyPaste ?? 0,
          }),
        })
      }
      
    if(loading){
        return<AssessmentSubmissionSkeleton/>
    }
    return (
        <div className="grid relative gap-8 mt-4 md:mt-8">
            {assesments ? (
                Object.keys(assesments).length > 0 ? (
                    Object.keys(assesments).map(
                        (key) =>
                            key !== 'totalStudents' && (
                                <div key={key}>
                                    <h2 className="text-lg text-start font-bold text-gray-900 dark:text-white mb-4">
                                        Module - {key}
                                    </h2>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {Array.isArray(assesments[key]) &&
                                            assesments[key].map(
                                                (assessment: AssessmentSubmissions) => (
                                                    <AssesmentComponent
                                                        key={assessment.id}
                                                        id={Number(assessment.id)}
                                                        title={assessment.title}
                                                        codingChallenges={
                                                            assessment.totalCodingQuestions
                                                        }
                                                        mcq={
                                                            assessment.totalMcqQuestions
                                                        }
                                                        openEnded={
                                                            assessment.totalOpenEndedQuestions
                                                        }
                                                        totalSubmissions={
                                                            assesments?.totalStudents
                                                        }
                                                        studentsSubmitted={
                                                            assessment.totalSubmitedAssessments
                                                        }
                                                        bootcampId={courseId}
                                                        qualifiedStudents={
                                                            assessment.qualifiedStudents
                                                        }
                                                        // onDownloadClick={() =>
                                                        //     handleDownloadClick(
                                                        //         assessment
                                                        //     )
                                                        // }
                                                        onDownloadCsv={() =>
                                                            handleDownloadCsv(
                                                                assessment
                                                            )
                                                        }
                                                    />
                                                )
                                            )
                                        }

                                    </div>
                                </div>
                            )
                    )
                ) : (
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-center text-muted-foreground max-w-md">
                            No Assessment submissions available from the
                            students yet. Please wait until the first
                            submission.
                        </p>
                        <Image
                            src="/emptyStates/empty-submissions.png"
                            alt="No Assessment Found"
                            width={120}
                            height={120}
                            className="mb-6"
                        />
                    </div>
                )
            ) : (
                <div className="flex flex-col justify-center items-center">
                    <p className="text-center text-muted-foreground max-w-md">
                        No Assessment submissions available from the students
                        yet. Please wait until the first submission.
                    </p>
                    <Image
                        src="/emptyStates/empty-submissions.png"
                        alt="No Assessment Found"
                        width={120}
                        height={120}
                        className="mb-6"
                    />
                </div>
            )}
        </div>
    )
}

export default AssesmentSubmissionComponent
