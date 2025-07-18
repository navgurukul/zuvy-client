import { useCallback, useState, useEffect } from 'react'
import { api } from '@/utils/axios.config'
import { getCodingQuestionTags } from '@/store/store'

type Props = {
    id: number
    tags?: any
    assesmentSide?: boolean
}

const useGetMCQs = ({ id, tags: tag, assesmentSide }: Props) => {
    const [quizData, setQuizData] = useState<any>(null)
    const [noofExistingVariants, setNoofExistingVariants] = useState<number>(0)
    const [difficulty, setDifficulty] = useState<string | null>(null)
    const [tagName, setTagName] = useState<string | null>(null)
    const { tags } = getCodingQuestionTags()

    const newTags = assesmentSide ? tag : tags

    const fetchQuizHandler = useCallback(async () => {
        try {
            const res = await api.get(`/Content/quiz/${id}`)
            const quiz = res.data.data[0]

            setQuizData(quiz)
            setDifficulty(quiz.difficulty)
            setNoofExistingVariants(quiz.quizVariants.length)

            // Find the tag name based on the `tagId`
            const matchingTag = newTags.find(
                (tag: any) => tag.id === quiz.tagId
            )
            setTagName(matchingTag ? matchingTag.tagName : null)
        } catch (error: any) {
            console.error(
                error?.response?.data?.message || 'Error fetching quiz data'
            )
        }
    }, [id, newTags])

    useEffect(() => {
        if (id) {
            fetchQuizHandler()
        }
    }, [id, fetchQuizHandler])

    return {
        quizData,
        difficulty,
        tagName,
        noofExistingVariants,
        refetch: fetchQuizHandler,
    }
}

export default useGetMCQs
