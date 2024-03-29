"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, GraduationCap, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogOverlay, DialogTrigger } from "@/components/ui/dialog";
import Heading from "../_components/header";
import NewCourseDialog from "./_components/newCourseDialog";
import api from "@/utils/axios.config";
import OptimizedImageWithFallback from "@/components/ImageWithFallback";

import styles from "./_components/cources.module.css";
import { COURSE_FILTER } from "@/utils/constant";
import Link from "next/link";
import Image from "next/image";

interface Course {
  name: string;
  learnersCount: number;
  date: string;
  coverImage: string; // URL for the course image
  id: string;
  students_in_bootcamp: number;
}

const Courses: React.FC = () => {
  // misc
  const router = useRouter();

  // state and variables
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "completed"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseName, setNewCourseName] = useState<string>("");

  // func
  const handleFilterClick = (filter: "all" | "active" | "completed") => {
    setActiveFilter(filter);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const getBootcamp = () => {
    try {
      api.get("/bootcamp").then((response) => setCourses(response.data.data));
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleNewCourseNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewCourseName(event.target.value);
  };

  const handleCreateCourse = async () => {
    try {
      const response = await api.post("/bootcamp", { name: newCourseName });
      const data = response.data;
      getBootcamp();
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const handleCardClick = (id: string) => {
    router.push(`courses/${id}`);
  };

  // async
  useEffect(() => {
    getBootcamp();
  }, []);

  console.log(courses);

  return (
    <div>
      <Heading title={"Courses"} />
      <div>
        <div className={styles.searchContainer}>
          <Input
            type='text'
            placeholder='Search'
            // className={styles.searchInput}
            className='max-w-[500px]'
            value={searchQuery}
            onChange={handleSearchChange}
            disabled
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button className='text-white bg-secondary'>
                <Plus className='w-5 mr-2' />
                <p>New Course</p>
              </Button>
            </DialogTrigger>
            <DialogOverlay />
            <NewCourseDialog
              newCourseName={newCourseName}
              handleNewCourseNameChange={handleNewCourseNameChange}
              handleCreateCourse={handleCreateCourse}
            />
          </Dialog>
        </div>
        <div className='flex mt-5 mb-10'>
          {/* <div className="flex mr-2">
            {COURSE_FILTER.map((filter: any) => (
              <p
                key={filter}
                className={`${
                  activeFilter === filter
                    ? "bg-muted-foreground text-white"
                    : ""
                } capitalize mr-2 cursor-pointer py-1 px-2 rounded-md`}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </p>
            ))}

       
          </div> */}
          {/* <div>
            <p className="flex items-center bg-muted-foreground text-white py-1 px-2 rounded-md">
              All Partners <ChevronDown />
            </p>
          </div> */}
        </div>
        <div className='my-5 flex justify-center items-center'>
          {courses.length === 0 ? (
            <div className='mt-24'>
              <h4 className={styles.firstCourseText}>
                Create your first course and share with students
              </h4>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className='text-white bg-secondary'>
                    <Plus className='w-5 mr-2' />
                    <p>New Course</p>
                  </Button>
                </DialogTrigger>
                <DialogOverlay />
                <NewCourseDialog
                  newCourseName={newCourseName}
                  handleNewCourseNameChange={handleNewCourseNameChange}
                  handleCreateCourse={handleCreateCourse}
                />
              </Dialog>
              <hr className={styles.hrLine} />
              <p className={styles.needHelpText}>
                Need help getting started? Checkout the tutorials below
              </p>
              <div className=' m-0 flex items-center justify-center'>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4'>
                  <Link href={""}>
                    <div className='bg-white rounded-lg border p-4'>
                      <Image
                        src='https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym9va3N8ZW58MHx8MHx8fDA%3D'
                        alt='Placeholder Image'
                        className=' object-contain'
                        height={48}
                        width={300}
                      />
                      <div className='px-1 py-4'>
                        <div className='font-semibold text-xl mb-2'>
                          {" "}
                          How to create a new course
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex flex-wrap justify-center gap-3'>
              {courses.map((course, index) => (
                <Card
                  key={index}
                  className='h-max w-[400px] cursor-pointer'
                  onClick={() => handleCardClick(course.id.toString())}
                >
                  <div className='bg-muted flex justify-center h-[200px] relative overflow-hidden rounded-sm'>
                    <OptimizedImageWithFallback
                      src={course.coverImage}
                      alt={course.name}
                      fallBackSrc={"/logo_white.png"}
                    />
                  </div>
                  <div className='text-start px-4 py-3 bg-muted'>
                    <p className='capitalize mb-2 font-semibold'>
                      {course.name}
                    </p>
                    <div className='flex gap-2 items-center'>
                      <GraduationCap width={20} />
                      <span className='text-sm font-semibold'>
                        {course.students_in_bootcamp} Learners
                      </span>
                      {/* <span>{course.date}</span> */}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
