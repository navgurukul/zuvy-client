import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/utils/axios.config";

import styles from "../../_components/cources.module.css";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Calendar } from "@/components/ui/calendar";
import { ENROLLMENT_CAP } from "@/utils/constant";
import { Input } from "@/components/ui/input";
import CalendarInput from "@/app/_components/calendarInput";
import { toast } from "@/components/ui/use-toast";

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
function DateTimePicker({
  label,
  dateTime,
  setDateTime,
}: {
  label: any;
  dateTime: any;
  setDateTime: any;
}) {
  const handleDateChange = (event: { target: { value: any } }) => {
    const newDate = event.target.value;
    const time = dateTime.toISOString().split("T")[1];
    setDateTime(new Date(`${newDate}T${time}`));
  };

  const handleTimeChange = (event: { target: { value: any } }) => {
    const date = dateTime.toISOString().split("T")[0];
    const newTime = event.target.value;
    setDateTime(new Date(`${date}T${newTime}:00.000Z`));
  };
  const currentDate = new Date().toISOString().split("T")[0];
  return (
    <div className='my-6'>
      <Label htmlFor={`${label}DateTime`}>{label}:</Label>
      <div className='flex'>
        <input
          type='date'
          value={dateTime.toISOString().split("T")[0]}
          onChange={handleDateChange}
          min={currentDate}
        />
        <input
          type='time'
          value={dateTime.toISOString().split("T")[1].slice(0, 5)}
          onChange={handleTimeChange}
        />
      </div>
    </div>
  );
}

const NewClassDialog = ({
  courseId,
  bootcampData,
}: {
  courseId: string;
  bootcampData: Object;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());
  const [batchId, setBatchId] = useState("");
  const [attendeesInput, setAttendeesInput] = useState("");
  // const [bootcampData, setBootcampData] = useState([]);
  const [isDialogOpen, setDialogOpen] = useState(true);

  // useEffect(() => {
  //   api
  //     .get(`/bootcamp/batches/${courseId}`)
  //     .then((response) => {
  //       const transformedData = response.data.map(
  //         (item: { id: any; name: any }) => ({
  //           value: item.id.toString(),
  //           label: item.name,
  //         })
  //       );
  //       setBootcampData(transformedData);
  //     })
  //     .catch((error) => {
  //       console.log("Error fetching data:", error);
  //     });
  // }, [courseId]);

  console.log("COMBO", bootcampData);

  const handleComboboxChange = (value: string) => {
    setBatchId(value);
  };

  const handleCreateCourse = async () => {
    const attendeesArray = attendeesInput.split(", ");

    const userIdLocal = JSON.parse(localStorage.getItem("AUTH") || "");
    const newCourseData = {
      title,
      description,
      startDateTime,
      endDateTime,
      timeZone: "Asia/Kolkata",
      attendees: [],
      batchId,
      bootcampId: courseId.toString(),
      userId: userIdLocal.id,
      roles: userIdLocal.rolesList,
    };

    try {
      const postClass = await api.post(`/classes`, newCourseData);
      if (postClass.data.status == "success") {
        toast({
          title: "class created successfully",
          variant: "default",
          className: "text-start capitalize",
        });
        setDialogOpen(false);
      }

      return postClass;
    } catch (error) {
      toast({
        title: "class creation failed",
        variant: "default",
        className: "text-start capitalize",
      });
      console.error("Error creating class:", error);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className={styles.newCourse}>New Class</DialogTitle>
        <DialogDescription className='text-start'>
          <div className='my-6'>
            <Label htmlFor='name'>Class Title</Label>
            <Input
              type='text'
              id='name'
              placeholder='Enter Class title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className='my-6'>
            <Label htmlFor='description'>Description:</Label>
            <Input
              type='text'
              id='description'
              placeholder='Enter course description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className='my-6'>
            <DateTimePicker
              label='Start Date'
              dateTime={startDateTime}
              setDateTime={setStartDateTime}
            />
          </div>
          <div className='my-6'>
            <DateTimePicker
              label='End Date'
              dateTime={endDateTime}
              setDateTime={setEndDateTime}
            />
          </div>

          <div className='my-6'>
            <Label htmlFor='batchId'>Batch:</Label>
            <Combobox
              data={bootcampData}
              title={"Select Batch"}
              onChange={handleComboboxChange}
            />
          </div>
          <DialogClose asChild>
            <div className='text-end'>
              <Button onClick={handleCreateCourse}>Create Class</Button>
            </div>
          </DialogClose>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  );
};

export default NewClassDialog;
