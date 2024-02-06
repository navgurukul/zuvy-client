import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import styles from "../../_components/cources.module.css";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Calendar } from "@/components/ui/calendar";
import { ENROLLMENT_CAP } from "@/utils/constant";
import { Input } from "@/components/ui/input";
import CalendarInput from "@/app/_components/calendarInput";

// interface newClassDialogProps {
//   newCourseName: string;
//   handleNewCourseNameChange: (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => void;
//   handleCreateCourse: () => void;
// }

const data = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

const NewClassDialog = ({}) => {
  // state and variables
  const [date, setDate] = React.useState<Date>(new Date());
  const [cap, setCap] = React.useState<number>(50);

  const handleCap = (value: number) => {
    setCap(value);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className={styles.newCourse}>New Course</DialogTitle>
        <DialogDescription>
          <div className="my-6">
            <Label htmlFor="name">Batch Name:</Label>
            <Input
              type="text"
              id="name"
              placeholder="Enter course name"
              value={"New Class"}
            />
          </div>
          <div className="my-6">
            <Label htmlFor="date">Instructor:</Label>
            <Combobox data={data} title={"Select Instructor"} />
          </div>
          {/* <div className="my-6">
            <Label htmlFor="name">Date:</Label>
            <Calendar
              id="startDate"
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-0 flex justify-center"
              classNames={{ month: "rounded-md border p-3" }}
            />
          </div> */}

          <CalendarInput date={date} setDate={setDate} />
          <div className="my-6">
            <Label htmlFor="time">Time:</Label>
            <Input
              type="text"
              id="time"
              placeholder="Enter Time"
              // value=
            />
          </div>
          <div className={styles.labelInputContainer}>
            <Label>Enrollment Cap:</Label>
            <div>
              <div className="text-start mb-8">
                {ENROLLMENT_CAP.map((capValue) => (
                  <button
                    key={capValue}
                    onClick={() => handleCap(capValue)}
                    className={` px-2 py-1 mr-3 rounded-sm ${
                      cap === capValue
                        ? "bg-muted-foreground text-white"
                        : "bg-muted"
                    }`}
                  >
                    {capValue}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-end">
            <Button>Create Course</Button>
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  );
};

export default NewClassDialog;
