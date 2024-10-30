'use client'

import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import React, { useEffect, useState } from 'react'
import CodingSubmission from '@/app/student/courses/[viewcourses]/modules/_components/CodingSubmission'

const Page = ({ params }: { params: any }) => {
    const { studentData } = useLazyLoadedStudentData()
    let userID = studentData?.id
    const [codingSubmissionsData, setCodingSubmissionsData] =
        useState<any>(null)

    async function getCodingSubmissionsData(
        codingOutsourseId: any,
        assessmentSubmissionId: any,
        questionId: any
    ) {
        try {
            const res = await api.get(
                `codingPlatform/submissions/questionId=${questionId}?assessmentSubmissionId=${assessmentSubmissionId}&codingOutsourseId=${codingOutsourseId}`
            )
            setCodingSubmissionsData(res.data)
        } catch (error) {
            console.error('Error fetching coding submissions data:', error)
        }
    }

    useEffect(() => {
        if (!userID) {
            userID = studentData?.id
        }
        getCodingSubmissionsData(
            params.codingOutsourseId,
            params.assessmentSubmissionId,
            params.questionId
        )
    }, [userID])

    return (
        <>
            <CodingSubmission codingSubmissionsData={codingSubmissionsData} />
        </>
    )
}

export default Page
