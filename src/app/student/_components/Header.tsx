'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Logout } from "@/utils/logout";
import { useThemeStore, useLazyLoadedStudentData } from "@/store/store";

const Header = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const { studentData } = useLazyLoadedStudentData();
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
      <header className="w-full h-16 px-4 sm:px-6 font-semibold flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50 shadow-4dp sticky top-0 z-50">
        {/* Left - Logo and Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
            <img
              src={'/logo.PNG'}
              alt="Zuvy"
              className="h-12"
            />
          </div>

          {/* Course Navigation Buttons */}
          {isOnCoursePage && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="link"
                size="sm"
                onClick={handleDashboardClick}
                className={`text-xs font-semibold sm:text-sm ${'text-foreground  hover:text-primary'
                  }`}
              >
                Dashboard
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={handleSyllabusClick}
                className={` text-xs font-semibold sm:text-sm ${isOnCourseSyllabus()
                    ? 'text-primary font-semibold'
                    : 'text-foreground hover:text-primary'
                  }`}
              >
                Course Syllabus
              </Button>
            </div>
          )}
        </div>

        {/* Right - Theme Switch and Avatar with Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9"></div> {/* Placeholder for theme toggle */}

          {/* Student Avatar with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                <AvatarImage src={studentData?.profile_picture} alt="Student" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {getUserInitials(studentData?.name)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{studentData?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {studentData?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm capitalize">
                    {studentData?.rolesList?.join(', ')}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
    <header className="w-screen h-16 px-4 sm:px-6 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50 shadow-4dp sticky top-0 z-50">
      {/* Left - Logo and Navigation */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
          <img
            src={'/logo.PNG'}
            alt="Zuvy"
            className="h-12"
          />
        </div>

        {/* Course Navigation Buttons */}
        {isOnCoursePage && (
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="link"
              size="sm"
              onClick={handleDashboardClick}
              className={`text-xs sm:text-sm font-semibold ${'text-foreground hover:underline hover:text-primary'
                }`}
            >
              Dashboard
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={handleSyllabusClick}
              className={`text-xs sm:text-sm font-semibold ${isOnCourseSyllabus()
                  ? 'text-primary font-medium'
                  : 'text-foreground hover:underline hover:text-primary'
                }`}
            >
              Course Syllabus
            </Button>
          </div>
        )}
      </div>

      {/* Right - Theme Switch and Avatar with Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Student Avatar with Dropdown */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 text-left cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              {studentData?.profile_picture ? <AvatarImage src={(studentData as any)?.profilePicture || '/logo.PNG'} alt="Student" /> : <AvatarFallback className="font-medium">
                {getUserInitials(studentData?.name)}
              </AvatarFallback>}

            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 text-left" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{studentData?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {studentData?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm capitalize">
                  {studentData?.rolesList?.join(', ')}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600 hover:bg-primary hover:text-primary hover:text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>



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