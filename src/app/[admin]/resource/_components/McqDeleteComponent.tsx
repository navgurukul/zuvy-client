import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import DeleteConfirmationModal from '../../courses/[courseId]/_components/deleteModal'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { getAllQuizData, getOffset, getPosition } from '@/store/store'

type Props = {
    logSelectedRows: () => any[]
    table: any
}

const McqDeleteVaiarntComp = ({ logSelectedRows, table }: Props) => {
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const { setStoreQuizData } = getAllQuizData()

    const selectedRows = logSelectedRows()
    const { offset } = getOffset()
    const { position } = getPosition()
    

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

        async function getAllUpdatedQuiz() {
            const safeOffset = Math.max(0, offset)
            await api
                .get(
                    `/Content/allQuizQuestions?limit=${position}&offset=${safeOffset}`
                )
                .then((res) => {
                    setStoreQuizData(res.data.data)
                })
        }

        await api({
            method: 'delete',
            url: 'Content/deleteMainQuizOrVariant',
            data: transformedBody,
        })
            .then((res) => {
                toast.success({
                    title: 'Success',
                    description: res.data.message,
                })
                table.toggleAllPageRowsSelected(false)

                setDeleteModalOpen(false)
                getAllUpdatedQuiz()
            })
            .catch((error) => {
                toast.error({
                    title: 'Error',
                    description:
                        error.response?.data?.message || 'An error occurred',
                })
                if (
                    error.response?.data?.message.includes('Quizzes with IDs')
                ) {
                    getAllUpdatedQuiz()
                    setDeleteModalOpen(false)
                    table.toggleAllPageRowsSelected(false)
                }
            })
    }

    return (
    <div>
        {selectedRows.length > 0 ? (
            <Button
                className="border-2 border-red-300 flex items-center p-2 mr-[1rem] mt-[3rem]" 
                variant={'ghost'}
                onClick={() => setDeleteModalOpen(true)}
            >
                <Trash2 className="text-red-400 mr-2" size={17} /> Delete MCQ
            </Button>
        ) : null}
        
        <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={deleteMcqHalderinBulk}
            modalText={'Are You Sure you want to delete Selected Mcqs ?'}
            buttonText="Delete Quiz Question"
            input={false}
        />
    </div>
)
}

export default McqDeleteVaiarntComp
