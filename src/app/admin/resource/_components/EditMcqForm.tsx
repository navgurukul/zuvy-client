import React, { useEffect } from 'react'
import { getEditQuizQuestion } from '@/store/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

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
import { useState } from 'react'
import TipTapForForm from './TipTapForForm'
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

    const [showTagName, setShowTagName] = useState<boolean>(false)
    const [activeVariantIndex, setActiveVariantIndex] = useState<number>(0)
    const [selectedTag, setSelectedTag] = useState<{
        id: number
        tagName: String
    }>({ id: 0, tagName: '' })
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

    const handleAddVariant = () => {
        append({
            questionText: '',
            selectedOption: 0,
            options: [{ optionText: '' }, { optionText: '' }],
        })
        setActiveVariantIndex(fields.length)
        setIsVariantAdded(fields.length + 1 > noofExistingVariants)
    }

    const {
        fields: optionFields,
        append: appendOption,
        remove: removeOption,
    } = useFieldArray({
        control: form.control,
        name: `variants.${activeVariantIndex}.options`,
    })

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
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
                setDeleteModalOpen(false)
                refetch()
            })
            .catch((error) => {
                toast({
                    title: 'Error',
                    description:
                        error.response?.data?.message || 'An error occurred',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
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

    const onSubmitHandler = async (values: z.infer<typeof formSchema>) => {
        if (isVariantAdded) {
            const transformedObj = {
                id: quizQuestionId,
                title: 'Introduction to Quantum Physics',
                difficulty: values.difficulty,
                tagId: values.topics,
                content:
                    'Detailed content explaining quantum theories and experiments.',
                isRandomOptions: false,
                variantMCQs: values.variants.map((variant, index) => ({
                    variantNumber: index + 1,
                    question: variant.questionText,
                    options: variant.options.reduce((acc: any, option, idx) => {
                        acc[idx + 1] = option.optionText
                        return acc
                    }, {}),
                    correctOption: variant.selectedOption + 1,
                })),
            }

            const missingVariants = findMissingVariants(
                transformedObj,
                quizData
            )

            const updatedVariants = missingVariants.map((variants: any) => {
                return {
                    correctOption: variants.correctOption,
                    options: variants.options,
                    question: variants.question,
                }
            })

            const reqBody = {
                quizId: quizQuestionId,
                variantMCQs: updatedVariants,
            }

            try {
                await api
                    .post(`/Content/quiz/add/variants`, reqBody)
                    .then((res) => {
                        toast({
                            title: 'Success',
                            description: res.data.message,
                            className:
                                'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                        })
                    })

                setIsVariantAdded(false)
                await refetch()
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: error?.data?.message || 'An error occurred',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            }
        } else {
            const transformedObj = {
                id: quizQuestionId,
                title: 'Introduction to Quantum Physics',
                difficulty: values.difficulty,
                tagId: values.topics,
                content:
                    'Detailed content explaining quantum theories and experiments.',
                isRandomOptions: false,
                variantMCQs: values.variants.map((variant, index) => ({
                    variantNumber: index + 1,
                    question: variant.questionText,
                    options: variant.options.reduce((acc: any, option, idx) => {
                        acc[idx + 1] = option.optionText
                        return acc
                    }, {}),
                    correctOption: variant.selectedOption + 1,
                })),
            }
            // console.log(transformedObj)
            try {
                await api
                    .post(`/Content/editquiz`, transformedObj)
                    .then((res) => {
                        toast({
                            title: 'Success',
                            description: res?.data.message,
                            className:
                                'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                        })
                    })
                await refetch()
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: error?.data?.message || 'An error occurred',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                })
            }
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

    const getCurrentVariantOptions = (index: number) => {
        const currentVariant = form.getValues(`variants.${index}`)
        return (
            currentVariant?.options || [{ optionText: '' }, { optionText: '' }]
        )
    }

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
                                        } // Bind the onChange event
                                        value={field.value} // Use field.value instead of quizData?.difficulty
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
                                                setSelectedTag(selectedTag)
                                                setShowTagName(true)
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
                            <>
                                <Button
                                    key={field.id}
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
                            </>
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

                    {fields.length > 0 && (
                        <>
                            <FormField
                                key={fields[activeVariantIndex]?.id}
                                control={form.control}
                                name={`variants.${activeVariantIndex}.questionText`}
                                render={({ field }) => (
                                    <FormItem className="text-left w-full">
                                        <FormLabel className="text-md font-normal">
                                            Question Text
                                        </FormLabel>
                                        <FormControl>
                                            <TipTapForForm
                                                description={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {quizData && (
                                <div className="space-y-4">
                                    <FormField
                                        key={fields[activeVariantIndex]?.id}
                                        control={form.control}
                                        name={`variants.${activeVariantIndex}.selectedOption`}
                                        render={({ field }) => (
                                            <RadioGroup
                                                value={
                                                    field.value?.toString() ||
                                                    '0'
                                                }
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        Number(value)
                                                    )
                                                }
                                            >
                                                <FormLabel className="text-left text-md font-normal">
                                                    Answer Choices
                                                </FormLabel>
                                                {getCurrentVariantOptions(
                                                    activeVariantIndex
                                                ).map(
                                                    (
                                                        optionField: any,
                                                        optionIndex
                                                    ) => (
                                                        <div
                                                            key={
                                                                optionField.id ||
                                                                optionIndex
                                                            }
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
                                                                                value={
                                                                                    field.value
                                                                                }
                                                                                onChange={
                                                                                    field.onChange
                                                                                }
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            {/* Remove Option Button */}
                                                            {optionFields.length >
                                                                2 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    className="text-red-500"
                                                                    onClick={() =>
                                                                        removeOption(
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
                                            onClick={() =>
                                                appendOption({ optionText: '' })
                                            }
                                            className="text-left text-secondary font-semibold text-md"
                                        >
                                            + Add Option
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="flex flex-row justify-between items-end w-full ml-[195px]">
                    {activeVariantIndex > 0 && (
                        <>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() =>
                                                setDeleteModalOpen(true)
                                            }
                                            type="button"
                                            className="mt-3 ml-5 text-red-500 bg-white cursor-pointer"
                                        >
                                            Remove Variant
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Delete Variant</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
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
                        </>
                    )}
                    <Button className="" type="submit">
                        {isVariantAdded ? 'Add Variant' : 'Save Question'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default EditMcqForm
