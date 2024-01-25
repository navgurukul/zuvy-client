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
import styles from "./sidebar.module.css";
import Image from "next/image";

interface SidebarProps {
  onMenuItemClick: (menuItem: string) => void;
  selectedMenuItem: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  onMenuItemClick,
  selectedMenuItem,
}) => {
  const menuItems = [
    { name: "Home", icon: <Home /> },
    { name: "Notifications", icon: <Bell /> },
    { name: "Courses", icon: <Book /> },
    { name: "Resource Bank", icon: <Database /> },
    { name: "Instructors", icon: <User /> },
    { name: "Reports", icon: <BarChart /> },
    { name: "Settings", icon: <Cog /> },
    { name: "Help", icon: <HelpCircle /> },
  ];

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
          <div
            key={index}
            className={`${styles.sidebarItem} ${
              item.name === selectedMenuItem ? styles.selectedItem : ""
            }`}
            onClick={() => onMenuItemClick(item.name)}
          >
            <span className={styles.sidebarIcon}>{item.icon}</span>
            <span className={styles.sidebarItemText}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
