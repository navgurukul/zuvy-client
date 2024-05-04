'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import Tiptap from './Tiptap'
interface ContentDetail {
    title: string
    description: string | null
    links: string | null
    file: string | null
    content: string | null
}

interface Content {
    id: number
    moduleId: number
    topicId: number
    order: number
    contentDetails: ContentDetail[]
}

interface ArticleProps {
    content: Content
}

const AddArticle = ({ content }: ArticleProps) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const { contentDetails } = content
    const [showContent, setShowContent] = useState(false)
    const { moduleId } = useParams()

    return (
        <div>
            <Tiptap chapterContent={content} />
        </div>
    )
}

export default AddArticle
