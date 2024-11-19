import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import DeleteConfirmationModal from '../../courses/[courseId]/_components/deleteModal'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

type Props = {
    logSelectedRows: () => any[]
}

const McqDeleteVaiarntComp = ({ logSelectedRows }: Props) => {
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const selectedRows = logSelectedRows()

    const deleteMcqHalderinBulk = async () => {
        const selectedQuestionIds = selectedRows.map((selectedRow) => {
            return selectedRow.original.id
        })
        const transformedBody: any = {
            questionIds: selectedQuestionIds.map((questionIds) => {
                return {
                    id: questionIds,
                    type: 'main',
                }
            }),
        }

        await api({
            method: 'delete',
            url: 'Content/deleteMainQuizOrVariant',
            data: transformedBody,
        })
            .then((res) => {
                toast({
                    title: 'Success',
                    description: res.data.message,
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })

                setDeleteModalOpen(false)
            })
            .catch((error) => {
                toast({
                    title: 'Error',
                    description:
                        error.response?.data?.message || 'An error occurred',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            })
    }

    return (
        <div>
            {selectedRows.length > 0 ? (
                <div>
                    <Button
                        className="border-2 border-red-300 flex items-center p-2 ml-[50px]   left-0 "
                        variant={'ghost'}
                        onClick={() => setDeleteModalOpen(true)}
                    >
                        <Trash2 className="text-red-400" size={17} /> Delete MCQ
                    </Button>
                    <DeleteConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={deleteMcqHalderinBulk}
                        modalText={
                            'Are You Sure you want to delete Selected Mcqs ?'
                        }
                        buttonText="Delete Quiz Question"
                        input={false}
                    />
                </div>
            ) : (
                <div></div>
            )}
        </div>
    )
}

export default McqDeleteVaiarntComp
