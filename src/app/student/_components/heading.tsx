"use client";
import React from "react";
import { useLazyLoadedStudentData } from "@/store/store";
function Heading() {
  const { studentData } = useLazyLoadedStudentData();
  const username: string[] | undefined = studentData?.name?.split(" ");
  const newUserName: string | undefined =
    username?.[0]?.charAt(0)?.toUpperCase() +
    (username?.[0]?.slice(1)?.toLowerCase() || "");
  console.log(newUserName);

  return (
    <div className="flex align-center justify-between text-start my-2 flex-wrap">
      <h1 className="text-3xl font-semibold tracking-tight m-0">
        Welcome back, <span className="text-secondary"> {newUserName}!</span>
      </h1>
      {/* <div className="text-sm font-medium tracking-tight sm:text-end max-sm:mt-2 text-start">
        <p className="m-0">
          Batch: <span className="text-muted-foreground">Alpha</span>
        </p>
        <p className="m-0">
          Course:{" "}
          <span className="text-muted-foreground ">
            {" "}
            Amazon Coding Bootcamp{" "}
          </span>
        </p>
      </div> */}
    </div>
  );
}

export default Heading;
