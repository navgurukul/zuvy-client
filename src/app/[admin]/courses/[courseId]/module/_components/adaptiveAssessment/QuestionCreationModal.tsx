import { useState } from 'react';
import { X, Sparkles, Loader2, Wand2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Difficulty, MCQQuestion } from '@/types/assessment';
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface QuestionCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainName: string;
  topicName: string;
  difficulty: Difficulty;
  onSaveQuestions: (questions: Omit<MCQQuestion, 'id'>[]) => void;
}

// Zod schema for form validation
const formSchema = z.object({
  topicName: z.string().min(1, 'Topic name is required'),
  topicDescription: z.string().optional(),
  numberOfQuestions: z.number().min(1, 'At least 1 question required').max(50, 'Maximum 50 questions allowed'),
  learningObjectives: z.string().min(10, 'Learning objectives are required (minimum 10 characters)'),
  targetAudience: z.string().optional(),
  focusAreas: z.string().optional(),
  bloomsLevel: z.string(),
  questionStyle: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const difficultyColors: Record<Difficulty, string> = {
  Easy: 'bg-success/20 text-success border-success/30',
  Medium: 'bg-warning/20 text-warning border-warning/30',
  Hard: 'bg-destructive/20 text-destructive border-destructive/30',
};

const bloomsLevels = [
  { value: 'remember', label: 'Remember (Recall facts)' },
  { value: 'understand', label: 'Understand (Explain concepts)' },
  { value: 'apply', label: 'Apply (Use knowledge)' },
  { value: 'analyze', label: 'Analyze (Break down information)' },
  { value: 'evaluate', label: 'Evaluate (Justify decisions)' },
  { value: 'create', label: 'Create (Produce new work)' },
];

const questionStyles = [
  { value: 'conceptual', label: 'Conceptual (Theory-focused)' },
  { value: 'practical', label: 'Practical (Scenario-based)' },
  { value: 'mixed', label: 'Mixed (Variety)' },
];

// Mock domains with topics - replace with actual data from your backend/context
const availableDomains = [
  {
    id: 'programming',
    name: 'Programming',
    topics: ['Python Basics', 'Java Fundamentals', 'C++ Programming', 'JavaScript ES6+', 'Data Structures', 'Algorithms']
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    topics: ['React Fundamentals', 'Vue.js', 'Angular', 'HTML/CSS', 'Node.js', 'REST APIs', 'GraphQL']
  },
  {
    id: 'data-science',
    name: 'Data Science',
    topics: ['Statistical Analysis', 'Machine Learning Basics', 'Data Visualization', 'Pandas', 'NumPy', 'SQL for Data']
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    topics: ['AWS Services', 'Azure Fundamentals', 'Google Cloud Platform', 'Docker', 'Kubernetes', 'Serverless']
  },
  {
    id: 'database',
    name: 'Database Management',
    topics: ['SQL Queries', 'Database Design', 'PostgreSQL', 'MongoDB', 'Redis', 'Database Optimization']
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    topics: ['React Native', 'Flutter', 'iOS Swift', 'Android Kotlin', 'Mobile UI/UX']
  },
  {
    id: 'devops',
    name: 'DevOps',
    topics: ['CI/CD Pipelines', 'Jenkins', 'GitLab CI', 'Infrastructure as Code', 'Monitoring', 'Linux Administration']
  },
  {
    id: 'security',
    name: 'Cybersecurity',
    topics: ['Network Security', 'Cryptography', 'Web Application Security', 'Penetration Testing', 'Security Best Practices']
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    topics: ['Neural Networks', 'Deep Learning', 'NLP', 'Computer Vision', 'Model Training', 'TensorFlow', 'PyTorch']
  },
  {
    id: 'software-eng',
    name: 'Software Engineering',
    topics: ['Design Patterns', 'SOLID Principles', 'Agile Methodology', 'Testing Strategies', 'Code Review', 'System Design']
  },
];

export function QuestionCreationModal({
  isOpen,
  onClose,
  domainName,
  topicName,
  difficulty,
  onSaveQuestions,
}: QuestionCreationModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const hasNoTopic = !topicName || topicName === 'General';
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  
  // Initialize form with react-hook-form and zod
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // Validate on change to enable real-time validation
    defaultValues: {
      numberOfQuestions: 5,
      learningObjectives: '',
      targetAudience: '',
      focusAreas: '',
      bloomsLevel: 'understand',
      questionStyle: 'mixed',
      topicName: hasNoTopic ? '' : topicName,
      topicDescription: '',
    },
  });

  // Get topics for the current domain
  const selectedDomain = availableDomains.find(d => d.name === domainName);
  const availableTopics = selectedDomain?.topics || [];

  // Watch form values for dynamic calculations
  const watchedNumberOfQuestions = form.watch('numberOfQuestions');

  // Difficulty distribution state (percentages)
  const [difficultyDistribution, setDifficultyDistribution] = useState({
    easy: 10,
    medium: 40,
    hard: 50,
  });

  // Calculate actual question counts based on percentages
  const questionCounts = {
    easy: Math.round((difficultyDistribution.easy / 100) * (watchedNumberOfQuestions || 0)),
    medium: Math.round((difficultyDistribution.medium / 100) * (watchedNumberOfQuestions || 0)),
    hard: Math.round((difficultyDistribution.hard / 100) * (watchedNumberOfQuestions || 0)),
  };

  // Adjust one difficulty when another changes to maintain 100% total
  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard', value: number) => {
    const newDistribution = { ...difficultyDistribution };
    const oldValue = newDistribution[difficulty];
    const diff = value - oldValue;
    newDistribution[difficulty] = value;

    // Distribute the difference across other difficulties
    if (difficulty !== 'easy' && difficulty !== 'medium') {
      const remaining = 100 - value;
      const ratio = newDistribution.easy / (newDistribution.easy + newDistribution.medium);
      newDistribution.easy = Math.round(remaining * ratio);
      newDistribution.medium = remaining - newDistribution.easy;
    } else if (difficulty !== 'easy') {
      const remaining = 100 - value - newDistribution.easy;
      newDistribution.hard = Math.max(0, remaining);
    } else {
      const remaining = 100 - value - newDistribution.medium;
      newDistribution.hard = Math.max(0, remaining);
    }

    setDifficultyDistribution(newDistribution);
  };

  const onSubmit = async (values: FormValues) => {
    console.log('Form Submitted! Values:', values);
    console.log('Difficulty Distribution:', difficultyDistribution);
    console.log('Question Counts:', questionCounts);
    
    setIsGenerating(true);
    
    try {
      // TODO: Replace with actual AI API call
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated questions
      const generatedQuestions: Omit<MCQQuestion, 'id'>[] = Array.from(
        { length: values.numberOfQuestions },
        (_, i) => ({
          questionText: `AI-Generated Question ${i + 1} for ${values.topicName || topicName}`,
          options: {
            A: 'Option A',
            B: 'Option B',
            C: 'Option C',
            D: 'Option D',
          },
          correctAnswer: 'A' as const,
          domain: domainName,
          topic: values.topicName || topicName,
          difficulty,
        })
      );

      onSaveQuestions(generatedQuestions);
      handleCancel();
      console.log('Generated Questions:', generatedQuestions);
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    form.reset({
      numberOfQuestions: 5,
      learningObjectives: '',
      targetAudience: '',
      focusAreas: '',
      bloomsLevel: 'understand',
      questionStyle: 'mixed',
      topicName: hasNoTopic ? '' : topicName,
      topicDescription: '',
    });
    setDifficultyDistribution({ easy: 10, medium: 40, hard: 50 });
    setShowNewTopicForm(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background to-muted/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/25">
              <Wand2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-xl font-bold">Generate Questions with AI</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {!hasNoTopic && (
                  <>
                    <span className="text-text-secondary text-sm">›</span>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                      {topicName}
                    </Badge>
                  </>
                )}
                </Badge>
                <span className="text-text-secondary text-sm">›</span>
                <Badge className={difficultyColors[difficulty]}>
                  {difficulty}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Topic Selection/Creation Section */}
            {hasNoTopic ? (
              <div className="p-4 bg-primary/5 border border-primary/30 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Wand2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground">Select or Create Topic</h4>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewTopicForm(!showNewTopicForm)}
                    className="text-primary hover:text-primary-dark"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {showNewTopicForm ? 'Select Existing' : 'Create New'}
                  </Button>
                </div>
                
                {showNewTopicForm ? (
                  <>
                    <FormField
                      control={form.control}
                      name="topicName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Topic Name <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., React Hooks Fundamentals"
                              className="bg-background/50 border-border/50 rounded-xl h-11"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter a descriptive name for the new topic
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="topicDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="e.g., Covers useState, useEffect, useContext, and custom hooks with practical examples..."
                              className="min-h-[80px] bg-background/50 border-border/50 rounded-xl resize-none"
                            />
                          </FormControl>
                          <FormDescription>
                            Optional: Describe what this topic covers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <FormField
                    control={form.control}
                    name="topicName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Select Topic <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-border/50 rounded-xl h-11">
                              <SelectValue placeholder="Select a topic..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50 rounded-xl">
                            {availableTopics.length > 0 ? (
                              availableTopics.map((topic) => (
                                <SelectItem key={topic} value={topic} className="rounded-lg">
                                  {topic}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-6 text-sm text-center text-muted-foreground">
                                No topics available for {domainName}
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose an existing topic from {domainName}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            ) : (
              <div className="p-4 bg-primary/5 border border-primary/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Wand2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Topic Selection</h4>
                </div>
                <FormField
                  control={form.control}
                  name="topicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Select Topic <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 border-border/50 rounded-xl h-11">
                            <SelectValue placeholder="Select a topic..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50 rounded-xl">
                          {availableTopics.length > 0 ? (
                            availableTopics.map((topic) => (
                              <SelectItem key={topic} value={topic} className="rounded-lg">
                                {topic}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-6 text-sm text-center text-muted-foreground">
                              No topics available for {domainName}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose from available topics in {domainName} or keep current: {topicName}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Number of Questions */}
            <FormField
              control={form.control}
              name="numberOfQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Number of Questions <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      placeholder="e.g., 10"
                      className="bg-background/50 border-border/50 rounded-xl h-11"
                    />
                  </FormControl>
                  <FormDescription>Maximum 50 questions per generation</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

          {/* Difficulty Distribution Sliders */}
          <div className="p-4 bg-muted/30 border border-border/50 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Difficulty Distribution</h4>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Total: {questionCounts.easy + questionCounts.medium + questionCounts.hard} questions
              </Badge>
            </div>

            {/* Easy Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Badge className="bg-success/20 text-success border-success/30 border text-xs">Easy</Badge>
                  <span className="text-text-secondary">{difficultyDistribution.easy}%</span>
                </Label>
                <span className="text-sm font-semibold text-success">{questionCounts.easy} questions</span>
              </div>
              <Slider
                value={[difficultyDistribution.easy]}
                onValueChange={([value]) => handleDifficultyChange('easy', value)}
                min={0}
                max={100}
                step={5}
                className="[&_[role=slider]]:bg-success [&_[role=slider]]:border-success"
              />
            </div>

            {/* Medium Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Badge className="bg-warning/20 text-warning border-warning/30 border text-xs">Medium</Badge>
                  <span className="text-text-secondary">{difficultyDistribution.medium}%</span>
                </Label>
                <span className="text-sm font-semibold text-warning">{questionCounts.medium} questions</span>
              </div>
              <Slider
                value={[difficultyDistribution.medium]}
                onValueChange={([value]) => handleDifficultyChange('medium', value)}
                min={0}
                max={100}
                step={5}
                className="[&_[role=slider]]:bg-warning [&_[role=slider]]:border-warning"
              />
            </div>

            {/* Hard Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30 border text-xs">Hard</Badge>
                  <span className="text-text-secondary">{difficultyDistribution.hard}%</span>
                </Label>
                <span className="text-sm font-semibold text-destructive">{questionCounts.hard} questions</span>
              </div>
              <Slider
                value={[difficultyDistribution.hard]}
                onValueChange={([value]) => handleDifficultyChange('hard', value)}
                min={0}
                max={100}
                step={5}
                className="[&_[role=slider]]:bg-destructive [&_[role=slider]]:border-destructive"
              />
            </div>
          </div>

          {/* Learning Objectives */}
          <FormField
            control={form.control}
            name="learningObjectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Learning Objectives <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="e.g., Students should be able to understand React hooks, implement state management, and create custom hooks..."
                    className="min-h-[100px] bg-background/50 border-border/50 rounded-xl resize-none"
                  />
                </FormControl>
                <FormDescription>
                  What should students learn or demonstrate? Be specific.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Target Audience */}
          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="e.g., Intermediate developers with 1-2 years of JavaScript experience, familiar with ES6+ syntax..."
                    className="min-h-[80px] bg-background/50 border-border/50 rounded-xl resize-none"
                  />
                </FormControl>
                <FormDescription>
                  Describe the knowledge level and background of your audience
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bloom's Taxonomy Level */}
          <FormField
            control={form.control}
            name="bloomsLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cognitive Level (Bloom's Taxonomy)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background/50 border-border/50 rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50 rounded-xl">
                    {bloomsLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="rounded-lg">
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the cognitive complexity level for questions
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Question Style */}
          <FormField
            control={form.control}
            name="questionStyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Style</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background/50 border-border/50 rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50 rounded-xl">
                    {questionStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value} className="rounded-lg">
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the type of questions to generate
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Focus Areas */}
          <FormField
            control={form.control}
            name="focusAreas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specific Focus Areas (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="e.g., Focus on useState, useEffect, and useContext hooks. Include questions about common pitfalls and best practices..."
                    className="min-h-[80px] bg-background/50 border-border/50 rounded-xl resize-none"
                  />
                </FormControl>
                <FormDescription>
                  Any specific topics, concepts, or areas to emphasize
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isGenerating}
            className="rounded-xl"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || isGenerating}
            className="rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-primary-foreground shadow-lg min-w-[180px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate {watchedNumberOfQuestions} Questions
              </>
            )}
          </Button>
        </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
