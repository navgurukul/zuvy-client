'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { Editor } from 'react-draft-wysiwyg'
import {
    EditorState,
    convertToRaw,
    convertFromRaw,
    RawDraftContentState,
} from 'draft-js'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'

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
    const [editorStates, setEditorStates] = useState([
        EditorState.createEmpty(),
    ])
    const { contentDetails } = content
    const [savedContents, setSavedContents] = useState<RawDraftContentState[]>(
        []
    )
    const [showContent, setShowContent] = useState(false)
    const { moduleId } = useParams()

    const onEditorStateChange = (index: number) => (newState: EditorState) => {
        const newEditorStates = [...editorStates]
        newEditorStates[index] = newState
        setEditorStates(newEditorStates)

        const newSavedContents = [...savedContents]
        newSavedContents[index] = convertToRaw(newState.getCurrentContent())
        setSavedContents(newSavedContents)
    }

    const addEditor = () => {
        setEditorStates([...editorStates, EditorState.createEmpty()])
        setSavedContents([
            ...savedContents,
            convertToRaw(EditorState.createEmpty().getCurrentContent()),
        ])
    }

    const removeEditor = (index: number) => {
        const newEditorStates = [...editorStates]
        newEditorStates.splice(index, 1)
        setEditorStates(newEditorStates)

        const newSavedContents = [...savedContents]
        newSavedContents.splice(index, 1)
        setSavedContents(newSavedContents)
    }

    const loadContent = () => {
        setShowContent(true)
    }

    const handleSubmit = () => {
        if (title && description) {
            api.put(
                `/Content/editChapterOfModule/${moduleId}?chapterId=${content?.id}`,
                {
                    title: title,
                    description: description,
                    articleContent: savedContents,
                }
            )
                .then((response) => {
                    console.log(response.data)
                })
                .catch((error) => {
                    console.error(error)
                })
        } else {
            alert('Please fill in both the title and description')
        }
    }

    return (
        <div className="flex flex-col justify-center items-center w-full">
            <input
                type="text"
                className="text-center"
                placeholder={
                    contentDetails[0].title || 'Enter Article Title Here...'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                placeholder={
                    contentDetails[0].description ||
                    'Enter Article Description Here...'
                }
                value={description}
                cols={30}
                className="text-center"
                onChange={(e) => setDescription(e.target.value)}
            />
            {editorStates.map((editorState, index) => (
                <div key={index}>
                    <Editor
                        editorState={editorState}
                        onEditorStateChange={onEditorStateChange(index)}
                        wrapperClassName="card"
                        editorClassName="card-body"
                        placeholder="    Write Your Article Content Here..."
                        toolbar={{
                            inline: { inDropdown: true },
                            list: { inDropdown: true },
                            textAlign: { inDropdown: true },
                            image: { uploadEnabled: true },
                            remove: { inDropdown: true },
                            history: { inDropdown: true },
                        }}
                    />
                    <Button
                        className="mb-5"
                        onClick={() => removeEditor(index)}
                    >
                        Remove Text Editor
                    </Button>
                </div>
            ))}
            <Button className="mb-5" onClick={addEditor}>
                Add Text Editor
            </Button>
            <Button onClick={loadContent}>Load Content</Button>
            <Button className="mt-5" onClick={handleSubmit}>
                Submit
            </Button>
            {showContent &&
                savedContents.map((content, index) => (
                    <Editor
                        key={index}
                        editorState={EditorState.createWithContent(
                            convertFromRaw(content)
                        )}
                        readOnly
                        toolbarHidden
                    />
                ))}
        </div>
    )
}

export default AddArticle
