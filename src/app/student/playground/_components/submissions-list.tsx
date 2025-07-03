'use-client'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CircularLoader from '@/components/ui/circularLoader'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useLazyLoadedStudentData } from '@/store/store'
import { api } from '@/utils/axios.config'
import { b64DecodeUnicode } from '@/utils/base64'
import { List } from 'lucide-react'
import { useEffect, useState } from 'react'
import {Submission,SubmissionsApiRes} from "@/app/student/playground/_components/type"

export default function SubmissionsList({
    questionId,
    admin,
}: {
    questionId: string
    admin: false
}) {
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(false)
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id

    const getSubmissionsByQuestionId = async () => {
        try {
            setLoading(true) // Start loading
            const response = await api.get<SubmissionsApiRes>(
                `codingPlatform/submissions/${questionId}`
            )
            setSubmissions(response?.data?.data)
        } catch (error) {
            console.error('Error fetching courses:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getSubmissionsByQuestionId()
    }, [])
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    onClick={getSubmissionsByQuestionId}
                    size="sm"
                    className="mr-2"
                    variant="outline"
                    disabled={admin}
                >
                    <List size={20} />
                    <span className="ml-2 text-lg font-bold">Submissions</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl h-1/2 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>All Submissions</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="flex justify-center">
                        <CircularLoader />
                    </div>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {submissions ? (
                            submissions?.map((ele:Submission) => (
                                <AccordionItem
                                    key={ele?.createdAt}
                                    value={ele?.createdAt}
                                >
                                    <AccordionTrigger className="flex justify-between">
                                        Submitted on:{' '}
                                        {new Date(
                                            ele.createdAt
                                        ).toLocaleString()}
                                        <Badge
                                            variant={
                                                ele.status === 'Accepted'
                                                    ? 'secondary'
                                                    : 'destructive'
                                            }
                                        >
                                            {/* {ele.language.name} */}
                                            {ele.status}
                                        </Badge>
                                        {ele.status === 'Accepted' ? (
                                            <Badge variant="secondary">
                                                {/* {ele.status.description} */}
                                                {ele.questionDetail.title}
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive">
                                                {ele.questionDetail.title}
                                            </Badge>
                                        )}
                                    </AccordionTrigger>
                                    <AccordionContent className="h-full p-2 overflow-y-auto">
                                        <pre>
                                            {ele.questionDetail.description}
                                        </pre>
                                    </AccordionContent>
                                </AccordionItem>
                            ))
                        ) : (
                            <div> No Submissions</div>
                        )}
                    </Accordion>
                )}
            </DialogContent>
        </Dialog>
    )
}
