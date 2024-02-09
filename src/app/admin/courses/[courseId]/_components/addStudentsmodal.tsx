"use client";
// components/TwoOptionsModal.tsx

import React, { useState } from "react";

import * as z from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Dropzone from "./dropzone";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import api from "@/utils/axios.config";
import { toast } from "@/components/ui/use-toast";
import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";
interface TwoOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}
interface FormData {
  studentName: string;
  studentEmail: string;
}
const formSchema = z.object({
  studentName: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  studentEmail: z.string().email(),
});

const AddStudentsModal: React.FC<TwoOptionsModalProps> = ({
  isOpen,
  onClose,
  id,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    "Bulk Upload"
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      studentEmail: "",
    },
  });
  const [input1Value, setInput1Value] = useState("");
  const [input2Value, setInput2Value] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [studentData, setStudentData] = useState<{}>();
  const [closeModal, setCloseModal] = useState<boolean>(true);
  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    // Reset values when switching options
    setInput1Value("");
    setInput2Value("");
    setFile(null);
  };
  const handleCloseModal = () => {
    setCloseModal((prevState) => !prevState);
  };

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(data);
    const transformedObject = {
      students: [
        {
          email: data.studentEmail,
          name: data.studentName,
        },
      ],
    };
    if (data) {
      const requestBody = transformedObject;
      console.log(requestBody);
      try {
        const response = await api
          .post(`/bootcamp/students/${id}`, requestBody, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            console.log("Response", response.data);
            toast({
              title: response.data.status,
              description: response.data.message,
              className: "text-start capitalize",
            });
          });
      } catch (error: any) {
        toast({
          title: "Failed",
          variant: "destructive",
          // description: error.message,
        });
        console.error("Error", error.message);
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "inline" : "hidden"
      } overflow-y-auto p-4`}
    >
      <div className='flex items-center justify-center min-h-screen '>
        <div className='bg-white p-7 rounded-lg shadow-lg w-[500px]  '>
          <div className='flex justify-between'>
            <DialogTitle className='text-xl font-semibold mb-4'>
              Add Students
            </DialogTitle>
            <button onClick={onClose}>
              <X size={20} className='text-gray-400' />
            </button>
          </div>
          <div className='flex items-center justify-start  '>
            <label className='block mb-2'>
              <input
                type='radio'
                name='options'
                checked={selectedOption === "Bulk Upload"}
                onChange={() => handleOptionClick("Bulk Upload")}
                className='mx-2'
              />
              Bulk Upload
            </label>
            <label className='block mb-2'>
              <input
                type='radio'
                name='options'
                checked={selectedOption === "One at a time"}
                onChange={() => handleOptionClick("One at a time")}
                className='mx-2'
              />
              One at a time
            </label>
          </div>
          {selectedOption === "One at a time" && (
            <div className=''>
              <Form {...form}>
                <FormLabel className=' my-4 flex flex-start'>
                  Student Name
                </FormLabel>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <FormField
                    control={form.control}
                    name='studentName'
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder='Student name'
                              type='text'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormLabel className='my-4 flex flex-start'>Email</FormLabel>
                  <FormField
                    control={form.control}
                    name='studentEmail'
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder='Student Email'
                              type='email'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <div className='w-full flex flex-row justify-end m-3 p-3 '>
                    <Button type='submit' className=''>
                      Add Students
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
          {selectedOption === "Bulk Upload" && (
            <>
              <Dropzone
                id={id}
                className='px-5 py-2 mt-10 border-dashed border-2 rounded-[10px] block'
              />

              {/* <div className='fixed inset-0 bg-gray-700 opacity-25 z-50'></div> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudentsModal;
