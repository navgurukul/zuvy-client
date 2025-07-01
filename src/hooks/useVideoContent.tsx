import { useMemo } from 'react'
import { getEmbedLink } from '@/utils/admin'
import useWindowSize from '@/hooks/useHeightWidth'

interface ChapterDetails {
    id: number
    title: string
    description: string | null
    status: string
    file: string | null
    links: string[] | null
    duration?: string
}

export const useVideoContent = (chapterDetails: ChapterDetails) => {
    const { width } = useWindowSize()
    const isMobile = width < 768

    const modifiedLink = useMemo(() => {
        if (!chapterDetails.links?.length) return null
        return getEmbedLink(chapterDetails.links[0])
    }, [chapterDetails.links])

    const isGdriveVideo = (link: string) => link.includes('drive')

    return {
        isMobile,
        modifiedLink,
        isGdriveVideo,
    }
}
