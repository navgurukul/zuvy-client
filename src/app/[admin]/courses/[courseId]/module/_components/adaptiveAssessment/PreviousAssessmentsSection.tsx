import { useEffect } from 'react';
import { PreviousAssessment } from '@/types/assessment';
import { PreviousAssessmentCard } from './PreviousAssessmentCard';
import { Button } from '@/components/ui/button';
import { History, CheckCircle2, ArrowRight, Clock } from 'lucide-react';

interface PreviousAssessmentsSectionProps {
  assessments: PreviousAssessment[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onContinue: () => void;
}

export function PreviousAssessmentsSection({
  assessments,
  selectedIds,
  onSelectionChange,
  onContinue,
}: PreviousAssessmentsSectionProps) {
  // Pre-select latest 3 assessments on mount
  useEffect(() => {
    if (selectedIds.length === 0 && assessments.length >= 3) {
      const latestThree = assessments.slice(0, 3).map(a => a.id);
      onSelectionChange(latestThree);
    }
  }, [assessments, selectedIds.length, onSelectionChange]);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    } else if (selectedIds.length < 3) {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const canContinue = selectedIds.length === 3;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-xl opacity-40" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-xl shadow-primary/25">
            <History className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">Select Previous Assessments</h2>
          <p className="text-text-secondary mt-1.5 text-base">
            We have preselected the latest <span className="font-bold text-primary">3 assessments</span> but you can change them.
          </p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-info/10 via-info/5 to-transparent rounded-2xl border border-info/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-info" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-foreground">
                {selectedIds.length} of 3 selected
              </span>
              {selectedIds.length === 3 && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>
            <span className="text-sm text-text-secondary">
              {selectedIds.length < 3 
                ? `Select ${3 - selectedIds.length} more assessment${3 - selectedIds.length > 1 ? 's' : ''}`
                : 'Ready to continue!'
              }
            </span>
          </div>
        </div>
        
        {/* Progress dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < selectedIds.length 
                  ? 'bg-gradient-to-br from-primary to-accent scale-110' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assessments.map((assessment, index) => (
          <div 
            key={assessment.id} 
            className="animate-fade-in" 
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <PreviousAssessmentCard
              assessment={assessment}
              isSelected={selectedIds.includes(assessment.id)}
              onToggle={() => handleToggle(assessment.id)}
              disabled={!selectedIds.includes(assessment.id) && selectedIds.length >= 3}
            />
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <div className="relative group">
          {canContinue && (
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
          )}
          <Button 
            onClick={onContinue} 
            disabled={!canContinue} 
            className="relative px-8 h-12 text-base font-bold bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary rounded-xl shadow-lg shadow-primary/20 transition-all duration-500 disabled:opacity-40 disabled:shadow-none"
          >
            Continue to Weightage
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </div>
  );
}
