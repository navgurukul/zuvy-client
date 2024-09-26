import { isPlural } from '@/lib/utils'
import {
    BookOpenText,
    Clock1,
    SquareCode,
    FileQuestion,
    GripVertical,
    PencilLine,
    Trash2,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import DeleteConfirmationModal from '@/app/admin/courses/[courseId]/_components/deleteModal'
import { api } from '@/utils/axios.config'
import { useRouter } from 'next/navigation'
import { DELETE_MODULE_CONFIRMATION } from '@/utils/constant'
import { toast } from '@/components/ui/use-toast'

type Props = {
    editHandle: any
    index: number
    moduleId: any
    courseId: number
    name: string
    order: number
    description: string
    quizCount: number
    assignmentCount: number
    timeAlloted: number
    codingProblemsCount: number
    articlesCount: number
    typeId: number
    fetchCourseModules: () => void
    projectId: number
}

const CurricullumCard = ({
    editHandle,
    index,
    moduleId,
    courseId,
    name,
    order,
    description,
    quizCount,
    assignmentCount,
    timeAlloted,
    codingProblemsCount,
    articlesCount,
    typeId,
    fetchCourseModules,
    projectId,
}: Props) => {
    // states and variables
    const router = useRouter()

    // Calculate time in weeks and days
    const timeAllotedInWeeks = Math.ceil(timeAlloted / 604800)

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [chapterId, setChapterId] = useState<any>()

    // functions

    const getChapterId = useCallback(async () => {
        try {
            const response = await api.get(
                `tracking/getAllChaptersWithStatus/${moduleId}`
            )
            setChapterId(response.data.trackingData[0].id)
        } catch (error) {
            console.log(error)
        }
    }, [])

    useEffect(() => {
        if (moduleId) {
            getChapterId()
        }
    }, [moduleId, getChapterId])

    const handleDeleteModal = () => {
        setDeleteModalOpen(true)
    }

    const handleDeleteModule = async () => {
        const response = await api
            .delete(`Content/deleteModule/${courseId}?moduleId=${moduleId}`)
            .then((response) => {
                toast({
                    title: 'Success',
                    description: 'Module Deleted Successfully',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
                fetchCourseModules()
            })
            .catch((error) => {
                toast({
                    title: 'Error',
                    description:
                        'There was an error while deleting. Please try again.',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            })
    }

    const handleModuleRoute = () => {
        router.push(`/admin/courses/${courseId}/module/${moduleId}/chapters/content/${chapterId}/chapterContent`)
    }

    return (
        <div className="w-full flex items-center justify-between gap-y-2 cursor-pointer">
            <div className="w-full p-2" onClick={handleModuleRoute}>
                <div className="flex mb-2 w-full justify-between">
                    <p className="text-md font-semibold capitalize text-black text-start">
                        {`Module ${order}`} : {name}
                    </p>
                    <div className="flex items-center gap-x-2">
                        <Trash2
                            className="hover:text-destructive cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteModal()
                            }}
                        />
                        <GripVertical
                            onClick={(e) => {
                                e.stopPropagation()
                                editHandle(moduleId)
                            }}
                        />
                    </div>
                </div>
                <p className="text-start mb-2">{description}</p>
                <div className="flex flex-wrap justify-start gap-x-4">
                    <div className="flex items-center justify-start gap-x-2">
                        <Clock1 size={15} />
                        <p className="text-md font-semibold capitalize text-gray-600">
                            {timeAllotedInWeeks > 1
                                ? `${timeAllotedInWeeks} weeks`
                                : `${timeAllotedInWeeks} week`}
                        </p>
                    </div>
                    {articlesCount > 0 ? (
                        <div className="flex items-center justify-start gap-x-2">
                            <BookOpenText size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {articlesCount}{' '}
                                {isPlural(articlesCount)
                                    ? 'Articles'
                                    : 'Article'}
                            </p>
                        </div>
                    ) : null}
                    {assignmentCount > 0 ? (
                        <div className="flex items-center justify-start gap-x-2">
                            <PencilLine size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {assignmentCount}{' '}
                                {isPlural(assignmentCount)
                                    ? 'Assignments'
                                    : 'Assignment'}
                            </p>
                        </div>
                    ) : null}
                    {quizCount > 0 ? (
                        <div className="flex items-center justify-start gap-x-2">
                            <FileQuestion size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {quizCount}{' '}
                                {isPlural(quizCount) ? 'Quizzes' : 'Quiz'}
                            </p>
                        </div>
                    ) : null}
                    {codingProblemsCount > 0 ? (
                        <div className="flex items-center justify-start gap-x-2">
                            <SquareCode size={15} />
                            <p className="text-md font-semibold capitalize text-gray-600">
                                {codingProblemsCount}{' '}
                                {isPlural(codingProblemsCount)
                                    ? 'Coding Problems'
                                    : 'Coding Problem'}
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => {
                    handleDeleteModule()
                    setDeleteModalOpen(false)
                }}
                modalText={DELETE_MODULE_CONFIRMATION}
                buttonText="Delete Module"
                input={false}
            />
        </div>
    )
}

export default CurricullumCard
