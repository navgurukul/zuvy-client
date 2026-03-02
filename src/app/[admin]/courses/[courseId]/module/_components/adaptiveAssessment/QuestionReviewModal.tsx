import { useState } from 'react';
import { X, RefreshCw, Check, Sparkles, ArrowRight, Trash2, Info } from 'lucide-react';
import { GeneratedQuestionSet, MCQQuestion } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestionReplaceModal } from './QuestionReplaceModal';
import { HelpTooltip } from './HelpTooltip';

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
  const diffStyle = difficultyConfig[question.difficulty] || difficultyConfig.Medium;
  
  return (
    <div className="group p-6 bg-gradient-to-br from-card to-card-elevated rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-primary-foreground font-bold text-sm flex items-center justify-center shadow-lg shadow-primary/20">
            {index + 1}
          </span>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs bg-muted/50">{question.domain}</Badge>
            <Badge variant="outline" className="text-xs bg-muted/50">{question.topic}</Badge>
            <Badge className={`${diffStyle.bg} ${diffStyle.text} ${diffStyle.border} border text-xs font-semibold`}>
              {question.difficulty}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReplace} 
            className="text-text-secondary hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all duration-300 opacity-70 group-hover:opacity-100"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Replace
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove} 
            className="text-text-secondary hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-300 opacity-70 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Remove
          </Button>
        </div>
      </div>

      <p className="text-foreground font-semibold text-lg mb-5 leading-relaxed">{question.questionText}</p>

      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(question.options) as [keyof typeof question.options, string][]).map(([key, value]) => {
          const isCorrect = key === question.correctAnswer;
          return (
            <div
              key={key}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                isCorrect
                  ? 'border-success/50 bg-success/10 shadow-lg shadow-success/5'
                  : 'border-border/50 bg-muted/30 hover:border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
                  isCorrect
                    ? 'bg-gradient-to-br from-success to-success-dark text-success-foreground shadow-md'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {key}
                </span>
                <span className={`text-sm flex-1 ${isCorrect ? 'font-semibold text-success' : 'text-foreground'}`}>
                  {value}
                </span>
                {isCorrect && <Check className="h-5 w-5 text-success" />}
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
      <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-card to-card-elevated w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-fade-in border border-border/50 overflow-hidden">
          {/* Header */}
          <div className="relative flex items-center justify-between p-6 border-b border-border/50 flex-shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-primary/5 to-transparent pointer-events-none" />
            
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-lg shadow-accent/25">
                <Sparkles className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-foreground">{set.name}</h3>
                <p className="text-sm text-text-secondary mt-0.5">
                  {set.questions.length} MCQ Questions • Review and customize
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="relative hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Info Banner */}
          <div className="px-6 py-3 bg-info/5 border-b border-info/20 flex items-center gap-3">
            <Info className="h-4 w-4 text-info flex-shrink-0" />
            <p className="text-sm text-info">
              You can remove or replace individual questions. Changes are tracked for version control.
            </p>
          </div>

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              {set.questions.length > 0 ? (
                set.questions.map((question, index) => (
                  <div key={question.id} className="animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
                    <QuestionCard
                      question={question}
                      index={index}
                      onReplace={() => handleReplace(question)}
                      onRemove={() => handleRemove(question.id)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-2xl bg-muted/50 mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-text-secondary text-lg">No questions in this set.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 p-6 border-t border-border/50 bg-card/50 backdrop-blur-sm flex-shrink-0">
            <span className="text-sm text-text-secondary">
              {set.questions.length} questions remaining
            </span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="px-6 h-11 rounded-xl border-2 border-border/50">
                Back to Sets
              </Button>
              <Button 
                onClick={onPublish} 
                className="px-8 h-11 text-base font-bold bg-gradient-to-r from-accent to-accent-dark text-accent-foreground rounded-xl shadow-lg"
              >
                Continue to Publish
                <ArrowRight className="ml-2 h-5 w-5" />
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
