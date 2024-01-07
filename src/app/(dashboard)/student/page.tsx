"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PartyPopper } from "lucide-react";

import React from "react";
import Heading from "./_components/heading";
import { Stat } from "./_components/stat";
import Schedule from "./_components/schedule";

function page() {
  return (
    <div>
      <Heading />
      <Alert className="text-start bg-primary-foreground ">
        <PartyPopper className="h-4 w-4" color="#2f433a" strokeWidth={2.5} />
        <AlertTitle className="text-primary">Congratulations!</AlertTitle>
        <AlertDescription>
          Welcome to the Full Stack Development course at Zuvy. You are on route
          to becoming a star programmer. Happy coding!
        </AlertDescription>
      </Alert>
      <div className="flex items-start my-3 gap-5">
        <Schedule />
        <Stat />
      </div>
    </div>
  );
}

export default page;
