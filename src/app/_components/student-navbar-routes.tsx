"use client";

import {
  BarChart,
  Compass,
  Layout,
  List,
  MessageCircleQuestion,
  MessagesSquare,
  LogOut,
  Code,
  Search,
  Slack,
  Bell,
  CircleUser,
} from "lucide-react";

import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";

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

// const commonRoutes = [
//   {
//     icon: LogOut,
//     label: "Logout",
//     href: "/logout",
//   },
// ];

export const StudentSidebarRoutes = () => {
  const pathname = usePathname();

  const isTeacherPage = pathname?.includes("/teacher");

  const routes = isTeacherPage ? teacherRoutes : guestRoutes;

  return (
    <div className="flex justify-between flex-col h-full">
      <div>
        {routes.map((route) => (
          <SidebarItem
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
          />
        ))}
      </div>
      {/* <div>
        {commonRoutes.map((route) => (
          <SidebarItem
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
          />
        ))}
      </div> */}
    </div>
  );
};
