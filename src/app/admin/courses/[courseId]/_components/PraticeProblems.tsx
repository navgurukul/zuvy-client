import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import SubmissionComponent from './submissionComponent'
import { api } from '@/utils/axios.config'

type Submission = {
    id: string
    codingQuestionDetails: { id: number; title: string }
    submitStudents: number
}

type Props = {
    courseId: number
    name: string
    totalStudents: number
    submission: Submission[]
    moduleId: number
}

const PracticeProblems = (props: Props) => {
    return (
        <div className="w-full mb-10">
            <h1 className=" text-start text-lg font-semibold">{props.name}</h1>
            <section className=" bg-white dark:bg-gray-900">
                <div className="mx-auto">
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-3">
                        {props.submission.map(
                            ({ codingQuestionDetails, id, submitStudents }) => (
                                <SubmissionComponent
                                    key={id}
                                    title={
                                        codingQuestionDetails?.title ||
                                        'Untitled Question'
                                    }
                                    totalSubmissions={props.totalStudents}
                                    studentsSubmitted={submitStudents}
                                    courseId={props.courseId}
                                    id={id}
                                    moduleId={props.moduleId}
                                />
                            )
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default PracticeProblems
