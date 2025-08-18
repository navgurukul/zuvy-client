import { useCallback, useState, useEffect } from 'react'
import { api } from '@/utils/axios.config'
import { getCodingQuestionTags } from '@/store/store'
import{Props, Tag,QuizApiResponse  } from '@/hooks/hookType'

const useGetMCQs = ({ id, tags: tag, assesmentSide }: Props) => {
    const [quizData, setQuizData] = useState<any>(null)
    const [noofExistingVariants, setNoofExistingVariants] = useState<number>(0)
    const [difficulty, setDifficulty] = useState<string | null>(null)
    const [tagName, setTagName] = useState<string | null>(null)
    const { tags } = getCodingQuestionTags()

    const newTags = (assesmentSide ? tag : tags) || []

    const fetchQuizHandler = useCallback(async () => {
        try {
            const res = await api.get<QuizApiResponse>(`/Content/quiz/${id}`)
            const quiz = res.data.data[0]

            setQuizData(quiz)
            setDifficulty(quiz.difficulty)
            setNoofExistingVariants(quiz.quizVariants.length)

            // Find the tag name based on the `tagId`
            const matchingTag = newTags.find(
                (tag:  Tag ) => tag.id === quiz.tagId
            )
            setTagName(matchingTag ? matchingTag.tagId : null)
        } catch (error: any) {
            console.error(
                error?.response?.data?.message || 'Error fetching quiz data'
            )
        }
    }, [id, tags])

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
