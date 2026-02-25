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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, Check, Plus, Trash2, Loader2, Code, Briefcase, GraduationCap, Calendar, X } from 'lucide-react';
import type { OnboardingStep3 as Step3Type, AcademicPerformance, WorkExperience, CompetitiveProfile } from '@/lib/onboarding.types';
import { MONTHS, getYearsArray, CLASS_12_BOARDS, COMPETITIVE_PLATFORMS, TECH_STACK } from '@/lib/onboarding.mockData';
import { WorkExperienceModal, WorkExperienceCard } from './WorkExperienceComponents';

interface OnboardingStep3Props {
  initialData?: Partial<Step3Type>;
  onNext: (data: Step3Type) => void;
  onSkip: () => void;
  onBack?: () => void;
  onFieldChange?: (data: Step3Type) => void;
}

const CGPAPercentageConverter: React.FC<{
  format: 'CGPA' | 'Percentage';
  cgpa?: number;
  percentage?: number;
  onCGPAChange: (cgpa: number) => void;
  onPercentageChange: (percentage: number) => void;
}> = ({ format, cgpa, percentage, onCGPAChange, onPercentageChange }) => {
  const convertCGPAToPercentage = (cgpa: number) => Math.round(cgpa * 9.5);
  const convertPercentageToGPA = (percentage: number) => (percentage / 9.5).toFixed(2);

  return (
    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg space-y-2">
      <div className="font-medium text-foreground">Quick Converter:</div>
      {format === 'CGPA' && cgpa ? (
        <div>
          CGPA {cgpa} ≈ {convertCGPAToPercentage(cgpa)}%
          <button
            type="button"
            onClick={() => onPercentageChange(convertCGPAToPercentage(cgpa))}
            className="ml-2 text-primary hover:underline text-xs"
          >
            Use this percentage
          </button>
        </div>
      ) : format === 'Percentage' && percentage ? (
        <div>
          {percentage}% ≈ {convertPercentageToGPA(percentage)} CGPA
          <button
            type="button"
            onClick={() => onCGPAChange(parseFloat(convertPercentageToGPA(percentage)))}
            className="ml-2 text-primary hover:underline text-xs"
          >
            Use this CGPA
          </button>
        </div>
      ) : null}
    </div>
  );
};

export const OnboardingStep3Component: React.FC<OnboardingStep3Props> = ({
  initialData,
  onNext,
  onSkip,
  onBack,
  onFieldChange,
}) => {
  const [hasInternship, setHasInternship] = useState(initialData?.hasInternshipExperience ?? false);
  const [academicData, setAcademicData] = useState<AcademicPerformance>(
    initialData?.academicPerformance || { marksFormat: 'CGPA' }
  );
  const [showClass1012Marks, setShowClass1012Marks] = useState<boolean>(
    !!(initialData?.academicPerformance?.class12Percentage || initialData?.academicPerformance?.class12Board || initialData?.academicPerformance?.class10Marks)
  );
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>(initialData?.workExperiences || []);
  const [competitiveProfiles, setCompetitiveProfiles] = useState<CompetitiveProfile[]>(
    initialData?.competitiveProfiles || COMPETITIVE_PLATFORMS.slice(0, 3).map((p) => ({ platform: p.name as any, isVerified: false }))
  );
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | undefined>();
  const [verifyingPlatform, setVerifyingPlatform] = useState<string | null>(null);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const years = getYearsArray(1990);
  
  // Auto-save form data on change
  useEffect(() => {
    if (onFieldChange) {
      onFieldChange({
        academicPerformance: academicData,
        workExperiences,
        competitiveProfiles,
        hasInternshipExperience: hasInternship,
      });
    }
  }, [academicData, workExperiences, competitiveProfiles, hasInternship]);

  const validateAcademic = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (academicData.marksFormat === 'CGPA' && (!academicData.cgpa || academicData.cgpa < 0 || academicData.cgpa > 10)) {
      newErrors.cgpa = 'Enter a valid CGPA between 0.0 and 10.0';
    }
    if (academicData.marksFormat === 'Percentage' && (!academicData.percentage || academicData.percentage < 0 || academicData.percentage > 100)) {
      newErrors.percentage = 'Enter a valid percentage between 0 and 100';
    }
    if (academicData.class12Percentage !== undefined && (academicData.class12Percentage < 0 || academicData.class12Percentage > 100)) {
      newErrors.class12Percentage = 'Enter a valid percentage between 0 and 100';
    }
    if (academicData.class10Marks !== undefined && (academicData.class10Marks < 0 || academicData.class10Marks > 100)) {
      newErrors.class10Marks = 'Enter valid marks';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddExperience = (experience: WorkExperience) => {
    if (editingExperience) {
      setWorkExperiences((prev) => prev.map((exp) => (exp.id === experience.id ? experience : exp)));
      setEditingExperience(undefined);
    } else {
      setWorkExperiences((prev) => [...prev, experience]);
    }
  };

  const handleDeleteExperience = (experienceId: string) => {
    setWorkExperiences((prev) => prev.filter((exp) => exp.id !== experienceId));
  };

  const handleVerifyProfile = async (platform: string) => {
    setVerifyingPlatform(platform);
    const profile = competitiveProfiles.find((p) => p.platform === platform);
    if (profile?.username) {
      // Simulate API call
      setTimeout(() => {
        setCompetitiveProfiles((prev) =>
          prev.map((p) =>
            p.platform === platform
              ? {
                  ...p,
                  isVerified: true,
                  verifiedUsername: p.username,
                  problemsSolved: Math.floor(Math.random() * 500) + 50,
                  rating: Math.floor(Math.random() * 2200) + 800,
                  lastVerifiedAt: new Date().toISOString(),
                }
              : p
          )
        );
        setVerifyingPlatform(null);
      }, 1500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAcademic()) {
      onNext({
        academicPerformance: academicData,
        workExperiences,
        competitiveProfiles,
        hasInternshipExperience: hasInternship,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Academic Performance Card */}
      <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
        <CardContent className="pb-6">
          <div className="flex items-center gap-2 mb-6 bg-muted -mx-6 px-6 py-3 rounded-t-md">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold uppercase tracking-wide">ACADEMIC PERFORMANCE</h3>
          </div>
          <div className="space-y-6">
              {/* College Marks Section */}
              <div className="space-y-4">
                <Label className="font-medium">College Marks</Label>
                
                {/* Stream and Score in same row */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stream" className="font-medium">Stream</Label>
                    <Input
                      id="stream"
                      value={initialData?.stream || ''}
                      disabled
                      className="bg-muted"
                      placeholder="Auto-filled from Step 1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collegeScore" className="font-medium">Score</Label>
                    <div className="flex gap-2">
                      <Input
                        id="collegeScore"
                        type="number"
                        step={academicData.marksFormat === 'CGPA' ? '0.01' : '1'}
                        min="0"
                        max={academicData.marksFormat === 'CGPA' ? '10' : '100'}
                        placeholder={academicData.marksFormat === 'CGPA' ? 'e.g. 8.5' : 'e.g. 85'}
                        value={academicData.marksFormat === 'CGPA' ? (academicData.cgpa || '') : (academicData.percentage || '')}
                        onChange={(e) => {
                          const value = academicData.marksFormat === 'CGPA' 
                            ? parseFloat(e.target.value) || undefined 
                            : parseInt(e.target.value) || undefined;
                          
                          setAcademicData((prev) => ({
                            ...prev,
                            ...(academicData.marksFormat === 'CGPA' 
                              ? { cgpa: value as number | undefined }
                              : { percentage: value as number | undefined })
                          }));
                        }}
                        className={`flex-1 ${errors.cgpa || errors.percentage ? 'border-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAcademicData((prev) => ({
                            ...prev,
                            marksFormat: 'CGPA',
                          }));
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          academicData.marksFormat === 'CGPA'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        CGPA
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAcademicData((prev) => ({
                            ...prev,
                            marksFormat: 'Percentage',
                          }));
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          academicData.marksFormat === 'Percentage'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        %
                      </button>
                    </div>
                    {(errors.cgpa || errors.percentage) && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.cgpa || errors.percentage}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Class 12 Section */}
              <div className="space-y-4">
                <Label className="font-medium">Class 12</Label>
                
                {/* Board and Score in same row */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="class12Board" className="font-medium">Board</Label>
                    <Select
                      value={academicData.class12Board || ''}
                      onValueChange={(value) =>
                        setAcademicData((prev) => ({ ...prev, class12Board: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Board" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_12_BOARDS.map((board) => (
                          <SelectItem key={board} value={board}>
                            {board}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class12Score" className="font-medium">Score</Label>
                    <div className="flex gap-2">
                      <Input
                        id="class12Score"
                        type="number"
                        step={(academicData.class12Format || 'Percentage') === 'CGPA' ? '0.01' : '1'}
                        min="0"
                        max={(academicData.class12Format || 'Percentage') === 'CGPA' ? '10' : '100'}
                        placeholder={(academicData.class12Format || 'Percentage') === 'CGPA' ? 'e.g. 9.0' : 'Score'}
                        value={academicData.class12Percentage || ''}
                        onChange={(e) => {
                          setAcademicData((prev) => ({
                            ...prev,
                            class12Percentage: parseFloat(e.target.value) || undefined,
                          }));
                        }}
                        className={`flex-1 ${errors.class12Percentage ? 'border-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAcademicData((prev) => ({
                            ...prev,
                            class12Format: 'CGPA',
                          }));
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          (academicData.class12Format || 'Percentage') === 'CGPA'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        CGPA
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAcademicData((prev) => ({
                            ...prev,
                            class12Format: 'Percentage',
                          }));
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          (academicData.class12Format || 'Percentage') === 'Percentage'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        %
                      </button>
                    </div>
                    {errors.class12Percentage && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.class12Percentage}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Class 10 Section */}
              <div className="space-y-4">
                <Label className="font-medium">Class 10</Label>
                
                {/* Board and Score in same row */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="class10Board" className="font-medium">Board</Label>
                    <Select
                      value={academicData.class10Board || ''}
                      onValueChange={(value) =>
                        setAcademicData((prev) => ({ ...prev, class10Board: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Board" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_12_BOARDS.map((board) => (
                          <SelectItem key={board} value={board}>
                            {board}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class10Marks" className="font-medium">Score</Label>
                    <div className="flex gap-2">
                      <Input
                        id="class10Marks"
                        type="number"
                        step={(academicData.class10Format || 'Percentage') === 'CGPA' ? '0.01' : '1'}
                        min="0"
                        max={(academicData.class10Format || 'Percentage') === 'CGPA' ? '10' : '100'}
                        placeholder={(academicData.class10Format || 'Percentage') === 'CGPA' ? 'e.g. 9.5' : 'Score'}
                        value={academicData.class10Marks || ''}
                        onChange={(e) => {
                          setAcademicData((prev) => ({
                            ...prev,
                            class10Marks: parseFloat(e.target.value) || undefined,
                          }));
                        }}
                        className={`flex-1 ${errors.class10Marks ? 'border-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAcademicData((prev) => ({
                            ...prev,
                            class10Format: 'CGPA',
                          }));
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          (academicData.class10Format || 'Percentage') === 'CGPA'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        CGPA
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAcademicData((prev) => ({
                            ...prev,
                            class10Format: 'Percentage',
                          }));
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          (academicData.class10Format || 'Percentage') === 'Percentage'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        %
                      </button>
                    </div>
                    {errors.class10Marks && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.class10Marks}
                      </p>
                    )}
                  </div>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Experience Card */}
      <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
        <CardContent className="pb-6">
          <div className="flex items-center gap-2 mb-6 bg-muted -mx-6 px-6 py-3 rounded-t-md">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold uppercase tracking-wide">WORK EXPERIENCE</h3>
          </div>
          <div className="space-y-4">
              {/* Have Internship Toggle */}
              <div className="space-y-4">
                <Label className="font-medium">Have you done any internships or jobs?</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={!hasInternship ? 'default' : 'outline'}
                    onClick={() => setHasInternship(false)}
                    className="h-10"
                  >
                    No, I'm a Fresher
                  </Button>
                  <Button
                    type="button"
                    variant={hasInternship ? 'default' : 'outline'}
                    onClick={() => setHasInternship(true)}
                    className="h-10"
                  >
                    Yes, I have experience
                  </Button>
                </div>
              </div>

              {/* Experience Modal and List */}
              {hasInternship && (
                <>
                  <WorkExperienceModal
                    isOpen={isExperienceModalOpen}
                    onOpenChange={setIsExperienceModalOpen}
                    onSave={handleAddExperience}
                    initialExperience={editingExperience}
                  />

                  {/* Added Experiences */}
                  {workExperiences.length > 0 && (
                    <div className="divide-y divide-border">
                      {workExperiences.map((experience) => (
                        <WorkExperienceCard
                          key={experience.id}
                          experience={experience}
                          onEdit={(exp) => {
                            setEditingExperience(exp);
                            setIsExperienceModalOpen(true);
                          }}
                          onDelete={handleDeleteExperience}
                        />
                      ))}
                    </div>
                  )}

                  {/* Add Experience CTA */}
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      {workExperiences.length === 0
                        ? 'Build your professional profile'
                        : 'Showcase more of your professional journey'}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => {
                        setEditingExperience(undefined);
                        setIsExperienceModalOpen(true);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Work Experience
                    </Button>
                  </div>
                </>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Profiles Card */}
      <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
        <CardContent className="pb-6">
          <div className="flex items-center gap-2 mb-6 bg-muted -mx-6 px-6 py-3 rounded-t-md">
            <Code className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold uppercase tracking-wide">COMPETITIVE PROFILES</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
              {competitiveProfiles.map((profile, index) => {
                const hasModified = profile.isVerified && profile.username !== profile.verifiedUsername;
                
                return (
                  <div key={profile.platform} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setCurrentProfileIndex(Math.max(0, index - 1))}
                          disabled={index === 0}
                          className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                        >
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentProfileIndex(Math.min(competitiveProfiles.length - 1, index + 1))}
                          disabled={index === competitiveProfiles.length - 1}
                          className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                        >
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                      <Label className="font-medium">{profile.platform}</Label>
                    </div>
                    
                    <Input
                      placeholder="Username"
                      value={profile.username || ''}
                      onChange={(e) =>
                        setCompetitiveProfiles((prev) =>
                          prev.map((p) =>
                            p.platform === profile.platform
                              ? { ...p, username: e.target.value }
                              : p
                          )
                        )
                      }
                      className="w-full"
                    />
                    
                    {!profile.isVerified && (
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => handleVerifyProfile(profile.platform)}
                        disabled={!profile.username || verifyingPlatform === profile.platform}
                      >
                        {verifyingPlatform === profile.platform && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Verify
                      </Button>
                    )}
                    
                    {profile.isVerified && hasModified && profile.problemsSolved && (
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <Button
                          type="button"
                          variant="default"
                          onClick={() => handleVerifyProfile(profile.platform)}
                          disabled={verifyingPlatform === profile.platform}
                          size="sm"
                        >
                          {verifyingPlatform === profile.platform && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          Re-Verify
                        </Button>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{profile.problemsSolved} problems solved</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">Rating: {profile.rating}</span>
                      </div>
                    )}
                    
                    {profile.isVerified && !hasModified && profile.problemsSolved && (
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-600">Verified</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{profile.problemsSolved} problems solved</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">Rating: {profile.rating}</span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </form>
    );
  };

export default OnboardingStep3Component;
