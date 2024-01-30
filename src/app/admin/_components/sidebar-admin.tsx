"use client";
import React from "react";
import {
  Home,
  Bell,
  Book,
  Database,
  User,
  BarChart,
  Cog,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import styles from "./sidebar.module.css";
import { usePathname } from "next/navigation";

// interface SidebarProps {
//   onMenuItemClick: (menuItem: string) => void;
//   selectedMenuItem: string;
// }

const AdminSidebar = (
  {
    // onMenuItemClick,
    // selectedMenuItem,
  }
) => {
  const menuItems = [
    { name: "Home", icon: <Home />, href: "/admin" },
    { name: "Notifications", icon: <Bell />, href: "/admin/home" },
    { name: "Courses", icon: <Book />, href: "/admin/courses" },
    { name: "Resource Bank", icon: <Database />, href: "/admin/home" },
    { name: "Instructors", icon: <User />, href: "/admin/home" },
    { name: "Reports", icon: <BarChart />, href: "/admin/home" },
    { name: "Settings", icon: <Cog />, href: "/admin/home" },
    { name: "Help", icon: <HelpCircle />, href: "/admin/home" },
  ];

  const pathname = usePathname();

  // const isActive = (pathname === "/" && item.name === "/") || pathname === item.name;

  return (
    <div className={styles.sidebar}>
      <div className="flex justify-center mt-3 mb-6">
        <Image
          src={"/logo.PNG"}
          alt="logo"
          // className="p-2"
          width={"80"}
          height={"80"}
        />
      </div>
      <div>
        {menuItems.map((item, index) => (
          <Link
            href={item.href}
            key={index}
            className={`${styles.sidebarItem} ${
              (pathname === "/" && item.name === "/") || pathname === item.name
                ? styles.selectedItem
                : ""
            }`}
            // onClick={() => onMenuItemClick(item.name)}
          >
            <span className={styles.sidebarIcon}>{item.icon}</span>
            <span className={styles.sidebarItemText}>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
