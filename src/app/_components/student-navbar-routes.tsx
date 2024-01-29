"use client";

<<<<<<< HEAD
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

=======
>>>>>>> cc57bebdcd2bb4e3ca09491824b30890acde8c11
import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";
import { guestRoutes, teacherRoutes } from "@/lib/navbar-routes";

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
