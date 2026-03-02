import { X, AlertCircle, ExternalLink, BookOpen, Search, Plus } from 'lucide-react';
import { AssessmentCriteria, Domain, Difficulty, TopicSelection, MCQQuestion } from '@/types/assessment';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpTooltip } from './HelpTooltip';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { QuestionCreationModal } from './QuestionCreationModal';

interface CriteriaRowProps {
  criteria: AssessmentCriteria;
  domains: Domain[];
  onUpdate: (updated: AssessmentCriteria) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const difficultyColors: Record<Difficulty, string> = {
  Easy: 'bg-success/20 text-success border-success/30',
  Medium: 'bg-warning/20 text-warning border-warning/30',
  Hard: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function CriteriaRow({ criteria, domains, onUpdate, onRemove, canRemove }: CriteriaRowProps) {
  const selectedDomain = domains.find(d => d.id === criteria.domainId);
  const availableTopics = selectedDomain?.topics || [];
  const [open, setOpen] = useState(false);
  const [questionModalState, setQuestionModalState] = useState<{
    isOpen: boolean;
    topicId: string | null;
    difficulty: Difficulty;
  }>({
    isOpen: false,
    topicId: null,
    difficulty: 'Medium',
  });
  
  // Defensive fallback for old localStorage data that might have topicIds instead of topics
  const criteriaTopics = criteria.topics || [];

  const handleDomainChange = (domainId: string) => {
    onUpdate({ ...criteria, domainId, topics: [] });
  };

  const handleTopicToggle = (topicId: string) => {
    const existingTopic = criteriaTopics.find(t => t.topicId === topicId);
    if (existingTopic) {
      onUpdate({ 
        ...criteria, 
        topics: criteriaTopics.filter(t => t.topicId !== topicId) 
      });
    } else {
      onUpdate({ 
        ...criteria, 
        topics: [...criteriaTopics, { topicId, difficulty: 'Medium', questionCount: 5 }] 
      });
    }
  };

  const handleTopicDifficultyChange = (topicId: string, difficulty: Difficulty) => {
    onUpdate({
      ...criteria,
      topics: criteriaTopics.map(t => 
        t.topicId === topicId ? { ...t, difficulty } : t
      ),
    });
  };

  const handleTopicQuestionCountChange = (topicId: string, count: number) => {
    onUpdate({
      ...criteria,
      topics: criteriaTopics.map(t => 
        t.topicId === topicId ? { ...t, questionCount: count } : t
      ),
    });
  };

  const getTopicSelection = (topicId: string): TopicSelection | undefined => {
    return criteriaTopics.find(t => t.topicId === topicId);
  };

  const getAvailableQuestionsForTopic = (topicId: string, difficulty: Difficulty): number => {
    const topic = availableTopics.find(t => t.id === topicId);
    if (!topic?.availableQuestions) return 20; // Default fallback
    
    switch (difficulty) {
      case 'Easy': return topic.availableQuestions.easy;
      case 'Medium': return topic.availableQuestions.medium;
      case 'Hard': return topic.availableQuestions.hard;
      default: return 20;
    }
  };

  const getTotalQuestions = () => {
    return criteriaTopics.reduce((sum, t) => sum + (t.questionCount || 0), 0);
  };

  const hasValidationError = (topicId: string): boolean => {
    const selection = getTopicSelection(topicId);
    if (!selection) return false;
    const available = getAvailableQuestionsForTopic(topicId, selection.difficulty);
    return selection.questionCount > available;
  };

  // Check if domain has no topics
  const hasNoTopics = criteria.domainId && availableTopics.length === 0;

  const handleCreateQuestions = (topicId: string, difficulty: Difficulty) => {
    setQuestionModalState({
      isOpen: true,
      topicId,
      difficulty,
    });
  };

  const handleSaveQuestions = (questions: Omit<MCQQuestion, 'id'>[]) => {
    console.log('Saving questions:', questions);
    // TODO: Integrate with your question bank storage/API
    // For now, just log them. In production, you would save these to your backend
    // and update the available question count for the topic
    
    // If no topic exists yet, the questions will be saved with a default topic name
    // that should be created in the question bank
    const topicName = questionModalState.topicId 
      ? availableTopics.find(t => t.id === questionModalState.topicId)?.name 
      : 'General';
    
    // Show a success message
    alert(`Successfully created ${questions.length} question(s) for ${selectedDomain?.name} - ${topicName}. These questions will be available in the Question Library.`);
  };

  return (
    <div className="group relative p-5 bg-gradient-to-br from-card via-card to-card-elevated rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 animate-fade-in">
      {/* Question Creation Modal */}
      {questionModalState.isOpen && (
        <QuestionCreationModal
          isOpen={questionModalState.isOpen}
          onClose={() => setQuestionModalState({ isOpen: false, topicId: null, difficulty: 'Medium' })}
          domainName={selectedDomain?.name || ''}
          topicName={questionModalState.topicId 
            ? (availableTopics.find(t => t.id === questionModalState.topicId)?.name || 'General')
            : 'General'
          }
          difficulty={questionModalState.difficulty}
          onSaveQuestions={handleSaveQuestions}
        />
      )}
      
      {/* Decorative gradient orb */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative space-y-4">
        {/* Row Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Domain Select */}
            <div className="w-64">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Domain
                </label>
                <HelpTooltip content="Select the subject area for this criteria. Each domain contains multiple topics you can choose from." />
              </div>
              <Select value={criteria.domainId} onValueChange={handleDomainChange}>
                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors h-11 rounded-xl">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50 rounded-xl z-50">
                  {domains.map(domain => (
                    <SelectItem 
                      key={domain.id} 
                      value={domain.id}
                      className="rounded-lg focus:bg-primary/10 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {domain.name}
                        {domain.topics.length === 0 && (
                          <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">
                            No topics
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Questions Counter */}
            {criteriaTopics.length > 0 && (
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl px-4 py-2 border border-primary/20">
                <div className="text-xs text-text-secondary mb-0.5">Total Questions</div>
                <div className="text-xl font-bold text-primary">{getTotalQuestions()}</div>
              </div>
            )}
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={!canRemove}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300 disabled:opacity-30"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* No Topics Warning */}
        {hasNoTopics && (
          <div className="flex items-start gap-4 p-4 bg-warning/5 border border-warning/30 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">No Topics Available</h4>
              <p className="text-sm text-text-secondary mb-3">
                The domain "{selectedDomain?.name}" doesn't have any topics configured yet. Create questions to get started.
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => handleCreateQuestions('', 'Medium')}
                  className="bg-primary hover:bg-primary-dark rounded-lg transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Questions
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/question-library', '_blank')}
                  className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary rounded-lg transition-all duration-300"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Go to Question Library
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Topics Selection */}
        {availableTopics.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Select Topics
              </label>
              <HelpTooltip content="Search and select topics from the dropdown. Each selected topic will have its own difficulty and question count settings." />
            </div>
            
            {/* Searchable Dropdown */}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-11 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Search and select topics...</span>
                  </div>
                  <Plus className="h-4 w-4 ml-2 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] p-0 bg-popover/95 backdrop-blur-xl border-border/50 rounded-xl" align="start">
                <Command className="bg-transparent">
                  <CommandInput 
                    placeholder="Search topics..." 
                    className="h-11 border-b border-border/50"
                  />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>
                      <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center mb-3">
                          <AlertCircle className="h-6 w-6 text-warning" />
                        </div>
                        <h4 className="font-semibold text-foreground mb-2">Topic Not Found</h4>
                        <p className="text-sm text-text-secondary mb-4 max-w-sm">
                          The topic you're looking for doesn't exist yet. Create it in the Question Library first.
                        </p>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOpen(false);
                            window.open('/question-library', '_blank');
                          }}
                          className="border-warning/50 text-warning hover:bg-warning/10 hover:border-warning rounded-lg transition-all duration-300"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Go to Question Library
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {availableTopics.map(topic => {
                        const selection = getTopicSelection(topic.id);
                        const isSelected = !!selection;
                        
                        return (
                          <CommandItem
                            key={topic.id}
                            value={topic.name}
                            onSelect={() => {
                              handleTopicToggle(topic.id);
                            }}
                            className="flex items-center justify-between cursor-pointer py-3 px-3 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'bg-primary border-primary' 
                                  : 'border-border'
                              }`}>
                                {isSelected && (
                                  <span className="text-primary-foreground text-xs">✓</span>
                                )}
                              </div>
                              <span className="font-medium">{topic.name}</span>
                            </div>
                            {isSelected && (
                              <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
                                Selected
                              </Badge>
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected Topics Display */}
            {criteriaTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
                {criteriaTopics.map(t => {
                  const topic = availableTopics.find(at => at.id === t.topicId);
                  if (!topic) return null;
                  
                  return (
                    <Badge
                      key={t.topicId}
                      variant="default"
                      className="bg-gradient-to-r from-primary to-primary-dark text-primary-foreground shadow-md shadow-primary/20"
                    >
                      {topic.name}
                      <button
                        onClick={() => handleTopicToggle(t.topicId)}
                        className="ml-1.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Selected Topics Configuration */}
        {criteriaTopics.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Configure Selected Topics
              </label>
              <HelpTooltip content="Set the difficulty level and number of questions for each selected topic. Question count cannot exceed available questions for that difficulty." />
            </div>
            <div className="space-y-2">
              {criteriaTopics.map(t => {
                const topic = availableTopics.find(at => at.id === t.topicId);
                if (!topic) return null;
                
                const availableQs = getAvailableQuestionsForTopic(t.topicId, t.difficulty);
                const isExceedingLimit = t.questionCount > availableQs;
                
                return (
                  <div 
                    key={t.topicId}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                      isExceedingLimit 
                        ? 'bg-destructive/5 border-destructive/30' 
                        : 'bg-muted/30 border-border/50'
                    }`}
                  >
                    {/* Topic Name */}
                    <Badge className="bg-gradient-to-r from-primary to-primary-dark text-primary-foreground shadow-md px-3 py-1">
                      {topic.name}
                    </Badge>

                    {/* Difficulty Select */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-text-secondary">Difficulty:</span>
                      <Select 
                        value={t.difficulty} 
                        onValueChange={(v) => handleTopicDifficultyChange(t.topicId, v as Difficulty)}
                      >
                        <SelectTrigger className={`h-7 w-24 text-xs border rounded-lg px-2 ${difficultyColors[t.difficulty]}`}>
                          <span className="text-xs font-medium">{t.difficulty}</span>
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
                        max={availableQs}
                        value={t.questionCount || ''}
                        onChange={(e) => handleTopicQuestionCountChange(t.topicId, parseInt(e.target.value) || 0)}
                        className={`w-16 h-7 text-xs text-center font-semibold rounded-lg no-spinners ${
                          isExceedingLimit 
                            ? 'border-destructive bg-destructive/10 text-destructive' 
                            : 'border-border/50 bg-background/50'
                        }`}
                      />
                      <span className="text-xs text-text-secondary">/ {availableQs}</span>
                    </div>

                    {/* Error Message */}
                    {isExceedingLimit && (
                      <div className="flex items-center gap-1 text-destructive text-xs">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Exceeds available</span>
                      </div>
                    )}

                    {/* Remove Topic */}
                    <button
                      onClick={() => handleTopicToggle(t.topicId)}
                      className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
