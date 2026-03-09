'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  Code, 
  GraduationCap, 
  Target, 
  MapPin, 
  Briefcase, 
  FileText, 
  Lock,
  Plus,
  X,
  ShieldAlert,
  Edit2,
  Save,
  Trophy,
  Trash2,
  Loader2,
  Check,
  ChevronDown,
  ChevronLeft
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOnboardingStorage } from '@/hooks/use-profile';
import { SKILLS_BY_CATEGORY, COLLEGES, CAREER_ROLES, INDIAN_CITIES } from '@/lib/profile.mockData';
import type { CompetitiveProfile } from '@/lib/profile.types';
import { ProjectModal } from '@/app/student/profile/ProfileStep2';

type TabType = 'basic-info' | 'skills-projects' | 'education' | 'career-goals';
type EditingCard = 'personal-info' | 'skills' | 'projects' | 'academic-info' | 'academic-performance' | 'work-experience' | 'competitive-profiles' | 'career-goals' | null;

export const EditProfilePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { onboardingData, updateStepData } = useOnboardingStorage();
  const [activeTab, setActiveTab] = useState<TabType>('basic-info');
  const [editingCard, setEditingCard] = useState<EditingCard>(null);
  
  // Handle tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['basic-info', 'skills-projects', 'education', 'career-goals'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);
  
  // State for managing edits
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  // State for edit forms
  const [editedData, setEditedData] = useState<any>({});
  const [customSkill, setCustomSkill] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [verifyingPlatform, setVerifyingPlatform] = useState<string | null>(null);
  
  // College search state
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [filteredColleges, setFilteredColleges] = useState(COLLEGES);
  
  // Work experience state
  const [hasInternship, setHasInternship] = useState(false);
  
  // Career goals edit state
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [remotePreference, setRemotePreference] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [internshipSalary, setInternshipSalary] = useState('');
  const [fullTimeSalary, setFullTimeSalary] = useState('');
  const [allowCompanies, setAllowCompanies] = useState(false);
  const [emailPref, setEmailPref] = useState(true);
  const [whatsappPref, setWhatsappPref] = useState(false);
  const [phonePref, setPhonePref] = useState(false);
  
  const internshipSalaryRanges = ['₹10–20k', '₹20–30k', '₹30–40k', '₹40k+'];
  const fullTimeSalaryRanges = ['₹3–5 LPA', '₹5–7 LPA', '₹7–10 LPA', '₹10+ LPA'];

  // Skills management state - must be before early return
  const skillDropdownRef = useRef<HTMLDivElement>(null);
  const collegeDropdownRef = useRef<HTMLDivElement>(null);
  const allSkills = Object.values(SKILLS_BY_CATEGORY).flat();
  const [skills, setSkills] = useState<string[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<string[]>(allSkills);

  const step1 = onboardingData?.step1;
  const step2 = onboardingData?.step2;
  const step3 = onboardingData?.step3;
  const step4 = onboardingData?.step4;
  
  // Save handlers
  const handleSavePersonalInfo = () => {
    if (step1) {
      updateStepData(1, {
        ...step1,
        fullName: editedData.fullName || step1.fullName,
        phoneNumber: editedData.phoneNumber || step1.phoneNumber,
        linkedin: editedData.linkedin || step1.linkedin,
      });
      setEditingCard(null);
      setEditedData({});
    }
  };
  
  const handleSaveSkills = () => {
    if (step2) {
      updateStepData(2, {
        ...step2,
        additionalSkills: editedData.skills || step2.additionalSkills,
      });
      setEditingCard(null);
      setEditedData({});
    }
  };
  
  const handleSaveAcademic = () => {
    if (step1 && step3) {
      if (editedData.step1) {
        updateStepData(1, { ...step1, ...editedData.step1 });
      }
      if (editedData.step3) {
        updateStepData(3, { ...step3, ...editedData.step3 });
      }
      setEditingCard(null);
      setEditedData({});
    }
  };
  
  const handleSaveCompetitive = () => {
    if (step3) {
      updateStepData(3, {
        ...step3,
        competitiveProfiles: editedData.competitiveProfiles || step3.competitiveProfiles,
      });
      setEditingCard(null);
      setEditedData({});
    }
  };
  
  const handleSaveCareerGoals = () => {
    if (step4) {
      updateStepData(4, {
        ...step4,
        ...editedData.step4,
      });
      setEditingCard(null);
      setEditedData({});
    }
  };
  
  useEffect(() => {
    if (editingCard === 'skills' && step2) {
      setSkills(step2.additionalSkills || []);
    }
  }, [editingCard, step2]);
  
  useEffect(() => {
    if (customSkill.trim()) {
      const filtered = allSkills.filter((skill) =>
        skill.toLowerCase().includes(customSkill.toLowerCase()) &&
        !skills.includes(skill) &&
        !(step2?.autoDetectedSkills || []).includes(skill)
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills(allSkills.filter(
        (skill) => !skills.includes(skill) && !(step2?.autoDetectedSkills || []).includes(skill)
      ));
    }
  }, [customSkill, skills, step2, allSkills]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target as Node)) {
        setShowSkillDropdown(false);
      }
    };
    if (showSkillDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSkillDropdown]);
  
  // College search filtering
  useEffect(() => {
    if (collegeSearch.trim()) {
      const filtered = COLLEGES.filter(
        (college) =>
          college.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
          college.state.toLowerCase().includes(collegeSearch.toLowerCase())
      );
      setFilteredColleges(filtered);
    } else {
      setFilteredColleges(COLLEGES);
    }
  }, [collegeSearch]);
  
  // College dropdown click-outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target as Node)) {
        setShowCollegeDropdown(false);
      }
    };
    if (showCollegeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCollegeDropdown]);
  
  // Initialize hasInternship when entering work-experience edit mode
  useEffect(() => {
    if (editingCard === 'work-experience') {
      setHasInternship((step3?.workExperiences?.length ?? 0) > 0);
    }
  }, [editingCard, step3?.workExperiences]);
  
  // Initialize career goals edit state
  useEffect(() => {
    if (editingCard === 'career-goals' && step4) {
      setSelectedRoles(step4.targetRoles || []);
      setRemotePreference(step4.locationPreferences?.remote ?? false);
      setSelectedCities(step4.locationPreferences?.cities || []);
      setInternshipSalary(step4.salaryExpectations?.internship || '');
      setFullTimeSalary(step4.salaryExpectations?.fullTime || '');
      setEmailPref(step4.communicationPreferences?.email ?? true);
      setWhatsappPref(step4.communicationPreferences?.whatsapp ?? false);
      setPhonePref(step4.communicationPreferences?.phone ?? false);
      setAllowCompanies(step4.allowCompaniesViewProfile ?? false);
    }
  }, [editingCard, step4]);
  
  const handleCollegeSelect = (collegeName: string) => {
    setEditedData({...editedData, collegeName, customCollege: ''});
    setShowCollegeDropdown(false);
    setCollegeSearch('');
  };
  
  const handleCustomCollege = () => {
    setEditedData({...editedData, collegeName: '', customCollege: collegeSearch});
    setShowCollegeDropdown(false);
  };
  
  const handleAddSkill = (skill: string) => {
    const totalSkills = (step2?.autoDetectedSkills?.length || 0) + skills.length;
    if (totalSkills < 20 && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setCustomSkill('');
    }
  };
  
  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };
  
  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      handleAddSkill(customSkill.trim());
    }
  };
  
  const handleSaveSkillsUpdated = () => {
    if (step2) {
      updateStepData(2, {
        ...step2,
        additionalSkills: skills,
      });
      setEditingCard(null);
      setCustomSkill('');
    }
  };
  
  const handleAddProject = (project: any) => {
    if (step2) {
      const updatedProjects = [...(step2.externalProjects || []), project];
      updateStepData(2, {
        ...step2,
        externalProjects: updatedProjects,
      });
    }
  };
  
  const handleEditProject = (project: any) => {
    if (step2) {
      const updatedProjects = (step2.externalProjects || []).map(p => 
        p.id === project.id ? project : p
      );
      updateStepData(2, {
        ...step2,
        externalProjects: updatedProjects,
      });
    }
  };
  
  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
  };
  
  const confirmDeleteProject = () => {
    if (projectToDelete && step2) {
      const updatedProjects = (step2.externalProjects || []).filter(p => p.id !== projectToDelete);
      updateStepData(2, {
        ...step2,
        externalProjects: updatedProjects,
      });
      setProjectToDelete(null);
    }
  };

  const handleVerifyProfile = async (platform: string) => {
    setVerifyingPlatform(platform);
    if (!step3) return;
    
    const profileIndex = step3.competitiveProfiles.findIndex((p) => p.platform === platform);
    if (profileIndex === -1) return;
    
    const currentUsername = editedData.competitiveProfiles?.[profileIndex]?.username ?? step3.competitiveProfiles[profileIndex].username;
    
    if (currentUsername) {
      // Simulate API call
      setTimeout(() => {
        if (step3) {
          const updatedProfiles = step3.competitiveProfiles.map((p, idx) =>
            idx === profileIndex
              ? {
                  ...p,
                  username: currentUsername,
                  isVerified: true,
                  verifiedUsername: currentUsername,
                  problemsSolved: Math.floor(Math.random() * 500) + 50,
                  rating: Math.floor(Math.random() * 2200) + 800,
                  lastVerifiedAt: new Date().toISOString(),
                }
              : p
          );
          updateStepData(3, {
            ...step3,
            competitiveProfiles: updatedProfiles,
          });
          // Clear edited data for this profile since it's now saved
          setEditedData({...editedData, competitiveProfiles: undefined});
        }
        setVerifyingPlatform(null);
      }, 1500);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get primary location
  const primaryLocation = step4?.locationPreferences?.cities?.[0] || 'Bangalore, India';

  const tabs = [
    { id: 'basic-info' as TabType, label: 'Basic Info', icon: User },
    { id: 'skills-projects' as TabType, label: 'Skills & Projects', icon: Code },
    { id: 'education' as TabType, label: 'Education', icon: GraduationCap },
    { id: 'career-goals' as TabType, label: 'Career Goals', icon: Target },
  ];

  // Early return must come AFTER all hooks and helper functions
  if (!onboardingData || !step1) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground mb-6">
              Please complete your onboarding to create a profile.
            </p>
            <Button asChild>
              <Link href="/student?stay=dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="w-full pt-6">
        <div className="flex justify-start px-4 md:px-6">
          <Button variant="ghost" asChild className="gap-1 text-muted-foreground hover:text-foreground ml-0">
            <Link href="/student?stay=dashboard">
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onOpenChange={(open) => {
          setShowProjectModal(open);
          if (!open) {
            setEditingProject(null);
          }
        }}
        onSave={editingProject ? handleEditProject : handleAddProject}
        initialProject={editingProject}
      />
      
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
        
        {/* Profile Header Card */}
        <Card className="border-border/50 bg-white dark:bg-slate-950 backdrop-blur mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Name and Status */}
                <div>
                  <h1 className="text-2xl font-bold mb-1">
                    {step1?.fullName || 'User Name'}
                  </h1>
                  <p className="text-muted-foreground mb-2">
                    {step1?.currentStatus || 'Student'} • {step1?.collegeName || step1?.customCollege || 'College Not Added'}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {primaryLocation}
                    </div>
                    <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                      <Briefcase className="w-3 h-3 mr-1" />
                      Open to Work
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <Card className="border-border/50 bg-white dark:bg-slate-950 backdrop-blur mb-6">
          <div className="flex items-center border-b border-border/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Tab Content */}
        {activeTab === 'basic-info' && step1 && (
          <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
            <div className="bg-muted p-4 flex items-center justify-between">
              <h3 className="text-base font-semibold tracking-wide">Personal Information</h3>
              {editingCard !== 'personal-info' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCard('personal-info')}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
            <CardContent className="pb-6 pt-6">
              {editingCard !== 'personal-info' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Full name</p>
                    <p className="font-medium">{step1.fullName || 'Not Added'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Email address</p>
                    <p className="font-medium">{step1.email || 'alex.johnson@email.com'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Phone number</p>
                    <p className="font-medium">{step1.phoneNumber || 'Not Added'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">LinkedIn</p>
                    <p className="font-medium">{step1.linkedin || 'Not Added'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Row 1: Full Name and Phone Number */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="font-medium">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input 
                        id="fullName"
                        defaultValue={step1.fullName} 
                        onChange={(e) => setEditedData({...editedData, fullName: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="font-medium">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input 
                        id="phoneNumber"
                        defaultValue={step1.phoneNumber} 
                        onChange={(e) => setEditedData({...editedData, phoneNumber: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  
                  {/* Row 2: Email Address - Full Width */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input 
                        id="email"
                        value={step1.email || 'alex.johnson@email.com'} 
                        disabled 
                        className="bg-muted" 
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  {/* Row 3: LinkedIn Profile - Full Width */}
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="font-medium">LinkedIn Profile</Label>
                    <Input 
                      id="linkedin"
                      defaultValue={step1.linkedin} 
                      onChange={(e) => setEditedData({...editedData, linkedin: e.target.value})}
                      placeholder="linkedin.com/in/yourname" 
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" size="sm" onClick={() => { setEditingCard(null); setEditedData({}); }}>Cancel</Button>
                    <Button size="sm" className="gap-2" onClick={handleSavePersonalInfo}><Save className="w-4 h-4" />Save Changes</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'skills-projects' && (
          <div className="space-y-6">
            {/* Technical Skills */}
            <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
              <div className="bg-muted p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold tracking-wide">Technical Skills</h3>
                </div>
                {editingCard !== 'skills' && step2?.autoDetectedSkills && step2.autoDetectedSkills.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCard('skills')}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </div>
              <CardContent className="pb-6 pt-6">
                {editingCard !== 'skills' ? (
                  <>
                    {step2?.autoDetectedSkills && step2.autoDetectedSkills.length > 0 ? (
                      /* Skills Display - View Mode - All same color */
                      <div className="flex flex-wrap gap-2">
                        {step2.autoDetectedSkills?.map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-black dark:bg-white text-white dark:text-black hover:bg-black hover:dark:bg-white">
                            {skill}
                          </Badge>
                        ))}
                        {step2.additionalSkills?.map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-black dark:bg-white text-white dark:text-black hover:bg-black hover:dark:bg-white">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      /* Empty State */
                      <div className="text-center py-8">
                        <Code className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No technical skills added yet</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => setEditingCard('skills')}
                        >
                          Add Skills
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Skills Edit Mode - Like Onboarding */}
                    <div className="space-y-4">
                      {/* Display tags */}
                      {((step2?.autoDetectedSkills?.length ?? 0) > 0 || skills.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                          {step2?.autoDetectedSkills?.map((skill) => (
                            <Badge key={skill} variant="default" className="bg-primary/10 text-primary cursor-default">
                              {skill}
                              <Lock className="w-3 h-3 ml-1" />
                            </Badge>
                          ))}
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
                      
                      {/* Input field with dropdown */}
                      <div className="relative" ref={skillDropdownRef}>
                        <Input 
                          placeholder="Type a skill and press Enter (e.g. React)..."
                          className="bg-muted/30"
                          value={customSkill}
                          onChange={(e) => setCustomSkill(e.target.value)}
                          onFocus={() => setShowSkillDropdown(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomSkill();
                            }
                          }}
                          disabled={((step2?.autoDetectedSkills?.length || 0) + skills.length) >= 20}
                        />
                        
                        {/* Dropdown with skill suggestions */}
                        {showSkillDropdown && filteredSkills.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                            <div className="flex flex-wrap gap-2 p-3">
                              {filteredSkills.slice(0, 30).map((skill) => (
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
                      
                      {/* Skills counter */}
                      <div className="flex justify-end mt-2">
                          <p className="text-xs text-muted-foreground">
                          {((step2?.autoDetectedSkills?.length || 0) + skills.length)}/20 added
                          </p>
                      </div>
                      
                      {/* Save Button */}
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setEditingCard(null); setSkills([]); setCustomSkill(''); }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={handleSaveSkillsUpdated}
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
              <div className="bg-muted p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold tracking-wide">Projects</h3>
                </div>
                {editingCard !== 'projects' && step2?.externalProjects && step2.externalProjects.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCard('projects')}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </div>
              <CardContent className="pb-6 pt-6">
                {editingCard !== 'projects' ? (
                  <>
                    {/* View Mode - Simple Project List */}
                    {!step2?.externalProjects || step2.externalProjects.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No projects added yet</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => setEditingCard('projects')}
                        >
                          Add Projects
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {step2.externalProjects.map((project) => (
                          <div key={project.id} className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-base">{project.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {project.projectType}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{project.oneLineDescription}</p>
                              {project.techStack.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {project.techStack.map((tech) => (
                                    <Badge key={tech} variant="secondary" className="text-xs bg-black dark:bg-white text-white dark:text-black">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Edit Mode - Project Management */}
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Edit your projects below or add new ones.
                      </p>
                      
                      {/* Existing Projects */}
                      {step2?.externalProjects && step2.externalProjects.length > 0 && (
                        <div className="space-y-3">
                          {step2?.externalProjects?.map((project) => (
                            <Card key={project.id} className="bg-muted/30 border-border/30">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-base">{project.title}</h4>
                                    <p className="text-sm text-muted-foreground">{project.oneLineDescription}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {project.techStack.map((tech) => (
                                        <Badge key={tech} variant="secondary" className="text-xs">
                                          {tech}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => {
                                        setEditingProject(project);
                                        setShowProjectModal(true);
                                      }}
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDeleteProject(project.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                      
                      {/* Add New Project Button */}
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingProject(undefined);
                            setShowProjectModal(true);
                          }}
                          className="flex items-center gap-2 text-primary font-medium mx-auto hover:underline"
                        >
                          <Plus className="w-4 h-4" />
                          Add New Project
                        </button>
                      </div>
                      
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
                            <AlertDialogAction 
                              onClick={confirmDeleteProject} 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      {/* Save Button */}
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCard(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-6">
            {/* Academic Information - Merged Card */}
            <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
                <div className="bg-muted p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-semibold tracking-wide">Academic Information</h3>
                  </div>
                  {editingCard !== 'academic-info' && (step1?.collegeName || step1?.customCollege || step3?.academicPerformance) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCard('academic-info')}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </div>
                <CardContent className="pb-6 pt-6">
                  {editingCard !== 'academic-info' ? (
                    <>
                      {/* View Mode - Display All Academic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* College Details */}
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">College name</p>
                          <p className="font-medium">{step1?.collegeName || step1?.customCollege || 'Not Added'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">Degree</p>
                          <p className="font-medium">{step1?.degree || 'Not Added'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">Branch</p>
                          <p className="font-medium">{step1?.branch || 'Not Added'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">Year of study</p>
                          <p className="font-medium">{step1?.yearOfStudy || 'Not Added'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">Expected graduation</p>
                          <p className="font-medium">{step1?.graduationDate ? `${step1.graduationDate.month} ${step1.graduationDate.year}` : 'Not Added'}</p>
                        </div>
                        
                        {/* Academic Performance */}
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">College marks</p>
                          <p className="font-medium">
                            {step3?.academicPerformance?.marksFormat === 'CGPA'
                              ? `${step3.academicPerformance.cgpa || 'Not Added'} ${step3.academicPerformance.cgpa ? 'CGPA' : ''}`
                              : step3?.academicPerformance?.percentage ? `${step3.academicPerformance.percentage}%` : 'Not Added'}
                          </p>
                        </div>
                        
                        <div className="md:col-span-2 border-t border-border/30 pt-4 mt-2">
                          <p className="text-xs text-muted-foreground font-medium mb-2">Class 12th</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground font-medium mb-1">Board</p>
                              <p className="font-medium">{step3?.academicPerformance?.class12Board || 'Not Added'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium mb-1">Score</p>
                              <p className="font-medium">
                                {step3?.academicPerformance?.class12Percentage 
                                  ? `${step3.academicPerformance.class12Percentage}%` 
                                  : 'Not Added'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:col-span-2 border-t border-border/30 pt-4">
                          <p className="text-xs text-muted-foreground font-medium mb-2">Class 10th</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground font-medium mb-1">Board</p>
                              <p className="font-medium">{step3?.academicPerformance?.class10Board || 'Not Added'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium mb-1">Score</p>
                              <p className="font-medium">
                                {step3?.academicPerformance?.class10Marks 
                                  ? `${step3.academicPerformance.class10Marks}${step3.academicPerformance.class10Format === 'CGPA' ? ' CGPA' : '%'}`
                                  : 'Not Added'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Edit Mode - Combined Form */}
                      <div className="space-y-6">
                        {/* College Details Section */}
                        {step1 && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="college" className="font-medium">
                                College Name <span className="text-destructive">*</span>
                              </Label>
                              <div className="relative" ref={collegeDropdownRef}>
                                <Input
                                  placeholder="Search college name or state..."
                                  value={editedData.collegeName || editedData.customCollege || collegeSearch || step1.collegeName || step1.customCollege}
                                  onChange={(e) => {
                                    setCollegeSearch(e.target.value);
                                    setShowCollegeDropdown(true);
                                    if (editedData.collegeName || editedData.customCollege) {
                                      setEditedData({...editedData, collegeName: '', customCollege: ''});
                                    }
                                  }}
                                  onFocus={() => {
                                    setShowCollegeDropdown(true);
                                    if (editedData.collegeName || editedData.customCollege) {
                                      setCollegeSearch('');
                                    }
                                  }}
                                  className="bg-muted/30"
                                />
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                                
                                {showCollegeDropdown && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                                    {filteredColleges.map((college) => (
                                      <button
                                        key={college.id}
                                        type="button"
                                        onClick={() => handleCollegeSelect(college.name)}
                                        className="w-full text-left px-3 py-2 hover:bg-accent text-sm hover:text-accent-foreground transition-colors"
                                      >
                                        <div className="font-medium">{college.name}</div>
                                        <div className="text-xs text-muted-foreground">{college.state}</div>
                                      </button>
                                    ))}
                                    {collegeSearch.trim() && filteredColleges.length === 0 && (
                                      <button
                                        type="button"
                                        onClick={handleCustomCollege}
                                        className="w-full text-left px-3 py-2 hover:bg-accent text-sm hover:text-accent-foreground transition-colors border-t border-border/30"
                                      >
                                        <div className="font-medium text-primary">Add &quot;{collegeSearch}&quot; as custom college</div>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="font-medium">Degree</Label>
                                <Select defaultValue={step1.degree}>
                                  <SelectTrigger className="mt-2 bg-muted/30">
                                    <SelectValue placeholder="Select Degree" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="B.Tech">B.Tech</SelectItem>
                                    <SelectItem value="B.E.">B.E.</SelectItem>
                                    <SelectItem value="BCA">BCA</SelectItem>
                                    <SelectItem value="MCA">MCA</SelectItem>
                                    <SelectItem value="M.Tech">M.Tech</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="font-medium">Branch *</Label>
                                <Select defaultValue={step1.branch}>
                                  <SelectTrigger className="mt-2 bg-muted/30">
                                    <SelectValue placeholder="Select Branch" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                                    <SelectItem value="Electronics">Electronics</SelectItem>
                                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                                    <SelectItem value="Civil">Civil</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="font-medium">Year of Study *</Label>
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                  {['1st', '2nd', '3rd', '4th'].map((year) => (
                                    <button
                                      key={year}
                                      type="button"
                                      className={`py-2 px-3 rounded-lg border-2 font-medium text-sm transition-all ${
                                        step1.yearOfStudy === year
                                          ? 'border-primary bg-primary text-primary-foreground'
                                          : 'border-border bg-background hover:border-primary'
                                      }`}
                                    >
                                      {year}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="font-medium">Expected Graduation *</Label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  <Select defaultValue={step1.graduationDate.month}>
                                    <SelectTrigger className="bg-muted/30">
                                      <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="January">January</SelectItem>
                                      <SelectItem value="February">February</SelectItem>
                                      <SelectItem value="March">March</SelectItem>
                                      <SelectItem value="April">April</SelectItem>
                                      <SelectItem value="May">May</SelectItem>
                                      <SelectItem value="June">June</SelectItem>
                                      <SelectItem value="July">July</SelectItem>
                                      <SelectItem value="August">August</SelectItem>
                                      <SelectItem value="September">September</SelectItem>
                                      <SelectItem value="October">October</SelectItem>
                                      <SelectItem value="November">November</SelectItem>
                                      <SelectItem value="December">December</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Select defaultValue={step1.graduationDate.year}>
                                    <SelectTrigger className="bg-muted/30">
                                      <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="2024">2024</SelectItem>
                                      <SelectItem value="2025">2025</SelectItem>
                                      <SelectItem value="2026">2026</SelectItem>
                                      <SelectItem value="2027">2027</SelectItem>
                                      <SelectItem value="2028">2028</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            
                          </>
                        )}
                        
                        {/* Academic Performance Section */}
                        {step3?.academicPerformance && (
                          <>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="collegeScore" className="font-medium">College Marks *</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    id="collegeScore"
                                    type="number"
                                    step={step3.academicPerformance.marksFormat === 'CGPA' ? '0.01' : '1'}
                                    min="0"
                                    max={step3.academicPerformance.marksFormat === 'CGPA' ? '10' : '100'}
                                    placeholder={step3.academicPerformance.marksFormat === 'CGPA' ? 'e.g. 8.5' : 'e.g. 85'}
                                    defaultValue={step3.academicPerformance.marksFormat === 'CGPA' ? step3.academicPerformance.cgpa : step3.academicPerformance.percentage}
                                    className="flex-1 bg-muted/30"
                                  />
                                  <button
                                    type="button"
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                      step3.academicPerformance.marksFormat === 'CGPA'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                  >
                                    CGPA
                                  </button>
                                  <button
                                    type="button"
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                      step3.academicPerformance.marksFormat === 'Percentage'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                  >
                                    %
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3 border-t pt-6">
                              <Label className="font-medium">Class 12th (Optional)</Label>
                              
                              {/* Board and Score in same row */}
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="class12Board" className="font-medium">Board</Label>
                                  <Select defaultValue={step3.academicPerformance.class12Board || ''}>
                                    <SelectTrigger className="bg-muted/30">
                                      <SelectValue placeholder="Board" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="CBSE">CBSE</SelectItem>
                                      <SelectItem value="ICSE">ICSE</SelectItem>
                                      <SelectItem value="State Board">State Board</SelectItem>
                                      <SelectItem value="IB">IB</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="class12Score" className="font-medium">Score</Label>
                                  <div className="flex gap-2">
                                    <Input 
                                      id="class12Score"
                                      type="number"
                                      step={(step3.academicPerformance.class12Format || 'Percentage') === 'CGPA' ? '0.01' : '1'}
                                      min="0"
                                      max={(step3.academicPerformance.class12Format || 'Percentage') === 'CGPA' ? '10' : '100'}
                                      placeholder={(step3.academicPerformance.class12Format || 'Percentage') === 'CGPA' ? 'e.g. 9.0' : 'Score'}
                                      defaultValue={step3.academicPerformance.class12Percentage}
                                      className="flex-1 bg-muted/30"
                                    />
                                    <button
                                      type="button"
                                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        (step3.academicPerformance.class12Format || 'Percentage') === 'CGPA'
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                      }`}
                                    >
                                      CGPA
                                    </button>
                                    <button
                                      type="button"
                                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        (step3.academicPerformance.class12Format || 'Percentage') === 'Percentage'
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                      }`}
                                    >
                                      %
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <Label className="font-medium">Class 10th (Optional)</Label>
                              
                              {/* Board and Score in same row */}
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor="class10Board" className="font-medium">Board</Label>
                                  <Select defaultValue={step3.academicPerformance.class10Board || ''}>
                                    <SelectTrigger className="bg-muted/30">
                                      <SelectValue placeholder="Board" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="CBSE">CBSE</SelectItem>
                                      <SelectItem value="ICSE">ICSE</SelectItem>
                                      <SelectItem value="State Board">State Board</SelectItem>
                                      <SelectItem value="IB">IB</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="class10Marks" className="font-medium">Score</Label>
                                  <div className="flex gap-2">
                                    <Input 
                                      id="class10Marks"
                                      type="number"
                                      step={(step3.academicPerformance.class10Format || 'Percentage') === 'CGPA' ? '0.01' : '1'}
                                      min="0"
                                      max={(step3.academicPerformance.class10Format || 'Percentage') === 'CGPA' ? '10' : '100'}
                                      placeholder={(step3.academicPerformance.class10Format || 'Percentage') === 'CGPA' ? 'e.g. 9.5' : 'Score'}
                                      defaultValue={step3.academicPerformance.class10Marks}
                                      className="flex-1 bg-muted/30"
                                    />
                                    <button
                                      type="button"
                                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        (step3.academicPerformance.class10Format || 'Percentage') === 'CGPA'
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                      }`}
                                    >
                                      CGPA
                                    </button>
                                    <button
                                      type="button"
                                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        (step3.academicPerformance.class10Format || 'Percentage') === 'Percentage'
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                      }`}
                                    >
                                      %
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* Save/Cancel Buttons */}
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCard(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

            {/* Work Experience */}
            <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
              <div className="bg-muted p-4 flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-wide">Work Experience</h3>
                {editingCard !== 'work-experience' && step3?.workExperiences && step3.workExperiences.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCard('work-experience')}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </div>
              <CardContent className="pb-6 pt-6">
                {editingCard !== 'work-experience' ? (
                  <>
                    {step3?.workExperiences && step3.workExperiences.length > 0 ? (
                      /* View Mode - Display Work Experiences */
                      <div className="space-y-3">
                        {step3.workExperiences.map((exp) => (
                          <Card key={exp.id} className="bg-muted/30 border-border/30">
                            <CardContent className="p-4">
                              <h4 className="font-medium">{exp.role}</h4>
                              <p className="text-sm text-muted-foreground">{exp.companyName}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {exp.startDate.month} {exp.startDate.year} →{' '}
                                {exp.isCurrentlyWorking ? 'Present' : `${exp.endDate?.month} ${exp.endDate?.year}`}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {exp.workMode}
                                </Badge>
                                {exp.city && (
                                  <Badge variant="outline" className="text-xs">
                                    {exp.city}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      /* Empty State */
                      <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No work experience added yet</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => setEditingCard('work-experience')}
                        >
                          Add Work Experience
                        </Button>
                      </div>
                    )}
                  </>
                  ) : (
                    <>
                      {/* Edit Mode - Manage Work Experiences */}
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
                              No, I&apos;m a Fresher
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

                        {/* Show Experience Form only if hasInternship is true */}
                        {hasInternship && (
                          <>
                            {/* Existing Work Experiences */}
                            {step3?.workExperiences && step3.workExperiences.length > 0 && (
                              <div className="space-y-3">
                                {step3.workExperiences.map((exp) => (
                            <Card key={exp.id} className="bg-muted/30 border-border/30">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium">{exp.role}</h4>
                                    <p className="text-sm text-muted-foreground">{exp.companyName}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {exp.startDate.month} {exp.startDate.year} →{' '}
                                      {exp.isCurrentlyWorking ? 'Present' : `${exp.endDate?.month} ${exp.endDate?.year}`}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {exp.workMode}
                                      </Badge>
                                      {exp.city && (
                                        <Badge variant="outline" className="text-xs">
                                          {exp.city}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm">
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                                ))}
                              </div>
                            )}
                            
                            {/* Add New Experience Button */}
                            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                              <p className="text-sm text-muted-foreground mb-3">
                                {step3?.workExperiences && step3.workExperiences.length > 0
                                  ? 'Showcase more of your professional journey'
                                  : 'Build your professional profile'}
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Work Experience
                              </Button>
                            </div>
                          </>
                        )}
                        
                        {/* Save Button */}
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setEditingCard(null); setEditedData({}); }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={handleSaveAcademic}
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            
            {/* Competitive Profiles */}
            <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
              <div className="bg-muted p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold tracking-wide">Competitive Coding Profiles</h3>
                </div>
                {editingCard !== 'competitive-profiles' && step3?.competitiveProfiles && step3.competitiveProfiles.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCard('competitive-profiles')}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </div>
              <CardContent className="pb-6 pt-6">
                {editingCard !== 'competitive-profiles' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {step3?.competitiveProfiles && step3.competitiveProfiles.length > 0 ? (
                      step3.competitiveProfiles.map((profile) => (
                        <div key={profile.platform} className="space-y-1">
                          <p className="text-xs text-muted-foreground font-medium">{profile.platform}</p>
                          <p className="font-medium">{profile.username || 'Not Added'}</p>
                        </div>
                      ))
                    ) : (
                      <div className="md:col-span-2 text-center py-8">
                        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No competitive profiles added yet</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => setEditingCard('competitive-profiles')}
                        >
                          Add Profiles
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {(step3?.competitiveProfiles && step3.competitiveProfiles.length > 0 ? step3.competitiveProfiles : [
                        { platform: 'LeetCode', username: '', isVerified: false },
                        { platform: 'CodeChef', username: '', isVerified: false },
                        { platform: 'Codeforces', username: '', isVerified: false },
                        { platform: 'HackerRank', username: '', isVerified: false }
                      ] as CompetitiveProfile[]).map((profile, index) => {
                          const currentUsername = editedData.competitiveProfiles?.[index]?.username ?? profile.username ?? '';
                          const hasUsername = profile.username && profile.username.trim() !== '';
                          const hasModified = hasUsername && currentUsername !== profile.username;
                          
                          return (
                            <div key={profile.platform} className="space-y-4">
                              <Label className="font-medium text-base">{profile.platform}</Label>
                              
                              <Input 
                                value={currentUsername}
                                placeholder="Username"
                                onChange={(e) => {
                                  const newProfiles = editedData.competitiveProfiles || (step3?.competitiveProfiles || []).map(p => ({...p}));
                                  newProfiles[index] = { ...newProfiles[index], ...profile, username: e.target.value };
                                  setEditedData({...editedData, competitiveProfiles: newProfiles});
                                }}
                              />
                              
                              {/* Show Verify button for empty profiles or newly entered usernames */}
                              {!hasUsername && (
                                <Button
                                  type="button"
                                  variant="default"
                                  onClick={() => handleVerifyProfile(profile.platform)}
                                  disabled={!currentUsername || verifyingPlatform === profile.platform}
                                >
                                  {verifyingPlatform === profile.platform && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  )}
                                  Verify
                                </Button>
                              )}
                              
                              {/* Show Re-Verify when username was modified */}
                              {hasUsername && hasModified && (
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
                                  {profile.problemsSolved && (
                                    <>
                                      <span className="text-muted-foreground">•</span>
                                      <span className="text-muted-foreground">{profile.problemsSolved} problems solved</span>
                                      <span className="text-muted-foreground">•</span>
                                      <span className="text-muted-foreground">Rating: {profile.rating}</span>
                                    </>
                                  )}
                                </div>
                              )}
                              
                              {/* Show Verified status when username exists and not modified */}
                              {hasUsername && !hasModified && (
                                <div className="flex items-center gap-2 text-sm flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-green-600">Verified</span>
                                  </div>
                                  {profile.problemsSolved && (
                                    <>
                                      <span className="text-muted-foreground">•</span>
                                      <span className="text-muted-foreground">{profile.problemsSolved} problems solved</span>
                                      <span className="text-muted-foreground">•</span>
                                      <span className="text-muted-foreground">Rating: {profile.rating}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" size="sm" onClick={() => { setEditingCard(null); setEditedData({}); }}>
                          Cancel
                        </Button>
                        <Button size="sm" className="gap-2" onClick={handleSaveCompetitive}>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'career-goals' && (
          <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
            <div className="bg-muted p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold tracking-wide">Career Goals</h3>
              </div>
              {editingCard !== 'career-goals' && step4 && (step4.targetRoles || step4.locationPreferences || step4.salaryExpectations) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCard('career-goals')}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>
            <CardContent className="pb-6 pt-6">
              {editingCard !== 'career-goals' ? (
                <>
                  {!step4 || (!step4.targetRoles && !step4.locationPreferences && !step4.salaryExpectations) ? (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No career goals added yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => setEditingCard('career-goals')}
                      >
                        Add Career Goals
                      </Button>
                    </div>
                  ) : (
                    <>
                  {/* View Mode - Display Target Roles and Locations */}
                  {/* Target Roles */}
                  {step4?.targetRoles && step4.targetRoles.length > 0 && (
                    <div className="mb-6">
                      <Label className="text-xs font-medium text-muted-foreground mb-3 block">Target roles</Label>
                      <div className="flex flex-wrap gap-2">
                        {step4.targetRoles.map((role) => (
                          <Badge key={role} variant="secondary" className="bg-black dark:bg-white text-white dark:text-black">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferred Locations */}
                  {step4.locationPreferences && (
                    <div className="mb-6 pb-6 border-b border-border/30">
                      <Label className="text-xs font-medium text-muted-foreground mb-3 block">Preferred location</Label>
                      <div className="flex flex-wrap gap-2">
                        {step4.locationPreferences.remote && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Open to Remote
                          </Badge>
                        )}
                        {step4.locationPreferences.cities?.map((city) => (
                          <Badge key={city} variant="secondary" className="bg-black dark:bg-white text-white dark:text-black">
                            {city}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Salary Expectations */}
                  {step4.salaryExpectations && (step4.salaryExpectations.internship || step4.salaryExpectations.fullTime) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {step4.salaryExpectations.internship && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">Internship expectations</p>
                          <p className="font-medium">{step4.salaryExpectations.internship}</p>
                        </div>
                      )}
                      {step4.salaryExpectations.fullTime && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">Full-time expectations</p>
                          <p className="font-medium">{step4.salaryExpectations.fullTime}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Allow Companies to View Profile */}
                  {step4.allowCompaniesViewProfile !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${step4.allowCompaniesViewProfile ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-muted-foreground">
                        {step4.allowCompaniesViewProfile ? 'Profile visible to companies' : 'Profile hidden from companies'}
                      </span>
                    </div>
                  )}
                  </>
                  )}
                </>
              ) : (
                <>
                  {/* Edit Mode - Match OnboardingStep4 */}
                  <div className="space-y-6">
                    {/* Target Roles */}
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium text-sm tracking-wide">Target roles <span className="text-destructive">*</span></Label>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {CAREER_ROLES.map((role) => (
                          <label
                            key={role}
                            className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                              selectedRoles.includes(role)
                                ? 'bg-primary/5'
                                : 'bg-muted/30'
                            } ${!selectedRoles.includes(role) && selectedRoles.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes(role)}
                              onChange={() => {
                                if (selectedRoles.includes(role)) {
                                  setSelectedRoles(selectedRoles.filter(r => r !== role));
                                } else if (selectedRoles.length < 5) {
                                  setSelectedRoles([...selectedRoles, role]);
                                }
                              }}
                              disabled={!selectedRoles.includes(role) && selectedRoles.length >= 5}
                              className="w-4 h-4 rounded accent-green-600"
                            />
                            <span className="text-sm font-medium text-muted-foreground">{role}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Location Preferences */}
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium text-sm tracking-wide">Preferred location</Label>
                      </div>

                      {/* Remote Toggle */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setRemotePreference(!remotePreference)}
                          className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                            remotePreference
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-muted/30 text-muted-foreground border border-border hover:border-primary/50'
                          }`}
                        >
                          Open to Remote
                        </button>
                      </div>

                      {/* Cities Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        {INDIAN_CITIES.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              if (selectedCities.includes(city)) {
                                setSelectedCities(selectedCities.filter(c => c !== city));
                              } else if (selectedCities.length < 5) {
                                setSelectedCities([...selectedCities, city]);
                              }
                            }}
                            disabled={!selectedCities.includes(city) && selectedCities.length >= 5}
                            className={`py-3 px-4 rounded-lg border font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              selectedCities.includes(city)
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border text-muted-foreground hover:border-primary/50'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Salary Expectations */}
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Internship Stipend */}
                        <div className="space-y-2">
                          <Label className="font-medium text-sm tracking-wide">Internship stipend</Label>
                          <Select value={internshipSalary} onValueChange={setInternshipSalary}>
                            <SelectTrigger className="bg-muted/30">
                              <SelectValue placeholder="Select Range" />
                            </SelectTrigger>
                            <SelectContent>
                              {internshipSalaryRanges.map((range) => (
                                <SelectItem key={range} value={range}>
                                  {range}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Full-Time CTC */}
                        <div className="space-y-2">
                          <Label className="font-medium text-sm tracking-wide">Full-time CTC</Label>
                          <Select value={fullTimeSalary} onValueChange={setFullTimeSalary}>
                            <SelectTrigger className="bg-muted/30">
                              <SelectValue placeholder="Select Range" />
                            </SelectTrigger>
                            <SelectContent>
                              {fullTimeSalaryRanges.map((range) => (
                                <SelectItem key={range} value={range}>
                                  {range}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Communication Preferences */}
                    <div className="space-y-4">
                      <Label className="font-medium text-sm tracking-wide">Preferred contact methods</Label>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="email-pref-edit"
                            checked={emailPref}
                            onCheckedChange={(checked) => setEmailPref(checked as boolean)}
                          />
                          <label htmlFor="email-pref-edit" className="text-sm font-medium cursor-pointer">
                            Email
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="whatsapp-pref-edit"
                            checked={whatsappPref}
                            onCheckedChange={(checked) => setWhatsappPref(checked as boolean)}
                          />
                          <label htmlFor="whatsapp-pref-edit" className="text-sm font-medium cursor-pointer">
                            Whatsapp
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="phone-pref-edit"
                            checked={phonePref}
                            onCheckedChange={(checked) => setPhonePref(checked as boolean)}
                          />
                          <label htmlFor="phone-pref-edit" className="text-sm font-medium cursor-pointer">
                            Phone
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Profile Visibility Toggle */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="allowCompanies-edit"
                          checked={allowCompanies}
                          onChange={(e) => setAllowCompanies(e.target.checked)}
                          className="w-4 h-4 rounded accent-green-600"
                        />
                        <label htmlFor="allowCompanies-edit" className="text-sm cursor-pointer">
                          Allow hiring partners to view my profile and contact me for jobs.
                        </label>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { 
                          setEditingCard(null); 
                          setEditedData({}); 
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          if (step4) {
                            updateStepData(4, {
                              ...step4,
                              targetRoles: selectedRoles,
                              locationPreferences: {
                                remote: remotePreference,
                                cities: selectedCities,
                              },
                              salaryExpectations: {
                                internship: internshipSalary || undefined,
                                fullTime: fullTimeSalary || undefined,
                              },
                              communicationPreferences: {
                                email: emailPref,
                                whatsapp: whatsappPref,
                                phone: phonePref,
                              },
                              allowCompaniesViewProfile: allowCompanies,
                            });
                            setEditingCard(null);
                          }
                        }}
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EditProfilePage;
