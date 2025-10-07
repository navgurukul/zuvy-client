"use client";
import Image from "next/image";
import React from "react";

function page() {
  return (
    <>
      <div className="flex justify-center my-20">
        <Image
          src="/under-construction.svg"
          alt="Under construction"
          width={500}
          height={500}
        />
      </div>
      <p className="text-xl font-semibold my-2">
        Dashboard
        <span className="text-green-700 text-xl font-bold ml-2">
          Under Construction
        </span>
      </p>
    </>
  );
}

export default page;
