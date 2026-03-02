import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, X } from 'lucide-react';
import { ExternalProject } from '@/lib/onboarding.types';
import { TECH_STACK } from '@/lib/profile.mockData';

interface ProjectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (project: ExternalProject) => void;
  initialProject?: ExternalProject;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ 
  isOpen, 
  onOpenChange, 
  onSave, 
  initialProject 
}) => {
  const [formData, setFormData] = useState<ExternalProject>(
    initialProject || {
      id: Date.now().toString(),
      title: '',
      oneLineDescription: '',
      detailedDescription: '',
      techStack: [],
      projectType: 'Solo',
      teamSize: 2,
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.oneLineDescription.trim()) newErrors.oneLineDescription = 'One-line description is required';
    if (formData.detailedDescription && formData.detailedDescription.length > 500) {
      newErrors.detailedDescription = 'Description cannot exceed 500 characters';
    }
    if (formData.githubUrl && !isValidUrl(formData.githubUrl)) {
      newErrors.githubUrl = 'GitHub URL must be valid';
    }
    if (formData.demoUrl && !isValidUrl(formData.demoUrl)) {
      newErrors.demoUrl = 'Demo URL must be valid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleTechStackSelect = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...prev.techStack, tech],
    }));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      onOpenChange(false);
      setFormData({
        id: Date.now().toString(),
        title: '',
        oneLineDescription: '',
        detailedDescription: '',
        techStack: [],
        projectType: 'Solo',
        teamSize: 2,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{initialProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 px-6">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium">
              Project Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., E-commerce Platform"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* One-line Description */}
          <div className="space-y-2">
            <Label htmlFor="oneLineDescription" className="font-medium">
              One-line Description <span className="text-destructive">*</span>
            </Label>
            <Input
              id="oneLineDescription"
              placeholder="A short summary of what it does..."
              value={formData.oneLineDescription}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, oneLineDescription: e.target.value }))
              }
              maxLength={100}
              className={errors.oneLineDescription ? 'border-destructive' : ''}
            />
            {errors.oneLineDescription && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.oneLineDescription}
              </p>
            )}
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <Label className="font-medium">
              Tech Stack (Multi-select)
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
                      onClick={() => handleTechStackSelect(tech)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.techStack.includes(tech)}
                        onChange={() => handleTechStackSelect(tech)}
                        className="rounded"
                      />
                      <span className="text-sm">{tech}</span>
                    </div>
                  ))}
                </div>
              </SelectContent>
            </Select>
            {formData.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleTechStackSelect(tech)}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Project Type */}
          <div className="space-y-2">
            <Label className="font-medium">Project Type</Label>
            <RadioGroup
              value={formData.projectType}
              onValueChange={(value: 'Solo' | 'Team') =>
                setFormData((prev) => ({ ...prev, projectType: value }))
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Solo" id="solo" />
                <Label htmlFor="solo" className="cursor-pointer">Solo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Team" id="team" />
                <Label htmlFor="team" className="cursor-pointer">Team</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Team Size (if Team project) */}
          {formData.projectType === 'Team' && (
            <div className="space-y-2">
              <Label htmlFor="teamSize" className="font-medium">
                Team Size
              </Label>
              <Input
                id="teamSize"
                type="number"
                min="2"
                value={formData.teamSize || 2}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamSize: parseInt(e.target.value) || 2,
                  }))
                }
              />
            </div>
          )}

          {/* Detailed Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="detailedDescription" className="font-medium">
              Detailed Description (Optional)
            </Label>
            <Textarea
              id="detailedDescription"
              placeholder="Provide more details about the project..."
              value={formData.detailedDescription || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  detailedDescription: e.target.value,
                }))
              }
              maxLength={500}
              rows={4}
              className={errors.detailedDescription ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              {formData.detailedDescription?.length || 0}/500 characters
            </p>
            {errors.detailedDescription && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.detailedDescription}
              </p>
            )}
          </div>

          {/* GitHub URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="githubUrl" className="font-medium">
              GitHub URL (Optional)
            </Label>
            <Input
              id="githubUrl"
              type="url"
              placeholder="https://github.com/username/repo"
              value={formData.githubUrl || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, githubUrl: e.target.value }))
              }
              className={errors.githubUrl ? 'border-destructive' : ''}
            />
            {errors.githubUrl && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.githubUrl}
              </p>
            )}
          </div>

          {/* Demo URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="demoUrl" className="font-medium">
              Demo URL (Optional)
            </Label>
            <Input
              id="demoUrl"
              type="url"
              placeholder="https://your-project-demo.com"
              value={formData.demoUrl || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, demoUrl: e.target.value }))
              }
              className={errors.demoUrl ? 'border-destructive' : ''}
            />
            {errors.demoUrl && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.demoUrl}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {initialProject ? 'Save Changes' : 'Add Project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
