"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLazyLoadedStudentData } from "@/store/store";

type Props = {};

export default function Profile({}: Props) {
  const { studentData } = useLazyLoadedStudentData();
  return (
    <>

    </>
  );
}
