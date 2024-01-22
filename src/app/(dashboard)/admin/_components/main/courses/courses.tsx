import React, { useState, useEffect } from "react";
import styles from "./cources.module.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Course {
  courseName: string;
  learnersCount: number;
  date: string;
  image: string; // URL for the course image
}

const Courses: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);

  const handleFilterClick = (filter: "all" | "active" | "completed") => {
    setActiveFilter(filter);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    // TODO: Change the API_ENDPOINT TO ORIGINAL ONE.
    fetch('BACKEND_API_ENDPOINT_FOR_FETCHING_COURSES ')
      .then(response => response.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Error fetching courses:', error));
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className={styles.header}>Courses</div>
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
              <Button className={styles.newCourseBtn}>
                {" "}
                + New Course
              </Button>
            </DialogTrigger>
            <DialogOverlay />
            <DialogContent>
              <DialogHeader>
                <DialogTitle className={styles.newCourse}>New Course</DialogTitle>
                <DialogDescription >
                  <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="courseName" className={styles.dialogCourseName}>Course Name:</label>
                    <input type="text" id="courseName" placeholder="Enter course name" className={styles.inputBox} />
                  </div>
                  <Button onClick={() => handleCreateCourse()} className={styles.createCourseBtnDialog}>
                    Create Course
                  </Button>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
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
              <h4 className={styles.firstCourseText}>Create your first course and share with students</h4>
              <Dialog>
                <DialogTrigger>
                  <Button variant="outline" className={styles.newCourseBtn}>
                    {" "}
                    + New Course
                  </Button>
                </DialogTrigger>
                <DialogOverlay />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Course</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <hr className={styles.hrLine} />
              <p className={styles.needHelpText}>Need help getting started? Checkout the tutorials below</p>
            </div>
          ) : (
            filteredCourses.map((course, index) => (
              <Card key={index} className={styles.cardContainer}>
                <div className={styles.courseImageContainer}>
                  <img
                    src={course.image}
                    alt={`Course: ${course.courseName}`}
                    className={styles.courseImage}
                  />
                </div>
                <div className={styles.courseDetails}>
                  <span className={styles.courseNameText}>{course.courseName}</span>
                </div>
                <div className={styles.courseDetails}>
                  <span className={styles.learnersCount}>{course.learnersCount} Learners</span>
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
