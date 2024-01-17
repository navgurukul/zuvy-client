import React from "react";
import HomeContent from "./homeContent/homeContent";
import Notifications from "./notifications/notifications";
import Courses from "./courses/courses";
import CourseDetails from "./courses/courseDetails";
import RecourceBank from "./recourceBank/recourceBank";
import Instructors from "./instructors/instructors";
import Reports from "./reports/reports";
import Settings from "./settings/settings";
import Help from "./help/help";

interface MainContentProps {
  selectedMenuItem: string;
}

const MainContent: React.FC<MainContentProps> = ({ selectedMenuItem }) => {
  // Define the mapping between menu items and their corresponding content components
  const contentMap: { [key: string]: React.ReactNode } = {
    Home: <HomeContent />,
    Notifications: <Notifications />,
    Courses: <Courses />,
    "Resource Bank": <RecourceBank />,
    Instructors: <Instructors />,
    Reports: <Reports />,
    Settings: <Settings />,
    Help: <Help />,
  };

  // Render the selected content based on the menu item
  return <div className="main-content">{contentMap[selectedMenuItem]}</div>;
};

export default MainContent;
