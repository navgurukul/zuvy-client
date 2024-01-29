import {
    BarChart,
    Compass,
    Layout,
    List,
    MessageCircleQuestion,
    MessagesSquare,
    LogOut,
    Code,
  } from "lucide-react";
  
  const guestRoutes = [
    {
      icon: Layout,
      label: "Dashboard",
      href: "/student",
    },
    {
      icon: Compass,
      label: "Browse",
<<<<<<< HEAD
      href: "/search",
=======
      href: "/student/courses",
>>>>>>> cc57bebdcd2bb4e3ca09491824b30890acde8c11
    },
    {
      icon: Code,
      label: "Playground",
      href: "/playground",
    },
    {
      icon: MessagesSquare,
      label: "Discussion",
      href: "/discussion",
    },
    {
      icon: MessageCircleQuestion,
      label: "Help",
      href: "/help",
    },
  ];
  
  const teacherRoutes = [
    {
      icon: List,
      label: "Courses",
      href: "/teacher/courses",
    },
    {
      icon: BarChart,
      label: "Analytics",
      href: "/teacher/analytics",
    },
  ];
  
  const commonRoutes = [
    {
      icon: LogOut,
      label: "Logout",
      href: "/",
    },
  ];


  export {guestRoutes, teacherRoutes, commonRoutes}