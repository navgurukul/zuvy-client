import { GeneratedQuestionSet } from '@/types/assessment';
import { GeneratedSetCard } from './GeneratedSetCard';

interface GeneratedSetsSectionProps {
  sets: GeneratedQuestionSet[];
  onSelectSet: (set: GeneratedQuestionSet) => void;
}

export function GeneratedSetsSection({ sets, onSelectSet }: GeneratedSetsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl flex font-semibold text-foreground">Generated Question Sets</h2>
        <p className="text-sm flex text-text-secondary mt-2">
          Review and customize your adaptive question sets before publishing.
        </p>
      </div>

      {/* Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sets.map((set) => (
          <div key={set.id}>
            <GeneratedSetCard set={set} onClick={() => onSelectSet(set)} />
          </div>
        ))}
      </div>
    </div>
  );
}
