'use client'

import React, { useEffect, useState } from 'react'
import { getEditQuizQuestion } from '@/store/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import DOMPurify from 'dompurify'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { X } from 'lucide-react'
import useGetMCQs from '@/hooks/useGetMcq'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import DeleteConfirmationModal from '../../courses/[courseId]/_components/deleteModal'
import RemirrorForForm from '@/app/admin/resource/_components/RemirrorForForm'
import { Spinner } from '@/components/ui/spinner'

type Props = {}

const formSchema = z.object({
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    topics: z.number().min(1, 'You need to select a Topic'),
    variants: z.array(
        z.object({
            variantId: z.number().optional(),
            questionText: z.string().nonempty('Question text is required'),
            selectedOption: z.number().nonnegative(),
            options: z
                .array(
                    z.object({
                        optionText: z
                            .string()
                            .nonempty('Option text is required'),
                    })
                )
                .min(2, 'At least two options are required'),
        })
    ),
})

const EditMcqForm = ({
    tags,
    closeModal,
    setStoreQuizData,
    getAllQuizQuesiton,
}: {
    tags: any[]
    closeModal: () => void
    setStoreQuizData: any
    getAllQuizQuesiton: any
}) => {
    const { quizQuestionId } = getEditQuizQuestion()
    const { quizData, noofExistingVariants, refetch } = useGetMCQs({
        id: quizQuestionId,
    })
    const [isVariantAdded, setIsVariantAdded] = useState<boolean>(false)
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [activeVariantIndex, setActiveVariantIndex] = useState<number>(0)
    const difficulties = ['Easy', 'Medium', 'Hard']

    const form = useForm<z.infer<typeof formSchema>>({
        mode: 'onChange',
        resolver: zodResolver(formSchema),
        defaultValues: {
            difficulty: 'Easy',
            topics: 0,
            variants: [
                {
                    questionText: '',
                    selectedOption: 0,
                    options: [{ optionText: '' }, { optionText: '' }],
                },
            ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'variants',
    })

    const optionsPath = `variants.${activeVariantIndex}.options`
    const currentOptions = form.watch(optionsPath) || []

    const handleAddOption = () => {
        form.setValue(optionsPath, [...currentOptions, { optionText: '' }], {
            shouldValidate: true,
        })
    }

    const handleRemoveOption = (index: number) => {
        const selectedOptionPath = `variants.${activeVariantIndex}.selectedOption`
        const selectedOption = form.getValues(selectedOptionPath)

        const newOptions = currentOptions.filter((_, i) => i !== index)
        form.setValue(optionsPath, newOptions, { shouldValidate: true })

        if (selectedOption === index) {
            form.setValue(selectedOptionPath, 0)
        } else if (selectedOption > index) {
            form.setValue(selectedOptionPath, selectedOption - 1)
        }
    }

    const handleAddVariant = () => {
        append({
            questionText: '',
            selectedOption: 0,
            options: [{ optionText: '' }, { optionText: '' }],
        })
        setActiveVariantIndex(fields.length)
        setIsVariantAdded(fields.length + 1 > noofExistingVariants)
    }

    const handleRemoveVariant = async (index: number) => {
        if (fields.length > 1) {
            remove(index)
            if (index >= fields.length - 1) {
                setActiveVariantIndex(fields.length - 2)
            } else if (index === activeVariantIndex) {
                setActiveVariantIndex(Math.max(0, index - 1))
            }
        }
        setIsVariantAdded(fields.length - 1 > noofExistingVariants)
        const removedVariantId = fields[index].variantId
        const reqBody = {
            questionIds: [
                {
                    id: removedVariantId,
                    type: 'variant',
                },
            ],
        }
        await api({
            method: 'delete',
            url: `/Content/deleteMainQuizOrVariant`,
            data: reqBody,
        })
            .then((res) => {
                toast({
                    title: 'Success',
                    description: res.data.message,
                })
                setDeleteModalOpen(false)
                refetch()
            })
            .catch((error) => {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description:
                        error.response?.data?.message || 'An error occurred',
                })
            })
    }

    function findMissingVariants(object1: any, object2: any) {
        const variantsObject1 = object1.variantMCQs || []
        const variantsObject2 = object2.quizVariants || []

        const variantsObject2Map = new Map()
        variantsObject2.forEach((variant: any) => {
            variantsObject2Map.set(variant.variantNumber, variant)
        })

        const missingVariants = variantsObject1.filter((variant: any) => {
            return !variantsObject2Map.has(variant.variantNumber)
        })

        return missingVariants
    }
    
    const formatErrorMessage = (validationResult: { isValid: boolean; reason: string; issues: string[] }) => {
        if (validationResult.isValid) {
            return "AI Validation successful.";
        }
    
        if (validationResult.issues && validationResult.issues.length > 0) {
            const issue = validationResult.issues[0].toLowerCase();
            if (issue.includes("correct answer")) return "The selected answer is incorrect.";
            if (issue.includes("distractor")) return "Improve the incorrect options.";
            if (issue.includes("multiple correct")) return "Multiple correct answers found.";
            if (issue.includes("difficulty")) return "Question difficulty mismatch.";
            if (issue.includes("topic")) return "Question topic mismatch.";
            if (issue.includes("service error")) return "AI Service Error. Please try again.";
            return `Validation Issue: ${validationResult.issues[0]}`;
        }
        
        if (validationResult.reason) {
            const reason = validationResult.reason.toLowerCase();
            if (reason.includes("parse") || reason.includes("unexpected")) return "Invalid response from AI.";
            if (reason.includes("unavailable")) return "AI service unavailable or error.";
        }
    
        return "An unknown validation error occurred.";
    };
    const validateMCQWithAI = async (mcqData: {
        questionText: string
        options: { optionText: string }[]
        selectedOption: number
        difficulty: string
        topicName: string
    }) => {
        const { questionText, options, selectedOption, difficulty, topicName } = mcqData
        const correctOptionText = options[selectedOption]?.optionText

        const sanitizedQuestionText = DOMPurify.sanitize(questionText);
        const sanitizedOptions = options.map(opt => DOMPurify.sanitize(opt.optionText));
        const sanitizedCorrectOptionText = DOMPurify.sanitize(correctOptionText);
        const prompt = `
            You are an expert in multiple-choice questions for the topic: "${topicName || 'General Knowledge'}".
            Please validate the following MCQ for a test on this topic.
            Question:
            ${sanitizedQuestionText}

            Options:
            ${sanitizedOptions.map((opt, i) => `${String.fromCharCode(65 + i)}. "${opt}"`).join('\n')}
            Correct Answer: "${sanitizedCorrectOptionText}" (Option ${String.fromCharCode(65 + selectedOption)})

            Difficulty: ${difficulty}
            Topic: ${topicName || 'Not specified'}

            Evaluate the following:
            1. Is the designated "Correct Answer" truly correct for the given question and topic?
            2. Are the other options clearly incorrect for the given question in the context of the topic?
            3. Is there only one correct answer among all provided options?
            4. Is the question appropriate for the selected difficulty (${difficulty}) and topic (${topicName || 'Not specified'})?
            Your response MUST be ONLY the JSON object, with no additional text or formatting.
            Provide your response in a JSON format with the following structure:
            {
                "isValid": boolean,
                "reason": string,
                "issues": []
            }
        `;
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = {
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        isValid: { type: "BOOLEAN" },
                        reason: { type: "STRING" },
                        issues: {
                            type: "ARRAY",
                            items: { type: "STRING" }
                        }
                    },
                    required: ["isValid", "reason", "issues"]
                }
            }
        };
        const apiKey = "AIzaSyBc54lljwvKqkgKpFcU0lbjZxihs7-mA2A";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.candidates && result.candidates[0]?.content?.parts[0]) {
                 const responseText = result.candidates[0].content.parts[0].text;
                 if (!responseText) throw new Error('AI response text part is empty.');
                 return JSON.parse(responseText);
            } else {
                throw new Error('AI response structure is unexpected or empty.');
            }
        } catch (error: any) {
            return {
                isValid: false,
                reason: `AI validation service unavailable or encountered an error: ${error.message}.`,
                issues: ["AI service error."]
            };
        }
    };

    const onSubmitHandler = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const selectedTagObject = tags.find(tag => tag.id === values.topics);
            const topicName = selectedTagObject ? String(selectedTagObject.tagName) : 'Unknown Topic';

            for (let i = 0; i < values.variants.length; i++) {
                const variant = values.variants[i];

                // Skip validation if the question text contains an image tag
                if (variant.questionText.includes('<img')) {
                    continue;
                }

                const validationResult = await validateMCQWithAI({
                    questionText: variant.questionText,
                    options: variant.options,
                    selectedOption: variant.selectedOption,
                    difficulty: values.difficulty,
                    topicName: topicName,
                });

                if (!validationResult.isValid) {
                    const errorMessage = formatErrorMessage(validationResult);
                    toast({
                        variant: "destructive",
                        title: `Validation Failed for Variant ${i + 1}`,
                        description: errorMessage,
                    });
                    setIsLoading(false);
                    return;
                }
            }
            
            toast.success({
                title: 'Validation Success',
                description: 'All variants passed AI Validation. Saving changes...',
            });

            if (isVariantAdded) {
                const transformedObj = {
                    id: quizQuestionId,
                    title: 'Introduction to Quantum Physics',
                    difficulty: values.difficulty,
                    tagId: values.topics,
                    content: values.variants[activeVariantIndex].questionText,
                    isRandomOptions: false,
                    variantMCQs: values.variants.map((variant, index) => ({
                        variantNumber: index + 1,
                        question: variant.questionText,
                        options: variant.options.reduce((acc: any, option, idx) => {
                            acc[idx + 1] = option.optionText;
                            return acc;
                        }, {}),
                        correctOption: variant.selectedOption + 1,
                    })),
                };
                const missingVariants = findMissingVariants(transformedObj, quizData);
                const updatedVariants = missingVariants.map((variants: any) => ({
                    correctOption: variants.correctOption,
                    options: variants.options,
                    question: variants.question,
                }))

                const reqBody = {
                    quizId: quizQuestionId,
                    variantMCQs: updatedVariants,
                }

                await api
                    .post(`/Content/quiz/add/variants`, reqBody)
                    .then((res) => {
                        toast({
                            title: 'Success',
                            description: res.data.message,
                        })
                    })

                setIsVariantAdded(false)
                await refetch()
            } else {
                const transformedObj = {
                    id: quizQuestionId,
                    title: 'Introduction to Quantum Physics',
                    difficulty: values.difficulty,
                    tagId: values.topics,
                    content: values.variants[activeVariantIndex].questionText,
                    isRandomOptions: false,
                    variantMCQs: values.variants.map((variant, index) => ({
                        variantNumber: index + 1,
                        question: variant.questionText,
                        options: variant.options.reduce((acc: any, option, idx) => {
                            acc[idx + 1] = option.optionText;
                            return acc;
                        }, {}),
                        correctOption: variant.selectedOption + 1,
                    })),
                }
                await api
                    .post(`/Content/editquiz`, transformedObj)
                    .then((res) => {
                        toast.success({
                            title: 'Success',
                            description: res?.data.message,
                        })
                    })
                await refetch()
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: 'Error',
                description: error?.data?.message || 'An unexpected error occurred',
            })
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (quizData) {
            form.reset({
                difficulty: quizData.difficulty,
                topics: quizData.tagId || 0,
                variants: quizData.quizVariants.map((variant: any) => ({
                    variantId: variant.id,
                    questionText: variant.question,
                    selectedOption: variant.correctOption - 1,
                    options: Object.values(variant.options).map(
                        (optionText) => ({
                            optionText,
                        })
                    ),
                })),
            })
            setIsVariantAdded(fields.length > noofExistingVariants)
        }
    }, [quizData, form, refetch])
    
    const { isDirty } = form.formState;
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmitHandler)}
                className="space-y-8 mr-12 w-[700px] flex flex-col justify-center items-center "
            >
                <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                        <div className="w-full ml-[140px]">
                            <FormItem className="space-y-3 text-start ">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={(value) =>
                                            field.onChange(value)
                                        }
                                        value={field.value}
                                    >
                                        <div className="flex gap-x-5 ml-[17px]">
                                            <FormLabel className="mt-5 font-semibold text-md ">
                                                Difficulty
                                            </FormLabel>
                                            {difficulties.map((difficulty) => (
                                                <FormItem
                                                    key={difficulty}
                                                    className="flex items-center space-x-2 space-y-0"
                                                >
                                                    <FormControl className="">
                                                        <RadioGroupItem
                                                            value={difficulty}
                                                            className="text-secondary"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-md ">
                                                        {difficulty}
                                                    </FormLabel>
                                                </FormItem>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </div>
                    )}
                />

                <FormField
                    control={form.control}
                    name="topics"
                    render={({ field }) => (
                        <div className="w-full ml-[140px]">
                            <FormItem className="text-left flex flex-col   ml-[20px] ">
                                <FormLabel className="font-semibold text-md">
                                    Topics
                                </FormLabel>
                                <div className="flex gap-x-4">
                                    <Select
                                        value={
                                            tags.find(
                                                (tag) => tag.id === field.value
                                            )?.tagName ||
                                            tags.find(
                                                (tag) =>
                                                    tag.id === quizData?.tagId
                                            )?.tagName ||
                                            ''
                                        }
                                        onValueChange={(value) => {
                                            const selectedTag = tags.find(
                                                (tag) => tag.tagName === value
                                            )
                                            if (selectedTag) {
                                                field.onChange(selectedTag.id)
                                            }
                                        }}
                                    >
                                        <FormControl className="w-[190px]">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose Topic" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {tags.map((tag) => (
                                                <SelectItem
                                                    key={tag.id}
                                                    value={tag.tagName}
                                                >
                                                    {tag.tagName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <FormMessage />
                            </FormItem>
                        </div>
                    )}
                />

                <div className="space-y-4 ml-[195px]">
                    <FormLabel className="mt-5 font-semibold text-md flex ">
                        Variants
                    </FormLabel>
                    <div className="flex space-x-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="relative group">
                                <Button
                                    className={`${
                                        activeVariantIndex === index
                                            ? 'border-b-4 border-secondary text-secondary text-md'
                                            : ''
                                    } rounded-none`}
                                    variant="ghost"
                                    type="button"
                                    onClick={() => setActiveVariantIndex(index)}
                                >
                                    Variant {index + 1}
                                </Button>
                                {fields.length > 1 && (
                                     <X
                                        size={16}
                                        onClick={() => setDeleteModalOpen(true)}
                                        className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                )}
                            </div>
                        ))}

                        <Button
                            type="button"
                            onClick={handleAddVariant}
                            variant="ghost"
                            className="font-semibold text-md"
                        >
                            + Add Variant
                        </Button>
                    </div>

                    {fields.length > 0 && fields[activeVariantIndex] && (
                        <>
                            <FormField
                                key={fields[activeVariantIndex].id}
                                control={form.control}
                                name={`variants.${activeVariantIndex}.questionText`}
                                render={({ field }) => (
                                    <FormItem className="text-left w-full">
                                        <FormLabel className="text-md font-normal">
                                            Question Text
                                        </FormLabel>
                                        <FormControl>
                                            <RemirrorForForm
                                                description={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <FormField
                                    key={`${fields[activeVariantIndex].id}-options`}
                                    control={form.control}
                                    name={`variants.${activeVariantIndex}.selectedOption`}
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={field.value?.toString() || '0'}
                                            onValueChange={(value) =>
                                                field.onChange(
                                                    Number(value)
                                                )
                                            }
                                        >
                                            <FormLabel className="text-left text-md font-normal">
                                                Answer Choices
                                            </FormLabel>
                                            {currentOptions.map(
                                                (
                                                    optionField: any,
                                                    optionIndex
                                                ) => (
                                                    <div
                                                        key={optionIndex}
                                                        className="flex items-center space-x-4"
                                                    >
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value={optionIndex.toString()}
                                                            />
                                                        </FormControl>
                                                        <FormField
                                                            control={
                                                                form.control
                                                            }
                                                            name={`variants.${activeVariantIndex}.options.${optionIndex}.optionText`}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <FormItem className="w-full">
                                                                    <FormControl>
                                                                        <Input
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        {currentOptions.length > 2 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="text-red-500"
                                                                onClick={() =>
                                                                    handleRemoveOption(
                                                                        optionIndex
                                                                    )
                                                                }
                                                            >
                                                                X
                                                            </Button>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </RadioGroup>
                                    )}
                                />

                                <div className="flex ">
                                    <Button
                                        type="button"
                                        variant={'ghost'}
                                        onClick={handleAddOption}
                                        className="text-left text-secondary font-semibold text-md"
                                    >
                                        + Add Option
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex flex-row justify-between items-end w-full ml-[195px]">
                    <Button
                        className=""
                        type="submit"
                        disabled={isLoading || !isDirty}
                    >
                        {isLoading ? (
                            <>
                                <Spinner size="small" className="mr-2" />
                                Validating & {isVariantAdded ? 'Adding' : 'Saving'}...
                            </>
                        ) : isVariantAdded ? (
                            'Add Variant'
                        ) : (
                            'Save Question'
                        )}
                    </Button>
                </div>
                 <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={() =>
                        handleRemoveVariant(activeVariantIndex)
                    }
                    modalText="Any changes to the question text or the answer choices will be lost. Are you sure?"
                    modalText2=""
                    input={false}
                    buttonText="Delete Variant"
                    instructorInfo={''}
                    loading={loading}
                 />
            </form>
        </Form>
    )
}

export default EditMcqForm