import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import React, { useCallback, useEffect, useState } from 'react'
import PracticeProblems from '../../../_components/PraticeProblems'

type Props = {
    courseId: number
}

const PraticeProblemsComponent = (props: Props) => {
    const [submissions, setSubmissions] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)

    const getSubmissions = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/submissionsOfPractiseProblems/${props.courseId}`
            )
            setSubmissions(res.data.trackingData)
            setTotalStudents(res.data.totalStudents)
        } catch (error) {
            // console.error('Error fetching submissions:', error)
            toast({
                title: 'Error',
                description: 'Error fetching submissions:',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }, [props.courseId])

    useEffect(() => {
        getSubmissions()
    }, [getSubmissions])

    return (() => {
        const allEmpty = submissions.every(
            ({ moduleChapterData }) => moduleChapterData.length === 0
        )

        if (allEmpty) {
            return (
                <div className="text-left font-semibold my-5">
                    No practice problems found.
                </div>
            )
        } else {
            return submissions.map(({ id, name, moduleChapterData }) =>
                moduleChapterData.length > 0 ? (
                    <PracticeProblems
                        key={id}
                        courseId={props.courseId}
                        name={name}
                        totalStudents={totalStudents}
                        submission={moduleChapterData}
                        moduleId={id}
                    />
                ) : null
            )
        }
    })()
}

export default PraticeProblemsComponent
