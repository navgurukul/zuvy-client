import { Input } from "@/components/ui/input";
import React from "react";
import RadioCheckbox from "../_components/radioCheckbox";
import InstructorCard from "../_components/instructorCard";

type Props = {};

const Recordings = (props: Props) => {
  return (
    <div>
      <h1 className='text-start text-lg font-semibold '>
        1:1 Meeting Recordings
      </h1>
      <Input type='search' placeholder='Search By Name' className='w-1/5' />
      <RadioCheckbox />
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4'>
        <InstructorCard
          batchName={"AFE + Navgurukul Basics"}
          date1={26}
          month={"Jan"}
          topicTitle={"1:1 Meet With Karan Singh"}
          classesTiming={"4:00 PM - 5:00 PM"}
          typeClass={"View"}
        />
        <InstructorCard
          batchName={"AFE + Navgurukul Basics"}
          date1={26}
          month={"Jan"}
          topicTitle={"1:1 Meet With Karan Singh"}
          classesTiming={"4:00 PM - 5:00 PM"}
          typeClass={"View"}
        />
        <InstructorCard
          batchName={"AFE + Navgurukul Basics"}
          date1={26}
          month={"Jan"}
          topicTitle={"1:1 Meet With Karan Singh"}
          classesTiming={"4:00 PM - 5:00 PM"}
          typeClass={"View"}
        />
        <InstructorCard
          batchName={"AFE + Navgurukul Basics"}
          date1={26}
          month={"Jan"}
          topicTitle={"1:1 Meet With Karan Singh"}
          classesTiming={"4:00 PM - 5:00 PM"}
          typeClass={"View"}
        />
        <InstructorCard
          batchName={"AFE + Navgurukul Basics"}
          date1={26}
          month={"Jan"}
          topicTitle={"1:1 Meet With Karan Singh"}
          classesTiming={"4:00 PM - 5:00 PM"}
          typeClass={"View"}
        />
      </div>
    </div>
  );
};

export default Recordings;
