'use client'

import React, { useState } from 'react'
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
// Use the correct, updated RemirrorForm component
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm' 
import { Spinner } from '@/components/ui/spinner'

// Zod schema for form validation
const formSchema = z.object({
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    topics: z.number().min(1, 'You need to select a Topic'),
    variants: z.array(
        z.object({
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

/**
 * Compresses an image file in the browser before uploading.
 * @param file The original image file from the user.
 * @param quality A number between 0 and 1 for JPEG quality.
 * @returns A Promise that resolves with the compressed image as a Blob.
 */
const compressImage = (file: File, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        if (!(file instanceof Blob)) {
            return reject(new Error('Provided item is not a valid file.'));
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx?.drawImage(img, 0, 0);
                
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Image compression failed.'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};


export default function NewMcqForm({
    tags,
    closeModal,
    setStoreQuizData,
    getAllQuizQuesiton,
    setIsMcqModalOpen,
}: {
    tags: any[]
    closeModal: () => void
    setStoreQuizData: any
    getAllQuizQuesiton: any
    setIsMcqModalOpen: any
}) {
    const [isLoading, setIsLoading] = useState(false)
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

    const optionsPath = `variants.${activeVariantIndex}.options`
    const currentOptions = form.watch(optionsPath) || []

    const handleImageUpload = async (file: File): Promise<{ url: string }[]> => {
        if (!(file instanceof File) || !file.name) {
            return Promise.resolve([]); 
        }

        try {
            console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

            // Compress the image file first
            const compressedBlob = await compressImage(file, 0.8);
            console.log(`Compressed file size: ${(compressedBlob.size / 1024 / 1024).toFixed(2)} MB`);
            
            // Create FormData and append the compressed Blob
            const formData = new FormData();
            formData.append('file', compressedBlob, file.name);

            // Send the compressed data to your API
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            return [{ url: data.url }];

        } catch (error: any) {
            console.error('Image upload error:', error);
            toast({
                title: 'Image Upload Failed',
                description: error.message || 'Could not upload the image.',
                variant: 'destructive',
            });
            return [];
        }
    };


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
    }

    const handleRemoveVariant = (index: number) => {
        if (fields.length > 1) {
            remove(index)
            if (activeVariantIndex >= fields.length - 1) {
                setActiveVariantIndex(fields.length - 2)
            }
        }
    }
    
    const formatErrorMessage = (validationResult: { isValid: boolean; reason: string; issues: string[] }) => {
        if (validationResult.isValid) return "AI Validation successful.";
        if (validationResult.issues && validationResult.issues.length > 0) {
            const issue = validationResult.issues[0].toLowerCase();
            if (issue.includes("correct answer")) return "The selected answer is incorrect.";
            if (issue.includes("distractor")) return "Improve the incorrect options.";
            if (issue.includes("more than one correct")) return "Multiple correct answers found.";
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
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        isValid: { type: "BOOLEAN" },
                        reason: { type: "STRING" },
                        issues: { type: "ARRAY", items: { type: "STRING" } }
                    },
                    required: ["isValid", "reason", "issues"]
                }
            }
        };
        const apiKey = "AIzaSyBc54lljwvKqkgKpFcU0lbjZxihs7-mA2A"; // Replace with your actual API key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                 const responseText = result.candidates[0].content.parts[0].text;
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
                        title: `Validation Failed for Variant ${i + 1}`,
                        description: errorMessage,
                        variant: "destructive"
                     });
                    setIsLoading(false);
                    return;
                }
            }
            
            toast({
                title: 'Validation Success',
                description: 'All variants passed validation!',
            });
            const transformedObj: any = {
                title: 'New MCQ Question',
                difficulty: values.difficulty,
                tagId: values.topics,
                content: values.variants[0].questionText,
                isRandomOptions: false,
                variantMCQs: values.variants.map((variant) => ({
                    question: variant.questionText,
                    options: variant.options.reduce((acc: any, option, idx) => {
                        acc[idx + 1] = option.optionText;
                         return acc;
                    }, {}),
                    correctOption: variant.selectedOption + 1,
                })),
            };
            await api.post(`/Content/quiz`, { quizzes: [transformedObj] });
            toast({
                title: 'Success',
                description: 'Question Created Successfully',
            });
            setIsMcqModalOpen(false);

        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'An unexpected error occurred.';
            toast({
                title: 'Submission Error',
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
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
                                         onValueChange={field.onChange}
                                        defaultValue={field.value}
                                     >
                                        <div className="flex gap-x-5 ">
                                            <FormLabel className="mt-5 font-semibold text-md ">
                                                 Difficulty
                                            </FormLabel>
                                             {difficulties.map((difficulty) => (
                                                <FormItem
                                                    key={difficulty}
                                                    className="flex items-center space-x-2 space-y-0"
                                                  >
                                                    <FormControl>
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
                            <FormItem className="text-start flex flex-col flex-start ">
                                 <FormLabel className="font-semibold text-md">
                                    Topics
                                </FormLabel>
                                 <div className="flex gap-x-4">
                                    <Select
                                         onValueChange={(value) => {
                                            const selectedTag = tags.find(
                                                 (tag) => tag.tagName === value
                                            )
                                            if (selectedTag) {
                                                field.onChange(selectedTag.id)
                                                setSelectedTag(selectedTag)
                                            }
                                        }}
                                         value={
                                            tags.find(
                                                 (tag) => tag.id === field.value
                                            )?.tagName || ''
                                        }
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
                                                    value={String(tag.tagName)}
                                                >
                                                  {String(tag.tagName)}
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

                <div className="space-y-4 ml-[145px]">
                    <FormLabel className="mt-5 font-semibold text-md flex ">
                         Variants
                    </FormLabel>
                    <div className="flex items-center space-x-4">
                        {fields.map((field, index) => (
                             <div key={field.id} className="relative group">
                                <Button
                                    className={`${
                                         activeVariantIndex === index
                                            ? 'border-b-4 border-secondary text-secondary'
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
                                        onClick={() => handleRemoveVariant(index)}
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

                    {fields.length > 0 && (
                         <>
                            <FormField
                                key={fields[activeVariantIndex]?.id + '-question'}
                                control={form.control}
                                  name={`variants.${activeVariantIndex}.questionText`}
                                render={({ field }) => (
                                     <FormItem className="w-full text-left">
                                        <FormLabel className="text-md font-normal">
                                            Question Text
                                        </FormLabel>
                                        <FormControl>
                                             <RemirrorForm
                                                description={field.value}
                                                 onChange={field.onChange}
                                                 handleImageUpload={handleImageUpload}
                                            />
                                        </FormControl>
                                     </FormItem>
                                )}
                            />

                             <div className="space-y-4">
                                <FormField
                                    key={fields[activeVariantIndex]?.id + '-options'}
                                     control={form.control}
                                    name={`variants.${activeVariantIndex}.selectedOption`}
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={field.value.toString()}
                                              onValueChange={(value) =>
                                                field.onChange(Number(value))
                                             }
                                            className="w-full"
                                         >
                                            <FormLabel className="text-left text-md font-normal">
                                                 Answer Choices
                                            </FormLabel>
                                            {currentOptions.map(
                                                 (optionField, optionIndex) => (
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
                                                            control={form.control}
                                                             name={`variants.${activeVariantIndex}.options.${optionIndex}.optionText`}
                                                            render={({ field }) => (
                                                                 <FormItem className="w-full">
                                                                       <FormControl>
                                                                            <Input {...field} />
                                                                    </FormControl>
                                                                         <FormMessage />
                                                                     </FormItem>
                                                            )}
                                                         />
                                                        {currentOptions.length > 2 && (
                                                             <Button
                                                                 type="button"
                                                                variant="outline"
                                                                 size="icon"
                                                                className="text-red-500"
                                                                  onClick={() =>
                                                                       handleRemoveOption(optionIndex)
                                                                }
                                                              >
                                                                 <X size={16} />
                                                            </Button>
                                                         )}
                                                    </div>
                                                 )
                                            )}
                                         </RadioGroup>
                                    )}
                                />

                                 <div className="flex">
                                    <Button
                                        type="button"
                                         variant={'ghost'}
                                        onClick={handleAddOption}
                                         className="pl-0 text-left text-secondary font-semibold text-md"
                                    >
                                        + Add Option
                                      </Button>
                                </div>
                            </div>
                         </>
                    )}
                </div>
                <div className="flex w-full justify-end pt-4">
                    <Button type="submit" disabled={isLoading}>
                         {isLoading ? (
                            <>
                                <Spinner size="small" className="mr-2" />
                                Validating & Adding...
                             </>
                        ) : (
                            'Add Question'
                         )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}