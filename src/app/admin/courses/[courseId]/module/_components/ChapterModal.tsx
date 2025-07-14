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
    onClose,
}: {
    fetchChapters: () => void
    newChapterOrder: number
    courseId: any
    moduleId: any
    scrollToBottom: () => void
    onClose: () => void
}) {
    const { setTopicId } = getTopicId()
    const router = useRouter()
    const [classType, setClassType] = useState('createLiveClass')
    const [liveDialogOpen, setLiveDialogOpen] = useState(false) // <-- Add this

    const createChapter = async (topicId: number) => {
        setTopicId(topicId)
        await api
            .post(`Content/chapter`, {
                moduleId: Number(moduleId),
                bootcampId: Number(courseId),
                topicId: topicId,
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
                onClose() // <-- Close parent dialog
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
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-max">
                <DialogTitle className="mb-3 text-left text-gray-600 text-[16px]">
                    New Chapter
                </DialogTitle>
                <div className="grid grid-cols-3 p-3 gap-y-6 gap-x-2 ">
                    <div
                        className="flex items-center cursor-pointer hover:bg-[rgb(81,134,114)]/50 p-2 rounded-sm text-gray-600 text-[16px]"
                        onClick={() => createChapter(1)}
                    >
                        <Video className="mr-2 h-6 w-6" />
                        <span>Video</span>
                    </div>
                    <div
                        className="flex items-center cursor-pointer hover:bg-[rgb(81,134,114)]/50 p-2 rounded-sm text-gray-600 text-[16px]"
                        onClick={() => createChapter(2)}
                    >
                        <BookOpenText className="mr-2 h-6 w-6" />
                        <span>Article</span>
                    </div>
                    <div
                        className="flex items-center cursor-pointer hover:bg-[rgb(81,134,114)]/50 p-2 rounded-sm text-gray-600 text-[16px]"
                        onClick={() => createChapter(3)}
                    >
                        <SquareCode className="mr-2 h-6 w-6" />
                        <span>Coding Problem</span>
                    </div>
                    <div
                        className="flex items-center cursor-pointer hover:bg-[rgb(81,134,114)]/50 p-2 rounded-sm text-gray-600 text-[16px]"
                        onClick={() => createChapter(4)}
                    >
                        <FileQuestion className="mr-2 h-6 w-6" />
                        <span>Quiz</span>
                    </div>
                    <div
                        className="flex items-center cursor-pointer hover:bg-[rgb(81,134,114)]/50 p-2 rounded-sm text-gray-600 text-[16px]"
                        onClick={() => createChapter(5)}
                    >
                        <PencilLine className="mr-2 h-6 w-6" />
                        <span>Assignment</span>
                    </div>

                    <div
                        className="flex items-center cursor-pointer hover:bg-[rgb(81,134,114)]/50 p-2 rounded-sm text-gray-600 text-[16px]"
                        onClick={() => createChapter(6)}
                    >
                        <BookOpenCheck className="mr-2 h-6 w-6" />
                        <span>Assessment</span>
                    </div>
                    <div
                        className="flex items-center cursor-pointer hover:bg-[rgb(81,134,114)]/50 p-2 rounded-sm text-gray-600 text-[16px]"
                        onClick={() => createChapter(7)}
                    >
                        <Newspaper className="mr-2 h-6 w-6" />
                        <span>Form</span>
                    </div>
                    <div
                        className="flex items-center cursor-pointer hover:bg-[rgb(81,134,114)]/50 p-2 rounded-sm text-gray-600 text-[16px]"
                        onClick={() => setLiveDialogOpen(true)}
                    >
                        <Play className="mr-2 h-6 w-6" />
                        <span>Live Classes</span>
                    </div>
                </div>
                {/* Live Classes Dialog as pehle */}
                <Dialog
                    open={liveDialogOpen}
                    onOpenChange={(open) => {
                        setLiveDialogOpen(open)
                        if (!open) setClassType('createLiveClass')
                    }}
                >
                    <DialogContent className="max-w-2xl w-full">
                        <RadioGroup
                            value={classType}
                            className="flex flex-row items-center text-gray-600"
                            onValueChange={setClassType}
                            defaultValue="createLiveClass"
                        >
                            <div className="flex  space-x-2">
                                <RadioGroupItem
                                    className="!border-black !text-black"
                                    value="createLiveClass"
                                    id="r1"
                                />
                                <Label htmlFor="r1">Create Live Class</Label>
                            </div>
                            <div className="flex space-x-2 ">
                                <RadioGroupItem
                                    className="!border-black !text-black"
                                    value="existingLiveClass"
                                    id="r2"
                                />
                                <Label htmlFor="r2">
                                    Select from Existing Classes
                                </Label>
                            </div>
                        </RadioGroup>
                        {classType === 'createLiveClass' && (
                            <CreateSessionDialog
                                fetchingChapters={fetchChapters}
                                onClose={() => {
                                    setLiveDialogOpen(false)
                                    setClassType('createLiveClass')
                                    onClose() // Close parent dialog
                                }}
                            />
                        )}
                        {classType === 'existingLiveClass' && (
                            <div className="overflow-auto">
                                <ExistingLiveClass
                                    fetchingChapters={fetchChapters}
                                    onClose={() => {
                                        setLiveDialogOpen(false)
                                        setClassType('createLiveClass')
                                        onClose() // Close parent dialog
                                    }}
                                />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    )
}

export default ChapterModal
