import React from "react";

import CurricullumCard from "../_components/curricullumCard";

const Curricullum = () => {
  const arr1 = [1, 2, 3];
  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='items-start w-2/5'>
        <h1 className='font-semibold text-xl text-start mb-2 '>
          Courses has 5 Modules
        </h1>
      </div>
      {arr1.map((item) => {
        return (
          <CurricullumCard
            key={item}
            chapterTitle={"Module 1: Programming Basics 1"}
            chapterdescription={
              "Students learn basic concepts of programming and create their first program"
            }
            time={"2 weeks"}
            assignments={3}
            quiz={1}
          />
        );
      })}
    </div>
  );
};

export default Curricullum;
