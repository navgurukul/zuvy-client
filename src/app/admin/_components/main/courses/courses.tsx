"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogOverlay, DialogTrigger } from "@/components/ui/dialog";
import Heading from "../../header";

import styles from "./cources.module.css";
import NewCourseDialog from "./newCourseDialog";
import api from "@/utils/axios.default";
interface Course {
  name: string;
  learnersCount: number;
  date: string;
  image: string; // URL for the course image
  id: string;
}

const Courses: React.FC = () => {
  // misc

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

  const filteredCourses = courses.filter(
    (course) =>
      course.name &&
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCourse = async () => {
    try {
      const response = await api.post("/bootcamp", { name: newCourseName });
      const data = response.data;
      setCourses((prevCourses) => [...prevCourses, data]);
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  // async
  useEffect(() => {
    try {
      api.get("/bootcamp").then((response) => setCourses(response.data));
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, []);

  // const handleCourseClick = (courseId: string) => {
  //   window.location.href = `course/${courseId}`;
  // };

  // const handleCardClick = (name: string, id: string) => {
  //   onMenuItemClick(name);
  //   courseId(id);
  // };

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
        <div className={styles.courceContainer}>
          {filteredCourses.length === 0 ? (
            <div className={styles.centeredContainer}>
              <h4 className={styles.firstCourseText}>
                Create your first course and share with students
              </h4>
              <Dialog>
                <DialogTrigger>
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
            filteredCourses.map((course, index) => (
              <Card
                key={index}
                className={styles.cardContainer}
                // onClick={() => handleCardClick(course.name, course.id)}
              >
                <div className={styles.courseImageContainer}>
                  <img
                    src="https://t4.ftcdn.net/jpg/03/78/40/11/360_F_378401105_9LAka9cRxk5Ey2wwanxrLTFCN1U51DL0.jpg"
                    alt={`Course: ${course.name}`}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
