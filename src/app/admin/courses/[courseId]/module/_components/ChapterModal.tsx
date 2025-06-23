import {
    SquareCode,
    FileQuestion,
    PencilLine,
    BookOpenText,
    Video,
    BookOpenCheck,
    Newspaper,
    Play,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { getTopicId } from '@/store/store'
import { useState } from 'react'
import CreateSessionDialog from './createLiveClass'
import ExistingLiveClass from './existingLiveClass'

function ChapterModal({
    fetchChapters,
    newChapterOrder,
    moduleId,
    courseId,
    scrollToBottom,
}: {
    fetchChapters: () => void
    newChapterOrder: number
    courseId: any
    moduleId: any
    scrollToBottom: () => void
}) {
    const { setTopicId } = getTopicId()
    const router = useRouter()
    const [classType , setClassType] = useState('createLiveClass');
    const createChapter = async (topicId: number) => {
        setTopicId(topicId)
        await api
            .post(`Content/chapter`, {
                moduleId: Number(moduleId),
                bootcampId: Number(courseId),
                topicId: topicId,
                // order: newChapterOrder,
            })
            .then((res) => {
                const data = res?.data?.module[0]
                router.push(
                    `/admin/courses/${courseId}/module/${data.moduleId}/chapters/${data.id}`
                )
                toast.success({
                    title: res?.data?.module[0]?.title,
                    description: res?.data?.message,
                })
            })
            .catch((error) => {
                toast.error({
                    title: 'Error',
                    description: error?.response?.data?.message[0],
                })
            })
        fetchChapters()
    }

    
    
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
                    <Dialog>
                        <div
                            className="flex items-center cursor-pointer hover:bg-secondary/50 p-2 rounded-sm"
                            // onClick={() => createChapter(8)}
                        >
                            <DialogTrigger className="flex">
                                <Play className="mr-2 h-6 w-6" />
                                <span>Live Classes</span>
                            </DialogTrigger>
                            <DialogContent className='' >
                                <RadioGroup value={classType} className='flex flex-row items-center' onValueChange={(e: any)=> setClassType(e)} defaultValue="createLiveClass">
                                    <div className="flex  space-x-2">
                                        <RadioGroupItem
                                            value="createLiveClass"
                                            id="r1"
                                        />
                                        <Label htmlFor="r1">Create Live Class</Label>
                                    </div>
                                    <div className="flex space-x-2 ">
                                        <RadioGroupItem
                                            value="existingLiveClass"
                                            id="r2"
                                        />
                                        <Label htmlFor="r2">Select from Existing Classes</Label>
                                    </div>
                                </RadioGroup>
                                {classType === 'createLiveClass' && <div className='' ><CreateSessionDialog fetchingChapters={()=>fetchChapters()}  /></div>}
                                {classType === 'existingLiveClass' && <div className='overflow-auto'><ExistingLiveClass fetchingChapters={()=>fetchChapters()} /></div>}
                            </DialogContent>
                            {/* <Newspaper  /> */}
                        </div>
                    </Dialog>
                </div>
            </DialogHeader>
        </DialogContent>
    )
}

export default ChapterModal
