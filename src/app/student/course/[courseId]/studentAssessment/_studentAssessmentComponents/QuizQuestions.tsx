'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import TimerDisplay from './TimerDisplay';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/utils/axios.config';
import { useParams, useRouter } from 'next/navigation';
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
} from '@/components/ui/alert-dialog';
import { cn, difficultyColor } from '@/lib/utils';
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm';

interface QuizQuestionsProps {
    onBack: () => void;
    weightage?: any;
    remainingTime: number;
    questions: any;
    assessmentSubmitId: number | null;
    getQuizQuestions: () => void;
    getAssessmentData: (isNewStart?: boolean) => void;
}

const QuizQuestions: React.FC<QuizQuestionsProps> = ({
    onBack,
    remainingTime,
    questions,
    assessmentSubmitId,
    getQuizQuestions,
    getAssessmentData,
}) => {
    const params = useParams();
    const [isDisabled, setIsDisabled] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertModal, setIsAlertModal] = useState(false);

    const formSchema = z.object({
        answers: z.array(z.string().optional()),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            answers: [],
        }
    });

    useEffect(() => {
        if (questions?.data?.mcqs) {
            const defaultValues = {
                answers: questions.data.mcqs.map((question: any) =>
                    question.submissionsData && question.submissionsData.length > 0
                        ? question.submissionsData[0].chosenOption.toString()
                        : ''
                ),
            };
            form.reset(defaultValues);
        }
    }, [questions, form]);

    const handleSubmitClick = async () => {
        const isValid = await form.trigger();
        if (isValid) {
            setIsDialogOpen(true);
        } else {
            toast({
                title: 'Error',
                description: 'Please answer all questions before submitting.',
                variant: 'destructive',
            });
        }
    };

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsDisabled(true);
        setIsDialogOpen(false);

        if (!assessmentSubmitId) {
            toast({
                title: 'Error',
                description: 'Assessment submission ID is missing.',
                variant: 'destructive'
            });
            setIsDisabled(false);
            return;
        }

        try {
            const quizSubmissionData = data.answers
                .map((chosenOption, index) => {
                    if (!chosenOption) return null;
                    const question = questions.data.mcqs[index];
                    return {
                        questionId: Number(question?.outsourseQuizzesId),
                        variantId: question.variantId,
                        attemptCount: 1,
                        chosenOption: parseInt(chosenOption),
                    };
                })
                .filter(Boolean);

            if (quizSubmissionData.length === 0) {
                setIsAlertModal(true);
                setIsDisabled(false);
                return;
            }

            await api.patch(
                `/submission/quiz/assessmentSubmissionId=${assessmentSubmitId}?assessmentOutsourseId=${params.assessmentId}`,
                { quizSubmissionDto: quizSubmissionData }
            );

            toast({
                title: 'Success',
                description: 'Quiz Submitted Successfully',
            });
            
            getAssessmentData();
            getQuizQuestions();

            setTimeout(() => onBack(), 2000);
        } catch (error: any) {
            setIsDisabled(false);
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'An error occurred',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="h-screen bg-gray-50 overflow-y-auto">
            <AlertDialog open={isAlertModal} onOpenChange={setIsAlertModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cannot Submit</AlertDialogTitle>
                        <AlertDialogDescription>
                          Please select an answer for at least one question before submitting.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Header */}
            <div className="sticky top-0 bg-white shadow-sm z-10 p-4">
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost">
                                <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Your selections will be lost if you haven't submitted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={onBack}
                                >
                                    Go Back
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <TimerDisplay remainingTime={remainingTime} />
                </div>
            </div>

            <div className="p-4 md:p-8">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col items-center gap-6"
                    >
                        {questions?.data?.mcqs?.map((question: any, index: number) => (
                            <div
                                key={question.id}
                                className="w-full max-w-3xl border text-left bg-white border-gray-200 rounded-lg p-4 md:p-6 shadow-sm"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <p className="font-semibold text-lg">Question {index + 1}</p>
                                    <div className="flex items-center gap-3">
                                        <div className={cn('font-semibold text-sm px-2 py-1 rounded-md', difficultyColor(question.difficulty))}>
                                            {question.difficulty}
                                        </div>
                                        <div className="bg-gray-100 px-2 py-1 text-sm rounded-md font-semibold">
                                            {`${Math.trunc(Number(question.mark))} Marks`}
                                        </div>
                                    </div>
                                </div>
                                <FormField
                                    control={form.control}
                                    name={`answers.${index}`}
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>
                                                <div className="prose max-w-none text-base">
                                                    <RemirrorForm
                                                        description={question.question}
                                                        preview={true}
                                                    />
                                                </div>
                                            </FormLabel>
                                            <FormControl className="mt-4">
                                                <RadioGroup
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    className="flex flex-col gap-3"
                                                >
                                                    {Object.keys(question.options).map((key) => (
                                                        <FormItem key={key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                                            <FormControl>
                                                                <RadioGroupItem value={key} />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-base cursor-pointer">
                                                                {question.options[key]}
                                                            </FormLabel>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage className="mt-2" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}

                        <Button
                            type="button"
                            size="lg"
                            className="mt-6"
                            onClick={handleSubmitClick}
                            disabled={isDisabled}
                        >
                            {isDisabled ? "Submitting..." : "Submit Quiz"}
                        </Button>

                        <AlertDialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                        >
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. You can only submit the quiz once.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-500 hover:bg-red-600"
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
        </div>
    );
};

export default QuizQuestions; 