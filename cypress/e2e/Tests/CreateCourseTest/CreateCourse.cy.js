/// <reference types="cypress" />
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import CreateCourse from "../../Pages/CreateCoursePage/CreateCourse.cy";

Given("I am logged in", () => {
    CreateCourse.login();
});

When("I visit the dashboard", () => {
    CreateCourse.dashboard_vist();
});

And('I check if a course with the name "Sample" exists', () => {
    CreateCourse.searchCourse('Sample');
    CreateCourse.checkIfCourseExists('Sample');
});

And('I create a course with the name "Sample" if it does not exist', () => {
    CreateCourse.createCourseIfNotExists('Sample');
});

Then('I should see the course card for "Sample"', () => {
    CreateCourse.verifyCourseCard('Sample');
});
