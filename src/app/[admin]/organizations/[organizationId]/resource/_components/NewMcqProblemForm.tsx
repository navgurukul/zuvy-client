import { useState } from 'react';
import { X, Loader2, Sparkles, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Difficulty, MCQQuestion } from './adminResourceComponentType';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGenerateMcqQuestions } from '@/hooks/useGenerateMcqQuestions';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface CreateProblemFormProps {
  onClose: () => void;
  onSaveQuestions: (questions: Omit<MCQQuestion, 'id'>[]) => void;
}

// Zod schema for form validation
const formSchema = z.object({
  domainName: z.string().min(1, 'Domain is required'),
  topicNames: z.array(z.string()).min(1, 'At least one topic is required'),
  topicDescription: z.string().optional(),
  learningObjectives: z.string().min(10, 'Learning objectives are required (minimum 10 characters)'),
  targetAudience: z.string().optional(),
  focusAreas: z.string().optional(),
  bloomsLevel: z.string(),
  questionStyle: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const difficultyColors: Record<Difficulty, string> = {
  Easy: 'bg-green-100 text-green-700 border-green-300',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Hard: 'bg-red-100 text-red-700 border-red-300',
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

// Mock domains with topics - replace with actual data from your backend
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

export function CreateProblemForm({ onClose, onSaveQuestions }: CreateProblemFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDifficulty] = useState<Difficulty>('Medium');
  const { generateQuestions, isLoading, error } = useGenerateMcqQuestions();
  
  // State to track question count for each topic
  const [topicQuestionCounts, setTopicQuestionCounts] = useState<{ [key: string]: number }>({});
  
  // Initialize form with react-hook-form and zod
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      domainName: '',
      topicNames: [],
      topicDescription: '',
      learningObjectives: '',
      targetAudience: '',
      focusAreas: '',
      bloomsLevel: 'understand',
      questionStyle: 'mixed',
    },
  });

  // Watch form values
  const watchedDomain = form.watch('domainName');
  const watchedTopics = form.watch('topicNames');
  
  // Calculate total number of questions from all topics
  const totalQuestions = Object.values(topicQuestionCounts).reduce((sum, count) => sum + count, 0);

  // Get topics for selected domain
  const selectedDomain = availableDomains.find(d => d.name === watchedDomain);
  const availableTopics = selectedDomain?.topics || [];

  // Reset topics when domain changes
  const handleDomainChange = (domainName: string) => {
    form.setValue('topicNames', []);
    setTopicQuestionCounts({});
    return domainName;
  };
  
  // Handle topic question count change
  const handleTopicQuestionChange = (topic: string, count: number) => {
    // Clamp value between 1 and 50, or 0 if empty/invalid
    const clampedCount = count > 0 ? Math.max(1, Math.min(50, count)) : 0;
    setTopicQuestionCounts(prev => ({
      ...prev,
      [topic]: clampedCount
    }));
  };
  
  // Handle topic removal
  const handleTopicRemove = (topic: string) => {
    // Remove from form array
    const currentTopics = form.getValues('topicNames');
    const newTopics = currentTopics.filter((t) => t !== topic);
    
    // Remove from question counts
    setTopicQuestionCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[topic];
      return newCounts;
    });
    
    // Update form with validation
    form.setValue('topicNames', newTopics, { shouldValidate: true, shouldDirty: true });
  };
  
  // Handle topic addition
  const handleTopicAdd = (topic: string, currentTopics: string[]) => {
    // Prevent duplicates
    if (currentTopics.includes(topic)) {
      return currentTopics;
    }
    
    const newTopics = [...currentTopics, topic];
    
    // Set default count of 5 questions
    setTopicQuestionCounts(prev => ({
      ...prev,
      [topic]: 5
    }));
    
    return newTopics;
  };

  // Difficulty distribution state (percentages)
  const [difficultyDistribution, setDifficultyDistribution] = useState({
    easy: 10,
    medium: 40,
    hard: 50,
  });

  // Calculate actual question counts based on percentages
  const questionCounts = {
    easy: Math.round((difficultyDistribution.easy / 100) * totalQuestions),
    medium: Math.round((difficultyDistribution.medium / 100) * totalQuestions),
    hard: Math.round((difficultyDistribution.hard / 100) * totalQuestions),
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
    // Validate that all topics have question counts > 0
    const topicsWithoutCounts = values.topicNames.filter(topic => !topicQuestionCounts[topic] || topicQuestionCounts[topic] === 0);
    if (topicsWithoutCounts.length > 0) {
      form.setError('topicNames', {
        type: 'manual',
        message: `Please specify questions for: ${topicsWithoutCounts.join(', ')}`
      });
      return;
    }
    
    // Validate total questions
    if (totalQuestions === 0) {
      form.setError('topicNames', {
        type: 'manual',
        message: 'Total questions must be at least 1'
      });
      return;
    }
    
    if (totalQuestions > 50) {
      form.setError('topicNames', {
        type: 'manual',
        message: 'Total questions cannot exceed 50 (current: ' + totalQuestions + ')'
      });
      return;
    }
    
    // Clear any previous errors
    form.clearErrors('topicNames');
    
    const payload = {
      domainName: values.domainName,
      topicNames: values.topicNames,
      topicDescription: values.topicDescription || '',
      numberOfQuestions: totalQuestions,
      learningObjectives: values.learningObjectives,
      targetAudience: values.targetAudience || '',
      focusAreas: values.focusAreas || '',
      bloomsLevel: values.bloomsLevel,
      questionStyle: values.questionStyle,
      difficultyDistribution,
      questionCounts,
      topics: topicQuestionCounts,
      levelId: null,
    };
    
    console.log('Final Payload for AI API:', payload);
    // setIsGenerating(true);

    
    // try {
    //   const response = await generateQuestions(payload);
    //   console.log('Generated Questions Response:', response);
      
    //   // TODO: Transform the API response to match MCQQuestion format if needed
    //   // For now, assuming the API returns questions in the correct format
    //   if (response?.questions) {
    //     onSaveQuestions(response.questions);
    //   }
      
    //   handleCancel();
    // } catch (error) {
    //   console.error('Error generating questions:', error);
    //   alert(`Failed to generate questions: ${error instanceof Error ? error.message : 'Please try again.'}`);
    // } finally {
    //   setIsGenerating(false);
    // }
  };

  const handleCancel = () => {
    form.reset({
      domainName: '',
      topicNames: [],
      topicDescription: '',
      learningObjectives: '',
      targetAudience: '',
      focusAreas: '',
      bloomsLevel: 'understand',
      questionStyle: 'mixed',
    });
    setTopicQuestionCounts({});
    setDifficultyDistribution({ easy: 10, medium: 40, hard: 50 });
    onClose();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse"></div>
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark flex items-center justify-center shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">AI Question Generator</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs font-medium px-2 py-0.5">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by LLM
              </Badge>
              <Badge variant="secondary" className="bg-accent/10 text-accent border-0 text-xs font-medium px-2 py-0.5">
                <Zap className="h-3 w-3 mr-1" />
                Adaptive Assessment
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-base text-muted-foreground font-normal mt-4 flex">
          Create intelligent, personalized assessments that adapt to student performance
        </p>
      </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {/* Domain & Topic Section */}
          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/40 transition-all hover:shadow-medium animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Domain & Topics</h3>
              <Badge variant="outline" className="text-xs text-muted-foreground border-border/60">
                Step 1 of 3
              </Badge>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="domainName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground/80 mb-2 flex">
                        Domain
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(handleDomainChange(value))} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-0 bg-muted/50 hover:bg-muted/80 transition-all duration-200 rounded-xl">
                            <SelectValue placeholder="Choose a domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
                          {availableDomains.map((domain) => (
                            <SelectItem key={domain.id} value={domain.name} className="rounded-lg">
                              {domain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topicNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground/80 mb-2 flex">
                        Add Topics
                      </FormLabel>
                      <Select 
                        key={`topic-select-${field.value.length}`}
                        onValueChange={(value) => {
                          if (!field.value.includes(value)) {
                            const newTopics = handleTopicAdd(value, field.value);
                            field.onChange(newTopics);
                            // Clear any errors when adding topics
                            form.clearErrors('topicNames');
                          }
                        }} 
                        value=""
                        disabled={!watchedDomain}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 border-0 bg-muted/50 hover:bg-muted/80 transition-all duration-200 rounded-xl disabled:opacity-50">
                            <SelectValue placeholder={watchedDomain ? "Select topics" : "Select domain first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
                          {availableTopics.length > 0 ? (
                            availableTopics
                              .filter((topic) => !field.value.includes(topic))
                              .map((topic) => (
                                <SelectItem key={topic} value={topic} className="rounded-lg">
                                  {topic}
                                </SelectItem>
                              ))
                          ) : (
                            <div className="px-2 py-8 text-sm text-center text-muted-foreground">
                              No topics available
                            </div>
                          )}
                          {availableTopics.length > 0 && availableTopics.every((topic) => field.value.includes(topic)) && (
                            <div className="px-2 py-8 text-sm text-center text-muted-foreground">
                              All topics selected
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Selected Topics with Question Counts */}
              {watchedTopics.length > 0 && (
                <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Selected Topics</p>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                      totalQuestions > 50 
                        ? 'bg-destructive/10 border-destructive/30 ring-1 ring-destructive/20' 
                        : totalQuestions > 0 
                        ? 'bg-primary/5 border-primary/10' 
                        : 'bg-muted/20 border-border/40'
                    }`}>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</span>
                      <span className={`text-sm font-bold tabular-nums ${
                        totalQuestions > 50 ? 'text-destructive' : 'text-primary'
                      }`}>{totalQuestions}</span>
                      {totalQuestions > 50 && (
                        <span className="text-[9px] text-destructive/80">/50 max</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {watchedTopics.map((topic, index) => (
                      <div 
                        key={topic} 
                        className="group relative flex items-center justify-between gap-3 px-3.5 py-3 border border-border/40 hover:border-primary/30 hover:shadow-sm bg-card hover:bg-primary/[0.02] rounded-lg transition-all duration-200 animate-in fade-in zoom-in-95"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <span className="text-xs font-medium text-foreground/70 leading-snug line-clamp-1 flex-1 pr-2">{topic}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Input
                            type="number"
                            min={1}
                            max={50}
                            value={topicQuestionCounts[topic] || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numValue = value === '' ? 0 : parseInt(value);
                              handleTopicQuestionChange(topic, numValue);
                            }}
                            onBlur={(e) => {
                              // Set minimum of 1 if field is empty or 0 on blur
                              const value = parseInt(e.target.value);
                              if (!value || value === 0) {
                                handleTopicQuestionChange(topic, 1);
                              }
                            }}
                            placeholder="1"
                            className={`h-7 w-12 px-1.5 text-xs text-center border rounded-md font-semibold tabular-nums transition-all duration-200 ${
                              !topicQuestionCounts[topic] || topicQuestionCounts[topic] === 0
                                ? 'border-destructive/40 bg-destructive/5 hover:bg-destructive/10 focus:bg-destructive/10'
                                : 'border-0 bg-muted/40 hover:bg-muted/60 focus:bg-muted/80'
                            }`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleTopicRemove(topic)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="topicDescription"
                render={({ field }) => (
                  <FormItem className="pt-2">
                    <FormLabel className="text-sm font-medium text-foreground/80 mb-2 flex">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Provide additional context about these topics..."
                        className="min-h-[90px] resize-none border-0 bg-muted/50 hover:bg-muted/80 focus:bg-muted/80 transition-all duration-200 rounded-xl"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground mt-2">
                      Optional
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Difficulty Distribution */}
          {totalQuestions > 0 && (
            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/40 transition-all hover:shadow-medium animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-semibold flex">Difficulty Distribution</h3>
                  <p className="text-xs text-muted-foreground mt-1">AI will adjust complexity for adaptive learning</p>
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground border-border/60">
                  Step 2 of 3
                </Badge>
              </div>

              <div className="space-y-8">
                <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '0ms' }}>
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success/80 animate-pulse" style={{ animationDuration: '3s' }}></div>
                      <span className="text-sm font-medium">Easy</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground font-medium w-12 text-right">{difficultyDistribution.easy}%</span>
                      <span className="text-base font-semibold text-success w-10 text-right transition-all duration-300">{questionCounts.easy}</span>
                    </div>
                  </div>
                  <Slider
                    value={[difficultyDistribution.easy]}
                    onValueChange={([value]) => handleDifficultyChange('easy', value)}
                    min={0}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-success [&_[role=slider]]:border-0 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:shadow-md [&_[role=slider]]:transition-all [&_[role=slider]]:hover:scale-110 [&_[role=slider]]:hover:shadow-lg"
                  />
                </div>

                <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-warning/80 animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                      <span className="text-sm font-medium">Medium</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground font-medium w-12 text-right">{difficultyDistribution.medium}%</span>
                      <span className="text-base font-semibold text-warning w-10 text-right transition-all duration-300">{questionCounts.medium}</span>
                    </div>
                  </div>
                  <Slider
                    value={[difficultyDistribution.medium]}
                    onValueChange={([value]) => handleDifficultyChange('medium', value)}
                    min={0}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-warning [&_[role=slider]]:border-0 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:shadow-md [&_[role=slider]]:transition-all [&_[role=slider]]:hover:scale-110 [&_[role=slider]]:hover:shadow-lg"
                  />
                </div>

                <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-destructive/80 animate-pulse" style={{ animationDuration: '3s', animationDelay: '2s' }}></div>
                      <span className="text-sm font-medium">Hard</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground font-medium w-12 text-right">{difficultyDistribution.hard}%</span>
                      <span className="text-base font-semibold text-destructive w-10 text-right transition-all duration-300">{questionCounts.hard}</span>
                    </div>
                  </div>
                  <Slider
                    value={[difficultyDistribution.hard]}
                    onValueChange={([value]) => handleDifficultyChange('hard', value)}
                    min={0}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-destructive [&_[role=slider]]:border-0 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:shadow-md [&_[role=slider]]:transition-all [&_[role=slider]]:hover:scale-110 [&_[role=slider]]:hover:shadow-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Learning Configuration */}
          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/40 space-y-8 transition-all hover:shadow-medium animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex">Learning Configuration</h3>
                <p className="text-xs text-muted-foreground mt-1">Fine-tune the AI generation parameters</p>
              </div>
              <Badge variant="outline" className="text-xs text-muted-foreground border-border/60">
                Step 3 of 3
              </Badge>
            </div>
            
            <FormField
              control={form.control}
              name="learningObjectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground/80 mb-2 flex">
                    Learning Objectives
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What should students be able to demonstrate?"
                      className="min-h-[100px] resize-none border-0 bg-muted/50 hover:bg-muted/80 focus:bg-muted/80 transition-all duration-200 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground/80 mb-2 flex">
                    Target Audience
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the knowledge level and background..."
                      className="min-h-[90px] resize-none border-0 bg-muted/50 hover:bg-muted/80 focus:bg-muted/80 transition-all duration-200 rounded-xl"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground mt-2">
                    Optional
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="bloomsLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground/80 mb-2 flex">
                      Cognitive Level
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-0 bg-muted/50 hover:bg-muted/80 transition-all duration-200 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
                        {bloomsLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value} className="rounded-lg">
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground/80 mb-2 flex">
                      Question Style
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-0 bg-muted/50 hover:bg-muted/80 transition-all duration-200 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
                        {questionStyles.map((style) => (
                          <SelectItem key={style.value} value={style.value} className="rounded-lg">
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="focusAreas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground/80 mb-2 flex">
                    Focus Areas
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Specific concepts or areas to emphasize..."
                      className="min-h-[90px] resize-none border-0 bg-muted/50 hover:bg-muted/80 focus:bg-muted/80 transition-all duration-200 rounded-xl"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground mt-2">
                    Optional
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI will generate personalized, adaptive questions</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isGenerating}
              className="h-12 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isGenerating || totalQuestions === 0}
              className="h-12 px-8 bg-primary hover:bg-primary-dark disabled:opacity-40 rounded-xl font-medium shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md group relative overflow-hidden"
            >
              {isGenerating && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></span>
              )}
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 transition-transform group-hover:rotate-12" />
                  Generate {totalQuestions > 0 ? totalQuestions : ''} {totalQuestions === 1 ? 'Question' : 'Questions'}
                </>
              )}
            </Button>
          </div>
        </div>
          </form>
        </Form>
    </div>
  );
}
