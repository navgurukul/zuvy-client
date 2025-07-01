import { isPlural } from '@/lib/utils'
import {
    BookOpenText,
    Clock1,
    SquareCode,
    FileQuestion,
    GripVertical,
    PencilLine,
    Trash2,
    Pencil,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import DeleteConfirmationModal from '@/app/admin/courses/[courseId]/_components/deleteModal'
import { api } from '@/utils/axios.config'
import { useRouter } from 'next/navigation'
import { DELETE_MODULE_CONFIRMATION } from '@/utils/constant'
import { toast } from '@/components/ui/use-toast'
import { Reorder, useDragControls } from 'framer-motion'

type Props = {
    value: any
    isStarted?: boolean
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
    chapterId: number
}

const CurricullumCard = (props: Props) => {
    const {
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
        chapterId,
        isStarted,
    } = props

    const router = useRouter()
    const dragControls = useDragControls()
    const [isDragging, setIsDragging] = useState(false)

    // Calculate time in weeks and days
    const timeAllotedInWeeks = Math.ceil(timeAlloted / 604800)

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)

    const handleDeleteModal = () => {
        setDeleteModalOpen(true)
    }

    const handleDeleteModule = async () => {
        const response = await api
            .delete(`Content/deleteModule/${courseId}?moduleId=${moduleId}`)
            .then((response) => {
                toast.success({
                    title: 'Success',
                    description: 'Module Deleted Successfully',
                })
                fetchCourseModules()
            })
            .catch((error) => {
                toast.error({
                    title: 'Error',
                    description:
                        'There was an error while deleting. Please try again.',
                })
            })
    }

    const handleModuleRoute = () => {
        if (typeId === 1) {
            router.push(
                `/admin/courses/${courseId}/module/${moduleId}/chapters/${chapterId}`
            )
        } else if (typeId === 2) {
            router.push(
                `/admin/courses/${courseId}/module/${moduleId}/project/${projectId}`
            )
        }
    }

    return (
        <Reorder.Item
            value={props.value}
            dragListener={false}
            dragControls={dragControls}
            className={`select-none ${props.isStarted ? 'opacity-90' : ''}`}
        >
            <div
                className={`${
                    props.typeId === 2 ? 'bg-yellow/50' : 'bg-muted'
                } my-3 p-3 flex rounded-xl relative group select-none cursor-pointer`}
            >
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
                            <Pencil
                                className="hover:text-green-600 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    editHandle(moduleId)
                                }}
                            />
                            <GripVertical
                                style={{
                                    cursor: props.isStarted
                                        ? 'not-allowed'
                                        : isDragging
                                            ? 'grabbing'
                                            : 'grab',
                                }}
                                onPointerDown={
                                    !props.isStarted
                                        ? (e) => {
                                              e.stopPropagation()
                                              setIsDragging(true)
                                              dragControls.start(e)
                                          }
                                        : undefined
                                }
                                onPointerUp={() => setIsDragging(false)}
                                onPointerLeave={() => setIsDragging(false)}
                                onClick={(e) => e.stopPropagation()}
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
        </Reorder.Item>

    )
}

export default CurricullumCard
