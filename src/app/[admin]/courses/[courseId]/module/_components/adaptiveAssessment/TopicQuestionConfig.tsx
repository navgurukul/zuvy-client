import { Difficulty, TopicSelection } from '@/types/assessment';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, AlertCircle, Plus } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';
import { Button } from '@/components/ui/button';

interface TopicQuestionConfigProps {
  topic: { id: string; name: string };
  selection: TopicSelection & { questionCount: number };
  availableQuestions: number;
  onUpdate: (update: Partial<TopicSelection & { questionCount: number }>) => void;
  onRemove: () => void;
  domainName?: string;
  onCreateQuestions?: () => void;
}

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const difficultyColors: Record<Difficulty, string> = {
  Easy: 'bg-success/20 text-success border-success/30',
  Medium: 'bg-warning/20 text-warning border-warning/30',
  Hard: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function TopicQuestionConfig({
  topic,
  selection,
  availableQuestions,
  onUpdate,
  onRemove,
  domainName,
  onCreateQuestions,
}: TopicQuestionConfigProps) {
  const isExceedingLimit = selection.questionCount > availableQuestions;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
      isExceedingLimit 
        ? 'bg-destructive/5 border-destructive/30' 
        : 'bg-muted/30 border-border/50 hover:border-primary/30'
    }`}>
      {/* Topic Name */}
      <Badge
        variant="default"
        className="bg-gradient-to-r from-primary to-primary-dark text-primary-foreground shadow-md px-3 py-1"
      >
        {topic.name}
      </Badge>

      {/* Difficulty Select */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-secondary">Difficulty:</span>
        <Select 
          value={selection.difficulty} 
          onValueChange={(v) => onUpdate({ difficulty: v as Difficulty })}
        >
          <SelectTrigger className={`h-7 w-24 text-xs border rounded-lg px-2 ${difficultyColors[selection.difficulty]}`}>
            <span className="text-xs font-medium">{selection.difficulty}</span>
          </SelectTrigger>
          <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50 rounded-xl z-50 min-w-[100px]">
            {difficulties.map(diff => (
              <SelectItem 
                key={diff} 
                value={diff}
                className="rounded-lg focus:bg-primary/10 cursor-pointer text-xs"
              >
                <span className={`px-2 py-0.5 rounded ${difficultyColors[diff]}`}>
                  {diff}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Question Count */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-secondary">Questions:</span>
        <Input
          type="number"
          min={1}
          max={availableQuestions}
          value={selection.questionCount || ''}
          onChange={(e) => onUpdate({ questionCount: parseInt(e.target.value) || 0 })}
          className={`w-16 h-7 text-xs text-center font-semibold rounded-lg no-spinners ${
            isExceedingLimit 
              ? 'border-destructive bg-destructive/10 text-destructive' 
              : 'border-border/50 bg-background/50'
          }`}
        />
        <span className="text-xs text-text-secondary">/ {availableQuestions}</span>
        <HelpTooltip content={`Maximum ${availableQuestions} questions available for this topic at ${selection.difficulty} difficulty.`} />
      </div>

      {/* Error Message */}
      {isExceedingLimit && (
        <div className="flex items-center gap-1 text-destructive text-xs">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Exceeds limit</span>
        </div>
      )}

      {/* Create Questions Button */}
      {onCreateQuestions && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateQuestions}
          className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1"
          title="Create new questions for this topic"
        >
          <Plus className="h-3.5 w-3.5" />
          Create
        </Button>
      )}

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="ml-auto p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
