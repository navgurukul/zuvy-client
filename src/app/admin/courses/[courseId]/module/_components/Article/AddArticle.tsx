'use client'

import React from 'react'

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
    return (
        <div>
            <Tiptap chapterContent={content} />
        </div>
    )
}

export default AddArticle
