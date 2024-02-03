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

const adminRoutes = [
  { icon: Home, label: "Home", href: "/admin" },
  { label: "Notifications", icon: Bell, href: "/admin/home" },
  { label: "Courses", icon: Book, href: "/admin/courses" },
  { label: "Resource Bank", icon: Database, href: "/admin/home" },
  { label: "Instructors", icon: User, href: "/admin/home" },
  { label: "Reports", icon: BarChart, href: "/admin/home" },
  { label: "Settings", icon: Cog, href: "/admin/home" },
  { label: "Help", icon: HelpCircle, href: "/admin/home" },
];

const commonRoutes = [
  {
    icon: LogOut,
    label: "Logout",
    href: "/",
  },
];

export { guestRoutes, teacherRoutes, commonRoutes, adminRoutes };
