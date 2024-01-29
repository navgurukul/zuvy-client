import { BarChart, Bell, CircleUser, List, Search, Slack } from "lucide-react";

const guestRoutes = [
    {
      icon: CircleUser,
      label: "Profile",
<<<<<<< HEAD
      href: "/profile",
=======
      href: "/student/profile",
>>>>>>> cc57bebdcd2bb4e3ca09491824b30890acde8c11
    },
    {
      icon: Search,
      label: "Search",
      href: "/",
    },
    {
      icon: Slack,
      label: "Slack",
      href: "/slack",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/notiication",
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


  export {teacherRoutes, guestRoutes}