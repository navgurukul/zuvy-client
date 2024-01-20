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
      href: "/courses",
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