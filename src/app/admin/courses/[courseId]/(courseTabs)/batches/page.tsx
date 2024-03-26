"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

import AddStudentsModal from "../../_components/addStudentsmodal";
import api from "@/utils/axios.config";
import { getCourseData } from "@/store/store";

const Page = ({}: {}) => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const { courseData } = getCourseData();
  const [unassignedStudents, setUnassignedStudents] = useState(
    courseData?.unassigned_students
  );

  useEffect(() => {
    if (courseData?.id) {
      const fetchBatches = async () => {
        try {
          const response = await api.get(`/bootcamp/batches/${courseData?.id}`);
          setBatches(response.data.data);
          // setUnassignedStudents(data.bootcamp.unassigned_students);
        } catch (error: any) {
          console.log(error.message);
        }
      };

      fetchBatches();
    }
  }, [courseData]);

  useEffect(() => {
    if (courseData?.id) {
      const fetchCourseDetails = async () => {
        try {
          const response = await api.get(`/bootcamp/${courseData?.id}`);
          setUnassignedStudents(response.data.bootcamp.unassigned_students);
        } catch (error) {
          console.error("Error fetching course details:", error);
        }
      };

      fetchCourseDetails();
    }
  }, [courseData?.id, setUnassignedStudents]);

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Batch name must be at least 2 characters.",
    }),
    instructorId: z
      .string()
      .refine((instructorId) => !isNaN(parseInt(instructorId))),
    bootcampId: z.string().refine((bootcampId) => !isNaN(parseInt(bootcampId))),
    capEnrollment: z.string().refine(
      (capEnrollment) => {
        const parsedValue = parseInt(capEnrollment);
        return !isNaN(parsedValue) && parsedValue >= 0;
      },
      {
        message: "Cap enrollment must be a non-negative number",
      }
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      instructorId: "",
      bootcampId: courseData?.id.toString() ?? "",
      capEnrollment: "",
    },
    values: {
      name: "",
      instructorId: "",
      bootcampId: courseData?.id.toString() ?? "",
      capEnrollment: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // const convertedData = {
    //   ...values,
    //   instructorId: +values.instructorId,
    //   bootcampId: +values.bootcampId,
    //   capEnrollment: +values.capEnrollment,
    // };
    // console.log(convertedData);
    // try {
    //   await api
    //     .post(`/batch`, convertedData, {
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     })
    //     .then((response) => {
    //       const fetchBatches = async () => {
    //         try {
    //           const response = await api.get(
    //             `/bootcamp/batches/${courseData?.id || ""}`
    //           );
    //           setBatches(response.data);
    //         } catch (error: any) {
    //           console.log(error.message);
    //         }
    //       };
    //       fetchBatches();

    //       toast({
    //         title: response.data.status,
    //         description: response.data.message,
    //         className: "text-start capitalize",
    //       });
    //     });
    // } catch (error: any) {
    //   toast({
    //     title: "Failed",
    //     description: error.data.message,
    //     className: "text-start capitalize",
    //     variant: "destructive",
    //   });
    //   console.error("Error creating batch:", error);
    // }
  };

  const renderModal = (emptyState: boolean) => {
    if (unassignedStudents === 0) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button>{emptyState ? "+ Create Batch" : "New Batch"}</Button>
          </DialogTrigger>
          <DialogOverlay />
          <AddStudentsModal message={true} id={courseData?.id || ""} />
        </Dialog>
      );
    } else {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button>{emptyState ? "+ Create Batch" : "New Batch"}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Batch</DialogTitle>
              Unassigned Students in Records: {courseData?.unassigned_students}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  onError={(e) => console.log(e, "error")}
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
                            type='name'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormDescription>
                    {unassignedStudents} students will be added to this batch
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
      <div className=' relative flex items-center justify-between mb-6'>
        {batches.length > 0 ? (
          <Input type='search' placeholder='Search' className='w-[400px]' />
        ) : null}
        {renderModal(false)}
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mt-2'>
        {batches.length > 0 ? (
          batches.map((batch: any, index: number) => (
            <Link
              key={batch.name}
              href={`/admin/courses/${courseData?.id}/batch/${batch.id}`}
            >
              <Card key={batch.id} className='text-gray-900 text-base'>
                <div className='bg-white rounded-lg border p-4'>
                  <div className='px-1 py-4 flex flex-col items-start'>
                    <CardTitle className='font-semibold capitalize'>
                      {batch.name}
                    </CardTitle>
                    <CardDescription className=' capitalize'>
                      {batch.students_enrolled} <span>Learners</span>
                    </CardDescription>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <div className='w-full flex flex-col items-center justify-center gap-y-3 absolute'>
            <Image
              src='/batches.svg'
              alt='create batch'
              width={100}
              height={100}
            />
            <p>
              Start by creating the first batch for the course. Learners will
              get added automatically based on enrollment cap
            </p>
            {renderModal(true)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
