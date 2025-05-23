import React, { useEffect, useState } from 'react'
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import useGetMCQs from '@/hooks/useGetMcq'
import DOMPurify from 'dompurify'
import { AlertDialogHeader } from '@/components/ui/alert-dialog'
import { AlertDialogTitle } from '@radix-ui/react-alert-dialog'
import { addClassToCodeTags } from '@/utils/admin'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'

type Props = {
    quizQuestionId: number
    tags?: any
    assesmentSide?: boolean
    tagId?: number
}

const PreviewMCQ = ({ quizQuestionId, tags, assesmentSide, tagId }: Props) => {
    const { quizData, difficulty, tagName } = useGetMCQs({
        id: quizQuestionId,
        tags,
        assesmentSide,
    })
    const [activeTab, setActiveTab] = useState<string | null>(null)
    const [codeSnippet, setCodeSnippet] = useState<any>()
    const codeBlockClass =
        'text-gray-800 font-light bg-gray-300 p-4 rounded-lg text-left whitespace-pre-wrap w-full'

    useEffect(() => {
        if (quizData?.quizVariants?.length) {
            const initialVariant = quizData.quizVariants[0]
            setActiveTab(initialVariant.id.toString())
            updateCodeSnippet(initialVariant.question)
        }
    }, [quizData])

    // Function to sanitize and update codeSnippet
    const updateCodeSnippet = (question: any) => {
        const clean = DOMPurify.sanitize(question)
        const updatedHtml = clean.replace(
            /<pre>/g,
            '<pre class="text-gray-800 font-light bg-gray-300 p-1 rounded-lg text-left text-wrap overflow-y-scroll  overflow-scroll w-full">'
        )
        setCodeSnippet(updatedHtml)
    }

    const difficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-green-100 text-secondary'
            case 'Medium':
                return 'bg-orange-100 text-yellow-dark'
            case 'Hard':
                return 'bg-red-100 text-destructive'
            default:
                return 'bg-gray-200 text-gray-800'
        }
    }

    if (!quizData) return null

    const handleTabChange = (variantId: any) => {
        setActiveTab(variantId.toString())
        const selectedVariant = quizData.quizVariants.find(
            (variant: any) => variant.id.toString() === variantId.toString()
        )
        if (selectedVariant) {
            updateCodeSnippet(selectedVariant.question)
        }
    }

    const generateCodePreview = (codeQuestion: string) => {
        // Sanitize the input string
        const clean = DOMPurify.sanitize(codeQuestion)

        // Add class to <pre> and <code> tags
        const updatedHtml = clean
            .replace(
                /<pre>/g,
                '<pre class="text-gray-800 font-light bg-gray-300 p-0 rounded-lg text-left text-wrap w-2/2">'
            )
            .replace(
                /<code>/g,
                '<code class="text-gray-800 bg-gray-300 text-wrap">'
            )

        return updatedHtml
    }

    const newTagName = tags.filter((tag: any) => tag.id == tagId)

    return (
        <ScrollArea className="max-h-[500px] pr-3">
            <div className="w-full max-h-[500px]">
                <DialogHeader className="">
                    <div className="flex gap-x-3 ">
                        Question Preview{' '}
                        <div className="flex gap-x-3 items-center">
                            <span className="font-md text-[14px] bg-green-200 px-2  py-0.5 my-0.5 text-secondary rounded-md">
                                {assesmentSide
                                    ? tagName
                                    : newTagName[0].tagName}
                            </span>
                            <span
                                className={`font-normal text-[14px] px-2 py-0.5 my-0.5 rounded-md ${difficultyColor(
                                    difficulty as any
                                )}`}
                            >
                                {difficulty}
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs
                    value={activeTab as any}
                    className="w-full mt-5"
                    onValueChange={(value) => setActiveTab(value)}
                >
                    <TabsList className="flex justify-start bg-white">
                        {quizData.quizVariants.map((variant: any) => (
                            <TabsTrigger
                                key={variant.id}
                                value={variant.id.toString()}
                                onClick={() => handleTabChange(variant.id)}
                                className={`px-4 py-2 rounded-none ${
                                    activeTab === variant.id.toString()
                                        ? 'text-secondary border-b-2 border-secondary'
                                        : 'text-gray-500'
                                }`}
                            >
                                Variant {variant.variantNumber}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="w-full">
                        {quizData.quizVariants.map(
                            (variant: any, index: number) => (
                                <TabsContent
                                    key={variant.id}
                                    value={variant.id.toString()}
                                    className={`w-full  ${
                                        activeTab === variant.id.toString()
                                            ? 'block'
                                            : 'hidden'
                                    } `}
                                >
                                    <div className="mb-4">
                                        <div className="text-left flex gap-2 mb-2">
                                            <span className="font-bold flex">
                                                <h1>Q.</h1>
                                            </span>
                                            <RemirrorForm
                                                description={variant.question}
                                                preview={true}
                                            />
                                            {/* {variant.question} */}
                                        </div>
                                        <ul className="list-none pl-1">
                                            {Object.entries(
                                                variant.options
                                            ).map(([key, option], index) => (
                                                <li
                                                    key={key}
                                                    className="mt-1 flex gap-x-2 items-center"
                                                >
                                                    <p>{index + 1}.</p>
                                                    <Input
                                                        value={option as string}
                                                        readOnly
                                                        className={
                                                            parseInt(key) ===
                                                            variant.correctOption
                                                                ? 'border-2 border-secondary text-secondary'
                                                                : 'border-gray-300'
                                                        }
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </TabsContent>
                            )
                        )}
                    </div>
                </Tabs>
            </div>
        </ScrollArea>
    )
}

export default PreviewMCQ
