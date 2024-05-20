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

export function deleteOpenEndedQuestion(deleteOpenEndedQuestionId:any, getAllOpenEndedQuestions:any, setOpenEndedQuestions:any) {
    api({
        method: 'delete',
        url: 'Content/deleteOpenEndedQuestion',
        data: {
            questionIds: [deleteOpenEndedQuestionId],
        },
    })
        .then((res) => {
            toast({
                title: 'Success',
                description: res.data.message,
                className: 'text-start capitalize',
            })
            getAllOpenEndedQuestions(setOpenEndedQuestions)
            
        })
        .catch((error) => {
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.message ||
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

export const getAllOpenEndedQuestions = async (setAllOpenEndedQuestions:any) => {
    try {
        const response = await api.get('/Content/openEndedQuestions')
        setAllOpenEndedQuestions(response.data.data)
    } catch (error) {
        console.error(error)
    }
}

export const handleEditOpenEndedQuestion = (openEndedQuestion:any, setIsOpenEndDialogOpen:any, setEditOpenEndedQuestionId:any) => {
    setIsOpenEndDialogOpen(true)
    setEditOpenEndedQuestionId(openEndedQuestion.id)
}
export const handleEditCodingQuestion = (codingQuestion:any, setIsCodingDialogOpen:any, setEditCodingQuestionId:any) => {
    setIsCodingDialogOpen(true)
    setEditCodingQuestionId(codingQuestion.id)
}

export async function getAllTags(setTags:any) {
    const response = await api.get('Content/allTags')
    if (response) {
        setTags(response.data.allTags)
    }
}