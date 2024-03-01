"use client";

import { useEffect, useState } from "react";
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
import api from "@/utils/axios.config";
import { useLazyLoadedStudentData } from "@/store/store";
import Link from "next/link";

interface ResumeCourse {
  bootcamp_name?: string;
  module_name?: string;
  bootcampId?: number;
  moduleId?: number;
}

type ScheduleProps = React.ComponentProps<typeof Card>;

function Schedule({ className, ...props }: ScheduleProps) {
  const [courseStarted, setCourseStarted] = useState<boolean>(false);
  const { studentData } = useLazyLoadedStudentData();
  const userID = studentData?.id && studentData?.id;
  const [resumeCourse, setResumeCourse] = useState<ResumeCourse>({});

  useEffect(() => {
    const getResumeCourse = async () => {
      try {
        const response = await api.get(`/tracking/latest/learning/${userID}`);
        setResumeCourse(response.data);
        // If we get res, then course started, hence courseStarted: true;
        setCourseStarted(true);
      } catch (error) {
        console.error("Error getting resume course:", error);
        if (
          (error as any)?.response?.data?.message ===
          `Cannot read properties of undefined (reading 'moduleId')`
        ) {
          setCourseStarted(false);
        }
      }
    };
    if (userID) getResumeCourse();
  }, [userID]);
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
        {courseStarted ? (
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
                      {resumeCourse?.bootcamp_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {resumeCourse.module_name}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse.moduleId}`}
                >
                  <Button>Continue</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : null}
        {/* <Card className={cn("text-start w-full mt-3", className)} {...props}>
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
        </Card> */}
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
