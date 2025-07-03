import React, { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
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
import RemirrorTextEditor from '@/components/remirror-editor/RemirrorTextEditor'
import {ProjectApiSuccess, EditorDoc,Props } from "@/app/student/courses/[viewcourses]/modules/_components/type";

// type Props = {
//     projectId: number
//     moduleId: number
//     bootcampId: number
// }
// type EditorDoc = {
//     type: string
//     content: any[]
// }

const FormSchema = z.object({
    link: z
        .string()
        .url({ message: 'Please enter a valid URL.' })
        .refine((url) => url.includes('github') || url.includes('drive'), {
            message: 'The link must contain "github" or "googleDrive".',
        }),
})

const Projects = ({ projectId, moduleId, bootcampId }: Props) => {
    const [projectData, setProjectData] = useState<ProjectApiSuccess | null>(null)
    const [status, setStatus] = useState<string>('')
    const [title, setTitle] = useState<string>('')
    const [content, setContent] = useState<any>('')
    const [deadlineDate, setDeadlineDate] = useState<string>('')
    const [submittedDate, setSubmittedDate] = useState<string>('')
    const [initialContent, setInitialContent] = useState<
        { doc: EditorDoc } | undefined
    >()

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

    const fetchProjectDetails = useCallback(async () => {
        if (projectId === 0 || projectId === null) return
        try {
            const res = await api.get<ProjectApiSuccess>(
                `/tracking/getProjectDetailsWithStatus/${projectId}/${moduleId}`
            )
            setProjectData(res?.data)
            setTitle(res?.data?.data?.projectData[0]?.title)
            setContent(
                res?.data?.data?.projectData[0]?.projectTrackingData[0]
                    ?.projectLink
            )
            const projectDetail =
                res?.data?.data?.projectData[0]?.instruction?.description
            setStatus(res?.data?.data?.status)
            setDeadlineDate(res?.data?.data?.projectData[0]?.deadline)
            setSubmittedDate(
                res?.data?.data?.projectData[0]?.projectTrackingData[0]
                    ?.updatedAt
            )
            if (typeof projectDetail === 'string') {
                setInitialContent(JSON.parse(projectDetail))
            } else {
                const jsonData = { doc: projectDetail[0] }
                setInitialContent(jsonData)
            }
        } catch (error: any) {
            console.error(error.message)
        }
    }, [moduleId, projectId])

    useEffect(() => {
        fetchProjectDetails()
    }, [fetchProjectDetails])

    useEffect(() => {
        form.setValue('link', content)
    }, [content, form])

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
        //dev.api.zuvy.org/tracking/updateProject/54?moduleId=429&bootcampId=117
        const transFormedBody = {
            projectLink: data.link,
        }
        await api
            .post(
                `/tracking/updateProject/${projectId}?moduleId=${moduleId}&bootcampId=${bootcampId}`,
                transFormedBody
            )
            .then(() => {
                toast.success({
                    title: 'Success',
                    description: 'Project Link Submitted SuccesFully',
                })
                fetchProjectDetails()
            })
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

    const ProjectStatus = getSubmissionStatus(submittedDate, deadlineDate)

    // You have submitted on :- 20 Aug 2024 (Late submitted)

    return (
        <div className="flex flex-col gap-y-3 w-full">
            <h1 className="text-left text-xl font-semibold flex flex-col ">
                <span>Project:- {title}</span>
                <span className=" text-[14px]">
                    Deadline :- {formattedDate}
                </span>
                <span className="text-xl font-semibold">
                    {formattedSubmittedDate === 'Invalid Date' ? (
                        <>{ProjectStatus}</>
                    ) : (
                        <>
                            You have submitted on: {formattedSubmittedDate} (
                            {ProjectStatus})
                        </>
                    )}
                </span>
            </h1>
            <div>
                <h1 className="text-xl text-left font-semibold">
                    {' '}
                    Project Description
                </h1>
                <div className="mt-2 text-start">
                    <RemirrorTextEditor
                        initialContent={initialContent}
                        setInitialContent={setInitialContent}
                        preview={true}
                    />
                </div>
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
                                            placeholder="Paste your Project Link Here"
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
                    <div className="flex justify-end">
                        <Button
                            className="w-1/6"
                            type="submit"
                            disabled={status === 'Pending' ? false : true}
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default Projects
