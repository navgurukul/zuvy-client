import {
    SquareCode,
    FileQuestion,
    PencilLine,
    BookOpenText,
    Video,
    BookOpenCheck,
    Newspaper,
} from 'lucide-react'

import {
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

function ChapterModal({
    params,
    fetchChapters,
    newChapterOrder,
    scrollToBottom,
}: {
    params: { moduleId: string; courseId: string }
    fetchChapters: () => void
    newChapterOrder: number
    scrollToBottom: () => void
}) {
    const router = useRouter()
    const createChapter = async (topicId: number) => {
        await api
            .post(`Content/chapter`, {
                moduleId: Number(params?.moduleId),
                bootcampId: Number(params?.courseId),
                topicId: topicId,
                // order: newChapterOrder,
            })
            .then((res) => {
                const data = res?.data?.module[0]
                router.push(
                    `/admin/courses/${params?.courseId}/module/${data.moduleId}/chapters/${data.id}`
                )
                toast({
                    title: res?.data?.module[0]?.title,
                    description: res?.data?.message,
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
            })
            .catch((error) => {
                toast({
                    title: 'Error',
                    description: error?.response?.data?.message[0],
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            })
        fetchChapters()
        setTimeout(() => {
            scrollToBottom()
        }, 500)
    }

    // const createAssessment = async () => {
    //     await api
    //         .post(`/content/createAssessment/${params.moduleId}`)
    //         .then((res) => {
    //             toast({
    //                 title: res.data.message,
    //                 description: res.data[0].title,
    //             })
    //         })
    //     fetchChapters()
    // }
    return (
        <DialogContent className="max-w-max">
            <DialogHeader>
                <DialogTitle className="mb-3">New Chapter</DialogTitle>
                <div className="grid grid-cols-3 p-3 gap-y-6 gap-x-2 ">
                    <DialogClose asChild>
                        <div
                            className="flex items-center cursor-pointer hover:bg-secondary/50 p-2 rounded-sm"
                            onClick={() => createChapter(1)}
                        >
                            <Video className="mr-2 h-6 w-6" />
                            <span>Video</span>
                        </div>
                    </DialogClose>
                    <DialogClose asChild>
                        <div
                            className="flex items-center cursor-pointer hover:bg-secondary/50 p-2 rounded-sm"
                            onClick={() => createChapter(2)}
                        >
                            <BookOpenText className="mr-2 h-6 w-6" />
                            <span>Article</span>
                        </div>
                    </DialogClose>
                    <DialogClose asChild>
                        <div
                            className="flex items-center cursor-pointer hover:bg-secondary/50 p-2 rounded-sm"
                            onClick={() => createChapter(3)}
                        >
                            <SquareCode className="mr-2 h-6 w-6" />
                            <span>Coding Problem</span>
                        </div>
                    </DialogClose>
                    <DialogClose asChild>
                        <div
                            className="flex items-center cursor-pointer hover:bg-secondary/50 p-2 rounded-sm"
                            onClick={() => createChapter(4)}
                        >
                            <FileQuestion className="mr-2 h-6 w-6" />
                            <span>Quiz</span>
                        </div>
                    </DialogClose>
                    <DialogClose asChild>
                        <div
                            className="flex items-center cursor-pointer hover:bg-secondary/50 p-2 rounded-sm"
                            onClick={() => createChapter(5)}
                        >
                            <PencilLine className="mr-2 h-6 w-6" />
                            <span>Assignment</span>
                        </div>
                    </DialogClose>

                    <DialogClose asChild>
                        <div
                            className="flex items-center cursor-pointer hover:bg-secondary/50 p-2 rounded-sm"
                            onClick={() => createChapter(6)}
                        >
                            <BookOpenCheck className="mr-2 h-6 w-6" />
                            <span>Assessment</span>
                        </div>
                    </DialogClose>
                    <DialogClose asChild>
                        <div
                            className="flex items-center cursor-pointer hover:bg-secondary/50 p-2 rounded-sm"
                            onClick={() => createChapter(7)}
                        >
                            <Newspaper className="mr-2 h-6 w-6" />
                            <span>Form</span>
                        </div>
                    </DialogClose>
                </div>
            </DialogHeader>
        </DialogContent>
    )
}

export default ChapterModal
