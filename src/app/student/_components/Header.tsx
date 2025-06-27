'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { mockCourses } from "@/utils/studentMockData";

const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Hide header on assessment page for security and focus
  if (pathname.includes('/studentAssessment')) {
    return null;
  }

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogoClick = () => {
    const enrolledCourses = mockCourses.filter(course => course.status === 'enrolled');
    
    if (enrolledCourses.length === 1) {
      router.push(`/student/course/${enrolledCourses[0].id}`);
    } else {
      router.push('/student/dashboard');
    }
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

  // Check if we're on a course-related page
  const isOnCoursePage = pathname.includes('/course/');

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
              className="text-foreground hover:text-primary"
            >
              Dashboard
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={handleSyllabusClick}
              className="text-foreground hover:text-primary"
            >
              Course Syllabus
            </Button>
          </div>
        )}
      </div>

      {/* Right - Theme Switch and Avatar */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-9 h-9 p-0"
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;