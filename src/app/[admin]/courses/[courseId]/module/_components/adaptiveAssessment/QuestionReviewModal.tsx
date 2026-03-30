import { useState } from 'react';
import { X } from 'lucide-react';
import { GeneratedQuestionSet, MCQQuestion } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestionReplaceModal } from './QuestionReplaceModal';

interface QuestionReviewModalProps {
  set: GeneratedQuestionSet;
  onClose: () => void;
  onPublish: () => void;
  onRemoveQuestion?: (questionId: string) => void;
  onReplaceQuestion?: (oldQuestionId: string, newQuestion: MCQQuestion) => void;
  getSimilarQuestions?: (question: MCQQuestion) => MCQQuestion[];
}

const difficultyConfig: Record<string, { bg: string; text: string; border: string }> = {
  Easy: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
  Medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
  Hard: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' },
};

function QuestionCard({ 
  question, 
  index, 
  onReplace, 
  onRemove 
}: { 
  question: MCQQuestion; 
  index: number; 
  onReplace: () => void;
  onRemove: () => void;
}) {
  const normalizedDifficulty =
    question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);
  const diffStyle = difficultyConfig[normalizedDifficulty] || difficultyConfig.Medium;
  
  return (
    <div className="group p-4 bg-card rounded-xl border border-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="w-8 h-8 rounded-lg bg-muted text-foreground font-semibold text-sm flex items-center justify-center">
            {index + 1}
          </span>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs bg-muted/50">{question.topic}</Badge>
            <Badge className={`${diffStyle.bg} ${diffStyle.text} ${diffStyle.border} border text-xs font-semibold`}>
              {normalizedDifficulty}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReplace} 
            className="text-text-secondary hover:text-foreground hover:bg-muted rounded-md"
          >
            Replace
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove} 
            className="text-text-secondary hover:text-destructive hover:bg-destructive/10 rounded-md"
          >
            Remove
          </Button>
        </div>
      </div>

      <p className="text-foreground font-medium text-base mb-4 leading-relaxed">{question.question}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {question.options.map((value, optionIndex) => {
          const isCorrect = optionIndex === question.correctOption;
          const optionLabel = String.fromCharCode(65 + optionIndex);
          return (
            <div
              key={`${question.id}-option-${optionIndex}`}
              className={`p-3 rounded-lg border ${
                isCorrect
                  ? 'border-success/50 bg-success/10'
                  : 'border-border bg-muted/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center ${
                  isCorrect
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {optionLabel}
                </span>
                <span className={`text-sm flex-1 ${isCorrect ? 'font-semibold text-success' : 'text-foreground'}`}>
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function QuestionReviewModal({ 
  set, 
  onClose, 
  onPublish,
  onRemoveQuestion,
  onReplaceQuestion,
  getSimilarQuestions,
}: QuestionReviewModalProps) {
  const [questionToReplace, setQuestionToReplace] = useState<MCQQuestion | null>(null);

  const handleReplace = (question: MCQQuestion) => {
    setQuestionToReplace(question);
  };

  const handleReplaceConfirm = (newQuestion: MCQQuestion) => {
    if (questionToReplace && onReplaceQuestion) {
      onReplaceQuestion(questionToReplace.id, newQuestion);
    }
    setQuestionToReplace(null);
  };

  const handleRemove = (questionId: string) => {
    if (onRemoveQuestion) {
      onRemoveQuestion(questionId);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card w-full max-w-3xl h-[82vh] rounded-2xl shadow-lg flex flex-col border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{set.name}</h3>
                <p className="text-sm text-text-secondary mt-0.5">
                  {set.questions.length} MCQ questions
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="hover:bg-destructive/10 hover:text-destructive rounded-md"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Info Banner */}
          <div className="px-4 py-2.5 border-b border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">
              You can remove or replace individual questions. Changes are tracked for version control.
            </p>
          </div>

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {set.questions.length > 0 ? (
                set.questions.map((question, index) => (
                  <div key={question.id}>
                    <QuestionCard
                      question={question}
                      index={index}
                      onReplace={() => handleReplace(question)}
                      onRemove={() => handleRemove(question.id)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-text-secondary text-base">No questions in this set.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 p-4 border-t border-border bg-card flex-shrink-0">
            <span className="text-sm text-text-secondary">
              {set.questions.length} questions remaining
            </span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="px-5 h-10 rounded-md border-border">
                Back to Sets
              </Button>
              <Button 
                onClick={onPublish} 
                className="px-6 h-10 text-sm font-semibold rounded-md"
              >
                Continue to Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Replace Modal */}
      {questionToReplace && getSimilarQuestions && (
        <QuestionReplaceModal
          currentQuestion={questionToReplace}
          similarQuestions={getSimilarQuestions(questionToReplace)}
          onReplace={handleReplaceConfirm}
          onClose={() => setQuestionToReplace(null)}
        />
      )}
    </>
  );
}
