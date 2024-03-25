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
import { getStoreStudentData } from "@/store/store";
import { fetchStudentData } from "@/utils/students";

const AddStudentsModal = ({
  id,
  message,
}: {
  id: number;
  message: boolean;
}) => {
  // misc
  interface Student {
    email: string;
    name: string;
  }

  type StudentDataState = Student[];

  // state and variables
  const [selectedOption, setSelectedOption] = useState("1");
  const [studentData, setStudentData] = useState<StudentDataState | any>({});
  const { setStoreStudentData } = getStoreStudentData();

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
      students:
        selectedOption === "1"
          ? studentData
          : [{ email: studentData.email, name: studentData.name }],
    };
    if (transformedObject) {
      const requestBody = transformedObject;
      try {
        const response = await api
          .post(`/bootcamp/students/${id}`, requestBody)
          .then((response) => {
            toast({
              title: response.data.status,
              description: response.data.message,
              className: "text-start capitalize",
            });
            fetchStudentData(id, setStoreStudentData);
          });
      } catch (error: any) {
        toast({
          title: "Error Adding Students",
          description: error?.data?.message,
          className: "text-start capitalize",
        });
        console.error("Error", error.message);
      }
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{message ? "New Batch" : "Add Students"}</DialogTitle>
        <span>
          {message
            ? "All the students are assigned to batches. Please add new students to create new batches"
            : ""}
        </span>
      </DialogHeader>
      <div className='flex items-center justify-start  '>
        {STUDENT_ONBOARDING_TYPES.map(({ id, label }) => (
          <RadioGroup
            key={id}
            value={selectedOption}
            onValueChange={handleStudentUploadType}
          >
            <div className='flex   space-x-2 mr-4'>
              <RadioGroupItem value={id} id={id} />
              <Label htmlFor={id}>{label}</Label>
            </div>
          </RadioGroup>
        ))}
      </div>
      {selectedOption === "2" && (
        <div className=''>
          <div className='text-left'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              name='name'
              value={studentData.name}
              onChange={handleSingleStudent}
            />
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              name='email'
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
            className='px-5 py-2 mt-10 border-dashed border-2 rounded-[10px] block'
          />
        </>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button type='submit' onClick={handleSubmit}>
            {selectedOption === "2" ? "Add Students" : "Add Students"}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddStudentsModal;
