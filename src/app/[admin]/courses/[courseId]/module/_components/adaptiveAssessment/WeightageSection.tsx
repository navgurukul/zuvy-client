import { PreviousAssessment, SelectedAssessmentWithWeight } from '@/types/assessment';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scale, Sparkles, SkipForward, ArrowRight, Info } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';

interface WeightageSectionProps {
  assessments: PreviousAssessment[];
  weights: SelectedAssessmentWithWeight[];
  onWeightChange: (weights: SelectedAssessmentWithWeight[]) => void;
  onSubmit: () => void;
  onSkip: () => void;
}

export function WeightageSection({
  assessments,
  weights,
  onWeightChange,
  onSubmit,
  onSkip,
}: WeightageSectionProps) {
  const handleWeightUpdate = (assessmentId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newWeights = weights.map(w =>
      w.assessmentId === assessmentId ? { ...w, weightage: numValue } : w
    );
    onWeightChange(newWeights);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl blur-xl opacity-40" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center shadow-xl shadow-secondary/25">
            <Scale className="h-7 w-7 text-secondary-foreground" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">Assign Weightage</h2>
            <HelpTooltip content="Weightage determines how much influence each previous assessment has on the question generation. Higher weights mean more similar questions will be generated." />
          </div>
          <p className="text-text-secondary mt-1.5 text-base">
            Assign importance weightage to each selected assessment to influence question generation patterns.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-4 p-4 bg-info/5 border border-info/20 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center flex-shrink-0">
          <Info className="h-5 w-5 text-info" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1">What does weightage mean here?</h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            Weightage is a numerical value that indicates how much influence a previous assessment should have on generating new questions. 
            <strong> Higher weightage</strong> means the AI will generate more questions similar to that assessment's patterns. 
            <strong> A weightage of 0</strong> means the assessment will be considered but with minimal influence. 
            Use this to fine-tune the question generation based on successful past assessments.
          </p>
        </div>
      </div>

      {/* Assessment Cards */}
      <div className="space-y-4">
        {assessments.map((assessment, index) => {
          const weight = weights.find(w => w.assessmentId === assessment.id);
          return (
            <div
              key={assessment.id}
              className="group relative flex items-center gap-5 p-5 bg-gradient-to-br from-card via-card to-card-elevated rounded-2xl border border-border/50 hover:border-secondary/40 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 text-secondary font-bold flex items-center justify-center text-lg group-hover:from-secondary group-hover:to-secondary-dark group-hover:text-secondary-foreground transition-all duration-500 shadow-lg">
                {index + 1}
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-foreground text-lg group-hover:text-secondary transition-colors duration-300">
                  {assessment.name}
                </h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {assessment.domains.map(d => (
                    <Badge key={d} variant="outline" className="text-xs bg-muted/50 border-border/50">
                      {d}
                    </Badge>
                  ))}
                  <Badge className="text-xs bg-primary/10 text-primary border border-primary/20 font-semibold">
                    {assessment.totalQuestions} Qs
                  </Badge>
                </div>
              </div>
              
              <div className="w-32">
                <label className="text-xs text-text-secondary mb-2 block font-semibold uppercase tracking-wider">
                  Weight
                </label>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={weight?.weightage ?? 0}
                  onChange={(e) => handleWeightUpdate(assessment.id, e.target.value)}
                  className="bg-background/50 backdrop-blur-sm border-border/50 hover:border-secondary/50 focus:border-secondary no-spinners text-center font-bold text-xl h-12 rounded-xl transition-colors"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={onSkip} 
          className="px-6 h-12 rounded-xl border-2 border-border/50 hover:border-muted-foreground/50 hover:bg-muted/50 transition-all duration-300 group"
        >
          <SkipForward className="mr-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
          Skip Weightage
        </Button>
        
        <Button 
          onClick={onSubmit} 
          className="px-8 h-12 text-base font-bold bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary rounded-xl shadow-lg shadow-primary/20"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Generate Questions
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
