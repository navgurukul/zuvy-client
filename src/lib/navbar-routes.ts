import { BarChart, Bell, CircleUser, List, Search, Slack } from "lucide-react";

const guestRoutes = [
  {
    icon: CircleUser,
    label: "Profile",
    href: "/profile",
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

const adminRoutes = [
  {
    icon: CircleUser,
    label: "Profile",
    href: "/profile",
  },
  {
    icon: Search,
    label: "Search",
    href: "/",
  },
];

const teacherRoutes = [
  {
    icon: List,
    label: "Courses",
    href: "/instructor/courses",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/instructor/analytics",
  },
];

export { teacherRoutes, guestRoutes, adminRoutes };
