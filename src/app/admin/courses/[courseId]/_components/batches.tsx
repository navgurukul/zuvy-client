"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import styles from "../../_components/courses.module.css";
import api from "@/utils/axios.config";
import Link from "next/link";
import Loader from "@/app/student/courses/_components/Loader";
import AddStudentsModal from "./addStudentsmodal";
import { toast } from "@/components/ui/use-toast";

const Batches = ({
  courseID,
  unassigned_students,
}: {
  courseID: string;
  unassigned_students: number;
}) => {
  const [batches, setBatches] = useState([]);
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await api.get(`/bootcamp/batches/${courseID}`);
        setBatches(response.data);
      } catch (error: any) {
        console.log(error.message);
      }
    };

    fetchBatches();
  }, [courseID]);

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Batch name must be at least 2 characters.",
    }),
    instructorId: z
      .string()
      .refine((instructorId) => !isNaN(parseInt(instructorId))),
    bootcampId: z.string().refine((bootcampId) => !isNaN(parseInt(bootcampId))),
    capEnrollment: z
      .string()
      .refine((capEnrollment) => !isNaN(parseInt(capEnrollment)), {
        message: "A cap enrollment is required",
      }),
  });

  const { handleSubmit, register } = useForm({
    resolver: zodResolver(formSchema),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      instructorId: "",
      bootcampId: courseID,
      capEnrollment: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const convertedData = {
      ...values,
      instructorId: +values.instructorId,
      bootcampId: +values.bootcampId,
      capEnrollment: +values.capEnrollment,
    };
    try {
      const response = await api
        .post(`/batch`, convertedData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          const fetchBatches = async () => {
            try {
              const response = await api.get(`/bootcamp/batches/${courseID}`);
              setBatches(response.data);
            } catch (error: any) {
              console.log(error.message);
            }
          };
          fetchBatches();

          toast({
            title: response.data.status,
            description: response.data.message,
            className: "text-start capitalize",
          });
        });
      console.log("Batch created successfully");
    } catch (error) {
      console.error("Error creating batch:", error);
    }
  };

  const renderModal = () => {
    if (unassigned_students === 0) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Batch</Button>
          </DialogTrigger>
          <DialogOverlay />
          <AddStudentsModal id={courseID} />
        </Dialog>
      );
    } else {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Batch</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Batch</DialogTitle>
              Unassigned Students in Records: {unassigned_students}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-8'
                >
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Batch Name' {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='instructorId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructor Id</FormLabel>
                        <FormControl>
                          <Input placeholder='20230' type='name' {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='capEnrollment'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cap Enrollment</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Cap Enrollment'
                            type='number'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormDescription>
                    {unassigned_students} students will be added to this batch
                    (Maximum current availability)
                  </FormDescription>
                  <div className='w-full flex flex-col items-end gap-y-5 '>
                    <DialogClose asChild>
                      <Button className='w-1/2' type='submit'>
                        Create batch
                      </Button>
                    </DialogClose>
                  </div>
                </form>
              </Form>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
    }
  };

  return (
    <div>
      <div className='flex items-center justify-between'>
        <Input type='search' placeholder='Search' className='w-1/2' />
        {renderModal()}
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mt-2'>
        {batches.length > 0 &&
          batches.map((batch: any, index: number) => (
            <Link key={batch.id} href={"/"} className='text-gray-900 text-base'>
              <div className='bg-white rounded-lg border p-4'>
                <div className='px-1 py-4 flex flex-col items-start'>
                  <h1 className='font-semibold capitalize'>{batch.name}</h1>
                  <h2 className=' capitalize'>
                    {batch.capEnrollment} <span>Learners</span>
                  </h2>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default Batches;
