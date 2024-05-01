import {
    Code,
    FileQuestion,
    PencilLine,
    ScrollText,
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

function ChapterModal({
    params,
    fetchChapters,
}: {
    params: { moduleId: string; courseId: string }
    fetchChapters: () => void
}) {
    const createChapter = async (topicId: number) => {
        await api
            .post(
                `https://dev.api.zuvy.org/Content/chapter/${params.moduleId}?topicId=${topicId}`
            )
            .then((res) => {
                toast({
                    title: res.data.message,
                    description: res.data.module[0].title,
                })
            })
        fetchChapters()
    }
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="mb-3">New Chapter</DialogTitle>
                <div className="grid grid-cols-3 p-3 gap-y-6 gap-x-2 ">
                    <DialogClose asChild>
                        <div
                            className="flex items-center cursor-pointer hover:bg-secondary/50 p-2 rounded-sm"
                            onClick={() => createChapter(2)}
                        >
                            <ScrollText className="mr-2 h-6 w-6" />
                            <span>Article</span>
                        </div>
                    </DialogClose>
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
                            onClick={() => createChapter(3)}
                        >
                            <Code className="mr-2 h-6 w-6" />
                            <span>Coding Problem</span>
                        </div>
                    </DialogClose>
                    <DialogClose asChild>
                        <div
                            className="flex items-center cursor-pointer hover:bg-secondary/50 p-2 rounded-sm"
                            // onClick={() => createChapter(2)}
                        >
                            <BookOpenCheck className="mr-2 h-6 w-6" />
                            <span>Assessment</span>
                        </div>
                    </DialogClose>
                    <DialogClose asChild>
                        <div
                            className="flex items-center cursor-pointer hover:bg-secondary/50 p-2 rounded-sm"
                            // onClick={() => createChapter(2)}
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
