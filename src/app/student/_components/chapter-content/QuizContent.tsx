import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useParams } from 'next/navigation';
import useAssignmentDetails from '@/hooks/useAssignmentDetails';
import useChapterCompletion from '@/hooks/useChapterCompletion';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import parse from 'html-react-parser';
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn, difficultyColor } from '@/lib/utils';
import {QuizSkeleton} from "@/app/student/_components/Skeletons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {QuizContentProps,Question} from '@/app/student/_components/chapter-content/componentChapterType'


const QuizContent: React.FC<QuizContentProps> = ({ chapterDetails, onChapterComplete }) => {
  const { courseId, moduleId } = useParams();
  const { assignmentData, loading, error, refetch: refetchAssignmentDetails } = useAssignmentDetails(chapterDetails.id.toString());
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localIsCompleted, setLocalIsCompleted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { isCompleting, completeChapter } = useChapterCompletion({
    courseId: courseId as string,
    moduleId: moduleId as string,
    chapterId: chapterDetails.id.toString(),
    onSuccess: () => {
      setLocalIsCompleted(true);
      onChapterComplete();
    },
  });

  // Update local state when assignment data changes
  useEffect(() => {
    if (assignmentData) {
      setLocalIsCompleted(assignmentData.status === 'Completed');
    }
  }, [assignmentData]);

  // Get quiz data from assignmentData
  const quizQuestions = assignmentData?.quizDetails || [];
  const isCompleted = localIsCompleted || assignmentData?.status === 'Completed';

  // Handle answer selection
  const handleSelect = (questionId: number, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // Handle submit button click
  const handleSubmitClick = () => {
    if (Object.keys(selectedAnswers).length === 0) {
      toast({
        title: 'Cannot Submit',
        description: 'Select at least one question',
        variant: 'destructive',
      });
      return;
    }
    setIsDialogOpen(true);
  };

  // Submit quiz answers
  const handleQuizSubmit = async () => {
    if (!quizQuestions.length) return;
    setIsSubmitting(true);
    setIsDialogOpen(false);
    
    const mappedAnswers = Object.entries(selectedAnswers).map(
      ([mcqId, chosenOption]) => ({
        mcqId: Number(mcqId),
        chossenOption: Number(chosenOption),
      })
    );
    
    try {
      await api.post(
        `/tracking/updateQuizAndAssignmentStatus/${courseId}/${moduleId}?chapterId=${chapterDetails.id}`,
        { submitQuiz: mappedAnswers }
      );
      await completeChapter();
      refetchAssignmentDetails();
      toast({
        title: 'Success',
        description: 'Submitted Quiz Successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to submit quiz.',
        variant: 'destructive',
      });
    } finally {
      // setIsSubmitting(false);
       setTimeout(() => setIsSubmitting(false), 15000);
    }
  };

  // Function to get option styling based on completion status
  const getOptionStyling = (question: Question, optionId: string) => {
    if (!isCompleted) {
      // For incomplete quiz, show normal styling
      return {
        borderColor: "border-border",
        bgColor: "bg-muted/30",
        textColor: "text-foreground"
      };
    }
    
    const quizTrack = question.quizTrackingData?.[0];
    const isAttempted = !!quizTrack;
    const isSelected = isAttempted ? quizTrack.chosenOption === parseInt(optionId) : false;
    const isCorrect = question.correctOption === parseInt(optionId);
    
    if (isCorrect && isSelected) {
      // Correct answer that was selected - green
      return {
        borderColor: "border-green-500",
        bgColor: "bg-green-50",
        textColor: "text-green-700"
      };
    } else if (isCorrect && !isSelected) {
      // Correct answer that wasn't selected - green
      return {
        borderColor: "border-green-300",
        bgColor: "bg-green-25",
        textColor: "text-green-600"
      };
    } else if (!isCorrect && isSelected) {
      // Wrong answer that was selected - red
      return {
        borderColor: "border-red-500",
        bgColor: "bg-red-50",
        textColor: "text-red-600"
      };
    }
    
    // Other options - default
    return {
      borderColor: "border-border",
      bgColor: "bg-muted/30",
      textColor: "text-foreground"
    };
  };

  // Function to get question status
  const getQuestionStatus = (question: Question) => {
    if (!isCompleted) return null;
    
    const quizTrack = question.quizTrackingData?.[0];
    const isAttempted = !!quizTrack;
    
    if (!isAttempted) {
      return {
        text: "Not attempted",
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/20"
      };
    }
    
    const isCorrect = quizTrack.chosenOption === question.correctOption;
    
    if (isCorrect) {
      return {
        text: "Correct",
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success/20"
      };
    } else {
      return {
        text: "Incorrect",
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20"
      };
    }
  };
  
  
if (loading) {
  return <QuizSkeleton/>;
}

  return (
    <div className="h-full bg-gradient-to-br from-background via-primary-light/5 to-accent-light/10 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 max-w-3xl ">
          <h5 className=" font-bold text-foreground ml-5">{chapterDetails.title}</h5>
          <Badge 
            variant="outline" 
            className={cn(
              "px-3 py-1 text-sm font-medium  border",
              isCompleted 
                ? "bg-success/10 text-success border-success/20" 
                : "bg-muted text-muted-dark border-border"
            )}
          >
            {isCompleted ? 'Completed' : 'Not Completed'}
          </Badge>
        </div>
        
        {chapterDetails.description && (
          <div className="mb-8">
            <p className="text-muted-foreground text-left leading-relaxed">{chapterDetails.description}</p>
          </div>
        )}
        
        {quizQuestions.length === 0 ? (
          <div className="bg-card rounded-2xl p-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No quiz questions have been added by the instructor.</p>
            </div>
          </div>
        ) : (
          <div className="">
            {quizQuestions.map((q: Question, index: number) => {
              const questionStatus = getQuestionStatus(q);
              const quizTrack = q.quizTrackingData?.[0];
              const isAttempted = !!quizTrack;
              
              return (
                <div key={q.id} className="rounded-2xl transition-all duration-300 overflow-hidden">
                  {/* Question Header */}
                  <div className="">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        {/* <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div> */}
                        {/* <h3 className="text-lg font-bold text-foreground">Question {index + 1}</h3> */}
                   
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {q.difficulty && (
                          <span className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium border',
                            difficultyColor(q.difficulty)
                          )}>
                            {q.difficulty}
                          </span>
                        )}
                        {q.marks && (
                          <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                            {Math.trunc(Number(q.marks))} Marks
                          </div>
                        )}
                    
                      </div>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="p-6">
                    <div className="mb-6 flex items-start">
                      <h3 className="text-lg  text-foreground mr-2">{index + 1}.</h3>
                      <div className="prose prose-neutral  max-w-none text-left">
                        <RemirrorForm
                          description={q.question}
                          preview={true}
                          bigScreen={true}

                        />
                      </div>
                      <div>

                      {questionStatus && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "px-2 py-1 text-xs font-medium",
                              questionStatus.bgColor,
                              questionStatus.color,
                              questionStatus.borderColor
                            )}
                          >
                            {questionStatus.text}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <RadioGroup
                      value={
                        isCompleted && isAttempted 
                          ? quizTrack.chosenOption.toString() 
                          : selectedAnswers[q.id] ?? ''
                      }
                      onValueChange={(value) => handleSelect(q.id, value)}
                      disabled={isCompleted || isSubmitting || isCompleting}
                      className="space-y-1"
                    >
                      {Object.entries(q.options).map(([optionId, optionText]) => {
                        const styling = getOptionStyling(q, optionId);
                        const isSelected = isCompleted && isAttempted 
                          ? quizTrack.chosenOption === parseInt(optionId)
                          : selectedAnswers[q.id] === optionId;
                        const isCorrect = isCompleted && q.correctOption === parseInt(optionId);
                        
                        return (
                          <div 
                            key={optionId} 
                            className={cn(
                              "flex items-start space-x-3 p-2 rounded-xl transition-all duration-200",
                              !isCompleted && "cursor-pointer",
                              isSelected && !isCompleted && "",
                              styling.borderColor
                            )}
                          >
                            <RadioGroupItem 
                              value={optionId} 
                              id={`q${index}_option${optionId}`}
                              className={cn(
                                "mt-0.5",
                                isCorrect && "border-green-500 text-green-500",
                                !isCorrect && isSelected && isCompleted && "border-red-500 text-red-500"
                              )}
                            />
                            <Label 
                              htmlFor={`q${index}_option${optionId}`} 
                              className={cn(
                                "flex-1 text-left leading-relaxed mb-0",
                                !isCompleted ? "cursor-pointer" : "cursor-default",
                                styling.textColor
                              )}
                            >
                              {optionText as string}
                              {isCompleted && isCorrect && (
                                <span className="ml-2 text-green-600 font-bold">✓ Correct Answer</span>
                              )}
                              {isCompleted && !isCorrect && isSelected && (
                                <span className="ml-2 text-red-600 font-bold">✗ Your Choice</span>
                              )}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {!isCompleted && quizQuestions.length > 0 && (
          <div className="flex justify-center pt-8 pb-6">
            <Button
              onClick={handleSubmitClick}
              disabled={
                isSubmitting || isCompleting ||
                Object.keys(selectedAnswers).length === 0
              }
              className={cn(
                "px-3 py-4 rounded-md font-semibold  transition-all duration-200 " ,
                isSubmitting || isCompleting
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark text-primary-foreground"
              )}
            >
              {isSubmitting || isCompleting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Submit Quiz</span>
                </div>
              )}
            </Button>
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This action cannot be undone and you can submit the quiz only once.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setIsDialogOpen(false)}
                className="bg-muted hover:bg-muted-dark text-foreground border-border"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-primary hover:bg-primary-dark text-primary-foreground"
                onClick={handleQuizSubmit}
              >
                Submit Quiz
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default QuizContent; 