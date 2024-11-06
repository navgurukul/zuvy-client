import { useCallback, useState, useEffect } from 'react'
import { api } from '@/utils/axios.config'
import { getCodingQuestionTags } from '@/store/store'

type Props = {
    id: number
}

const useGetMCQs = ({ id }: Props) => {
    const [quizData, setQuizData] = useState(null)
    const [difficulty, setDifficulty] = useState<string | null>(null)
    const [tagName, setTagName] = useState<string | null>(null)
    const { tags } = getCodingQuestionTags() // Assume this returns the list of tags

    const fetchQuizHandler = useCallback(async () => {
        try {
            const res = await api.get(`/Content/quiz/${id}`)
            const quiz = res.data.data[0]

            setQuizData(quiz)
            setDifficulty(quiz.difficulty)

            // Find the tag name based on the `tagId`
            const matchingTag = tags.find((tag) => tag.id === quiz.tagId)
            setTagName(matchingTag ? matchingTag.tagName : null)
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

    return { quizData, difficulty, tagName }
}

export default useGetMCQs
