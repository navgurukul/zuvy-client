import { useThemeStore } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Info, Monitor, AlertCircle } from "lucide-react";
import TimerDisplay from "../TimerDisplay";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AssessmentData, CodingQuestion } from "../projectStudentAssessmentUtilsType";
import QuestionCard from "../QuestionCard";


const noop = () => {};

export function TopBar({ remainingTime }: { remainingTime: number }) {
    const { isDark, toggleTheme } = useThemeStore();
    return (
      <div className="fixed flex items-center top-6 right-6 z-50 space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <TimerDisplay remainingTime={remainingTime} />
      </div>
    );
  }
  
  export function FullscreenPrompt({
    open,
    onOpenChange,
    onProceed,
    onCancel,
    remainingTime,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onProceed: () => void;
    onCancel: () => void;
    remainingTime: number;
  }) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/5 to-accent-light/10 flex items-center justify-center p-6">
        <div className="fixed top-6 right-6 z-50">
          <TimerDisplay remainingTime={remainingTime} />
        </div>
        <AlertDialog open={open} onOpenChange={onOpenChange}>
          <AlertDialogContent className="max-w-md font-manrope font-semibold">
            <AlertDialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-warning-light rounded-full flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-warning" />
                </div>
              </div>
              <AlertDialogTitle className="text-center text-xl">
                Fullscreen Mode Required
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                <span className="font-semibold">Assessment</span> requires fullscreen mode for proctoring purposes.
              </p>
              <div className="bg-info-light border border-info rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-info" />
                  <p className="font-semibold text-info">Important Guidelines</p>
                </div>
                <ul className="text-sm text-info text-left space-y-1 text-left">
                  <li>• Do not switch tabs or applications</li>
                  <li>• Do not exit fullscreen mode</li>
                  <li>• Violations will be tracked and reported</li>
                  <li>• Keep your webcam and microphone ready</li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button onClick={onProceed} size="lg" className="w-full font-semibold bg-primary text-primary-foreground">
                  I Understand, Proceed
                </Button>
                <Button onClick={onCancel} variant="outline" size="lg" className="w-full font-semibold bg-white hover:bg-primary-light text-black">
                  Cancel
                </Button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
  
  export function AssessmentHeader({ title }: { title?: string }) {
    return (
      <div className="rounded-2xl mb-8 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center flex-col w-full items-start text-left gap-5 mb-4">
            <h2 className="text-2xl w-full ml-3 text-left font-bold text-foreground">{title}</h2>
            <p className="text-left text-muted-foreground ml-2 font-medium">
              Complete all sections to submit your assessment. Read the instructions carefully before proceeding.
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="rounded-xl p-4">
            <h5 className="font-bold text-warning-dark mb-3 flex items-center space-x-2">
              <span>Proctoring Rules</span>
            </h5>
            <ul className="list-disc text-left list-inside space-y-1 text-warning-dark">
              <li>No copy-pasting is allowed during the assessment</li>
              <li>Tab switching or window switching is not permitted</li>
              <li>Assessment screen exit will result in violations</li>
              <li>Maximum 3 violations are allowed before auto-submission</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  export function CodingSection({
    assessmentData,
    isMobile,
    assessmentSubmitId,
    onSolve,
    setIsCodingSubmitted,
  }: {
    assessmentData: AssessmentData | null;
    isMobile: boolean;
    assessmentSubmitId: number | null;
    onSolve: (id: number, cq: CodingQuestion) => void;
    setIsCodingSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  }) {
    if (!assessmentData?.codingQuestions?.length) return null;
    return (
      <div className="mb-8 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-2xl font-bold text-foreground">Coding Challenges</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {assessmentData.codingQuestions.map((q) => (
              <QuestionCard
                key={q.codingQuestionId}
                id={q.codingQuestionId}
                title={q.title}
                description={q.difficulty}
                isMobile={isMobile}
                easyCodingMark={assessmentData?.easyCodingMark}
                mediumCodingMark={assessmentData?.mediumCodingMark}
                hardCodingMark={assessmentData?.hardCodingMark}
                assessmentSubmitId={assessmentSubmitId as number}
                codingOutsourseId={q.codingOutsourseId}
                codingQuestions
                setIsCodingSubmitted={setIsCodingSubmitted}
                onSolveChallenge={(id: number) => onSolve(id, q)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  export function McqSection({ assessmentData, onSolveQuiz }: {
    assessmentData: AssessmentData | null;
    onSolveQuiz: () => void;
  }) {
    const total =
      (assessmentData?.hardMcqQuestions ?? 0) +
      (assessmentData?.easyMcqQuestions ?? 0) +
      (assessmentData?.mediumMcqQuestions ?? 0);
    if (!total) return null;
    return (
      <div className="mb-8 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-foreground">Multiple Choice Questions</h2>
          </div>
        </div>
        <div className="p-6">
          <QuestionCard
            id={1}
            title="Quiz"
            weightage={assessmentData?.weightageMcqQuestions}
            description={`${total} questions`}
            onSolveChallenge={onSolveQuiz}
            isQuizSubmitted={assessmentData?.IsQuizzSubmission}
            setIsCodingSubmitted={noop}
          />
        </div>
      </div>
    );
  }
  
  export function OpenEndedSection({
    questions,
    onSolveOpenEnded,
  }: {
    questions: any[];
    onSolveOpenEnded: () => void;
  }) {
    if (!(questions?.length > 0)) return null;
    return (
      <div className="mb-8 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-info" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Open-Ended Questions</h2>
          </div>
        </div>
        <div className="p-6">
          <QuestionCard
            id={1}
            title="Open-Ended Questions"
            description={`${questions.length || 0} questions`}
            onSolveChallenge={onSolveOpenEnded}
            setIsCodingSubmitted={noop}
          />
        </div>
      </div>
    );
  }
  
  export function SubmitAssessmentDialog({
    disabled,
    onSubmit,
  }: {
    disabled: boolean;
    onSubmit: (typeOfsubmission?: "studentSubmit" | "auto-submit") => void | Promise<void>;
  }) {
    return (
      <div className="flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={disabled}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-8dp hover:shadow-16dp ${
                disabled
                  ? "bg-primary hover:bg-primary-dark text-primary-foreground cursor-not-allowed opacity-50"
                  : "bg-primary hover:bg-primary-dark text-primary-foreground"
              }`}
            >
              Submit Assessment
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border shadow-32dp">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This action cannot be undone. This will submit your whole assessment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-muted hover:bg-muted-dark text-foreground border-border">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive-dark text-destructive-foreground"
                onClick={() => onSubmit("studentSubmit")}
              >
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }