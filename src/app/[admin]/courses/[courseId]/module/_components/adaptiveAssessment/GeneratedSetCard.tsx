import { GeneratedQuestionSet } from '@/types/assessment';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GeneratedSetCardProps {
  set: GeneratedQuestionSet;
  onClick: () => void;
}

export function GeneratedSetCard({ set, onClick }: GeneratedSetCardProps) {
  const difficultyBreakdown = set.difficultyBreakdown ?? { easy: 0, medium: 0, hard: 0 };
  const total = difficultyBreakdown.easy + difficultyBreakdown.medium + difficultyBreakdown.hard;
  const safeTotal = total || 1;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative p-5 rounded-lg border border-border/50 bg-card',
        'hover:border-border/80 hover:shadow-sm transition-all duration-300 cursor-pointer'
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              {set.name}
            </h4>
          </div>
          <div className="text-xs font-medium text-text-secondary bg-muted px-2 py-1 rounded">
            {set.totalQuestions} Q
          </div>
        </div>

        {/* Difficulty Bar */}
        <div className="space-y-2">
          <div className="text-xs text-text-tertiary font-medium">Difficulty</div>
          <div className="flex h-2 rounded overflow-hidden bg-muted/50 gap-0.5">
            <div
              className="bg-success transition-all duration-300"
              style={{ width: `${(difficultyBreakdown.easy / safeTotal) * 100}%` }}
              title={`Easy: ${difficultyBreakdown.easy}`}
            />
            <div
              className="bg-warning transition-all duration-300"
              style={{ width: `${(difficultyBreakdown.medium / safeTotal) * 100}%` }}
              title={`Medium: ${difficultyBreakdown.medium}`}
            />
            <div
              className="bg-destructive transition-all duration-300"
              style={{ width: `${(difficultyBreakdown.hard / safeTotal) * 100}%` }}
              title={`Hard: ${difficultyBreakdown.hard}`}
            />
          </div>
        </div>

        {/* Domains */}
        {set.domainsCovered && set.domainsCovered.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {set.domainsCovered.slice(0, 2).map(domain => (
              <Badge 
                key={domain} 
                variant="secondary" 
                className="text-xs bg-muted hover:text-white text-text-secondary border-0 font-normal"
              >
                {domain}
              </Badge>
            ))}
            {set.domainsCovered.length > 2 && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-muted hover:text-white text-text-tertiary border-0 font-normal"
              >
                +{set.domainsCovered.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
