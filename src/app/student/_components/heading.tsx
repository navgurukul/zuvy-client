"use client";
import dynamic from "next/dynamic";
import { useStore } from "../../../store/store";

function Heading() {
  const { studentData } = useStore();
  const user = studentData;

  const username = user.name?.split(" ");
  const newUserName =
    username?.[0].charAt(0).toUpperCase() +
    username?.[0].slice(1).toLowerCase();

  return (
    <div className='flex align-center justify-between text-start my-2 flex-wrap'>
      <h1 className='text-3xl font-semibold tracking-tight m-0'>
        Welcome back,{" "}
        <span className='text-muted-foreground'> {newUserName}!</span>
      </h1>
      <div className='text-sm font-medium tracking-tight sm:text-end max-sm:mt-2 text-start'>
        <p className='m-0'>
          Batch: <span className='text-muted-foreground'>Alpha</span>
        </p>
        <p className='m-0'>
          Course:{" "}
          <span className='text-muted-foreground '>
            {" "}
            Amazon Coding Bootcamp{" "}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Heading;
