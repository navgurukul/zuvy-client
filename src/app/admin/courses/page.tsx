"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Plus } from "lucide-react";
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

interface Course {
  name: string;
  learnersCount: number;
  date: string;
  coverImage: string; // URL for the course image
  id: string;
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
      api.get("/bootcamp").then((response) => setCourses(response.data));
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

  return (
    <div>
      <Heading title={"Courses"} />
      <div>
        <div className={styles.searchContainer}>
          <Input
            type="text"
            placeholder="Search"
            // className={styles.searchInput}
            className="max-w-[500px]"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button className="text-white bg-secondary">
                <Plus className="w-5 mr-2" />
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
        <div className="flex mt-5 mb-10">
          <div className="flex mr-2">
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

            <span> | </span>
          </div>
          <div>
            <p className="flex items-center bg-muted-foreground text-white py-1 px-2 rounded-md">
              All Partners <ChevronDown />
            </p>
          </div>
        </div>
        <div className="my-5 flex justify-center items-center">
          {courses.length === 0 ? (
            <div className="mt-24">
              <h4 className={styles.firstCourseText}>
                Create your first course and share with students
              </h4>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="text-white bg-secondary">
                    <Plus className="w-5 mr-2" />
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
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              {courses.map((course, index) => (
                <Card
                  key={index}
                  className="h-max w-[400px] cursor-pointer"
                  onClick={() => handleCardClick(course.id.toString())}
                >
                  <div className="bg-muted flex justify-center h-[200px] relative overflow-hidden rounded-sm">
                    <OptimizedImageWithFallback
                      src={course.coverImage}
                      alt={course.name}
                      fallBackSrc={"/logo_white.png"}
                    />
                  </div>
                  <div className="text-start px-4 py-3 bg-muted">
                    <p className="capitalize mb-2 font-semibold">
                      {course.name}
                    </p>
                    <div className="">
                      <span className={styles.learnersCount}>
                        {course.learnersCount} Learners
                      </span>
                      <span>{course.date}</span>
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
