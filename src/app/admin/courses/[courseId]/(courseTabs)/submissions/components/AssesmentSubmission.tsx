'use client'
import React, { useCallback, useEffect, useState } from 'react'
import AssesmentComponent from '../../../_components/AssesmentComponent'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'
// import assesmentNotfound from @/public

type Props = {}

const AssesmentSubmissionComponent = ({ courseId }: any) => {
    const [assesments, setAssesments] = useState<any>()

    const getAssessments = useCallback(async () => {
        try {
            const res = await api.get(
                `/admin/bootcampAssessment/bootcamp_id${courseId}`
            )
            setAssesments(res.data)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error fetching assessments:',
                className: 'text-start capitalize border border-destructive',
            })
        }
    }, [courseId])

    useEffect(() => {
        getAssessments()
    }, [getAssessments])

    return (
        <div className="grid grid-cols-1 relative gap-8 mt-4 md:mt-8 md:grid-cols-2">
            {assesments ? (
                Object.keys(assesments).length > 0 ? (
                    Object.keys(assesments).map(
                        (key) =>
                            key !== 'totalStudents' && (
                                <div key={key}>
                                    <h2 className="text-lg text-start font-bold text-gray-900 dark:text-white">
                                        Module - {key}
                                    </h2>
                                    {assesments[key].map((assessment: any) => (
                                        <AssesmentComponent
                                            key={assessment.id}
                                            id={assessment.id}
                                            title={assessment.title}
                                            codingChallenges={
                                                assessment.totalCodingQuestions
                                            }
                                            mcq={assessment.totalQuizzes}
                                            openEnded={
                                                assessment.totalOpenEndedQuestions
                                            }
                                            totalSubmissions={
                                                assesments.totalStudents
                                            }
                                            studentsSubmitted={
                                                assessment.totalSubmitedAssessments
                                            }
                                            bootcampId={courseId}
                                            qualifiedStudents={
                                                assessment.qualifiedStudents
                                            }
                                        />
                                    ))}
                                </div>
                            )
                    )
                ) : (
                    <div className="w-screen flex flex-col justify-center items-center h-4/5">
                        <h1 className="text-center font-semibold ">
                            No Assessment Found
                        </h1>
                        <Image
                            src="/emptyStates/curriculum.svg"
                            alt="No Assessment Found"
                            width={400}
                            height={400}
                        />
                    </div>
                )
            ) : (
                <div className="w-full flex justify-center items-center absolute inset-0 h-screen">
                    <h1 className="text-center font-semibold ">
                        No Assessment Found
                    </h1>
                    <Image
                        src="/emptyStates/curriculum.svg"
                        alt="No Assessment Found"
                        width={400}
                        height={400}
                    />
                </div>
            )}
        </div>
    )
}

export default AssesmentSubmissionComponent
