'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { Spinner } from '@/components/ui/spinner'

type Props = {
    courseId: number
    debouncedSearch: string
}

const Assignments = ({ courseId, debouncedSearch }: Props) => {
    const [assignmentData, setAssignmentData] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        const fetchAssignmentDataHandler = async () => {
            setLoading(true)
            try {
                // let baseUrl = `/submission/submissionsOfAssignment/${courseId}`
                // if (debouncedSearch) {
                //     baseUrl += `?searchAssignment=${encodeURIComponent(
                //         debouncedSearch
                //     )}`
                // }

                // const res = await api.get(baseUrl)
                // setAssignmentData(res.data.data.trackingData)

                await api
                    .get(`/submission/submissionsOfAssignment/${courseId}`)
                    .then((res) => {
                        setAssignmentData(res.data.data.trackingData)
                    })
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Error While Fetching',
                })
            } finally {
                setLoading(false)
            }
        }

        fetchAssignmentDataHandler()
    }, [courseId, debouncedSearch])

    return (
        <>
            {loading ? (
                <div className="my-5 flex justify-center items-center">
                    <div className="absolute h-screen">
                        <div className="relative top-[75%]">
                            <Spinner className="text-secondary" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="">
                    {assignmentData?.map((data) => {
                        const moduleDataLength = data.moduleChapterData.length

                        if (moduleDataLength > 0)
                            return (
                                <div className=" " key={data.id}>
                                    <div className="w-full flex flex-col gap-y-5 ">
                                        <h1 className="w-full text-[20px] text-left font-semibold">
                                            Title: {data.name}
                                        </h1>
                                        <p className=" font-semibold text-left">
                                            <span>Description:-</span>{' '}
                                            {data.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-8 mt-2 md:mt-4 md:grid-cols-2 lg:grid-cols-3">
                                        {data.moduleChapterData.map(
                                            (data: any) => {
                                                return (
                                                    <div
                                                        className="lg:flex h-[220px] w-full shadow-[0_4px_4px_rgb(1,1,0,0.12)] my-4 rounded-md p-3"
                                                        key={data.id}
                                                    >
                                                        <div className=" font-semibold flex w-full">
                                                            <h1 className="w-1/2">
                                                                {data.title}
                                                            </h1>
                                                            <h2 className="w-1/2 flex">
                                                                <span>
                                                                    Total
                                                                    Submitted:
                                                                </span>
                                                                <span>
                                                                    {
                                                                        data.submitStudents
                                                                    }
                                                                </span>
                                                            </h2>
                                                        </div>
                                                        <div className="w-full flex justify-end items-end ">
                                                            <Button
                                                                variant={
                                                                    'secondary'
                                                                }
                                                                className="flex items-center border-none hover:text-secondary hover:bg-popover"
                                                            >
                                                                <Link
                                                                    href={`/admin/courses/${courseId}/submissionAssignments/${data.id}`}
                                                                >
                                                                    View
                                                                    Submissions
                                                                </Link>
                                                                <ChevronRight
                                                                    size={20}
                                                                />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        )}
                                    </div>
                                </div>
                            )
                    })}
                </div>
            )}
        </>
    )
}

export default Assignments
