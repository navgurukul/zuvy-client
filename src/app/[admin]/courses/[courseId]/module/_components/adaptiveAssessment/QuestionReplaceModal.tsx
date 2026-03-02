import { X, Check, RefreshCw, Sparkles, Search } from 'lucide-react';
import { MCQQuestion, Difficulty } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface QuestionReplaceModalProps {
  currentQuestion: MCQQuestion;
  similarQuestions: MCQQuestion[];
  onReplace: (newQuestion: MCQQuestion) => void;
  onClose: () => void;
}

const difficultyConfig: Record<string, { bg: string; text: string; border: string }> = {
  Easy: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
  Medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
  Hard: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' },
};

export function QuestionReplaceModal({ 
  currentQuestion, 
  similarQuestions, 
  onReplace, 
  onClose 
}: QuestionReplaceModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const diffStyle = difficultyConfig[currentQuestion.difficulty] || difficultyConfig.Medium;

  // Filter questions based on search query
  const filteredQuestions = similarQuestions.filter(question => 
    question.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-card to-card-elevated w-full max-w-3xl max-h-[80vh] rounded-3xl shadow-2xl flex flex-col animate-fade-in border border-border/50 overflow-hidden">
        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-border/50 flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center shadow-lg shadow-secondary/25">
              <RefreshCw className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground">Replace Question</h3>
              <p className="text-sm text-text-secondary mt-0.5">
                Select a similar question from {currentQuestion.topic}
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

        {/* Current Question */}
        <div className="p-6 border-b border-border/30 bg-muted/30">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Current Question</p>
          <div className="p-4 bg-card rounded-xl border border-border/50">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs bg-muted/50">{currentQuestion.domain}</Badge>
              <Badge variant="outline" className="text-xs bg-muted/50">{currentQuestion.topic}</Badge>
              <Badge className={`${diffStyle.bg} ${diffStyle.text} ${diffStyle.border} border text-xs font-semibold`}>
                {currentQuestion.difficulty}
              </Badge>
            </div>
            <p className="text-foreground font-medium">{currentQuestion.questionText}</p>
          </div>
        </div>

        {/* Similar Questions List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Available Replacements ({filteredQuestions.length})
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search questions, topics, or difficulty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 rounded-xl"
            />
          </div>
          
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-text-secondary">
                {searchQuery 
                  ? 'No questions match your search criteria.' 
                  : 'No similar questions available for replacement.'}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSearchQuery('')}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => {
                const qDiffStyle = difficultyConfig[question.difficulty] || difficultyConfig.Medium;
                
                return (
                  <div
                    key={question.id}
                    className="group p-5 bg-gradient-to-br from-card to-card-elevated rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => onReplace(question)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                            {question.topic}
                          </Badge>
                          <Badge className={`${qDiffStyle.bg} ${qDiffStyle.text} ${qDiffStyle.border} border text-xs font-semibold`}>
                            {question.difficulty}
                          </Badge>
                        </div>
                        <p className="text-foreground font-medium mb-3">{question.questionText}</p>
                        
                        {/* Preview Options */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {(Object.entries(question.options) as [string, string][]).map(([key, value]) => (
                            <div 
                              key={key}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                key === question.correctAnswer 
                                  ? 'bg-success/10 text-success border border-success/30' 
                                  : 'bg-muted/30 text-text-secondary'
                              }`}
                            >
                              <span className="font-semibold">{key}.</span>
                              <span className="truncate">{value}</span>
                              {key === question.correctAnswer && <Check className="h-3.5 w-3.5 ml-auto flex-shrink-0" />}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        className="flex-shrink-0 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-primary-foreground rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReplace(question);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-card/50 backdrop-blur-sm">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full h-11 rounded-xl border-2 border-border/50 hover:border-muted-foreground/50"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
