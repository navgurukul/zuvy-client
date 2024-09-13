import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import React, { useCallback, useEffect, useState } from 'react'
import PracticeProblems from '../../../_components/PraticeProblems'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'

type Props = {
    courseId: number
}

const PraticeProblemsComponent = ({ courseId }: Props) => {
    const [submissions, setSubmissions] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)
    const [loading, setLoading] = useState(true)

    const getSubmissions = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/submissionsOfPractiseProblems/${courseId}`
            )
            setSubmissions(res.data.trackingData)
            setTotalStudents(res.data.totalStudents)
        } catch (error) {
            console.error('Error fetching submissions:', error)
            toast({
                title: 'Error',
                description: 'Error fetching submissions.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        } finally {
            setLoading(false)
        }
    }, [courseId])

    useEffect(() => {
        getSubmissions()
    }, [getSubmissions])

    if (loading) {
        return (
            <div className="text-center">
                <Spinner className="text-secondary" />
            </div>
        )
    }

    const allEmpty = submissions.every(
        ({ moduleChapterData }) => moduleChapterData.length === 0
    )

    if (allEmpty) {
        return (
            <div className="w-screen flex flex-col justify-center items-center h-4/5">
                <h1 className="text-center font-semibold ">
                    No practice problems found.
                </h1>
                <Image
                    src="/emptyStates/curriculum.svg"
                    alt="No Assessment Found"
                    width={400}
                    height={400}
                />
            </div>
        )
    }

    return (
        <>
            {submissions.map(({ id, name, moduleChapterData }) =>
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
            )}
        </>
    )
}

export default PraticeProblemsComponent
