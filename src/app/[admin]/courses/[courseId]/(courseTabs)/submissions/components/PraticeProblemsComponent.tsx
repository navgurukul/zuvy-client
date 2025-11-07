import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import React, { useCallback, useEffect, useState } from 'react'
import PracticeProblems from '../../../_components/PraticeProblems'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'
import {
    PractieProblemProps,
    SubmissionsResponse,
} from '@/app/[admin]/courses/[courseId]/(courseTabs)/submissions/components/courseSubmissionComponentType'
import {PracticeProblemSubmissionSkeleton} from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'

const PraticeProblemsComponent = ({
    courseId,
    debouncedSearch,
}: PractieProblemProps) => {
    const [submissions, setSubmissions] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)
     const [loading, setLoading] = useState(true)

    const getSubmissions = useCallback(async () => {
        try {
            // const res = await api.get(
            //     `/submission/submissionsOfPractiseProblems/${courseId}`
            // )
            setLoading(true)
            const url = debouncedSearch
                ? `/submission/submissionsOfPractiseProblems/${courseId}?searchPractiseProblem=${debouncedSearch}`
                : `/submission/submissionsOfPractiseProblems/${courseId}`
            const res = await api.get<SubmissionsResponse>(url)
            setSubmissions(res.data.trackingData)
            setTotalStudents(res.data.totalStudents)
        } catch (error) {
            console.error('Error fetching submissions:', error)
            toast.error({
                title: 'Error',
                description: 'Error fetching submissions.',
            })
        } finally {
             setLoading(false)
        }
    }, [courseId, debouncedSearch])

    useEffect(() => {
        getSubmissions()
    }, [getSubmissions])

    const allEmpty = submissions?.every(
        ({ moduleChapterData }) => moduleChapterData.length === 0
    )

    if (loading) {
       return<PracticeProblemSubmissionSkeleton/>
    }
    if (allEmpty) {
        return (
            <div className="flex flex-col justify-center items-center">
                <p className="text-center text-muted-foreground max-w-md">
                    No practice problems found.
                </p>
                <Image
                    src="/emptyStates/empty-submissions.png"
                    alt="No Practice Problem Found"
                    width={120}
                    height={120}
                />
            </div>
        )
    }

    return (
        <>
            {submissions ? (
                submissions?.map(({ id, name, moduleChapterData }) =>
                    moduleChapterData.length > 0 ? (
                        <PracticeProblems
                            key={id}
                            courseId={courseId}
                            name={name}
                            totalStudents={totalStudents}
                            submission={moduleChapterData}
                            moduleId={id}
                        />
                    ) : null
                )
            ) : (
                <div className="flex flex-col justify-center items-center">
                    <p className="text-center text-muted-foreground max-w-md">
                        No Practice problems submissions available from the
                        students yet. Please wait until the first submission
                    </p>
                    <Image
                        src="/emptyStates/empty-submissions.png"
                        alt="No Practice Problem Found"
                        width={120}
                        height={120}
                    />
                </div>
            )}
        </>
    )
}

export default PraticeProblemsComponent
