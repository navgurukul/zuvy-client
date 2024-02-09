import {
  BarChart,
  Compass,
  Layout,
  List,
  MessageCircleQuestion,
  MessagesSquare,
  LogOut,
  Code,
  Home,
  Bell,
  Book,
  Database,
  User,
  Cog,
  HelpCircle,
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
    href: "/student/courses",
  },
  // {
  //   icon: Code,
  //   label: "Playground",
  //   href: "/student/playground",
  // },
  // {
  //   icon: MessagesSquare,
  //   label: "Discussion",
  //   href: "/student/discussion",
  // },
  // {
  //   icon: MessageCircleQuestion,
  //   label: "Help",
  //   href: "/student/help",
  // },
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

const adminRoutes = [
  { label: "Home", icon: Home,  href: "/admin" },
  { label: "Courses", icon: Book, href: "/admin/courses" },
  // { label: "Notifications", icon: Bell, href: "/admin/home" },
  // { label: "Resource Bank", icon: Database, href: "/admin/resource" },
  // { label: "Instructors", icon: User, href: "/admin/instructor" },
  // { label: "Reports", icon: BarChart, href: "/admin/reports" },
  // { label: "Settings", icon: Cog, href: "/admin/settings" },
  // { label: "Help", icon: HelpCircle, href: "/admin/help" },
];

const commonRoutes = [
  {
    icon: LogOut,
    label: "Logout",
    href: "/",
  },
];

export { guestRoutes, teacherRoutes, commonRoutes, adminRoutes };
