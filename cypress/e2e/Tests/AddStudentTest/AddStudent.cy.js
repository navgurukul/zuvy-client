/// <reference types="cypress" />
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import AddStudent from "../../Pages/AddStudentPage/AddStudent.cy";

Given("I am logged in", () => {
    AddStudent.login();
});

When("I visit the dashboard", () => {
    AddStudent.dashboard_visit();
});

And('I search for the course "Sample"', () => {
    AddStudent.searchCourse("Sample");
});

Then('I should see the course card for "Sample"', () => {
    AddStudent.verifyCourseCard("Sample");
});

When('I click on the course card for "Sample"', () => {
    AddStudent.clickCourseCard("Sample");
});

And("I navigate to the Students tab", () => {
    AddStudent.goToStudentsTab();
});

And('I click on the "Add Student" button', () => {
    AddStudent.clickAddStudentButton();
});

And('in the popup, I select the radio button "One at a time"', () => {
    AddStudent.selectOneAtATimeOption();
});

And('I enter the name of the student as {string}', (studentName) => {
    AddStudent.enterStudentName(studentName);
});

And('I enter the email of the student as {string}', (studentEmail) => {
    AddStudent.enterStudentEmail(studentEmail);
});

And('I click on the "Add Student" button in the popup', () => {
    AddStudent.confirmAddStudent();
});

Then('I should see a success message "1 Student Successfully Enrolled"', () => {
    AddStudent.verifySuccessMessage("1 Student Successfully Enrolled");
});

When('I search for the student {string} in the student list', (studentName) => {
    AddStudent.searchStudentInList(studentName);
});

Then('I should see {string} in the list of enrolled students', (studentName) => {
    AddStudent.verifyStudentInList(studentName);
});
