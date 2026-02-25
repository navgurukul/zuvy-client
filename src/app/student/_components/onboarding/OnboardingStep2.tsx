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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, X, AlertCircle, Check, Github, Globe, Trash2, Briefcase, Lock, Code, Calendar } from 'lucide-react';
import type { OnboardingStep2 as Step2Type, ExternalProject } from '@/lib/onboarding.types';
import { TECH_STACK, SKILLS_BY_CATEGORY, MONTHS, getYearsArray } from '@/lib/onboarding.mockData';

interface OnboardingStep2Props {
  initialData?: Partial<Step2Type>;
  onNext: (data: Step2Type) => void;
  onSkip: () => void;
  onBack?: () => void;
  onFieldChange?: (data: Step2Type) => void;
}

const ProjectModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (project: ExternalProject) => void;
  initialProject?: ExternalProject;
}> = ({ isOpen, onOpenChange, onSave, initialProject }) => {
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
            <Label className="font-medium">
              Project Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {['Solo', 'Team'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, projectType: type as any }))}
                  className={`py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                    formData.projectType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Team Size */}
          {formData.projectType === 'Team' && (
            <div className="space-y-2">
              <Label htmlFor="teamSize" className="font-medium">
                Team Size
              </Label>
              <Select
                value={formData.teamSize?.toString() || '2'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, teamSize: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} Members
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="font-medium">
                Start Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="startDate"
                  type="date"
                  value={
                    formData.startDate
                      ? typeof formData.startDate === 'string'
                        ? formData.startDate
                        : `${formData.startDate.year}-${formData.startDate.month.padStart(2, '0')}-01`
                      : ''
                  }
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    if (dateValue) {
                      const [year, month] = dateValue.split('-');
                      setFormData((prev) => ({ ...prev, startDate: { year, month: parseInt(month).toString() } }));
                    } else {
                      setFormData((prev) => ({ ...prev, startDate: undefined }));
                    }
                  }}
                  className="pl-10 [&::-webkit-calendar-picker-indicator]:hidden"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="font-medium">
                End Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="endDate"
                  type="date"
                  value={
                    formData.endDate
                      ? typeof formData.endDate === 'string'
                        ? formData.endDate
                        : `${formData.endDate.year}-${formData.endDate.month.padStart(2, '0')}-01`
                      : ''
                  }
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    if (dateValue) {
                      const [year, month] = dateValue.split('-');
                      setFormData((prev) => ({ ...prev, endDate: { year, month: parseInt(month).toString() } }));
                    } else {
                      setFormData((prev) => ({ ...prev, endDate: undefined }));
                    }
                  }}
                  className="pl-10 [&::-webkit-calendar-picker-indicator]:hidden"
                />
              </div>
            </div>
          </div>

          {/* GitHub URL and Demo URL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="githubUrl" className="font-medium">
                GitHub URL
              </Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="githubUrl"
                  placeholder="github.com/username/repo"
                  value={formData.githubUrl || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, githubUrl: e.target.value }))
                  }
                  className={`pl-10 ${errors.githubUrl ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.githubUrl && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.githubUrl}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="demoUrl" className="font-medium">
                Demo URL
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="demoUrl"
                  placeholder="project-demo.com"
                  value={formData.demoUrl || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, demoUrl: e.target.value }))
                  }
                  className={`pl-10 ${errors.demoUrl ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.demoUrl && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.demoUrl}
                </p>
              )}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <Label htmlFor="detailedDescription" className="font-medium">
              Detailed Description (Optional)
            </Label>
            <Textarea
              id="detailedDescription"
              placeholder="Explain key features, challenges faced, and architecture..."
              value={formData.detailedDescription}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, detailedDescription: e.target.value }))
              }
              maxLength={500}
              rows={4}
              className={errors.detailedDescription ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.detailedDescription?.length || 0}/500
            </p>
            {errors.detailedDescription && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.detailedDescription}
              </p>
            )}
          </div>
        </div>

        <div className="border-t p-4 flex gap-3 bg-background">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Save Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProjectCard: React.FC<{
  project: ExternalProject;
  onEdit: (project: ExternalProject) => void;
  onDelete: (projectId: string) => void;
}> = ({ project, onEdit, onDelete }) => (
  <div className="py-4">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        {/* Title and Project Type Badge */}
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-base text-foreground">{project.title}</h3>
          <Badge variant="secondary" className="text-xs uppercase">
            {project.projectType}
          </Badge>
        </div>

        {/* One-line Description */}
        <p className="text-sm text-muted-foreground">{project.oneLineDescription}</p>

        {/* Tech Stack */}
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="default" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Edit and Delete Icons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(project)}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <svg className="w-4 h-4 text-muted-foreground hover:text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(project.id)}
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

export const OnboardingStep2Component: React.FC<OnboardingStep2Props> = ({
  initialData,
  onNext,
  onSkip,
  onBack,
  onFieldChange,
}) => {
  const [projects, setProjects] = useState<ExternalProject[]>(initialData?.externalProjects || []);
  const [skills, setSkills] = useState<string[]>(initialData?.additionalSkills || []);
  const [autoDetectedSkills] = useState<string[]>(initialData?.autoDetectedSkills || ['React', 'JavaScript', 'TypeScript']);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ExternalProject | undefined>();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [skillSearch, setSkillSearch] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const skillDropdownRef = useRef<HTMLDivElement>(null);

  const allAvailableSkills = Object.values(SKILLS_BY_CATEGORY).flat();

  // Close skill dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target as Node)) {
        setShowSkillDropdown(false);
      }
    };

    if (showSkillDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSkillDropdown]);

  const filteredSkills = customSkill
    ? allAvailableSkills.filter(
        (skill) =>
          skill.toLowerCase().includes(customSkill.toLowerCase()) &&
          !skills.includes(skill) &&
          !autoDetectedSkills.includes(skill)
      )
    : allAvailableSkills.filter(
        (skill) => !skills.includes(skill) && !autoDetectedSkills.includes(skill)
      ).slice(0, 20); // Show top 20 suggestions when no search

  const totalSkills = autoDetectedSkills.length + skills.length;
  
  // Auto-save form data on change
  useEffect(() => {
    if (onFieldChange) {
      onFieldChange({
        externalProjects: projects,
        autoDetectedSkills,
        additionalSkills: skills,
      });
    }
  }, [projects, skills]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (totalSkills < 3) {
      newErrors.skills = 'Please select at least 3 skills total (including auto-detected)';
    }
    if (totalSkills > 20) {
      newErrors.skills = 'Maximum 20 skills allowed';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProject = (project: ExternalProject) => {
    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? project : p))
      );
      setEditingProject(undefined);
    } else {
      if (projects.length < 10) {
        setProjects((prev) => [...prev, project]);
      }
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete));
      setProjectToDelete(null);
    }
  };

  const handleAddSkill = (skill: string) => {
    if (!skills.includes(skill) && totalSkills < 20) {
      setSkills((prev) => [...prev, skill].sort());
    }
    setCustomSkill('');
    setShowSkillDropdown(false);
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill) && totalSkills < 20) {
      setSkills((prev) => [...prev, customSkill].sort());
      setCustomSkill('');
      setShowSkillDropdown(false);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext({
        externalProjects: projects,
        autoDetectedSkills,
        additionalSkills: skills,
      });
    }
  };

  const isMandatoryFieldsFilled = totalSkills >= 3 && totalSkills <= 20;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Technical Skills Card */}
      <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
        <CardContent className="pb-6">
          <div className="flex items-center justify-between mb-6 bg-muted -mx-6 px-6 py-3 rounded-t-md">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold uppercase tracking-wide">TECHNICAL SKILLS</h3>
            </div>
            <p className="text-xs text-muted-foreground">Min 3 · Max 20</p>
          </div>
          <div className="space-y-4">
          
          {/* Display tags outside input field */}
          {(autoDetectedSkills.length > 0 || skills.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {/* Display auto-detected skills as locked tags */}
              {autoDetectedSkills.map((skill) => (
                <Badge key={skill} variant="default" className="bg-primary/10 text-primary cursor-default">
                  {skill}
                  <Lock className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              {/* Display selected skills as tags */}
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {/* Separate input field */}
          <div className="relative" ref={skillDropdownRef}>
            <Input
              placeholder="Type a skill and press Enter (e.g. React)..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onFocus={() => setShowSkillDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomSkill();
                }
              }}
              disabled={totalSkills >= 20}
            />
            
            {/* Dropdown with skill suggestions */}
            {showSkillDropdown && filteredSkills.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                <div className="flex flex-wrap gap-2 p-3">
                  {filteredSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleAddSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
            
          {/* Skills counter positioned below on the right */}
          <div className="flex justify-end mt-2">
            <p className="text-xs text-muted-foreground">
              {totalSkills}/20 added
            </p>
          </div>

          {errors.skills && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.skills}
            </p>
          )}
          </div>
        </CardContent>
      </Card>

      {/* Projects Card */}
      <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
        <CardContent className="pb-6">
          <div className="flex items-center gap-2 mb-6 bg-muted -mx-6 px-6 py-3 rounded-t-md">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold uppercase tracking-wide">PROJECTS</h3>
          </div>
          <div className="space-y-4">
        <ProjectModal
          isOpen={isProjectModalOpen}
          onOpenChange={setIsProjectModalOpen}
          onSave={handleAddProject}
          initialProject={editingProject}
        />

        {projects.length > 0 && (
          <div className="divide-y divide-border">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => {
                  setEditingProject(p);
                  setIsProjectModalOpen(true);
                }}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}

        <div className="border-2 border-dashed border-border rounded-lg p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground">
                {projects.length === 0 
                  ? "Showcase your work and stand out!" 
                  : "Keep building your portfolio!"}
              </p>
              <p className="text-sm text-muted-foreground">
                {projects.length === 0
                  ? "Adding projects can boost your profile visibility by 60%"
                  : "Add more projects to strengthen your profile"}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => {
                setEditingProject(undefined);
                setIsProjectModalOpen(true);
              }}
              disabled={projects.length >= 10}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project from your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};

export default OnboardingStep2Component;
