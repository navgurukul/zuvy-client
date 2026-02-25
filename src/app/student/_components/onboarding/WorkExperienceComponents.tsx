import React, { useState, useEffect } from 'react';
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
import type { WorkExperience } from '@/lib/onboarding.types';
import { MONTHS, TECH_STACK } from '@/lib/onboarding.mockData';

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
      startDate: { month: '', year: '' },
      endDate: undefined,
      isCurrentlyWorking: false,
      workMode: 'Remote',
      city: '',
      responsibilities: '',
      technologiesUsed: [],
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialExperience) {
      setFormData(initialExperience);
    }
  }, [initialExperience]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.role.trim()) newErrors.role = 'Role/Title is required';
    if (!formData.startDate.month || !formData.startDate.year) newErrors.startDate = 'Start date is required';
    if (!formData.isCurrentlyWorking && (!formData.endDate?.month || !formData.endDate?.year)) {
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
      onSave(formData);
      onOpenChange(false);
      setFormData({
        id: Date.now().toString(),
        companyName: '',
        role: '',
        startDate: { month: '', year: '' },
        endDate: undefined,
        isCurrentlyWorking: false,
        workMode: 'Remote',
        city: '',
        responsibilities: '',
        technologiesUsed: [],
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{initialExperience ? 'Edit Work Experience' : 'Add Work Experience'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 px-6">
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
                  id="startDate"
                  type="month"
                  value={formData.startDate.year && formData.startDate.month ? `${formData.startDate.year}-${formData.startDate.month.padStart(2, '0')}` : ''}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    setFormData((prev) => ({ ...prev, startDate: { year, month: parseInt(month).toString() } }));
                  }}
                  className={`pl-10 [&::-webkit-calendar-picker-indicator]:hidden ${errors.startDate ? 'border-destructive' : ''}`}
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
                  id="endDate"
                  type="month"
                  disabled={formData.isCurrentlyWorking}
                  value={formData.endDate?.year && formData.endDate?.month ? `${formData.endDate.year}-${formData.endDate.month.padStart(2, '0')}` : ''}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    setFormData((prev) => ({ ...prev, endDate: { year, month: parseInt(month).toString() } }));
                  }}
                  className={`pl-10 [&::-webkit-calendar-picker-indicator]:hidden ${errors.endDate ? 'border-destructive' : ''}`}
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
                setFormData((prev) => ({
                  ...prev,
                  isCurrentlyWorking: checked as boolean,
                  endDate: checked ? undefined : prev.endDate,
                }));
              }}
            />
            <Label htmlFor="currentlyWorking" className="font-medium cursor-pointer">
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
                <Label htmlFor="remote" className="font-normal cursor-pointer">Remote</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="On-site" id="onsite" />
                <Label htmlFor="onsite" className="font-normal cursor-pointer">On-site</Label>
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
                <SelectValue placeholder="Select technologies..." />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 space-y-1">
                  {TECH_STACK.map((tech) => (
                    <div
                      key={tech}
                      className="flex items-center space-x-2 hover:bg-accent p-2 rounded cursor-pointer"
                      onClick={() => handleTechSelect(tech)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.technologiesUsed?.includes(tech)}
                        onChange={() => handleTechSelect(tech)}
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
  <div className="py-4">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        {/* Company and Role */}
        <div className="flex items-center gap-3">
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

        {/* Role and Duration */}
        <p className="text-sm font-medium text-foreground">{experience.role}</p>
        <p className="text-sm text-muted-foreground">
          {MONTHS[parseInt(experience.startDate.month) - 1]} {experience.startDate.year} -{' '}
          {experience.isCurrentlyWorking
            ? 'Present'
            : `${MONTHS[parseInt(experience.endDate!.month) - 1]} ${experience.endDate!.year}`}
          {experience.workMode === 'On-site' && experience.city && ` • ${experience.city}`}
        </p>

        {/* Technologies */}
        {experience.technologiesUsed && experience.technologiesUsed.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {experience.technologiesUsed.map((tech) => (
              <Badge key={tech} variant="default" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        {/* Responsibilities */}
        {experience.responsibilities && (
          <p className="text-sm text-muted-foreground whitespace-pre-line">{experience.responsibilities}</p>
        )}
      </div>

      {/* Edit and Delete Icons */}
      <div className="flex items-center gap-2">
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
