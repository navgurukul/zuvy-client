import { FileText, BarChart3, Layers, Eye, Sparkles } from 'lucide-react';
import { GeneratedQuestionSet } from '@/types/assessment';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GeneratedSetCardProps {
  set: GeneratedQuestionSet;
  onClick: () => void;
}

export function GeneratedSetCard({ set, onClick }: GeneratedSetCardProps) {
  const { difficultyBreakdown } = set;
  const total = difficultyBreakdown.easy + difficultyBreakdown.medium + difficultyBreakdown.hard;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative p-6 rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card via-card to-card-elevated',
        'hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 hover:scale-[1.02]',
        'transition-all duration-500 cursor-pointer overflow-hidden'
      )}
    >
      {/* Hover gradient orb */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* Sparkle decoration */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Sparkles className="h-5 w-5 text-accent animate-pulse" />
      </div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-5">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg',
            'bg-gradient-to-br from-accent/20 to-accent/10 group-hover:from-accent group-hover:to-accent-dark'
          )}>
            <FileText className="h-8 w-8 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
          </div>
          <Badge 
            variant="outline" 
            className="bg-card/80 backdrop-blur-sm font-bold px-3 py-1.5 text-sm border-border/50"
          >
            {set.totalQuestions} Qs
          </Badge>
        </div>

        <h4 className="text-xl font-bold text-foreground mb-5 group-hover:text-accent transition-colors duration-300">
          {set.name}
        </h4>

        {/* Difficulty Breakdown Bar */}
        <div className="mb-5 p-4 bg-muted/30 backdrop-blur-sm rounded-xl border border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-text-secondary" />
            <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Difficulty Breakdown</span>
          </div>
          <div className="flex h-3.5 rounded-full overflow-hidden bg-muted/50 shadow-inner">
            <div
              className="bg-gradient-to-r from-success to-success-dark transition-all duration-500 group-hover:brightness-110"
              style={{ width: `${(difficultyBreakdown.easy / total) * 100}%` }}
            />
            <div
              className="bg-gradient-to-r from-warning to-warning-dark transition-all duration-500 group-hover:brightness-110"
              style={{ width: `${(difficultyBreakdown.medium / total) * 100}%` }}
            />
            <div
              className="bg-gradient-to-r from-destructive to-destructive-dark transition-all duration-500 group-hover:brightness-110"
              style={{ width: `${(difficultyBreakdown.hard / total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs font-semibold">
            <span className="text-success flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success shadow-sm shadow-success/50" /> 
              Easy: {difficultyBreakdown.easy}
            </span>
            <span className="text-warning flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning shadow-sm shadow-warning/50" /> 
              Medium: {difficultyBreakdown.medium}
            </span>
            <span className="text-destructive flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive shadow-sm shadow-destructive/50" /> 
              Hard: {difficultyBreakdown.hard}
            </span>
          </div>
        </div>

        {/* Domains */}
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-text-secondary flex-shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {set.domainsCovered.map(domain => (
              <Badge 
                key={domain} 
                variant="secondary" 
                className="text-xs bg-primary/10 text-primary border border-primary/20 font-medium"
              >
                {domain}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* View prompt */}
        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Eye className="h-4 w-4" />
          <span>Click to review questions</span>
        </div>
      </div>
    </div>
  );
}
