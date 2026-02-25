import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Clock, Moon, Sun, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import OnboardingStep1Component from '@/app/student/_components/onboarding/OnboardingStep1';
import OnboardingStep2Component from '@/app/student/_components/onboarding/OnboardingStep2';
import OnboardingStep3Component from '@/app/student/_components/onboarding/OnboardingStep3';
import OnboardingStep4Component from '@/app/student/_components/onboarding/OnboardingStep4';
import { useOnboardingStorage } from '@/hooks/use-onboarding';
import type { OnboardingStep1 as Step1Type, OnboardingStep2 as Step2Type, OnboardingStep3 as Step3Type, OnboardingStep4 as Step4Type } from '@/lib/onboarding.types';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeProvider';
import { mockStudent } from '@/lib/mockData';

interface OnboardingPageProps {
  userEmail?: string;
  userFullName?: string;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ userEmail = '', userFullName = '' }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const handleLogout = () => {
    navigate('/');
  };

  const {
    onboardingData,
    isLoading,
    updateStepData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    completeOnboarding,
    skipOnboarding,
  } = useOnboardingStorage();

  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
  const [showAlert, setShowAlert] = useState(false);
  const [showAutoSaved, setShowAutoSaved] = useState(false);
  const [autofillMethod, setAutofillMethod] = useState<'resume' | 'linkedin'>('resume');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  
  // Track current step data to auto-save
  const [currentStepData, setCurrentStepData] = useState<any>(null);

  // Function to trigger auto-saved indicator
  const triggerAutoSaved = () => {
    setShowAutoSaved(true);
    setTimeout(() => setShowAutoSaved(false), 2000);
  };
  
  // Auto-save current step data
  const handleAutoSave = (stepNumber: number, data: any) => {
    setCurrentStepData(data);
    updateStepData(stepNumber, data);
    triggerAutoSaved();
  };

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeRemaining === 0 && onboardingData?.currentStep === 4) {
      setShowAlert(true);
    }
  }, [timeRemaining, onboardingData?.currentStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleStep1Complete = (data: Step1Type) => {
    updateStepData(1, data);
    goToNextStep();
  };

  const handleStep2Complete = (data: Step2Type) => {
    updateStepData(2, data);
    goToNextStep();
  };

  const handleStep3Complete = (data: Step3Type) => {
    updateStepData(3, data);
    goToNextStep();
  };

  const handleStep4Complete = (data: Step4Type) => {
    updateStepData(4, data);
    completeOnboarding();
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  const handleSkip = () => {
    // Move to next step instead of going to dashboard
    if (currentStep < 4) {
      goToNextStep();
    } else {
      // On final step, mark as skipped and go to dashboard
      skipOnboarding();
      navigate('/dashboard');
    }
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      // TODO: Implement resume parsing logic
      console.log('Resume uploaded:', file.name);
      // Here you would typically send the file to a backend API for parsing
    }
  };

  const handleLinkedinFetch = () => {
    if (linkedinUrl.trim()) {
      // TODO: Implement LinkedIn profile fetching logic
      console.log('Fetching LinkedIn profile:', linkedinUrl);
      // Here you would typically call an API to fetch LinkedIn profile data
    }
  };

  const handleBackClick = () => {
    // Save current step data before going back
    if (currentStepData && currentStep > 1) {
      updateStepData(currentStep, currentStepData);
    }
    goToPreviousStep();
    setShowAlert(false);
    // Clear current step data
    setCurrentStepData(null);
  };

  if (isLoading || !onboardingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your onboarding...</p>
        </div>
      </div>
    );
  }

  const currentStep = onboardingData.currentStep;
  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="w-full h-16 px-6 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50 shadow-4dp z-50 flex-shrink-0">
        {/* Left - Logo */}
        <div className="flex items-center">
          <img
            src={theme === 'dark'
              ? "/zuvy-logo-horizontal-dark.png"
              : "/zuvy-logo-horizontal.png"
            }
            alt="Zuvy"
            className="h-10"
          />
        </div>

        {/* Right - Auto Saved, Theme Switch and Avatar */}
        <div className="flex items-center gap-4">
          {showAutoSaved && (
            <span className="text-sm text-muted-foreground italic">Auto Saved</span>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-9 h-9 p-0"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {(userFullName || mockStudent.name)
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-semibold text-foreground">{userFullName || mockStudent.name}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail || mockStudent.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Setup your Profile</h1>
              <p className="text-muted-foreground">Complete these steps to unlock job applications.</p>
            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
              Step {currentStep} of 4
            </div>
          </div>
          
          {/* Step Navigation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 text-center">
                <div className={`text-xs font-semibold uppercase ${
                  currentStep === 1 ? 'text-primary' : currentStep > 1 ? 'text-muted-foreground' : 'text-muted-foreground/50'
                }`}>
                  BASICS
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className={`text-xs font-semibold uppercase ${
                  currentStep === 2 ? 'text-primary' : currentStep > 2 ? 'text-muted-foreground' : 'text-muted-foreground/50'
                }`}>
                  SKILLS & PROJECTS
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className={`text-xs font-semibold uppercase ${
                  currentStep === 3 ? 'text-primary' : currentStep > 3 ? 'text-muted-foreground' : 'text-muted-foreground/50'
                }`}>
                  Education & Experience
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className={`text-xs font-semibold uppercase ${
                  currentStep === 4 ? 'text-primary' : 'text-muted-foreground/50'
                }`}>
                  PREFERENCES
                </div>
              </div>
            </div>
            {/* Segmented Progress Bar */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className={`h-2 flex-1 rounded-full transition-colors cursor-pointer ${currentStep > 1 ? 'bg-primary hover:bg-primary/80' : 'bg-muted hover:bg-muted/80'}`}
              />
              <button
                type="button"
                onClick={() => goToStep(2)}
                className={`h-2 flex-1 rounded-full transition-colors cursor-pointer ${currentStep > 2 ? 'bg-primary hover:bg-primary/80' : 'bg-muted hover:bg-muted/80'}`}
              />
              <button
                type="button"
                onClick={() => goToStep(3)}
                className={`h-2 flex-1 rounded-full transition-colors cursor-pointer ${currentStep > 3 ? 'bg-primary hover:bg-primary/80' : 'bg-muted hover:bg-muted/80'}`}
              />
              <button
                type="button"
                onClick={() => goToStep(4)}
                className={`h-2 flex-1 rounded-full transition-colors cursor-pointer ${currentStep > 4 ? 'bg-primary hover:bg-primary/80' : 'bg-muted hover:bg-muted/80'}`}
              />
            </div>
          </div>
        </div>

        {/* Form Section - Single Card */}
        {currentStep === 1 && (
          <>
            {/* Auto-fill Options with Dotted Border */}
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5 mb-6">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
                  <p className="text-sm font-medium">Fast-track your profile</p>
                </div>
                <p className="text-xs text-muted-foreground">Auto-fill details using either method.</p>
              </div>

              <div className="flex items-stretch gap-3">
                {/* Upload Resume Card */}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="block h-full">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer h-full">
                      <div className="flex flex-col items-center justify-center text-center space-y-2 h-full">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Upload Resume</p>
                          <p className="text-xs text-muted-foreground">PDF / DOCX</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* OR Divider */}
                <div className="flex flex-col items-center justify-center px-2">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
                    <span className="text-xs font-medium text-muted-foreground">OR</span>
                  </div>
                </div>

                {/* Import from LinkedIn */}
                <div className="flex-1">
                  <div className="border-2 border-border rounded-lg p-4 bg-background h-full">
                    <div className="flex flex-col justify-center h-full space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center bg-[#0A66C2]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-foreground">Import from LinkedIn</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          placeholder="Paste profile URL..."
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleLinkedinFetch}
                          disabled={!linkedinUrl.trim()}
                        >
                          Fetch
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {currentStep === 2 && (
          <div className="flex items-center gap-2 mb-6">
            <div>
              <h3 className="text-2xl font-semibold">Skills & Projects</h3>
            </div>
          </div>
        )}
        <div className="mb-8">
            {currentStep === 1 && (
              <OnboardingStep1Component
                initialData={onboardingData.step1}
                userEmail={userEmail}
                userFullName={userFullName}
                onNext={handleStep1Complete}
                onSkip={handleSkip}
                onFieldChange={(data) => handleAutoSave(1, data)}
              />
            )}

            {currentStep === 2 && (
              <OnboardingStep2Component
                initialData={onboardingData.step2}
                onNext={handleStep2Complete}
                onSkip={handleSkip}
                onBack={handleBackClick}
                onFieldChange={(data) => handleAutoSave(2, data)}
              />
            )}

            {currentStep === 3 && (
              <OnboardingStep3Component
                initialData={onboardingData.step3}
                onNext={handleStep3Complete}
                onSkip={handleSkip}
                onBack={handleBackClick}
                onFieldChange={(data) => handleAutoSave(3, data)}
              />
            )}

            {currentStep === 4 && (
              <OnboardingStep4Component
                initialData={onboardingData.step4}
                onNext={handleStep4Complete}
                onSkip={handleSkip}
                onBack={handleBackClick}
                onFieldChange={(data) => handleAutoSave(4, data)}
              />
            )}
        </div>
        </div>
      </div>

      {/* Fixed Footer with Action Buttons */}
      <div className="flex-shrink-0 bg-background/80 backdrop-blur-md border-t border-border/50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBackClick} type="button" className="flex-1 md:flex-none">
              Back
            </Button>
          )}
          <div className="flex-1"></div>
          {(currentStep === 2 || currentStep === 3) && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              type="button"
              className="flex-1 md:flex-none text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          )}
          <Button
            onClick={() => {
              const form = document.querySelector('form');
              if (form) {
                form.requestSubmit();
              }
            }}
            className="flex-1 md:flex-none"
          >
            {currentStep === 4 ? 'Complete Setup' : 'Save & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
