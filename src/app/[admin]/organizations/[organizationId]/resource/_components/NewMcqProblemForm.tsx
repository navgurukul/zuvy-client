import { useEffect, useState } from 'react';
import { X, Loader2, Sparkles, Brain, Zap, ChevronDown, ChevronRight, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MCQQuestion } from './adminResourceComponentType';
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
import { usePathname } from 'next/navigation';
import { useAllCourses } from '@/hooks/useAllCourses';
import { useAllModulesByCourse } from '@/hooks/useAllModulesByCourse';
import { useTopics } from '@/hooks/useTopics';

interface CreateProblemFormProps {
  onClose: () => void;
  onSaveQuestions: (questions: Omit<MCQQuestion, 'id'>[]) => void;
}

// Zod schema for form validation
const formSchema = z.object({
  bootcampId: z.string().min(1, 'Bootcamp is required'),
  domainName: z.string().min(1, 'Domain is required'),
  topicNames: z.array(z.string()).min(1, 'At least one topic is required'),
  learningObjectives: z.string().min(10, 'Learning objectives are required (minimum 10 characters)'),
  targetAudience: z.string().optional(),
  focusAreas: z.string().optional(),
  bloomsLevel: z.string(),
  questionStyle: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

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

export function CreateProblemForm({ onClose, onSaveQuestions }: CreateProblemFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const searchParams = usePathname();
  const organizationId = +searchParams.split('/')[3] || 0;
  const { generateQuestions } = useGenerateMcqQuestions(organizationId);
  const { allCourses, loading: loadingBootcamps, error: bootcampError } = useAllCourses();
  
  // State to track question count for each topic
  const [topicQuestionCounts, setTopicQuestionCounts] = useState<{ [key: string]: number }>({});
  
  // State to track difficulty distribution for each topic
  const [topicDifficultyDistributions, setTopicDifficultyDistributions] = useState<{ 
    [key: string]: { easy: number; medium: number; hard: number } 
  }>({});
  
  // State to track which topics have expanded difficulty configuration
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  
  // State to track description for each topic
  const [topicDescriptions, setTopicDescriptions] = useState<{ [key: string]: string }>({});
  
  // Initialize form with react-hook-form and zod
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      bootcampId: '',
      domainName: '',
      topicNames: [],
      learningObjectives: '',
      targetAudience: '',
      focusAreas: '',
      bloomsLevel: 'understand',
      questionStyle: 'mixed',
    },
  });

  // Watch form values
  const watchedBootcampId = form.watch('bootcampId');
  const watchedDomain = form.watch('domainName');
  const watchedTopics = form.watch('topicNames');
  const selectedBootcampId = Number(watchedBootcampId || 0);

  const {
    modules,
    loading: loadingModules,
    error: modulesError,
  } = useAllModulesByCourse(selectedBootcampId, Boolean(selectedBootcampId));

  const selectedModule = modules.find((module) => module.name === watchedDomain);
  const selectedModuleId = selectedModule?.id || 0;

  const {
    topics: domainTopics,
    loading: loadingTopics,
    error: topicsError,
  } = useTopics(
    selectedModuleId,
    selectedBootcampId,
    Boolean(selectedBootcampId && selectedModuleId)
  );

  const availableTopicOptions = domainTopics.reduce<
    Array<{ id: string; name: string }>
  >((acc, topic) => {
    const topicName = topic.name?.trim()
    if (!topicName) {
      return acc
    }

    const topicId = topic.id ? String(topic.id) : `name:${topicName.toLowerCase()}`
    const alreadyExists = acc.some((item) => item.id === topicId)

    if (!alreadyExists) {
      acc.push({ id: topicId, name: topicName })
    }

    return acc
  }, [])

  const topicNameById = availableTopicOptions.reduce<Record<string, string>>(
    (acc, topic) => {
      acc[topic.id] = topic.name
      return acc
    },
    {}
  )

  const getTopicLabel = (topicId: string) => topicNameById[topicId] || topicId
  
  // Calculate total number of questions from all topics
  const totalQuestions = Object.values(topicQuestionCounts).reduce((sum, count) => sum + count, 0);

  const clearTopicSelections = () => {
    form.setValue('topicNames', [], { shouldValidate: true, shouldDirty: true });
    setTopicQuestionCounts({});
    setTopicDifficultyDistributions({});
    setTopicDescriptions({});
    setExpandedTopics(new Set());
    form.clearErrors('topicNames');
  };

  // Keep selected topics in sync with API-driven options.
  useEffect(() => {
    const validTopicIds = new Set(availableTopicOptions.map((topic) => topic.id))
    const filteredTopics = watchedTopics.filter((topic) =>
      validTopicIds.has(topic)
    );

    if (filteredTopics.length !== watchedTopics.length) {
      form.setValue('topicNames', filteredTopics, {
        shouldValidate: true,
        shouldDirty: true,
      });

      setTopicQuestionCounts((prev) => {
        const next: Record<string, number> = {};
        filteredTopics.forEach((topic) => {
          if (prev[topic]) {
            next[topic] = prev[topic];
          }
        });
        return next;
      });

      setTopicDifficultyDistributions((prev) => {
        const next: Record<string, { easy: number; medium: number; hard: number }> = {};
        filteredTopics.forEach((topic) => {
          if (prev[topic]) {
            next[topic] = prev[topic];
          }
        });
        return next;
      });

      setTopicDescriptions((prev) => {
        const next: Record<string, string> = {};
        filteredTopics.forEach((topic) => {
          if (prev[topic]) {
            next[topic] = prev[topic];
          }
        });
        return next;
      });

      setExpandedTopics((prev) => {
        const next = new Set<string>();
        filteredTopics.forEach((topic) => {
          if (prev.has(topic)) {
            next.add(topic);
          }
        });
        return next;
      });
    }
  }, [availableTopicOptions, form, watchedTopics]);

  const handleBootcampChange = (bootcampId: string) => {
    form.setValue('domainName', '', { shouldValidate: true, shouldDirty: true });
    clearTopicSelections();
    return bootcampId;
  };

  // Reset dependent selections when domain changes.
  const handleDomainChange = (domainName: string) => {
    clearTopicSelections();
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
  
  // Initialize default difficulty distribution for a topic
  const initializeTopicDifficulty = (topic: string) => {
    setTopicDifficultyDistributions(prev => {
      if (!prev[topic]) {
        return {
          ...prev,
          [topic]: { easy: 10, medium: 40, hard: 50 }
        };
      }
      return prev;
    });
  };
  
  // Toggle topic difficulty configuration expansion
  const toggleTopicExpansion = (topic: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topic)) {
        newSet.delete(topic);
      } else {
        newSet.add(topic);
        // Ensure the topic has a difficulty distribution
        if (!topicDifficultyDistributions[topic]) {
          initializeTopicDifficulty(topic);
        }
      }
      return newSet;
    });
  };
  
  // Handle per-topic difficulty change
  const handleTopicDifficultyChange = (
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    value: number
  ) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    
    setTopicDifficultyDistributions(prev => {
      const currentDist = prev[topic] || { easy: 10, medium: 40, hard: 50 };
      const newDistribution = { ...currentDist };
      
      // Set the new value
      newDistribution[difficulty] = clampedValue;
      
      // Calculate remaining percentage for other difficulties
      const remaining = 100 - clampedValue;
      
      // Get other difficulties
      const otherDifficulties = ['easy', 'medium', 'hard'].filter(d => d !== difficulty) as ('easy' | 'medium' | 'hard')[];
      
      if (remaining < 0) {
        newDistribution[difficulty] = 100;
        if (difficulty !== 'easy') newDistribution.easy = 0;
        if (difficulty !== 'medium') newDistribution.medium = 0;
        if (difficulty !== 'hard') newDistribution.hard = 0;
      } else if (remaining === 0) {
        if (difficulty !== 'easy') newDistribution.easy = 0;
        if (difficulty !== 'medium') newDistribution.medium = 0;
        if (difficulty !== 'hard') newDistribution.hard = 0;
      } else {
        const otherTotal = otherDifficulties.reduce((sum, d) => sum + newDistribution[d], 0);
        
        if (otherTotal === 0) {
          const equalShare = Math.floor(remaining / otherDifficulties.length);
          const remainder = remaining - (equalShare * otherDifficulties.length);
          
          otherDifficulties.forEach((d, index) => {
            newDistribution[d] = equalShare + (index === 0 ? remainder : 0);
          });
        } else {
          let distributed = 0;
          otherDifficulties.forEach((d, index) => {
            if (index === otherDifficulties.length - 1) {
              newDistribution[d] = remaining - distributed;
            } else {
              const proportion = newDistribution[d] / otherTotal;
              const newValue = Math.round(remaining * proportion);
              newDistribution[d] = newValue;
              distributed += newValue;
            }
          });
        }
      }
      
      // Final validation
      const sum = newDistribution.easy + newDistribution.medium + newDistribution.hard;
      if (sum !== 100) {
        const adjustment = 100 - sum;
        newDistribution[otherDifficulties[0]] = Math.max(0, newDistribution[otherDifficulties[0]] + adjustment);
      }
      
      return {
        ...prev,
        [topic]: newDistribution
      };
    });
  };
  
  // Get difficulty distribution for a topic (use global as fallback)
  const getTopicDifficulty = (topic: string) => {
    return topicDifficultyDistributions[topic] || difficultyDistribution;
  };
  
  // Calculate question counts for a specific topic
  const getTopicQuestionCounts = (topic: string) => {
    const topicTotal = topicQuestionCounts[topic] || 0;
    const dist = getTopicDifficulty(topic);
    
    if (topicTotal === 0) {
      return { easy: 0, medium: 0, hard: 0 };
    }
    
    const easyRaw = (dist.easy / 100) * topicTotal;
    const mediumRaw = (dist.medium / 100) * topicTotal;
    const hardRaw = (dist.hard / 100) * topicTotal;
    
    let easy = Math.round(easyRaw);
    let medium = Math.round(mediumRaw);
    let hard = Math.round(hardRaw);
    
    const sum = easy + medium + hard;
    const diff = topicTotal - sum;
    
    if (diff !== 0) {
      const fractions = [
        { type: 'easy', value: easyRaw - easy, count: easy },
        { type: 'medium', value: mediumRaw - medium, count: medium },
        { type: 'hard', value: hardRaw - hard, count: hard }
      ];
      
      fractions.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
      
      if (fractions[0].type === 'easy') easy += diff;
      else if (fractions[0].type === 'medium') medium += diff;
      else hard += diff;
    }
    
    return { 
      easy: Math.max(0, easy), 
      medium: Math.max(0, medium), 
      hard: Math.max(0, hard) 
    };
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
    
    // Remove from difficulty distributions
    setTopicDifficultyDistributions(prev => {
      const newDistributions = { ...prev };
      delete newDistributions[topic];
      return newDistributions;
    });
    
    // Remove from descriptions
    setTopicDescriptions(prev => {
      const newDescriptions = { ...prev };
      delete newDescriptions[topic];
      return newDescriptions;
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
    
    // Initialize difficulty distribution for this topic
    initializeTopicDifficulty(topic);
    
    return newTopics;
  };

  // Global difficulty distribution state (percentages) - used as default for new topics
  const [difficultyDistribution, setDifficultyDistribution] = useState({
    easy: 10,
    medium: 40,
    hard: 50,
  });

  const onSubmit = async (values: FormValues) => {
    // Validate that all topics have question counts > 0
    const topicsWithoutCounts = values.topicNames.filter(topic => !topicQuestionCounts[topic] || topicQuestionCounts[topic] === 0);
    if (topicsWithoutCounts.length > 0) {
      const topicLabels = topicsWithoutCounts.map((topicId) => getTopicLabel(topicId));
      form.setError('topicNames', {
        type: 'manual',
        message: `Please specify questions for: ${topicLabels.join(', ')}`
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
    const selectedTopicNames = values.topicNames.map((topicId) => getTopicLabel(topicId));
    const selectedTopicIds = values.topicNames
      .map((topicId) => Number(topicId))
      .filter((topicId) => Number.isFinite(topicId) && topicId > 0);
    
    // Prepare topic-specific configuration
    const topicConfigurations = values.topicNames.map(topic => {
      const count = topicQuestionCounts[topic] || 0;
      const distribution = topicDifficultyDistributions[topic] || difficultyDistribution;
      const topicId = Number(topic);
      
      // Calculate question counts for this topic
      const easyRaw = (distribution.easy / 100) * count;
      const mediumRaw = (distribution.medium / 100) * count;
      const hardRaw = (distribution.hard / 100) * count;
      
      let easy = Math.round(easyRaw);
      let medium = Math.round(mediumRaw);
      let hard = Math.round(hardRaw);
      
      // Adjust for rounding errors
      const sum = easy + medium + hard;
      const diff = count - sum;
      if (diff !== 0) {
        const fractions = [
          { type: 'easy', value: easyRaw - easy },
          { type: 'medium', value: mediumRaw - medium },
          { type: 'hard', value: hardRaw - hard }
        ];
        fractions.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
        
        if (fractions[0].type === 'easy') easy += diff;
        else if (fractions[0].type === 'medium') medium += diff;
        else hard += diff;
      }
      
      return {
        topicId: Number.isFinite(topicId) ? topicId : null,
        topicName: getTopicLabel(topic),
        topicDescription: topicDescriptions[topic] || '',
        totalQuestions: count,
        difficultyDistribution: distribution,
        questionCounts: {
          easy: Math.max(0, easy),
          medium: Math.max(0, medium),
          hard: Math.max(0, hard)
        }
      };
    });
    
    const payload = {
      bootcampId: Number(values.bootcampId),
      moduleId: selectedModuleId,
      domainName: values.domainName,
      topicIds: selectedTopicIds,
      topicNames: selectedTopicNames,
      numberOfQuestions: totalQuestions,
      learningObjectives: values.learningObjectives,
      targetAudience: values.targetAudience || '',
      focusAreas: values.focusAreas || '',
      bloomsLevel: values.bloomsLevel,
      questionStyle: values.questionStyle,
      topics: topicQuestionCounts,
      topicConfigurations, // Per-topic difficulty and description configuration
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
      bootcampId: '',
      domainName: '',
      topicNames: [],
      learningObjectives: '',
      targetAudience: '',
      focusAreas: '',
      bloomsLevel: 'understand',
      questionStyle: 'mixed',
    });
    setTopicQuestionCounts({});
    setTopicDifficultyDistributions({});
    setTopicDescriptions({});
    setExpandedTopics(new Set());
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
                Step 1 of 2
              </Badge>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="bootcampId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground/80 mb-2 flex">
                        Select Bootcamp
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(handleBootcampChange(value))
                        }
                        value={field.value}
                        disabled={loadingBootcamps}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 border-0 bg-muted/50 hover:bg-muted/80 transition-all duration-200 rounded-xl disabled:opacity-50">
                            <SelectValue
                              placeholder={
                                loadingBootcamps
                                  ? 'Loading bootcamps...'
                                  : 'Choose a bootcamp'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
                          {allCourses.length > 0 ? (
                            allCourses.map((course) => (
                              <SelectItem
                                key={course.id}
                                value={String(course.id)}
                                className="rounded-lg"
                              >
                                {course.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-8 text-sm text-center text-muted-foreground">
                              No bootcamps available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {Boolean(bootcampError) && (
                        <FormDescription className="text-xs text-destructive mt-2">
                          Failed to load bootcamps.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="domainName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground/80 mb-2 flex">
                        Domain
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(handleDomainChange(value))
                        }
                        value={field.value}
                        disabled={!watchedBootcampId || loadingModules || modules.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 border-0 bg-muted/50 hover:bg-muted/80 transition-all duration-200 rounded-xl disabled:opacity-50">
                            <SelectValue
                              placeholder={
                                !watchedBootcampId
                                  ? 'Select bootcamp first'
                                  : loadingModules
                                  ? 'Loading domains...'
                                  : modules.length === 0
                                  ? 'No domains available'
                                  : 'Choose a domain'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
                          {modules.length > 0 ? (
                            modules.map((module) => (
                              <SelectItem key={module.id} value={module.name} className="rounded-lg">
                                {module.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-8 text-sm text-center text-muted-foreground">
                              No domains available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {modulesError && watchedBootcampId && (
                        <FormDescription className="text-xs text-destructive mt-2">
                          Failed to load domains for the selected bootcamp.
                        </FormDescription>
                      )}
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
                        disabled={!watchedDomain || loadingTopics}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 border-0 bg-muted/50 hover:bg-muted/80 transition-all duration-200 rounded-xl disabled:opacity-50">
                            <SelectValue
                              placeholder={
                                !watchedBootcampId
                                  ? 'Select bootcamp first'
                                  : !watchedDomain
                                  ? 'Select domain first'
                                  : loadingTopics
                                  ? 'Loading topics...'
                                  : 'Select topics'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
                          {availableTopicOptions.length > 0 ? (
                            availableTopicOptions
                              .filter((topic) => !field.value.includes(topic.id))
                              .map((topic) => (
                                <SelectItem key={topic.id} value={topic.id} className="rounded-lg">
                                  {topic.name}
                                </SelectItem>
                              ))
                          ) : (
                            <div className="px-2 py-8 text-sm text-center text-muted-foreground">
                              {loadingTopics
                                ? 'Loading topics...'
                                : 'No topics available'}
                            </div>
                          )}
                          {availableTopicOptions.length > 0 && availableTopicOptions.every((topic) => field.value.includes(topic.id)) && (
                            <div className="px-2 py-8 text-sm text-center text-muted-foreground">
                              All topics selected
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {topicsError && watchedBootcampId && watchedDomain && (
                        <FormDescription className="text-xs text-destructive mt-2">
                          Failed to load topics for the selected domain.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Selected Topics with Question Counts */}
              {watchedTopics.length > 0 && (
                <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Selected Topics</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                        <Settings2 className="h-3 w-3" />
                        <span>Click to configure difficulty per topic</span>
                      </div>
                    </div>
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
                  <div className="space-y-3">
                    {watchedTopics.map((topicId, index) => {
                      const topicName = getTopicLabel(topicId);
                      const isExpanded = expandedTopics.has(topicId);
                      const topicDist = getTopicDifficulty(topicId);
                      const topicCounts = getTopicQuestionCounts(topicId);
                      
                      return (
                        <div 
                          key={topicId} 
                          className="border border-border/40 hover:border-primary/30 bg-card rounded-lg transition-all duration-200 animate-in fade-in zoom-in-95 overflow-hidden"
                          style={{ animationDelay: `${index * 40}ms` }}
                        >
                          {/* Topic Header */}
                          <div className="group flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-primary/[0.02]">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => toggleTopicExpansion(topicId)}
                                className="shrink-0 p-1 hover:bg-primary/10 rounded transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </button>
                              <span className="text-xs font-medium text-foreground/70 leading-snug truncate flex-1">
                                {topicName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Input
                                type="number"
                                min={1}
                                max={50}
                                value={topicQuestionCounts[topicId] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const numValue = value === '' ? 0 : parseInt(value);
                                  handleTopicQuestionChange(topicId, numValue);
                                }}
                                onBlur={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!value || value === 0) {
                                    handleTopicQuestionChange(topicId, 1);
                                  }
                                }}
                                placeholder="1"
                                className={`h-7 w-12 px-1.5 text-xs text-center border rounded-md font-semibold tabular-nums transition-all duration-200 ${
                                  !topicQuestionCounts[topicId] || topicQuestionCounts[topicId] === 0
                                    ? 'border-destructive/40 bg-destructive/5 hover:bg-destructive/10 focus:bg-destructive/10'
                                    : 'border-0 bg-muted/40 hover:bg-muted/60 focus:bg-muted/80'
                                }`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTopicExpansion(topicId)}
                                className="h-6 w-6 p-0 rounded-md opacity-60 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                                title="Configure difficulty"
                              >
                                <Settings2 className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleTopicRemove(topicId)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Expanded Difficulty Configuration */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2 bg-muted/20 border-t border-border/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                <Settings2 className="h-3 w-3" />
                                <span>Configuration for this topic</span>
                              </div>
                              
                              {/* Topic Description */}
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-foreground/70">Description</label>
                                <Textarea
                                  value={topicDescriptions[topicId] || ''}
                                  onChange={(e) => {
                                    setTopicDescriptions(prev => ({
                                      ...prev,
                                      [topicId]: e.target.value
                                    }));
                                  }}
                                  placeholder="Provide context about this topic..."
                                  className="min-h-[70px] text-xs resize-none border-0 bg-background/50 hover:bg-background/80 focus:bg-background/80 transition-all duration-200 rounded-lg"
                                />
                              </div>
                              
                              {/* Difficulty Distribution */}
                              <div className="pt-2">
                                <p className="text-xs font-medium text-foreground/70 mb-3">Difficulty Distribution</p>
                              </div>
                              
                              {/* Easy */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-success/80"></div>
                                    <span className="text-xs font-medium">Easy</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-muted-foreground font-medium w-8 text-right">{topicDist.easy}%</span>
                                    <span className="text-sm font-semibold text-success w-6 text-right">{topicCounts.easy}</span>
                                  </div>
                                </div>
                                <Slider
                                  value={[topicDist.easy]}
                                  onValueChange={([value]) => handleTopicDifficultyChange(topicId, 'easy', value)}
                                  min={0}
                                  max={100}
                                  step={5}
                                  className="[&_[role=slider]]:bg-success [&_[role=slider]]:border-0 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow"
                                />
                              </div>
                              
                              {/* Medium */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-warning/80"></div>
                                    <span className="text-xs font-medium">Medium</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-muted-foreground font-medium w-8 text-right">{topicDist.medium}%</span>
                                    <span className="text-sm font-semibold text-warning w-6 text-right">{topicCounts.medium}</span>
                                  </div>
                                </div>
                                <Slider
                                  value={[topicDist.medium]}
                                  onValueChange={([value]) => handleTopicDifficultyChange(topicId, 'medium', value)}
                                  min={0}
                                  max={100}
                                  step={5}
                                  className="[&_[role=slider]]:bg-warning [&_[role=slider]]:border-0 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow"
                                />
                              </div>
                              
                              {/* Hard */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-destructive/80"></div>
                                    <span className="text-xs font-medium">Hard</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-muted-foreground font-medium w-8 text-right">{topicDist.hard}%</span>
                                    <span className="text-sm font-semibold text-destructive w-6 text-right">{topicCounts.hard}</span>
                                  </div>
                                </div>
                                <Slider
                                  value={[topicDist.hard]}
                                  onValueChange={([value]) => handleTopicDifficultyChange(topicId, 'hard', value)}
                                  min={0}
                                  max={100}
                                  step={5}
                                  className="[&_[role=slider]]:bg-destructive [&_[role=slider]]:border-0 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Learning Configuration */}
          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/40 space-y-8 transition-all hover:shadow-medium animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex">Learning Configuration</h3>
                <p className="text-xs text-muted-foreground mt-1">Fine-tune the AI generation parameters</p>
              </div>
              <Badge variant="outline" className="text-xs text-muted-foreground border-border/60">
                Step 2 of 2
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
