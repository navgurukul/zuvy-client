'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Moon, Sun, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Logout } from "@/utils/logout";
import { useThemeStore } from "@/store/store";

const Header = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Ensure client-side rendering for hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate user initials from name
  const getUserInitials = (name: string | undefined): string => {
    if (!name) return 'JD'; // fallback
    
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      // First and last name initials
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    } else if (words.length === 1) {
      // Just first name, take first two characters or duplicate first character
      return words[0].length >= 2 
        ? (words[0].charAt(0) + words[0].charAt(1)).toUpperCase()
        : (words[0].charAt(0) + words[0].charAt(0)).toUpperCase();
    }
    return 'JD'; // fallback
  };

  // Hide header on assessment page for security and focus
  if (pathname.includes('/studentAssessment')) {
    return null;
  }

  const handleLogoClick = () => {
    router.push('/student');
  };

  const handleDashboardClick = () => {
     router.push(`/student`);

  };

  const handleSyllabusClick = () => {
    // Extract courseId from pathname
    const courseIdMatch = pathname.match(/\/course\/([^\/]+)/);
    if (courseIdMatch) {
      const courseId = courseIdMatch[1];
      router.push(`/student/course/${courseId}/courseSyllabus`);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    await Logout();
  };

  // Check if we're on a course-related page
  const isOnCoursePage = pathname.includes('/course/');

  // Check active page states
 

  const isOnCourseSyllabus = () => {
    return pathname.includes('/courseSyllabus');
  };

  // Don't render theme toggle until client-side
  if (!isClient) {
    return (
      <header className="w-full h-16 px-6 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50 shadow-4dp sticky top-0 z-50">
        {/* Left - Logo and Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
            <img 
              src={'/logo.PNG'} 
              alt="Zuvy" 
              className="h-12"
            />
          </div>

          {/* Course Navigation Buttons */}
          {isOnCoursePage && (
            <div className="flex items-center gap-2">
              <Button
                variant="link"
                size="sm"
                onClick={handleDashboardClick}
                className={`${ 
                     'text-foreground  hover:text-primary'
                }`}
              >
                Dashboard
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={handleSyllabusClick}
                className={`${
                  isOnCourseSyllabus() 
                    ? 'text-primary font-medium' 
                    : 'text-foreground hover:text-primary'
                }`}
              >
                Course Syllabus
              </Button>
            </div>
          )}
        </div>

        {/* Right - Theme Switch, Logout Button and Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9"></div> {/* Placeholder for theme toggle */}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogoutClick}
                  className="px-3 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be signed out of your account and redirected to the login page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-primary hover:bg-primary-dark">
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full h-16 px-6 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50 shadow-4dp sticky top-0 z-50">
      {/* Left - Logo and Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
          <img 
            src={'/logo.PNG'} 
            alt="Zuvy" 
            className="h-12"
          />
        </div>

        {/* Course Navigation Buttons */}
        {isOnCoursePage && (
          <div className="flex items-center gap-2">
            <Button
              variant="link"
              size="sm"
              onClick={handleDashboardClick}
              className={`${ 
                   'text-foreground  hover:text-primary'
              }`}
            >
              Dashboard
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={handleSyllabusClick}
              className={`${
                isOnCourseSyllabus() 
                  ? 'text-primary font-medium' 
                  : 'text-foreground hover:text-primary'
              }`}
            >
              Course Syllabus
            </Button>
          </div>
        )}
      </div>

      {/* Right - Theme Switch, Logout Button and Avatar */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogoutClick}
                className="px-3 py-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be signed out of your account and redirected to the login page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-primary hover:bg-primary-dark">
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
};

export default Header;