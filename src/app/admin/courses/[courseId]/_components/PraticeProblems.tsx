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
}

const PracticeProblems = (props: Props) => {
    console.log('first', props)
    return (
        <div className="w-full">
            <h1 className="ml-6 text-start font-semibold">{props.name}</h1>
            <section className="bg-white dark:bg-gray-900">
                <div className="px-6 py-5 mx-auto">
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-3">
                        {props.submission.map(
                            ({ codingQuestionDetails, id, submitStudents }) => (
                                <SubmissionComponent
                                    key={id} // Use index or any unique identifier from submissionItem
                                    title={
                                        codingQuestionDetails?.title ||
                                        'Untitled'
                                    }
                                    totalSubmissions={props.totalStudents}
                                    studentsSubmitted={submitStudents}
                                    courseId={props.courseId}
                                    id={id}
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
