'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { api } from '@/utils/axios.config'
import { Spinner } from '@/components/ui/spinner'
import { formatDate } from '@/lib/utils'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { object } from 'zod'
import OverviewComponent from '@/app/[admin]/courses/[courseId]/_components/OverviewComponent'
import IndividualStudentAssesment from '@/app/[admin]/courses/[courseId]/_components/individualStudentAssesment'
import { Skeleton } from '@/components/ui/skeleton'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon, Clock } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

import {
    BootcampData,
    TrackedFormData,
    FormItem,
    Params,
} from '@/app/[admin]/courses/[courseId]/submissionForm/[StudentForm]/IndividualReport/studentFormIndividualReportType'

const Page = ({ params }: { params: Params }) => {
    const router = useRouter()
    const [individualFormData, setIndividualFormData] = useState<any>()
    const [chapterDetails, setChapterDetails] = useState<any>()
    const [bootcampData, setBootcampData] = useState<BootcampData | null>(null)
    const [user, setUser] = useState<any>()

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get<{ bootcamp: BootcampData }>(
                `/bootcamp/${params.courseId}`
            )
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Error fetching bootcamps:',
            })
        }
    }, [params.courseId])

    const getIndividualStudentFormDataHandler = useCallback(async () => {
        const chapterId = params.report
        const moduleId = params.StudentForm
        const userId = params.IndividualReport
        await api
            .get<TrackedFormData>(
                `submission/getFormDetailsById/${moduleId}?chapterId=${chapterId}&userId=${userId}`
            )
            .then((res) => {
                setIndividualFormData(res.data.trackedData)
            })
            .catch((err) => {
                toast.error({
                    title: 'Error',
                    description: 'Error fetching Form details:',
                })
            })

        await api
            .get<TrackedFormData>(
                `/tracking/getChapterDetailsWithStatus/${chapterId}`
            )
            .then((res) => {
                setChapterDetails(res.data.trackingData)
            })
            .catch((err) => {
                toast.error({
                    title: 'Error',
                    description: 'Error fetching Chapter details:',
                })
            })
    }, [params.report])

    const getIndividualStudent = useCallback(async () => {
        try {
            await api
                .get(
                    `submission/formsStatus/${params.courseId}/${params.StudentForm}?chapterId=${params.report}&limit=3&offset=0`
                )
                .then((res) => {
                    const student = res.data.combinedData.find(
                        (item: FormItem) => item.id == params.IndividualReport
                    )
                    setUser(student)
                })
        } catch (err) {
            toast.error({
                title: 'Error',
                description: 'Error fetching Student details:',
            })
        }
    }, [params.report, params.IndividualReport])

    useEffect(() => {
        getIndividualStudentFormDataHandler()
        getBootcampHandler()
        getIndividualStudent()
    }, [getIndividualStudentFormDataHandler, getBootcampHandler])

    return (
        <div className="min-h-screen font-semibold bg-background">
            {/* Back Button */}
            <MaxWidthWrapper>
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="hover:bg-transparent hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Form
                    </Button>
                </div>
            </MaxWidthWrapper>
            <MaxWidthWrapper>
                <div className="space-y-8 pb-8">
                    {/* Form Info Card */}
                    <div className="bg-card border border-border rounded-lg p-8">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h1 className="text-2xl text-left font-heading font-bold text-foreground">
                                        {chapterDetails?.title}
                                    </h1>
                                    <p className="text-left text-muted-foreground text-md mt-2">
                                        {chapterDetails?.description}
                                    </p>
                                </div>
                            </div>
                            <div className="ml-8 flex-shrink-0">
                                {individualFormData && (
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground font-semibold">
                                            Submitted Date
                                        </p>
                                        <p className="text-left text-foreground text-lg mt-1">
                                            {formatDate(
                                                individualFormData?.[0]
                                                    .formTrackingData[0]
                                                    .updatedAt
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Questions */}
                    <div className="space-y-6">
                        {individualFormData &&
                            individualFormData.map(
                                (item: FormItem, index: number) => (
                                    <div
                                        key={index}
                                        className="space-y-4 text-start"
                                    >
                                        {item.typeId === 1 && (
                                            <div className="mt-6">
                                                <div className="flex flex-row gap-x-2 font-semibold">
                                                    <p>{index + 1}.</p>
                                                    <p>{item.question}</p>
                                                </div>
                                                <div className="space-y-3 text-start">
                                                    <RadioGroup
                                                        value={
                                                            item
                                                                .formTrackingData[0]
                                                                .chosenOptions[0]
                                                        }
                                                    >
                                                        {Object.keys(
                                                            item.options
                                                        ).map((option) => {
                                                            const answer =
                                                                item
                                                                    .formTrackingData[0]
                                                                    .chosenOptions[0]
                                                            return (
                                                                <div
                                                                    key={option}
                                                                    className={`flex space-x-2 mr-4 mt-1 p-3 ${
                                                                        answer ==
                                                                            option &&
                                                                        'border-gray-800 border-2 rounded-lg'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center w-full space-x-3 space-y-0">
                                                                        <RadioGroupItem
                                                                            value={
                                                                                option
                                                                            }
                                                                            checked={
                                                                                answer ==
                                                                                option
                                                                            }
                                                                            disabled
                                                                        />
                                                                        <label className="ml-2 text-md text-muted-foreground">
                                                                            {
                                                                                item
                                                                                    .options[
                                                                                    option
                                                                                ]
                                                                            }
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                        )}

                                        {item.typeId === 2 && (
                                            <div className="mt-6">
                                                <div className="flex flex-row gap-x-2 font-semibold">
                                                    <p>{index + 1}.</p>
                                                    <p>{item.question}</p>
                                                </div>
                                                <div className="mt-2">
                                                    {Object.keys(
                                                        item.options
                                                    ).map((option) => {
                                                        const answer =
                                                            item
                                                                .formTrackingData[0]
                                                                .chosenOptions
                                                        const optionNumber =
                                                            option
                                                        return (
                                                            <div
                                                                key={option}
                                                                className={`flex space-x-2 mr-5 mt-1 p-3 text-md text-muted-foreground ${
                                                                    answer.includes(
                                                                        optionNumber
                                                                    ) &&
                                                                    'border-gray-800 border-2 rounded-lg'
                                                                }`}
                                                            >
                                                                <Checkbox
                                                                    checked={answer.includes(
                                                                        optionNumber
                                                                    )}
                                                                    disabled
                                                                    aria-label={
                                                                        option
                                                                    }
                                                                    className={`translate-y-[2px] mr-1 ${
                                                                        answer.includes(
                                                                            optionNumber
                                                                        ) &&
                                                                        'bg-green-500'
                                                                    }`}
                                                                />
                                                                {
                                                                    item
                                                                        .options[
                                                                        option
                                                                    ]
                                                                }
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {item.typeId === 3 && (
                                            <div className="mt-6">
                                                <div className="flex flex-row gap-x-2 font-semibold mb-3">
                                                    <p>{index + 1}.</p>
                                                    <p>{item.question}</p>
                                                </div>
                                                <div className="text-md text-muted-foreground">
                                                    <p>
                                                        {
                                                            item
                                                                .formTrackingData[0]
                                                                ?.answer
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {item.typeId === 4 && (
                                            <div className="mt-6">
                                                <div className="flex flex-row gap-x-2 font-semibold mb-3">
                                                    <p>{index + 1}.</p>
                                                    <p>{item.question}</p>
                                                </div>
                                                <div className="flex flex-row gap-x-1">
                                                    <CalendarIcon className="h-4 w-4 opacity-50 m-1" />
                                                    <div className="text-md text-muted-foreground">
                                                        <p>
                                                            {formatDate(
                                                                item
                                                                    .formTrackingData[0]
                                                                    ?.answer
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {item.typeId === 5 && (
                                            <div className="mt-6">
                                                <div className="flex flex-row gap-x-2 font-semibold mb-3">
                                                    <p>{index + 1}.</p>
                                                    <p>{item.question}</p>
                                                </div>
                                                <div className="flex flex-row gap-x-1">
                                                    <Clock className="h-4 w-4 opacity-50 m-1" />
                                                    <div className="text-md text-muted-foreground">
                                                        <p>
                                                            {
                                                                item
                                                                    .formTrackingData[0]
                                                                    ?.answer
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                    </div>
                </div>
            </MaxWidthWrapper>
        </div>
    )
}

export default Page
