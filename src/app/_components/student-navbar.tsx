import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import StudentSidebar from "./student-sidebar";
import { Bell, Menu, Search, Slack } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const StudentNavbar = () => {
  return (
    <nav className="bg-muted">
      {/* <MaxWidthWrapper> */}
      <div className="flex items-center justify-between border-green-[#2f433a]">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger>
              <div className="bg-white p-4 rounded-r-lg">
                <Menu />
              </div>
            </SheetTrigger>
            <SheetContent side="left" className="w-[400px] sm:w-[540px]">
              <StudentSidebar />
            </SheetContent>
          </Sheet>
          <Link href={"/"} className="flex z-40 ">
            <Image
              src={"/logo.PNG"}
              alt="logo"
              // className="py-2"
              width={"70"}
              height={"70"}
            />
          </Link>
        </div>
        <div className="mr-2 px-2 items-center space-x-4 sm:flex ">
          <Search />
          <Bell />
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>NAME</AvatarFallback>
          </Avatar>
        </div>
      </div>
      {/* </MaxWidthWrapper> */}
    </nav>
  );
};

export default StudentNavbar;
