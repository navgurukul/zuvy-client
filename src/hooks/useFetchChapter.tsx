// hooks/useFetchChapterContent.ts
import { useState, useCallback } from 'react'
import { api } from '@/utils/axios.config'

const useFetchChapterContent = () => {
    const [loading, setLoading] = useState(true)
    const [chapterContent, setChapterContent] = useState<any>(null)

    // Function to fetch chapter content
    const fetchChapterContent = useCallback(
        async (
            chapterId: number,
            topicId: number,
            courseId: string,
            moduleId: string
        ) => {
            try {
                const response = await api.get(
                    `Content/chapterDetailsById/${chapterId}?bootcampId=${courseId}&moduleId=${moduleId}&topicId=${topicId}`
                )
                setChapterContent(response.data)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching chapter content:', error)
                setLoading(false)
            }
        },
        []
    )

    return { fetchChapterContent, chapterContent, loading }
}

export default useFetchChapterContent
