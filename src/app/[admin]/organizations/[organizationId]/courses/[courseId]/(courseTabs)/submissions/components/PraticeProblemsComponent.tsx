import { toast } from '@/components/ui/use-toast'
import React, { useEffect } from 'react'
import PracticeProblems from '../../../_components/PraticeProblems'
import Image from 'next/image'
import {
    PractieProblemProps,
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/(courseTabs)/submissions/components/courseSubmissionComponentType'
import {PracticeProblemSubmissionSkeleton} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton'
import { usePracticeProblemSubmissions } from '@/hooks/usePracticeProblemSubmissions'

const PraticeProblemsComponent = ({
    courseId,
    debouncedSearch,
}: PractieProblemProps) => {
    const { trackingData: submissions, totalStudents, loading, error } = usePracticeProblemSubmissions(courseId, {
        searchPractiseProblem: debouncedSearch,
    })

    useEffect(() => {
        if (error) {
            toast.error({
                title: 'Error',
                description: 'Error fetching submissions.',
            })
        }
    }, [error])

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
