import { Check, FileText, Calendar, Sparkles } from 'lucide-react';
import { PreviousAssessment } from '@/types/assessment';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PreviousAssessmentCardProps {
  assessment: PreviousAssessment;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const difficultyConfig: Record<string, { bg: string; text: string; border: string }> = {
  Easy: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
  Medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
  Hard: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' },
};

export function PreviousAssessmentCard({ assessment, isSelected, onToggle, disabled }: PreviousAssessmentCardProps) {
  const diffStyle = difficultyConfig[assessment.difficulty] || difficultyConfig.Medium;
  
  return (
    <div
      onClick={disabled ? undefined : onToggle}
      className={cn(
        'relative p-5 rounded-2xl border-2 transition-all duration-500 cursor-pointer group overflow-hidden',
        isSelected
          ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl shadow-primary/10'
          : 'border-border/50 bg-gradient-to-br from-card to-card-elevated hover:border-primary/40 hover:shadow-lg',
        disabled && !isSelected && 'opacity-40 cursor-not-allowed hover:shadow-none hover:border-border/50'
      )}
    >
      {/* Hover glow effect */}
      <div className={cn(
        'absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none',
        isSelected ? 'bg-primary/20 opacity-100' : 'bg-primary/10 opacity-0 group-hover:opacity-100'
      )} />
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-7 h-7 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg shadow-primary/30 animate-scale-in">
          <Check className="h-4 w-4 text-primary-foreground" />
        </div>
      )}

      <div className="relative flex items-start gap-4">
        <div className={cn(
          'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500',
          isSelected 
            ? 'bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/25' 
            : 'bg-gradient-to-br from-secondary/20 to-secondary/10 group-hover:from-primary/20 group-hover:to-primary/10'
        )}>
          <FileText className={cn(
            'h-7 w-7 transition-colors duration-300',
            isSelected ? 'text-primary-foreground' : 'text-secondary group-hover:text-primary'
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground truncate pr-10 text-lg group-hover:text-primary transition-colors duration-300">
            {assessment.name}
          </h4>
          
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {assessment.domains.map(domain => (
              <Badge 
                key={domain} 
                variant="outline" 
                className="text-xs bg-muted/50 border-border/50 font-medium"
              >
                {domain}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm">
            <Badge className={`${diffStyle.bg} ${diffStyle.text} ${diffStyle.border} border font-semibold`}>
              {assessment.difficulty}
            </Badge>
            <span className="font-bold text-foreground">{assessment.totalQuestions} MCQs</span>
            <span className="flex items-center gap-1.5 text-text-secondary">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(assessment.dateTaken).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
