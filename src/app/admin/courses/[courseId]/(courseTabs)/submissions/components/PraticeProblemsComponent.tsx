import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import React, { useCallback, useEffect, useState } from 'react'
import PracticeProblems from '../../../_components/PraticeProblems'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'

type Props = {
    courseId: number
    debouncedSearch: string
}

const PraticeProblemsComponent = ({ courseId, debouncedSearch }: Props) => {
    const [submissions, setSubmissions] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)

    const getSubmissions = useCallback(async () => {
        try {
            // const res = await api.get(
            //     `/submission/submissionsOfPractiseProblems/${courseId}`
            // )
            const url = debouncedSearch
                ? `/submission/submissionsOfPractiseProblems/${courseId}?searchPractiseProblem=${debouncedSearch}`
                : `/submission/submissionsOfPractiseProblems/${courseId}`
            const res = await api.get(url)
            setSubmissions(res.data.trackingData)
            setTotalStudents(res.data.totalStudents)
        } catch (error) {
            console.error('Error fetching submissions:', error)
            toast.error({
                title: 'Error',
                description: 'Error fetching submissions.',
            })
        } finally {
        }
    }, [courseId, debouncedSearch])

    useEffect(() => {
        getSubmissions()
    }, [getSubmissions])

    const allEmpty = submissions?.every(
        ({ moduleChapterData }) => moduleChapterData.length === 0
    )

    if (allEmpty) {
        return (
            <div className="w-screen flex flex-col justify-center items-center h-4/5">
                <h5 className="text-center font-semibold ">
                    No practice problems found.
                </h5>
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
                <div className="w-screen flex flex-col justify-center items-center h-4/5">
                    <h5 className="text-center font-semibold">
                        No Practice Problem Found
                    </h5>
                    <Image
                        src="/emptyStates/curriculum.svg"
                        alt="No Assessment Found"
                        width={400}
                        height={400}
                    />
                </div>
            )}
        </>
    )
}

export default PraticeProblemsComponent
