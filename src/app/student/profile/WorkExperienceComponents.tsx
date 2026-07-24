import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, Calendar, X, Briefcase } from 'lucide-react';
import type { WorkExperience } from '@/lib/profile.types';
import { MONTHS, TECH_STACK, SKILLS_BY_CATEGORY } from '@/lib/profile.mockData';
import { useLearnerTechnicalSkills } from '@/app/student/hooks/useLearnerTechnicalSkills';
import { format } from 'date-fns';

const formatDateForInput = (dateValue?: WorkExperience['startDate']) => {
  if (!dateValue) {
    return '';
  }

  if (typeof dateValue === 'string') {
    return dateValue;
  }

  const year = String(dateValue.year);
  const month = String(Number(dateValue.month)).padStart(2, '0');
  return `${year}-${month}-01`;
};

const getTodayInputValue = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const isEarlierThan = (leftDate?: string, rightDate?: string) => {
  if (!leftDate || !rightDate) {
    return false;
  }

  return leftDate < rightDate;
};

const formatExperienceDate = (dateValue?: WorkExperience['startDate']) => {
  if (!dateValue) {
    return 'Select date';
  }

  if (typeof dateValue === 'string') {
    const parsedDate = new Date(dateValue);
    return Number.isNaN(parsedDate.getTime()) ? dateValue : format(parsedDate, 'dd-MM-yyyy');
  }

  if (!dateValue.year || !dateValue.month) {
    return 'Select date';
  }

  const monthIndex = Number(dateValue.month) - 1;
  const normalizedDate = new Date(Number(dateValue.year), monthIndex, 1);
  return format(normalizedDate, 'dd-MM-yyyy');
};

export const WorkExperienceModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (experience: WorkExperience) => void;
  initialExperience?: WorkExperience;
}> = ({ isOpen, onOpenChange, onSave, initialExperience }) => {
  const [formData, setFormData] = useState<WorkExperience>(
    initialExperience || {
      id: Date.now().toString(),
      companyName: '',
      role: '',
      startDate: '',
      endDate: undefined,
      isCurrentlyWorking: false,
      workMode: 'Remote',
      city: '',
      responsibilities: '',
      technologiesUsed: [],
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { technicalSkills, loading: isLoadingTechStack } = useLearnerTechnicalSkills();
  const [startDateInputValue, setStartDateInputValue] = useState(formatDateForInput(initialExperience?.startDate) || '');
  const [endDateInputValue, setEndDateInputValue] = useState(formatDateForInput(initialExperience?.endDate) || '');
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);

  const allTechOptions = technicalSkills.length > 0
    ? technicalSkills.map((s) => s.name)
    : Object.values(SKILLS_BY_CATEGORY).flat();

  useEffect(() => {
    if (initialExperience) {
      setFormData(initialExperience);
      setStartDateInputValue(formatDateForInput(initialExperience.startDate) || '');
      setEndDateInputValue(formatDateForInput(initialExperience.endDate) || '');
    }
  }, [initialExperience]);

  useEffect(() => {
    if (isOpen) {
      if (initialExperience) {
        setFormData(initialExperience);
        setStartDateInputValue(formatDateForInput(initialExperience.startDate) || '');
        setEndDateInputValue(formatDateForInput(initialExperience.endDate) || '');
      } else {
        setFormData({
          id: Date.now().toString(),
          companyName: '',
          role: '',
          startDate: '',
          endDate: undefined,
          isCurrentlyWorking: false,
          workMode: 'Remote',
          city: '',
          responsibilities: '',
          technologiesUsed: [],
        });
        setStartDateInputValue('');
        setEndDateInputValue('');
      }
      setErrors({});
    }
  }, [isOpen, initialExperience]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.role.trim()) newErrors.role = 'Role/Title is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.isCurrentlyWorking && !formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.workMode === 'On-site' && !formData.city?.trim()) {
      newErrors.city = 'City is required for on-site work';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTechSelect = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologiesUsed: prev.technologiesUsed?.includes(tech)
        ? prev.technologiesUsed.filter((t) => t !== tech)
        : [...(prev.technologiesUsed || []), tech],
    }));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const normalizedExperience: WorkExperience = {
        ...formData,
        endDate: formData.isCurrentlyWorking ? undefined : formData.endDate,
      };

      onSave(normalizedExperience);
      onOpenChange(false);
      setFormData({
        id: Date.now().toString(),
        companyName: '',
        role: '',
        startDate: '',
        endDate: undefined,
        isCurrentlyWorking: false,
        workMode: 'Remote',
        city: '',
        responsibilities: '',
        technologiesUsed: [],
      });
      setStartDateInputValue('');
      setEndDateInputValue('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{initialExperience ? 'Edit Work Experience' : 'Add Work Experience'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 px-6 text-left block">
          {/* Company Name and Role */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="font-medium">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                placeholder="e.g., Google"
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                className={errors.companyName ? 'border-destructive' : ''}
              />
              {errors.companyName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.companyName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="font-medium">
                Role / Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer"
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                className={errors.role ? 'border-destructive' : ''}
              />
              {errors.role && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.role}
                </p>
              )}
            </div>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="font-medium">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={startDateInputRef}
                  id="startDate"
                  type="date"
                  value={startDateInputValue}
                  max={getTodayInputValue()}
                  onClick={() => startDateInputRef.current?.showPicker?.()}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    setStartDateInputValue(dateValue);

                    if (dateValue && isEarlierThan(getTodayInputValue(), dateValue)) {
                      setErrors((prev) => ({
                        ...prev,
                        startDate: 'Start date cannot be in the future',
                      }));
                      return;
                    }

                    if (dateValue) {
                      const currentEndDate = endDateInputValue;
                      if (currentEndDate && isEarlierThan(currentEndDate, dateValue)) {
                        setFormData((prev) => ({
                          ...prev,
                          startDate: dateValue,
                          endDate: undefined,
                        }));
                        setEndDateInputValue('');
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.endDate;
                          delete next.startDate;
                          return next;
                        });
                        return;
                      }

                      setFormData((prev) => ({
                        ...prev,
                        startDate: dateValue,
                      }));
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.startDate;
                        return next;
                      });
                    } else {
                      setFormData((prev) => ({ ...prev, startDate: '' }));
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.startDate;
                        return next;
                      });
                    }
                  }}
                  className={`pl-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0 ${errors.startDate ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.startDate && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.startDate}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="font-medium">
                End Date {!formData.isCurrentlyWorking && <span className="text-destructive">*</span>}
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={endDateInputRef}
                  id="endDate"
                  type="date"
                  disabled={formData.isCurrentlyWorking}
                  value={endDateInputValue}
                  max={getTodayInputValue()}
                  min={startDateInputValue || undefined}
                  onClick={() => endDateInputRef.current?.showPicker?.()}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    setEndDateInputValue(dateValue);
                    const startDateValue = startDateInputValue;

                    if (dateValue && isEarlierThan(getTodayInputValue(), dateValue)) {
                      setErrors((prev) => ({
                        ...prev,
                        endDate: 'End date cannot be in the future',
                      }));
                      return;
                    }

                    if (startDateValue && isEarlierThan(dateValue, startDateValue)) {
                      setErrors((prev) => ({
                        ...prev,
                        endDate: 'End date must be the same as or later than the start date',
                      }));
                      return;
                    }

                    if (dateValue) {
                      setFormData((prev) => ({
                        ...prev,
                        endDate: dateValue,
                      }));

                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.endDate;
                        return next;
                      });
                    } else {
                      setFormData((prev) => ({ ...prev, endDate: undefined }));
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.endDate;
                        return next;
                      });
                    }
                  }}
                  className={`pl-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0 ${errors.endDate ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.endDate && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Currently Working Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="currentlyWorking"
              checked={formData.isCurrentlyWorking}
              onCheckedChange={(checked) => {
                const isCurrentlyWorking = checked as boolean;

               console.log("Checkbox changed:", isCurrentlyWorking);
                setFormData((prev) => ({
                  ...prev,
                  isCurrentlyWorking,
                  endDate: isCurrentlyWorking ? undefined : prev.endDate,
                }));
                if (isCurrentlyWorking) {
                  setEndDateInputValue('');
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.endDate;
                    return next;
                  });
                }
              }}
            />
            <Label htmlFor="currentlyWorking" className="font-medium cursor-pointer mt-5">
              I am currently working here
            </Label>
          </div>

          {/* Work Mode */}
          <div className="space-y-2">
            <Label className="font-medium">Work Mode</Label>
            <RadioGroup
              value={formData.workMode}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, workMode: value as 'Remote' | 'On-site' }))}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Remote" id="remote" />
                <Label htmlFor="remote" className="font-normal cursor-pointer mt-5">Remote</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="On-site" id="onsite" />
                <Label htmlFor="onsite" className="font-normal cursor-pointer mt-5">On-site</Label>
              </div>
            </RadioGroup>
          </div>

          {/* City (conditional) */}
          {formData.workMode === 'On-site' && (
            <div className="space-y-2">
              <Label htmlFor="city" className="font-medium">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="e.g., Bangalore"
                value={formData.city || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                className={errors.city ? 'border-destructive' : ''}
              />
              {errors.city && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.city}
                </p>
              )}
            </div>
          )}

          {/* Responsibilities */}
          <div className="space-y-2">
            <Label htmlFor="responsibilities" className="font-medium">
              Responsibilities (Optional)
            </Label>
            <Textarea
              id="responsibilities"
              placeholder="• Built and maintained web applications&#10;• Collaborated with cross-functional teams&#10;• Implemented new features"
              value={formData.responsibilities || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, responsibilities: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Technologies Used */}
          <div className="space-y-2">
            <Label className="font-medium">
              Technologies Used (Optional)
            </Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingTechStack ? 'Loading technologies...' : 'Select technologies...'} />
              </SelectTrigger>
              <SelectContent>
                <div
                  className="p-2 space-y-1 max-h-60 overflow-y-auto"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {isLoadingTechStack ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
                  ) : null}
                  {!isLoadingTechStack && allTechOptions.map((tech) => (
                    <div
                      key={tech}
                      className="flex items-center space-x-2 hover:bg-accent p-2 rounded cursor-pointer"
                      onClick={() => handleTechSelect(tech)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.technologiesUsed?.includes(tech)}
                            readOnly
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTechSelect(tech);
                            }}
                        className="rounded"
                      />
                      <span className="text-sm">{tech}</span>
                    </div>
                  ))}
                </div>
              </SelectContent>
            </Select>
            {formData.technologiesUsed && formData.technologiesUsed.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.technologiesUsed.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleTechSelect(tech)}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t p-4 flex gap-3 bg-background">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Save Experience
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const WorkExperienceCard: React.FC<{
  experience: WorkExperience;
  onEdit: (experience: WorkExperience) => void;
  onDelete: (experienceId: string) => void;
}> = ({ experience, onEdit, onDelete }) => (
  <div className="rounded-xl border border-border/70 bg-background/70 p-4 shadow-sm">
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
      <div className="min-w-0 space-y-3 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-base text-foreground">{experience.companyName}</h3>
          <Badge variant="secondary" className="text-xs uppercase">
            {experience.workMode}
          </Badge>
          {experience.isCurrentlyWorking && (
            <Badge variant="default" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
              Current
            </Badge>
          )}
        </div>

        <p className="text-sm font-medium text-foreground">{experience.role}</p>
        <p className="text-sm text-muted-foreground">
          {formatExperienceDate(experience.startDate)} -{' '}
          {experience.isCurrentlyWorking
            ? 'Present'
            : formatExperienceDate(experience.endDate)}
          {experience.workMode === 'On-site' && experience.city && ` • ${experience.city}`}
        </p>

        {experience.technologiesUsed && experience.technologiesUsed.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {experience.technologiesUsed.map((tech) => (
              <Badge key={tech} variant="default" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        {experience.responsibilities && (
          <p className="text-sm text-muted-foreground whitespace-pre-line">{experience.responsibilities}</p>
        )}
      </div>

      <div className="flex items-start gap-2 md:justify-end">
        <button
          type="button"
          onClick={() => onEdit(experience)}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <svg className="w-4 h-4 text-muted-foreground hover:text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(experience.id)}
          className="p-2 hover:bg-destructive/10 rounded-md transition-colors"
        >
          <svg className="w-4 h-4 text-muted-foreground hover:text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);
