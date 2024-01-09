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
      <div className="flex-1">
        <Card
          className={cn("w-[380px] text-start w-full", className)}
          {...props}
        >
          <CardHeader className="bg-muted">
            <CardTitle>Upcoming sessions</CardTitle>
          </CardHeader>
          <CardContent className="grid p-3 gap-4">
            <div className=" flex items-center space-x-4 p-4">
              <PlaySquare />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  ReactJS: Server Side Rendering
                </p>
              </div>
              <div className="flex  space-x-4 items-center">
                <CalendarClock />
                <p className="text-sm text-muted-foreground">28th Jan, 19:00</p>
              </div>
            </div>
            <Separator />
            <div className=" flex items-center space-x-4 p-4">
              <GraduationCap />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Webinar on How to Crack MAANG
                </p>
              </div>
              <div className="flex  space-x-4 items-center">
                <CalendarClock />
                <p className="text-sm text-muted-foreground">29th Jan, 19:30</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn("w-[380px] text-start w-full mt-3", className)}
          {...props}
        >
          <CardHeader className="bg-muted">
            <CardTitle>Pick up where you left</CardTitle>
          </CardHeader>
          <CardContent className="p-3 grid gap-4">
            <div className=" flex items-center space-x-4 p-4">
              <BookOpenText />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">React: State</p>
                <p className="text-sm text-muted-foreground">
                  Create a basic counter
                </p>
              </div>
              <Button className="text-white bg-secondary">
                Continue solving
              </Button>
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
