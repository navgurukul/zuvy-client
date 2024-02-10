"use client";
// components/TwoOptionsModal.tsx

import React, { useState } from "react";
import Dropzone from "./dropzone";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/utils/axios.config";
import { toast } from "@/components/ui/use-toast";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { STUDENT_ONBOARDING_TYPES } from "@/utils/constant";

const AddStudentsModal = ({ id }: { id: string }) => {
  // misc
  interface Student {
    email: string;
    name: string;
  }

  type StudentDataState = Student[];

  // state and variables
  const [selectedOption, setSelectedOption] = useState("1");
  const [studentData, setStudentData] = useState<StudentDataState | any>({});

  // func
  const handleSingleStudent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };

  const handleStudentUploadType = (value: string) => {
    setSelectedOption(value);
  };

  // async
  const handleSubmit = async () => {
    const transformedObject = {
      students: studentData,
    };
    if (transformedObject) {
      const requestBody = transformedObject;
      try {
        const response = await api
          .post(`/bootcamp/students/${id}`, requestBody, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            toast({
              title: response.data.status,
              description: response.data.message,
              className: "text-start capitalize",
            });
          });
      } catch (error: any) {
        console.error("Error", error.message);
      }
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Students</DialogTitle>
      </DialogHeader>
      <div className="flex items-center justify-start  ">
        {STUDENT_ONBOARDING_TYPES.map(({ id, label }) => (
          <RadioGroup
            key={id}
            value={selectedOption}
            onValueChange={handleStudentUploadType}
          >
            <div className="flex items-center space-x-2 mr-4">
              <RadioGroupItem value={id} id={id} />
              <Label htmlFor={id}>{label}</Label>
            </div>
          </RadioGroup>
        ))}
      </div>
      {selectedOption === "2" && (
        <div className="">
          <div className="text-left">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={studentData.name}
              onChange={handleSingleStudent}
            />
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={studentData.email}
              onChange={handleSingleStudent}
            />
          </div>
        </div>
      )}
      {selectedOption === "1" && (
        <>
          <Dropzone
            studentData={studentData}
            setStudentData={setStudentData}
            className="px-5 py-2 mt-10 border-dashed border-2 rounded-[10px] block"
          />
        </>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button type="submit" onClick={handleSubmit}>
            Add Student(s)
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddStudentsModal;
