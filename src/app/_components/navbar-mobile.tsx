import React from "react";

import Image from "next/image";
import { MobileNavbarRoutes } from "./navbar-routes";

function MobileNavbar() {
  return (
    <div className="h-full flex align-center flex-col overflow-y-auto bg-white">
      <Image src={"/logo.PNG"} alt="logo" width={"60"} height={"60"} />
      <div className="flex h-full flex-col w-full mt-3">
        <MobileNavbarRoutes />
      </div>
    </div>
  );
}

export { MobileNavbar };
