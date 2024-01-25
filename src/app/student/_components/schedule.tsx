"use client";

import { useState } from "react";
// import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BookOpenText,
  Calendar,
  CalendarClock,
  GraduationCap,
  PlaySquare,
  SwitchCamera,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type ScheduleProps = React.ComponentProps<typeof Card>;

function Schedule({ className, ...props }: ScheduleProps) {
  return (
    <>
      <div className="">
        <Card className={cn("text-start w-full", className)} {...props}>
          <CardHeader className="bg-muted">
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent className="grid p-3 gap-4">
            <div className="flex flex-wrap justify-between items-center p-4">
              <div className="flex items-center">
                <PlaySquare />
                <p className="text-sm ml-2 font-medium leading-none">
                  ReactJS: Server Side Rendering
                </p>
              </div>
              <div className="flex items-center  max-sm:mt-2">
                <CalendarClock />
                <p className="text-sm ml-2 text-muted-foreground">
                  28th Jan, 19:00
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex flex-wrap justify-between items-center p-4">
              <div className="flex items-center">
                <GraduationCap />
                <p className="text-sm ml-2 font-medium leading-none">
                  Webinar on How to Crack MAANG
                </p>
              </div>
              <div className="flex items-center max-sm:mt-2">
                <CalendarClock />
                <p className="text-sm ml-2 text-muted-foreground">
                  28th Jan, 19:00
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(" text-start w-full mt-3", className)} {...props}>
          <CardHeader className="bg-muted">
            <CardTitle>Pick up where you left</CardTitle>
          </CardHeader>
          <CardContent className="p-3 grid gap-4">
            <div className=" flex flex-wrap items-center p-4 justify-between max-sm:justify-center gap-8">
              <div className="flex max-sm:text-center">
                <BookOpenText className="self-start max-sm:hidden" />
                <div className="flex-1 ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    React: State
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Create a basic counter
                  </p>
                </div>
              </div>

              <Button>Continue solving</Button>
            </div>
          </CardContent>
        </Card>
        <Card className={cn("text-start w-full mt-3", className)} {...props}>
          <CardHeader className="bg-muted">
            <CardTitle>Upcoming Submissions</CardTitle>
          </CardHeader>
          <CardContent className="grid p-3 gap-4">
            <div className="flex flex-wrap justify-between items-center p-4">
              <div className="flex items-center">
                <GraduationCap />
                <p className="text-sm ml-2 font-medium leading-none">
                  Quiz: Intro to variables
                </p>
              </div>
              <div className="flex items-center max-sm:mt-2">
                <CalendarClock />
                <p className="text-sm ml-2 text-muted-foreground">
                  5th Feb, 2024
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      /> */}
    </>
  );
}

export default Schedule;
