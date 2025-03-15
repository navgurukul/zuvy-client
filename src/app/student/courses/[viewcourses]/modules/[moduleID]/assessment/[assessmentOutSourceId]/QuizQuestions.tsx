import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import TimerDisplay from './TimerDisplay'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import { useParams, useRouter } from 'next/navigation'
import { addClassToCodeTags } from '@/utils/admin'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const QuizQuestions = ({
    onBack,
    weightage,
    remainingTime,
    questions,
    assessmentSubmitId,
    getSeperateQuizQuestions,
    getAssessmentData,
}: {
    onBack: () => void
    weightage?: any
    remainingTime: number
    questions: any
    assessmentSubmitId: number
    getSeperateQuizQuestions: () => void
    getAssessmentData: () => void
}) => {
    const router = useRouter()
    const params = useParams()
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const [isDisabled, setIsDisabled] = useState(false)

    const codeBlockClass = 'text-gray-800 font-light bg-gray-300 p-4 rounded-lg text-left whitespace-pre-wrap w-full'

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const formSchema = z.object({
        answers: z.array(
            z.string().nonempty({ message: 'This question is required.' })
        ),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    useEffect(() => {
        const defaultValues = {
            answers: questions?.data?.mcqs?.map((question: any) =>
                question.submissionsData && question.submissionsData.length > 0
                    ? question.submissionsData[0].chosenOption.toString()
                    : ''
            ),
        }
        form.reset(defaultValues)
    }, [questions, form])

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsDisabled(true)
    
        try {
            // Create submission data array with all answers
            const quizSubmissionDto = data.answers.map((chosenOption, index) => {
                const question = questions.data.mcqs[index];
                return {
                    questionId: Number(question?.outsourseQuizzesId),
                    variantId: question.variantId,
                    attemptCount: 1,
                    chosenOption: parseInt(chosenOption)
                };
            });
    
            // Make the API call with the properly structured data
            const response = await api.patch(
                `/submission/quiz/assessmentSubmissionId=${assessmentSubmitId}?assessmentOutsourseId=${params.assessmentOutSourceId}`,
                { quizSubmissionDto }
            );
    
            getAssessmentData();
    
            toast({
                title: 'Success',
                description: 'Quiz Submitted Successfully',
                className: 'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            });
    
            getSeperateQuizQuestions();
    
            timeoutRef.current = setTimeout(() => {
                onBack();
            }, 3000);
        } catch (error: any) {
            setIsDisabled(false);
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'An error occurred',
                className: 'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
                variant: 'destructive',
            });
        }
    };
    
    function formatNumber(num: number) {
        return num % 1 === 0 ? num : parseFloat(num.toFixed(2))
    }

    // const getDifficultyWeightage = (difficulty: any) => {
    //     let difficultyWeightage = 0

    //     switch (difficulty) {
    //         case 'Easy':
    //             difficultyWeightage = formatNumber(weightage.easyMcqMark)
    //             break
    //         case 'Medium':
    //             difficultyWeightage = formatNumber(weightage.mediumMcqMark)
    //             break
    //         case 'Hard':
    //             difficultyWeightage = formatNumber(weightage.hardMcqMark)
    //             break
    //         default:
    //             difficultyWeightage = 0
    //             break
    //     }

    //     return difficultyWeightage
    // }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-2">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ChevronLeft fontSize={24} />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                            This action is irreversible. If your quiz hasn&apos;t been submitted, your selections will be lost.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-500"
                                onClick={onBack}
                            >
                                Go Back
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <div className="fixed top-4 right-4 bg-white p-2 rounded-md shadow-md font-bold text-xl">
                    <TimerDisplay remainingTime={remainingTime} />
                </div>
            </div>
            {/* <Separator /> */}

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col items-center gap-6 mt-10"
                >
                    {questions?.data?.mcqs?.map(
                        (question: any, index: number) => (
                            <div
                                key={question.id}
                                className="w-full max-w-2xl border text-left border-gray-200 rounded-lg p-4 shadow-sm"
                            >
                                <FormField
                                    control={form.control}
                                    name={`answers.${index}`}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col items-start mb-10 w-full max-w-2xl">
                                            <FormLabel className="text-lg font-semibold text-left">
                                                {index + 1}.{' '}
                                                <span
                                                    className="text-gray-800"
                                                    dangerouslySetInnerHTML={{
                                                        __html: addClassToCodeTags(
                                                            question.question,
                                                            codeBlockClass
                                                        ),
                                                    }}
                                                />
                                            </FormLabel>

                                            <FormControl>
                                                <RadioGroup
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    className="flex flex-col gap-3"
                                                >
                                                    {Object.keys(
                                                        question.options
                                                    ).map((key) => (
                                                        <div
                                                            key={key}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <RadioGroupItem
                                                                value={key}
                                                            />
                                                            <p className="text-gray-700">
                                                                {
                                                                    question
                                                                        .options[
                                                                        key
                                                                    ]
                                                                }
                                                            </p>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )
                    )}

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                type='button' 
                                className="mt-4"
                                disabled={isDisabled}
                            >
                                Submit Quiz
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone and you can submit the quiz only once.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-500"
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={isDisabled}
                                >
                                    Submit
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </form>
            </Form>
        </div>
    )
}

export default QuizQuestions