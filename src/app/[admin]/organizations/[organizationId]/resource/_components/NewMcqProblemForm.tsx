import { useState } from 'react';
import { X, Sparkles, Loader2, Wand2, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    setTopicQuestionCounts(prev => ({
      ...prev,
      [topic]: Math.max(0, Math.min(50, count || 0))
    }));
  };
  
  // Handle topic removal
  const handleTopicRemove = (topic: string, currentTopics: string[]) => {
    const newTopics = currentTopics.filter((t) => t !== topic);
    const newCounts = { ...topicQuestionCounts };
    delete newCounts[topic];
    setTopicQuestionCounts(newCounts);
    return newTopics;
  };
  
  // Handle topic addition
  const handleTopicAdd = (topic: string, currentTopics: string[]) => {
    const newTopics = [...currentTopics, topic];
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
    // Validate that all topics have question counts
    const hasAllCounts = values.topicNames.every(topic => topicQuestionCounts[topic] > 0);
    if (!hasAllCounts) {
      alert('Please specify the number of questions for each topic (minimum 1).');
      return;
    }
    
    if (totalQuestions === 0) {
      alert('Total number of questions must be at least 1.');
      return;
    }
    
    if (totalQuestions > 50) {
      alert('Total number of questions cannot exceed 50.');
      return;
    }
    
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
    setIsGenerating(true);

    
    try {
      const response = await generateQuestions(payload);
      console.log('Generated Questions Response:', response);
      
      // TODO: Transform the API response to match MCQQuestion format if needed
      // For now, assuming the API returns questions in the correct format
      if (response?.questions) {
        onSaveQuestions(response.questions);
      }
      
      handleCancel();
    } catch (error) {
      console.error('Error generating questions:', error);
      alert(`Failed to generate questions: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
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
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg shadow-green-600/25">
          <Wand2 className="h-5 w-5 text-white" />
        </div>
        <div className="text-left">
          <div className="text-xl font-bold">Generate MCQ Questions with AI</div>
          <p className="text-sm text-muted-foreground font-normal mt-0.5">
            Create high-quality multiple choice questions using AI
          </p>
        </div>
      </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Domain & Topic Section */}
          <div className="p-4 bg-primary/5 border border-primary/30 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileText className="h-3.5 w-3.5 text-primary" />
              </div>
              <h6 className="font-semibold text-foreground">Domain & Topic Information</h6>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="domainName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center ' >
                      <span className="">Domain Name</span> <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={(value) => field.onChange(handleDomainChange(value))} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/50 rounded-xl h-11">
                          <SelectValue placeholder="Select domain..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50 rounded-xl">
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
                   <FormLabel className='flex items-center ' >
                      <span className="">Topics</span> <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="space-y-3">
                      {/* Display selected topics with question count inputs */}
                      {field.value && field.value.length > 0 && (
                        <div className="space-y-2 p-3 bg-background/50 border border-border/50 rounded-xl">
                          {field.value.map((topic) => (
                            <div key={topic} className="flex items-center gap-2 p-2 bg-background rounded-lg border border-border/30">
                              <Badge
                                variant="secondary"
                                className="flex-1 px-3 py-1.5 bg-primary/10 text-primary border-primary/30 text-left justify-start"
                              >
                                {topic}
                              </Badge>
                              <Input
                                type="number"
                                min={1}
                                max={50}
                                value={topicQuestionCounts[topic] || ''}
                                onChange={(e) => handleTopicQuestionChange(topic, parseInt(e.target.value) || 0)}
                                placeholder="Qs"
                                className="w-20 h-9 text-center bg-background/50 border-border/50 rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                  field.onChange(handleTopicRemove(topic, field.value));
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <span className="text-sm font-medium text-muted-foreground">Total Questions:</span>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-semibold text-base px-3 py-1">
                              {totalQuestions}
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      {/* Topic selection dropdown */}
                      <Select 
                        onValueChange={(value) => {
                          if (!field.value.includes(value)) {
                            field.onChange(handleTopicAdd(value, field.value));
                          }
                        }} 
                        disabled={!watchedDomain}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background/50 border-border/50 rounded-xl h-11">
                            <SelectValue placeholder={watchedDomain ? "Select topics..." : "Select domain first..."} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50 rounded-xl">
                          {availableTopics.length > 0 ? (
                            availableTopics
                              .filter((topic) => !field.value.includes(topic))
                              .map((topic) => (
                                <SelectItem key={topic} value={topic} className="rounded-lg">
                                  {topic}
                                </SelectItem>
                              ))
                          ) : (
                            <div className="px-2 py-6 text-sm text-left text-muted-foreground">
                              No topics available
                            </div>
                          )}
                          {availableTopics.length > 0 && availableTopics.every((topic) => field.value.includes(topic)) && (
                            <div className="px-2 py-6 text-sm text-left text-muted-foreground">
                              All topics selected
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormDescription>
                      Select multiple topics from {watchedDomain || 'the selected domain'}. Specify the number of questions for each topic.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="topicDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center ' >
                      <span className="">Topic Description</span> <span className="text-destructive">*</span>
                    </FormLabel>
                  
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="e.g., Covers useState, useEffect, useContext, and custom hooks..."
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
          </div>

            {/* Difficulty Distribution Sliders */}
            <div className="p-4 bg-muted/30 border border-border/50 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h6 className="font-semibold text-foreground">Difficulty Distribution</h6>
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
                <FormLabel className='flex items-center ' >
                      <span className="">Learning Objectives</span> <span className="text-destructive">*</span>
                    </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="e.g., Students should be able to understand React hooks, implement state management..."
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
                <FormLabel className='flex items-center ' >
                      <span className="">Target Audience</span> <span className="text-destructive">*</span>
                    </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="e.g., Intermediate developers with 1-2 years of JavaScript experience..."
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

          {/* Bloom's Taxonomy & Question Style */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bloomsLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center ' >
                      <span className="">Cognitive Level (Bloom&apos;s)</span> <span className="text-destructive">*</span>
                    </FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="questionStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center ' >
                      <span className="">Question Style</span> <span className="text-destructive">*</span>
                    </FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Focus Areas */}
          <FormField
            control={form.control}
            name="focusAreas"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center ' >
                      <span className="">Specific Focus Areas</span> <span className="text-destructive">*</span>
                    </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="e.g., Focus on useState, useEffect hooks. Include common pitfalls..."
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
            disabled={isGenerating}
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 min-w-[180px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate {totalQuestions} Questions
              </>
            )}
          </Button>
        </div>
          </form>
        </Form>
    </div>
  );
}
