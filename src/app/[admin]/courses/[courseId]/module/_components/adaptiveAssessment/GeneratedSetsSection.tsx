import { GeneratedQuestionSet } from '@/types/assessment';
import { GeneratedSetCard } from './GeneratedSetCard';
import { Sparkles, Wand2, Zap } from 'lucide-react';

interface GeneratedSetsSectionProps {
  sets: GeneratedQuestionSet[];
  onSelectSet: (set: GeneratedQuestionSet) => void;
}

export function GeneratedSetsSection({ sets, onSelectSet }: GeneratedSetsSectionProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-accent to-primary rounded-2xl blur-xl opacity-50" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-xl shadow-accent/30">
            <Sparkles className="h-7 w-7 text-accent-foreground" />
          </div>
          {/* Floating icons */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center shadow-lg animate-pulse">
            <Wand2 className="h-3 w-3 text-primary-foreground" />
          </div>
          <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-gradient-to-br from-secondary to-secondary-dark rounded-lg flex items-center justify-center shadow-lg animate-pulse" style={{ animationDelay: '0.5s' }}>
            <Zap className="h-2.5 w-2.5 text-secondary-foreground" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">Generated Question Sets</h2>
          <p className="text-text-secondary mt-1.5 text-base">
            We've generated <span className="font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">5 MCQ assessment sets</span> based on your criteria.
          </p>
          <p className="text-text-tertiary text-sm mt-1">Click on a set to review and customize the questions.</p>
        </div>
      </div>

      {/* Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sets.map((set, index) => (
          <div 
            key={set.id} 
            className="animate-fade-in" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <GeneratedSetCard set={set} onClick={() => onSelectSet(set)} />
          </div>
        ))}
      </div>
    </div>
  );
}
