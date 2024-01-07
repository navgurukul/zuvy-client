import React from "react";

import Image from "next/image";
import { SidebarRoutes } from "./sidebar-routes";

function StudentSidebar() {
  return (
    <div className="h-full flex align-center flex-col overflow-y-auto bg-white">
      {/* <div className="p-6"> */}
      <Image
        src={"/logo.PNG"}
        alt="logo"
        // className="p-2"
        width={"60"}
        height={"60"}
      />
      {/* </div> */}
      <div className="flex flex-col w-full mt-3">
        <SidebarRoutes />
      </div>
    </div>
  );
}

export default StudentSidebar;
