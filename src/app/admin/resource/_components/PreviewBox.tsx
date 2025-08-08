import React, { useEffect, useState } from 'react'
import useGetMCQs from '@/hooks/useGetMcq'
import DOMPurify from 'dompurify'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import {DialogBoxProps,PreviewBoxQuizVariantData,PreviewBoxQuizVariant} from "@/app/admin/resource/_components/adminResourceComponentType"

export default function DialogBox({
    show,
    onClose,
    title,
    message,
    quizQuestionId,
}:DialogBoxProps) {
    const { quizData, difficulty, tagName } = useGetMCQs({
        id: quizQuestionId,
    })
    const [activeTab, setActiveTab] = useState<string | null>(null)
    const [codeSnippet, setCodeSnippet] = useState< string>('')

    useEffect(() => {
        if (quizData?.quizVariants?.length) {
            const initialVariant = quizData.quizVariants[0]
            setActiveTab(initialVariant.id.toString())
            updateCodeSnippet(initialVariant.question)
        }
    }, [quizData])

    // Function to sanitize and update codeSnippet
    const updateCodeSnippet = (question:  string) => {
        const clean = DOMPurify.sanitize(question)
        const updatedHtml = clean.replace(
            /<pre>/g,
            '<pre class="text-gray-800 font-light bg-gray-400 p-5 rounded-lg text-left ">'
        )
        setCodeSnippet(updatedHtml)
    }
    if (quizData) {
    }

    const difficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-green-200 text-green-800'
            case 'Medium':
                return 'bg-yellow-200 text-yellow-800'
            case 'Hard':
                return 'bg-red-200 text-red-800'
            default:
                return 'bg-gray-200 text-gray-800'
        }
    }

    if (!quizData) return null

    const handleTabChange = (variantId: PreviewBoxQuizVariantData) => {
        setActiveTab(variantId.toString())
        const selectedVariant = quizData.quizVariants.find(
            (variant: PreviewBoxQuizVariant) => variant.id.toString() === variantId.toString()
        )
        if (selectedVariant) {
            updateCodeSnippet(selectedVariant.question)
        }
    }

    if (!show) return null

    return (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-20 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-3/4 h-3/4 sm:w-3/4 sm:h-3/4 md:w-3/4 md:h-3/4 lg:w-3/4 lg:h-3/4 shadow-lg overflow-y-auto relative">
                {/* Close Button at Top Right */}
                {/* <button className="absolute top-4 right-4 bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600">
                    X
                </button> */}
                <X
                    size={35}
                    className="absolute top-4 right-4 text-red-500  p-2 rounded-full cursor-pointer"
                    onClick={onClose}
                />

                {/* Dialog Content */}
                <div className="w-full">
                    <header>
                        <div className="flex gap-x-3">
                            Question Preview{' '}
                            <div className="flex gap-x-3 items-center">
                                <span className="font-md text-[14px] bg-green-200 px-2  py-0.5 my-0.5 text-secondary rounded-md">
                                    {tagName}
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
                    </header>

                    <Tabs
                        value={activeTab as any}
                        className="w-full"
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

                        {quizData.quizVariants.map((variant: any) => (
                            <TabsContent
                                key={variant.id}
                                value={variant.id.toString()}
                                className={`w-full ${
                                    activeTab === variant.id.toString()
                                        ? 'block'
                                        : 'hidden'
                                } `}
                            >
                                <div className="mb-4">
                                    <div className="text-left flex gap-2">
                                        <span className="font-bold">Q.</span>
                                        <div
                                            className=""
                                            dangerouslySetInnerHTML={{
                                                __html: codeSnippet,
                                            }}
                                        />
                                    </div>
                                    <ul className="list-none pl-1">
                                        {Object.entries(variant.options).map(
                                            ([key, option], index) => (
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
                                            )
                                        )}
                                    </ul>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
                {/* <p className="text-gray-600 mb-6">{message}</p> */}
            </div>
        </div>
    )
}
