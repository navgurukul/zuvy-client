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

export default function SubmissionsList({
    questionId,
}: {
    questionId: string
}) {
    const [submissions, setSubmissions] = useState<any>([])
    const [loading, setLoading] = useState(false)
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id

    const getSubmissionsByQuestionId = async () => {
        try {
            setLoading(true) // Start loading
            const response = await api.get(
                `/codingPlatform/allSubmissionsByQuestionId/${questionId}?userId=${userID}`
            )
            console.log('submissions', response.data.respond)
            setSubmissions(response.data.respond)
        } catch (error) {
            console.error('Error fetching courses:', error)
        } finally {
            setLoading(false)
        }
    }

    // useEffect(() => {
    //     getSubmissionsByQuestionId()
    // }, [])
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    onClick={getSubmissionsByQuestionId}
                    size="sm"
                    className="mr-2"
                    variant="outline"
                >
                    <List size={20} />
                    <span className="ml-2 text-lg font-bold">Submissions</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl h-1/2 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Accepted submissions</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="flex justify-center">
                        <CircularLoader />
                    </div>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {submissions ? (
                            submissions.map((ele: any) => (
                                <AccordionItem
                                    key={ele?.finished_at}
                                    value={ele?.finished_at}
                                >
                                    <AccordionTrigger className="flex justify-between">
                                        Submitted on:{' '}
                                        {new Date(
                                            ele.finished_at
                                        ).toLocaleString()}
                                        <Badge variant="secondary">
                                            {ele.language.name}
                                        </Badge>
                                        {ele.status_id === 3 ? (
                                            <Badge variant="secondary">
                                                {ele.status.description}
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive">
                                                {ele.status.description}
                                            </Badge>
                                        )}
                                    </AccordionTrigger>
                                    <AccordionContent className="h-full p-2 bg-accent text-white overflow-y-auto">
                                        <pre>
                                            {b64DecodeUnicode(ele.source_code)}
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
