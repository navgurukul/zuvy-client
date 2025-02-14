import React, { useCallback, useEffect, useState } from 'react'
import extensions from '@/app/_components/editor/TiptapExtensions'
import { api } from '@/utils/axios.config'
import { useEditor } from '@tiptap/react'
import TiptapEditor from '@/app/_components/editor/TiptapEditor'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form'
import { Check, Link, Github } from 'lucide-react'
import googleDriveLogo from '../../../../../../../public/google-drive.png'
import Image from 'next/image'
import { toast } from '@/components/ui/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

type Props = {
    projectId: number
    moduleId: number
    bootcampId: number
    completeChapter: () => void
    content: any
}
const FormSchema = z.object({
    link: z
        .string()
        .url({ message: 'Please enter a valid URL.' })
        .refine(
            (url) =>
                url.startsWith('https://github.com') ||
                url.startsWith('https://drive.google.com'),
            {
                message:
                    'The link must be from "https://github.com" or "https://drive.google.com".',
            }
        ),
})

const Assignments = ({
    projectId,
    moduleId,
    bootcampId,
    completeChapter,
    content,
}: Props) => {
    const [projectData, setProjectData] = useState<any>([])
    const [deadlineDate, setDeadlineDate] = useState<string>('')
    const [submittedDate, setSubmittedDate] = useState<string>('')
    const [status, setStatus] = useState<string>('')
    const [title, setTitle] = useState<string>('')
    const [icon, setIcon] = useState<JSX.Element>(
        <Link className="mr-2 h-4 w-4" />
    )
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            link: '',
        },

        mode: 'onChange',
    })

    const getProjectData = useCallback(async () => {
        try {
            await api
                .get(
                    `/tracking/getQuizAndAssignmentWithStatus?chapterId=${content.id}`
                )
                .then((res) => {
                    setProjectData(res.data.data.assignmentTracking[0])
                    setDeadlineDate(res.data.data.chapterDetails.completionDate)
                    setSubmittedDate(
                        res?.data?.data?.assignmentTracking[0]?.createdAt
                    )
                    setStatus(res.data.data.status)
                })
        } catch (error: any) {
            console.error(error.message)
        } finally {
        }
    }, [content.id])

    const editor = useEditor({
        extensions,
        content: '<h1>No Content Added Yet</h1>',
        editable: false,
    })

    useEffect(() => {
        if (editor && content?.articleContent?.[0]) {
            editor.commands.setContent(content.articleContent[0])
        } else if (editor) {
            editor.commands.setContent('<h1>No Content Added Yet</h1>')
        }
    }, [editor, content])

    useEffect(() => {
        getProjectData()
    }, [getProjectData])
    useEffect(() => {
        form.setValue('link', projectData?.projectUrl)
    }, [form, projectData])

    const updateIcon = (link: string) => {
        if (link.includes('github')) {
            setIcon(<Github className="mr-2 h-4 w-4" />)
        } else if (link.includes('drive')) {
            setIcon(
                <Image
                    src={googleDriveLogo}
                    alt="Google Drive"
                    width={16}
                    height={16}
                    className="mr-2"
                />
            )
        } else {
            setIcon(<Link className="mr-2 h-4 w-4" />)
        }
    }

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        ///tracking/updateQuizAndAssignmentStatus/8/31?chapterId=1212
        const today = new Date()
        const isoString = today.toISOString().split('.')[0] + 'Z'
        const transFormedBody = {
            submitAssignment: {
                projectUrl: data.link,
                timeLimit: isoString,
            },
        }
        await api
            .post(
                `tracking/updateQuizAndAssignmentStatus/${bootcampId}/${moduleId}?chapterId=${content.id}`,
                transFormedBody
            )
            .then(() => {
                toast({
                    title: 'Success',
                    description: 'Assignment Link Submitted SuccesFully',
                })
                completeChapter()
            })
            await getProjectData()
    }

    const timestamp = deadlineDate
    const date = new Date(timestamp)
    const submittedProjectDate = new Date(submittedDate)

    const options: any = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short',
    }
    const options2: any = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }

    const formattedDate = date.toLocaleDateString('en-US', options)
    const formattedSubmittedDate = submittedProjectDate.toLocaleString(
        'en-US',
        options2
    )

    function getSubmissionStatus(
        submittedDate: string | null,
        deadlineDate: string
    ): JSX.Element {
        if (!submittedDate) {
            return <span className="text-orange-500">Not Submitted Yet</span>
        }

        const submitted = new Date(submittedDate)
        const deadline = new Date(deadlineDate)

        if (submitted > deadline) {
            return <span className="text-red-500">Late Submitted</span>
        } else {
            return <span className="text-secondary">Submitted on Time</span>
        }
    }

    const AssignmentStatus = getSubmissionStatus(submittedDate, deadlineDate)

    return (
        <ScrollArea className="h-screen">
            <div className="flex flex-col mt-20 relative">
                <h1 className="text-left text-xl font-semibold flex flex-col ">
                    <span className="flex items-center gap-x-2 ">
                        {content?.title}{' '}
                        {status === 'Completed' && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-circle-check-big text-primary"
                            >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <path d="m9 11 3 3L22 4" />
                            </svg>
                        )}
                    </span>
                    {!content.articleContent ||
                    !content.articleContent.some((doc: any) =>
                        doc.content.some(
                            (paragraph: any) =>
                                paragraph.content &&
                                paragraph.content.some(
                                    (item: any) => item.type === 'text'
                                )
                        )
                    ) ? (
                        ''
                    ) : (
                        <span className="text-[14px]">
                            Deadline :- {formattedDate}
                        </span>
                    )}
                    <span className=" text-xl font-semibold">
                        {formattedSubmittedDate === 'Invalid Date' ? (
                            AssignmentStatus
                        ) : (
                            <>
                                You have submitted on: {formattedSubmittedDate}{' '}
                                ({AssignmentStatus})
                            </>
                        )}
                    </span>
                </h1>
                <div>
                    <h1 className="text-xl text-left font-semibold">
                        {' '}
                        Assignment Description
                    </h1>
                    {editor && <TiptapEditor editor={editor} />}
                </div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="flex items-center">
                                            {icon}
                                            <Input
                                                placeholder="Paste your Assignment Link Here"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e)
                                                    updateIcon(e.target.value)
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end absolute top-0 right-0">
                            <Button className="w-full mr-3" type="submit">
                                Submit
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </ScrollArea>
    )
}

export default Assignments
