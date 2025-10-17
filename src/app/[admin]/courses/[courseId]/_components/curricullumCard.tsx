import { isPlural } from '@/lib/utils'
import { GripVertical, Trash2, Edit, FolderOpen } from 'lucide-react'
import React, { useState } from 'react'
import DeleteConfirmationModal from '@/app/[admin]/courses/[courseId]/_components/deleteModal'
import { api } from '@/utils/axios.config'
import { useRouter } from 'next/navigation'
import { DELETE_MODULE_CONFIRMATION } from '@/utils/constant'
import { toast } from '@/components/ui/use-toast'
import { Reorder, useDragControls } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CurricullamCardProps } from '@/app/[admin]/courses/[courseId]/_components/adminCourseCourseIdComponentType'

const CurricullumCard = (props: CurricullamCardProps) => {
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
        onDragStart,
        onDragEnd,
        showBorderFlash,
        permissions,
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
                // `/admin/courses/${courseId}/module/${moduleId}/chapters/${chapterId}`
                `module/${moduleId}/chapters/${chapterId}`
            )
        } else if (typeId === 2) {
            router.push(`module/${moduleId}/project/${projectId}`)
        }
    }

    return (
        <Reorder.Item
            value={props.value}
            dragListener={false}
            dragControls={dragControls}
            className={`select-none ${
                props.isStarted ? 'opacity-90' : ''
            } relative z-0`}
            whileDrag={{
                scale: 1.02,
                boxShadow: '0px 10px 20px rgba(0,0,0,0.15)',
                zIndex: 999,
                x: 0,
            }}
            onDragStart={() => {
                setIsDragging(true)
                props.setDraggedModuleId(props.moduleId)
                onDragStart?.()
            }}
            onDragEnd={() => {
                setIsDragging(false)
                props.setDraggedModuleId(null)
                onDragEnd?.()
            }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className={`shadow-sm my-2 w-full transition-all duration-300 ${
                    showBorderFlash
                        ? 'border-2 border-green-400 shadow-lg shadow-green-300/50 animate-border-flash'
                        : ''
                }`}
            >
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="cursor-grab text-muted-foreground hover:text-foreground"
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
                            onClick={(e) => e.stopPropagation()}
                        >
                            <GripVertical className="h-5 w-5" />
                        </div>

                        <div className="flex-1 flex items-center justify-between hover:bg-muted/50 p-2 rounded-md transition-colors">
                            <div
                                className="text-left flex items-center gap-3 cursor-pointer w-full"
                                onClick={handleModuleRoute}
                            >
                                <div
                                    className={`p-2 rounded-md ${
                                        props.typeId === 2
                                            ? 'bg-yellow-100 text-secondary'
                                            : 'bg-primary/10 text-primary'
                                    }`}
                                >
                                    <FolderOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        Module {order}: {name}
                                    </h3>
                                    <p className="text-muted-foreground text-[1rem]">
                                        {description}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        Duration:{' '}
                                        {timeAllotedInWeeks > 1
                                            ? `${timeAllotedInWeeks} weeks`
                                            : `${timeAllotedInWeeks} week`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {permissions.editModule && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            editHandle(moduleId)
                                        }}
                                        className="hover:text-muted-foreground hover:bg-gray-200"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                                {permissions.deleteModule && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteModal()
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

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
        </Reorder.Item>
    )
}

export default CurricullumCard
