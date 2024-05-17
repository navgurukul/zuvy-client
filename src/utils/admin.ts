import { toast } from "@/components/ui/use-toast"
import { api } from "./axios.config"

export function handleDelete(deleteCodingQuestionId:any, getAllCodingQuestions:any, setCodingQuestions:any) {
    api({
        method: 'delete',
        url: 'Content/deleteCodingQuestion',
        data: {
            questionIds: [deleteCodingQuestionId],
        },
    })
        .then((res) => {
            toast({
                title: 'Success',
                description: res.data.message,
                className: 'text-start capitalize',
            })
            getAllCodingQuestions(setCodingQuestions)
        })
        .catch((error) => {
            toast({
                title: 'Error',
                description:
                    error.response?.data?.message ||
                    'An error occurred',
                className: 'text-start capitalize',
            })
        })
}

export const handleDeleteModal = (setDeleteModalOpen:any, setDeleteCodingQuestionId:any, codingQuestion:any) => {
    setDeleteModalOpen(true)
    setDeleteCodingQuestionId(codingQuestion.id)
}

export const handleConfirm = (handleDelete:any, setDeleteModalOpen:any, deleteCodingQuestionId:any, getAllCodingQuestions:any, setCodingQuestions:any) => {
    handleDelete(deleteCodingQuestionId, getAllCodingQuestions, setCodingQuestions)
    setDeleteModalOpen(false)
}

export async function getAllCodingQuestions(setCodingQuestions:any) {
    try {
        const response = await api.get('Content/allCodingQuestions')
        setCodingQuestions(response.data)
    } catch (error) {
        console.error(error)
    }
}