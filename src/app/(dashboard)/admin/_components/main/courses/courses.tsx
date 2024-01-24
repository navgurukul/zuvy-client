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
  name: string;
  learnersCount: number;
  date: string;
  image: string; // URL for the course image
  id: string; 
}



const Courses: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseName, setNewCourseName] = useState<string>("");
  const MAIN_URL = process.env.MAIN_URL
  const handleFilterClick = (filter: "all" | "active" | "completed") => {
    setActiveFilter(filter);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleNewCourseNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCourseName(event.target.value);
  };

  const handleCreateCourse = () => {
    fetch(`${MAIN_URL}/bootcamp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newCourseName,
      }),
    })
      .then(response => response.json())
      .then(data => {
        setCourses(prevCourses => [...prevCourses, data]);
      })
      .catch(error => console.error('Error creating course:', error));
  };

  useEffect(() => {
    fetch(`${MAIN_URL}/bootcamp`)
      .then(response => response.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Error fetching courses:', error));
  }, []);

  // const handleCourseClick = (courseId: string) => {
  //   window.location.href = `course/${courseId}`;
  // };

  const filteredCourses = courses.filter((course) =>
    course.name && course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // const handleCardClick = (name: string, id: string) => {
  //   onMenuItemClick(name);
  //   courseId(id);
  // };
  

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
                <DialogDescription>
                  <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="name" className={styles.dialogname}>Course Name:</label>
                    <input type="text" id="name" placeholder="Enter course name" className={styles.inputBox} value={newCourseName} onChange={handleNewCourseNameChange}/>
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
              <Button className={styles.newCourseBtn}>
                {" "}
                + New Course
              </Button>
            </DialogTrigger>
            <DialogOverlay />
            <DialogContent>
              <DialogHeader>
                <DialogTitle className={styles.newCourse}>New Course</DialogTitle>
                <DialogDescription>
                  <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="name" className={styles.dialogname}>Course Name:</label>
                    <input type="text" id="name" placeholder="Enter course name" className={styles.inputBox} value={newCourseName} onChange={handleNewCourseNameChange}/>
                  </div>
                  <Button onClick={() => handleCreateCourse()} className={styles.createCourseBtnDialog}>
                    Create Course
                  </Button>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
              <hr className={styles.hrLine} />
              <p className={styles.needHelpText}>Need help getting started? Checkout the tutorials below</p>
            </div>
          ) : (
            filteredCourses.map((course, index) => (
              <Card
                key={index}
                className={styles.cardContainer}
                onClick={() => handleCardClick(course.name, course.id)}
              >
                <div className={styles.courseImageContainer}>
                  <img
                    src='https://t4.ftcdn.net/jpg/03/78/40/11/360_F_378401105_9LAka9cRxk5Ey2wwanxrLTFCN1U51DL0.jpg'
                    alt={`Course: ${course.name}`}
                    className={styles.courseImage}
                  />
                </div>
                <div className={styles.courseDetails}>
                  <span className={styles.nameText}>{course.name}</span>
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
