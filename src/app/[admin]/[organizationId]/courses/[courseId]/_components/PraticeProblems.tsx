import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import SubmissionComponent from './submissionComponent'
import { api } from '@/utils/axios.config'
import { PraticeProblemProps } from '@/app/[admin]/[organizationId]/courses/[courseId]/_components/adminCourseCourseIdComponentType'

export default function PracticeProblems({
    submission,
    courseId,
    totalStudents,
    moduleId,
    name,
}: PraticeProblemProps) {
    return (
        <div className="w-full mb-10">
            <h1 className=" text-start text-lg font-semibold">{name}</h1>
            <section className="dark:bg-gray-900">
                <div className="mx-auto">
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-4">
                        {submission.map(
                            ({ codingQuestionDetails, id, submitStudents }) => (
                                <SubmissionComponent
                                    key={id}
                                    title={
                                        codingQuestionDetails?.title ||
                                        'Untitled Question'
                                    }
                                    totalSubmissions={totalStudents}
                                    studentsSubmitted={submitStudents}
                                    courseId={courseId}
                                    id={id}
                                    moduleId={moduleId}
                                    chapterId={id} // id here is chapterId
                                    questionId={codingQuestionDetails?.id}
                                />
                            )
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
