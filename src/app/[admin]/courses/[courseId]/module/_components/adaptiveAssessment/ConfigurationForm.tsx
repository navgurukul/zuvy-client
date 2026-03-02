import { useState } from 'react';
import { Plus, Sparkles, AlertCircle, FileText, Upload, X } from 'lucide-react';
import { AssessmentCriteria } from '../../[moduleId]/chapter/[chapterId]/adaptiveAssessment/types';
import { mockDomains } from '../../[moduleId]/chapter/[chapterId]/adaptiveAssessment/mockData';
import { CriteriaRow } from './CriteriaRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HelpTooltip } from './HelpTooltip';

interface ConfigurationFormProps {
  criteria: AssessmentCriteria[];
  onCriteriaChange: (criteria: AssessmentCriteria[]) => void;
  onSubmit: () => void;
  assessmentName?: string;
  assessmentDescription?: string;
  onNameChange?: (name: string) => void;
  onDescriptionChange?: (description: string) => void;
  syllabusFile?: File | null;
  onSyllabusChange?: (file: File | null) => void;
}

export function ConfigurationForm({ 
  criteria, 
  onCriteriaChange, 
  onSubmit,
  assessmentName = '',
  assessmentDescription = '',
  onNameChange,
  onDescriptionChange,
  syllabusFile,
  onSyllabusChange,
}: ConfigurationFormProps) {
  const [touched, setTouched] = useState({ name: false, description: false });
  const [internalSyllabus, setInternalSyllabus] = useState<File | null>(null);
  const [syllabusError, setSyllabusError] = useState<string | null>(null);
  const currentSyllabus = syllabusFile !== undefined ? syllabusFile : internalSyllabus;
  
  const createEmptyCriteria = (): AssessmentCriteria => ({
    id: `criteria-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    domainId: '',
    topics: [],
    questionType: 'MCQ',
  });

  const handleAddRow = () => {
    onCriteriaChange([...criteria, createEmptyCriteria()]);
  };

  const handleUpdateCriteria = (index: number, updated: AssessmentCriteria) => {
    const newCriteria = [...criteria];
    newCriteria[index] = updated;
    onCriteriaChange(newCriteria);
  };

  const handleRemoveCriteria = (index: number) => {
    onCriteriaChange(criteria.filter((_, i) => i !== index));
  };

  // Validation
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const descriptionWordCount = countWords(assessmentDescription);
  const isDescriptionValid = descriptionWordCount >= 20;
  const isNameValid = assessmentName.trim().length > 0;

  const hasValidTopicConfig = (c: AssessmentCriteria): boolean => {
    const topics = c.topics || [];
    if (topics.length === 0) return false;
    
    // Check all topics have valid question counts
    return topics.every(t => {
      const domain = mockDomains.find(d => d.id === c.domainId);
      const topic = domain?.topics.find(dt => dt.id === t.topicId);
      if (!topic?.availableQuestions) return t.questionCount > 0;
      
      const available = t.difficulty === 'Easy' 
        ? topic.availableQuestions.easy 
        : t.difficulty === 'Medium' 
          ? topic.availableQuestions.medium 
          : topic.availableQuestions.hard;
      
      return t.questionCount > 0 && t.questionCount <= available;
    });
  };

  const isFormValid = 
    isNameValid && 
    isDescriptionValid && 
    criteria.every(c => c.domainId && hasValidTopicConfig(c));

  const totalQuestions = criteria.reduce((sum, c) => {
    const topics = c.topics || [];
    return sum + topics.reduce((tSum, t) => tSum + (t.questionCount || 0), 0);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">
                Assessment Configuration
              </h2>
              <p className="text-text-secondary text-sm">
                Configure domains, topics with difficulty levels and question counts
              </p>
            </div>
          </div>
        </div>
        
        {/* Question Counter */}
        <div className="text-right">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-card to-card-elevated border border-border/50 rounded-2xl p-4 min-w-[120px]">
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Total Questions
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {totalQuestions}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Name & Description */}
      <div className="space-y-4 p-5 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Assessment Details</h3>
        </div>

        {/* Name Field */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-foreground">
              Assessment Name <span className="text-destructive">*</span>
            </label>
            <HelpTooltip content="Give your assessment a clear, descriptive name that helps identify its purpose and content." />
          </div>
          <Input
            value={assessmentName}
            onChange={(e) => onNameChange?.(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
            placeholder="e.g., JavaScript Fundamentals Quiz"
            className={`bg-background/50 border-border/50 rounded-xl h-11 ${
              touched.name && !isNameValid ? 'border-destructive' : ''
            }`}
          />
          {touched.name && !isNameValid && (
            <div className="flex items-center gap-1.5 mt-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Assessment name is required</span>
            </div>
          )}
        </div>

        {/* Description Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">
                Description <span className="text-destructive">*</span>
              </label>
              <HelpTooltip content="Provide a detailed description of the assessment including its objectives, target audience, and key topics covered. Minimum 20 words required." />
            </div>
            <span className={`text-xs ${descriptionWordCount >= 20 ? 'text-success' : 'text-text-secondary'}`}>
              {descriptionWordCount}/20 words minimum
            </span>
          </div>
          <Textarea
            value={assessmentDescription}
            onChange={(e) => onDescriptionChange?.(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
            placeholder="Describe the purpose, objectives, and scope of this assessment. Include information about the target audience and what skills or knowledge will be evaluated..."
            className={`bg-background/50 border-border/50 rounded-xl min-h-[100px] resize-none ${
              touched.description && !isDescriptionValid ? 'border-destructive' : ''
            }`}
          />
          {touched.description && !isDescriptionValid && (
            <div className="flex items-center gap-1.5 mt-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Description must be at least 20 words ({20 - descriptionWordCount} more needed)</span>
            </div>
          )}
        </div>
      </div>

      {/* Criteria Rows */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Domain & Topic Configuration</h3>
          <HelpTooltip content="Add one or more domain configurations. Each domain can have multiple topics with individual difficulty and question count settings." />
        </div>
        
        {criteria.map((c, index) => (
          <CriteriaRow
            key={c.id}
            criteria={c}
            domains={mockDomains}
            onUpdate={(updated) => handleUpdateCriteria(index, updated)}
            onRemove={() => handleRemoveCriteria(index)}
            canRemove={criteria.length > 1}
          />
        ))}
      </div>

      {/* Syllabus PDF Upload */}
      <div className="space-y-3 p-5 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Syllabus PDF (optional)</h3>
          <HelpTooltip content="Upload a syllabus PDF to guide question generation or keep as a reference with the assessment." />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-foreground">Upload file</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center justify-center px-4 h-10 rounded-xl cursor-pointer border border-border/60 bg-background/50 hover:bg-background transition-colors text-sm font-medium gap-2">
              <Upload className="h-4 w-4" />
              <span>{currentSyllabus ? 'Replace PDF' : 'Choose PDF file'}</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  if (!file) return;
                  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                    setSyllabusError('Please select a valid PDF file.');
                    return;
                  }
                  setSyllabusError(null);
                  onSyllabusChange?.(file);
                  setInternalSyllabus(file);
                }}
              />
            </label>

            {currentSyllabus && (
              <button
                type="button"
                onClick={() => {
                  onSyllabusChange?.(null);
                  setInternalSyllabus(null);
                  setSyllabusError(null);
                }}
                className="inline-flex items-center gap-2 px-3 h-10 rounded-xl border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors text-sm"
                aria-label="Remove syllabus PDF"
              >
                <X className="h-4 w-4" /> Remove
              </button>
            )}
          </div>

          {currentSyllabus && (
            <div className="text-sm text-text-secondary flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="truncate max-w-[60ch]">{currentSyllabus.name}</span>
              <span>• {(currentSyllabus.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          )}

          {syllabusError && (
            <div className="flex items-center gap-1.5 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{syllabusError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={handleAddRow}
          className="border-dashed border-2 border-primary/30 hover:border-primary hover:bg-primary/5 rounded-xl transition-all duration-300 group"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Add Another Domain
        </Button>

        <div className="flex-1" />

        <Button
          onClick={onSubmit}
          disabled={!isFormValid}
          className="px-8 h-12 rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Submit Configuration
        </Button>
      </div>
    </div>
  );
}
