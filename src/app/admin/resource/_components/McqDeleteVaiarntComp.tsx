import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { handleMcqDelete } from '@/store/store'
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
            questionIds: selectedQuestionIds,
        }

        console.log(transformedBody)

        await api({
            method: 'delete',
            url: 'Content/deleteQuizQuestion',
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

        // try {
        //     await api
        //         .delete('/Content/deleteQuizQuestion', transformedBody)
        //         .then((res) => {
        //             toast({
        //                 title: 'Success',
        //                 description: res.data.message,
        //                 className:
        //                     'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
        //             })
        //         })
        // } catch (error: any) {
        //     toast({
        //         title: 'Error',
        //         description:
        //             error.response?.data?.message || 'An error occurred',
        //         className:
        //             'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
        //     })
        // } finally {
        //     setDeleteModalOpen(false)
        // }
    }

    return (
        <div>
            <Button
                className="border-2 border-red-300 flex items-center p-2 ml-[50px]   left-0 "
                variant={'ghost'}
                onClick={() => setDeleteModalOpen(true)}
                disabled={selectedRows.length > 0 ? false : true}
            >
                <Trash2 className="text-red-400" size={17} /> Delete MCQ
            </Button>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={deleteMcqHalderinBulk}
                modalText={'Are You Sure you want to delete Selected Mcq ?'}
                buttonText="Delete Quiz Question"
                input={false}
            />
        </div>
    )
}

export default McqDeleteVaiarntComp
