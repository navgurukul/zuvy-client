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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Plus, Code, Briefcase, GraduationCap } from 'lucide-react';
import type { OnboardingStep3 as Step3Type, AcademicPerformance, WorkExperience, CompetitiveProfile } from '@/lib/profile.types';
import { MONTHS, getYearsArray, CLASS_12_BOARDS, COMPETITIVE_PLATFORMS, TECH_STACK } from '@/lib/profile.mockData';
import { WorkExperienceModal, WorkExperienceCard } from './WorkExperienceComponents';
import { useLearnerBoards } from '@/hooks/useLearnerBoards';
import { toast } from '@/components/ui/use-toast';

const DEFAULT_COMPETITIVE_PROFILES: CompetitiveProfile[] = COMPETITIVE_PLATFORMS.slice(0, 3).map((platform) => ({
  platform: platform.name as CompetitiveProfile['platform'],
  isVerified: false,
}));

const normalizeCompetitiveProfiles = (profiles?: CompetitiveProfile[]): CompetitiveProfile[] => {
  if (!profiles?.length) {
    return DEFAULT_COMPETITIVE_PROFILES.map((profile) => ({ ...profile }));
  }

  return DEFAULT_COMPETITIVE_PROFILES.map((defaultProfile) => {
    const existingProfile = profiles.find((profile) => profile.platform === defaultProfile.platform);
    return existingProfile ? { ...defaultProfile, ...existingProfile } : { ...defaultProfile };
  });
};

const hasAtMostTwoDecimalPlaces = (value: number) => {
  const decimalPart = value.toString().split('.')[1];
  return !decimalPart || decimalPart.length <= 2;
};

const getScoreError = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '';
  }

  if (value < 0 || value > 100 || !hasAtMostTwoDecimalPlaces(value)) {
    return 'Enter a valid percentage between 0 and 100 with up to 2 decimal places';
  }

  return '';
};

interface ProfileStep3Props {
  initialData?: Partial<Step3Type>;
  step1Data?: any;
  onNext: (data: Step3Type) => void;
  onSkip: () => void;
  onBack?: () => void;
  onFieldChange?: (data: Step3Type) => void;
}


export const ProfileStep3Component: React.FC<ProfileStep3Props> = ({
  initialData,
  step1Data,
  onNext,
  onSkip,
  onBack,
  onFieldChange,
}) => {
  const hasInitialWorkExperience = (initialData?.workExperiences?.length ?? 0) > 0 || initialData?.hasInternshipExperience || false;
  const [hasInternship, setHasInternship] = useState(hasInitialWorkExperience);
  const hasInternshipEditedRef = useRef<boolean>(false);
  const [academicData, setAcademicData] = useState<AcademicPerformance>(
    initialData?.academicPerformance || { marksFormat: 'Percentage' }
  );
  const [showClass1012Marks, setShowClass1012Marks] = useState<boolean>(
    !!(initialData?.academicPerformance?.class12Percentage || initialData?.academicPerformance?.class12Board || initialData?.academicPerformance?.class10Marks)
  );
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>(initialData?.workExperiences || []);
  const [competitiveProfiles, setCompetitiveProfiles] = useState<CompetitiveProfile[]>(
    normalizeCompetitiveProfiles(initialData?.competitiveProfiles)
  );
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customClass12Board, setCustomClass12Board] = useState<string>('');
  const [customClass10Board, setCustomClass10Board] = useState<string>('');
  const { boards, loading: isBoardsLoading } = useLearnerBoards();
  const isWorkingStatus = step1Data?.currentStatus === 'Working';

  const updateScoreError = (key: 'percentage' | 'class12Percentage' | 'class10Marks', errorMessage?: string) => {
    setErrors((prev) => {
      const nextErrors = { ...prev };

      if (errorMessage) {
        nextErrors[key] = errorMessage;
      } else {
        delete nextErrors[key];
      }

      return nextErrors;
    });
  };

  const years = getYearsArray(1990);
  const boardOptions = (() => {
    if (boards.length > 0) {
      return boards.map(board => board.name);
    }
    return CLASS_12_BOARDS;
  })();

  // Sync work-experience toggle with Step 1 status unless user edited manually
  useEffect(() => {
    if (!step1Data || typeof step1Data.currentStatus === 'undefined') return;
    if (hasInternshipEditedRef.current) return;

    const status = step1Data.currentStatus;
    const hasExistingWorkExperience = hasInitialWorkExperience || workExperiences.length > 0;

    if (hasExistingWorkExperience || status === 'Working') {
      setHasInternship(true);
    } else {
      setHasInternship(false);
    }
  }, [step1Data?.currentStatus, workExperiences.length, hasInitialWorkExperience]);
  
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

  // Handle custom board initialization
  useEffect(() => {
    // Initialize custom Class 12 board if needed
    if (academicData.class12Board && !boardOptions.includes(academicData.class12Board) && academicData.class12Board !== 'Other') {
      setCustomClass12Board(academicData.class12Board);
    }
    // Initialize custom Class 10 board if needed
    if (academicData.class10Board && !boardOptions.includes(academicData.class10Board) && academicData.class10Board !== 'Other') {
      setCustomClass10Board(academicData.class10Board);
    }
  }, [academicData.class12Board, academicData.class10Board, boardOptions]);

  const handleCustomClass12BoardChange = (value: string) => {
    setCustomClass12Board(value);
    setAcademicData((prev) => ({
      ...prev,
      class12Board: value.trim() || 'Other',
    }));
  };

  const handleCustomClass10BoardChange = (value: string) => {
    setCustomClass10Board(value);
    setAcademicData((prev) => ({
      ...prev,
      class10Board: value.trim() || 'Other',
    }));
  };

  const validateAcademic = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (academicData.percentage === undefined || academicData.percentage === null) {
      newErrors.percentage = 'Enter a valid percentage between 0 and 100 with up to 2 decimal places';
    } else {
      const percentageError = getScoreError(academicData.percentage);
      if (percentageError) {
        newErrors.percentage = percentageError;
      }
    }
    if (academicData.class12Percentage !== undefined) {
      const class12Error = getScoreError(academicData.class12Percentage);
      if (class12Error) {
        newErrors.class12Percentage = class12Error;
      }
    }
    if (academicData.class10Marks !== undefined) {
      const class10Error = getScoreError(academicData.class10Marks);
      if (class10Error) {
        newErrors.class10Marks = class10Error;
      }
    }
    setErrors(newErrors);
    return newErrors;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAcademic();
    if (Object.keys(validationErrors).length === 0) {
      onNext({
        academicPerformance: academicData,
        workExperiences,
        competitiveProfiles,
        hasInternshipExperience: hasInternship,
      });
      return;
    }

    toast.error({
      title: 'Please fill all required details before going to the next page',
      description: ` ${Object.values(validationErrors).join('; ')}`,
    });
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
                <Label className="font-medium text-left block">College Marks</Label>
                
                {/* Stream and Score in same row */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stream" className="font-medium text-left block">Stream</Label>
                    <Input
                      id="stream"
                      value={step1Data?.branch || ''}
                      disabled
                      className="bg-muted"
                      placeholder="Auto-filled from Step 1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collegeScore" className="font-medium text-left block">Score</Label>
                    <div className="flex gap-2">
                      <Input
                        id="collegeScore"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        min="0"
                        max="100"
                        placeholder="e.g. 85.25"
                        value={academicData.percentage ?? ''}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          if (rawValue && !/^\d*(?:\.\d{0,2})?$/.test(rawValue)) {
                            return;
                          }
                          const value = rawValue ? parseFloat(rawValue) : undefined;
                          if (value !== undefined && (value < 0 || value > 100)) return;
                          setAcademicData((prev) => ({ ...prev, percentage: value }));
                          updateScoreError('percentage', getScoreError(value));
                        }}
                        className={`flex-1 mt-0 ${errors.percentage ? 'border-destructive' : ''}`}
                      />
                      <span className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground">
                        %
                      </span>
                    </div>
                    {errors.percentage && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.percentage}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Class 12 Section */}
              <div className="space-y-4">
                <Label className="font-medium text-left block">Class 12</Label>
                
                {/* Board and Score in same row */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="class12Board" className="font-medium text-left block">Board</Label>
                    <Select
                      value={(() => {
                        const board = academicData.class12Board ?? '';
                        // If it's empty, return empty
                        if (!board) return '';
                        // If it's a predefined board, show it
                        if (boardOptions.includes(board)) return board;
                        // If it's a custom board, always show 'Other' in dropdown
                        return 'Other';
                      })()}
                      onValueChange={(value) => {
                        if (value === 'Other') {
                          setAcademicData((prev) => ({ ...prev, class12Board: 'Other' }));
                        } else {
                          setAcademicData((prev) => ({ ...prev, class12Board: value }));
                          setCustomClass12Board('');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isBoardsLoading ? "Loading boards..." : "Select Board"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isBoardsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading boards...
                          </SelectItem>
                        ) : boardOptions.length > 0 ? (
                          <>
                            {boardOptions.map((board) => (
                              <SelectItem key={board} value={board}>
                                {board}
                              </SelectItem>
                            ))}
                            {/* Only show "Other" option if it's not already in the API data */}
                            {!boardOptions.includes('Other') && (
                              <SelectItem value="Other">
                                Other
                              </SelectItem>
                            )}
                          </>
                        ) : (
                          <SelectItem value="no-boards" disabled>
                            No boards available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    
                    {/* Custom Class 12 Board Input */}
                    {(academicData.class12Board === 'Other' || (academicData.class12Board && !boardOptions.includes(academicData.class12Board))) && (
                      <div className="mt-2">
                        <Input
                          placeholder="Enter your board name"
                          value={customClass12Board}
                          onChange={(e) => handleCustomClass12BoardChange(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class12Score" className="font-medium text-left block">Score</Label>
                    <div className="flex gap-2">
                      <Input
                        id="class12Score"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        min="0"
                        max="100"
                        placeholder="e.g. 85.25"
                        value={academicData.class12Percentage ?? ''}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          if (rawValue && !/^\d*(?:\.\d{0,2})?$/.test(rawValue)) {
                            return;
                          }
                          const nextValue = rawValue ? parseFloat(rawValue) : undefined;
                          if (nextValue !== undefined && (nextValue < 0 || nextValue > 100)) return;
                          setAcademicData((prev) => ({ ...prev, class12Percentage: nextValue }));
                          updateScoreError('class12Percentage', getScoreError(nextValue));
                        }}
                        className={`flex-1 mt-0 ${errors.class12Percentage ? 'border-destructive' : ''}`}
                      />
                      <span className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground">
                        %
                      </span>
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
                <Label className="font-medium text-left block">Class 10</Label>
                
                {/* Board and Score in same row */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="class10Board" className="font-medium text-left block">Board</Label>
                    <Select
                      value={(() => {
                        const board = academicData.class10Board ?? '';
                        // If it's empty, return empty
                        if (!board) return '';
                        // If it's a predefined board, show it
                        if (boardOptions.includes(board)) return board;
                        // If it's a custom board, always show 'Other' in dropdown
                        return 'Other';
                      })()}
                      onValueChange={(value) => {
                        if (value === 'Other') {
                          setAcademicData((prev) => ({ ...prev, class10Board: 'Other' }));
                        } else {
                          setAcademicData((prev) => ({ ...prev, class10Board: value }));
                          setCustomClass10Board('');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isBoardsLoading ? "Loading boards..." : "Select Board"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isBoardsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading boards...
                          </SelectItem>
                        ) : boardOptions.length > 0 ? (
                          <>
                            {boardOptions.map((board) => (
                              <SelectItem key={board} value={board}>
                                {board}
                              </SelectItem>
                            ))}
                            {/* Only show "Other" option if it's not already in the API data */}
                            {!boardOptions.includes('Other') && (
                              <SelectItem value="Other">
                                Other
                              </SelectItem>
                            )}
                          </>
                        ) : (
                          <SelectItem value="no-boards" disabled>
                            No boards available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    
                    {/* Custom Class 10 Board Input */}
                    {(academicData.class10Board === 'Other' || (academicData.class10Board && !boardOptions.includes(academicData.class10Board))) && (
                      <div className="mt-2">
                        <Input
                          placeholder="Enter your board name"
                          value={customClass10Board}
                          onChange={(e) => handleCustomClass10BoardChange(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class10Marks" className="font-medium text-left block">Score</Label>
                    <div className="flex gap-2">
                      <Input
                        id="class10Marks"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        min="0"
                        max="100"
                        placeholder="e.g. 85.25"
                        value={academicData.class10Marks ?? ''}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          if (rawValue && !/^\d*(?:\.\d{0,2})?$/.test(rawValue)) {
                            return;
                          }
                          const nextValue = rawValue ? parseFloat(rawValue) : undefined;
                          if (nextValue !== undefined && (nextValue < 0 || nextValue > 100)) return;
                          setAcademicData((prev) => ({ ...prev, class10Marks: nextValue }));
                          updateScoreError('class10Marks', getScoreError(nextValue));
                        }}
                        className={`flex-1 mt-0 ${errors.class10Marks ? 'border-destructive' : ''}`}
                      />
                      <span className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground">
                        %
                      </span>
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
                <Label className="font-medium text-left block">Have you done any internships or jobs?</Label>
                <div className="grid grid-cols-2 gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={isWorkingStatus ? 'cursor-not-allowed' : 'inline-block'}>
                          <Button
                            type="button"
                            variant={!hasInternship ? 'default' : 'outline'}
                            disabled={isWorkingStatus}
                            onClick={() => {
                              if (isWorkingStatus) return;
                              hasInternshipEditedRef.current = true;
                              setHasInternship(false);
                            }}
                            className="h-10 w-full disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            No, I&apos;m a Fresher
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {isWorkingStatus && (
                        <TooltipContent side="top" align="center">
                          Your profile status is set to Working, so the Fresher option is disabled.
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    type="button"
                    variant={hasInternship ? 'default' : 'outline'}
                    onClick={() => {
                      hasInternshipEditedRef.current = true;
                      setHasInternship(true);
                    }}
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
                    <div className="space-y-4">
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
              {competitiveProfiles.map((profile) => (
                <div key={profile.platform} className="space-y-2">
                  <Label className="font-medium">{profile.platform}</Label>
                  <Input
                    placeholder="Username"
                    value={profile.username || ''}
                    onChange={(e) => {
                      const nextUsername = e.target.value;
                      setCompetitiveProfiles((prev) =>
                        prev.map((p) =>
                          p.platform === profile.platform
                            ? { ...p, username: nextUsername }
                            : p
                        )
                      );
                    }}
                    className="w-full"
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </form>
    );
  };

export default ProfileStep3Component;
