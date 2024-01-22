"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PartyPopper } from "lucide-react";

import React from "react";
import Heading from "./_components/heading";
import { Stat } from "./_components/stat";
import Schedule from "./_components/schedule";
import Doubt from "./_components/doubt";

function Page() {
  return (
    <div>
      <Heading />
      <Alert className="text-start bg-accent-foreground ">
        <PartyPopper className="h-4 w-4" color="#082f49" strokeWidth={2.5} />
        <AlertTitle className="text-primary">Congratulations!</AlertTitle>
        <AlertDescription>
          Welcome to the Full Stack Development course at Zuvy. You are on route
          to becoming a star programmer. Happy coding!
        </AlertDescription>
      </Alert>
      {/* <div className="flex flex-wrap items-start my-3 gap-5">
        <div className="flex-1">
          <Schedule />
        </div>
        <div className="max-sm:w-full">
          <Stat />
          <Doubt className="mt-2" />
        </div>
      </div> */}
      <div className="flex flex-wrap items-stretch my-3 gap-5">
        <div className="flex-1">
          <Schedule />
        </div>
        <div className="max-sm:w-full">
          <Stat />
        </div>
      </div>
      <Doubt className="lg:fixed -bottom-2 right-6 mt-2" />
    </div>
  );
}

export default Page;
