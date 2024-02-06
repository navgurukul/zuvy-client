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

  const handleNewCourseNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewCourseName(event.target.value);
  };

  const handleCreateCourse = async () => {
    try {
      const response = await api.post("/bootcamp", { name: newCourseName });
      const data = response.data;
      setCourses((prevCourses) => [...prevCourses, data]);
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const handleCardClick = (id: string) => {
    router.push(`courses/${id}`);
  };

  // async
  useEffect(() => {
    try {
      api.get("/bootcamp").then((response) => setCourses(response.data));
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, []);

  return (
    <div>
      <Heading title={"Courses"} />
      <div>
        <div className={styles.searchContainer}>
          <Input
            type="text"
            placeholder="Search"
            className={styles.searchInput}
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Dialog>
            <DialogTrigger>
              <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-white hover:bg-primary h-10 px-4 py-2">
                <Plus className="w-5 mr-2" />
                <p>New Course</p>
              </div>
            </DialogTrigger>
            <DialogOverlay />
            <NewCourseDialog
              newCourseName={newCourseName}
              handleNewCourseNameChange={handleNewCourseNameChange}
              handleCreateCourse={handleCreateCourse}
            />
          </Dialog>
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.content}>
            <span
              className={activeFilter === "all" ? `${styles.active}` : ""}
              onClick={() => handleFilterClick("all")}
            >
              All
            </span>
            <span
              className={activeFilter === "active" ? `${styles.active}` : ""}
              onClick={() => handleFilterClick("active")}
            >
              Active
            </span>
            <span
              className={activeFilter === "completed" ? `${styles.active}` : ""}
              onClick={() => handleFilterClick("completed")}
            >
              Completed
            </span>
            <span> | </span>
          </div>
          <div>
            <span className={styles.filterDropdown}>
              All Partners &nbsp; <ChevronDown />
            </span>
          </div>
        </div>
        <div className="my-5 flex justify-center items-center">
          {courses.length === 0 ? (
            <div className="mt-24">
              <h4 className={styles.firstCourseText}>
                Create your first course and share with students
              </h4>
              <Dialog>
                <DialogTrigger>
                  <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-white hover:bg-primary h-10 px-4 py-2">
                    <Plus className="w-5 mr-2" />
                    <p>New Course</p>
                  </div>
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
            <div className="grid grid-cols-3 gap-3">
              {courses.map((course, index) => (
                <Card
                  key={index}
                  className="h-max w-[400px] cursor-pointer"
                  onClick={() => handleCardClick(course.id.toString())}
                >
                  <div className="bg-muted flex justify-center">
                    <OptimizedImageWithFallback
                      src={course.coverImage}
                      alt={course.name}
                      fallBackSrc={"/logo_white.png"}
                      className={styles.courseImage}
                    />
                  </div>
                  <div className={styles.courseDetails}>
                    <span className={styles.nameText}>{course.name}</span>
                  </div>
                  <div className={styles.courseDetails}>
                    <span className={styles.learnersCount}>
                      {course.learnersCount} Learners
                    </span>
                    <span>{course.date}</span>
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
