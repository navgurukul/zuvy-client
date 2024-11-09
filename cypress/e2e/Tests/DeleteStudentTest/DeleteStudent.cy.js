/// <reference types="cypress" />
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import DeleteStudent from "../../Pages/DeleteStudentPage/DeleteStudent.cy";

Given("I am logged in", () => {
    DeleteStudent.login();
});

When("I visit the dashboard", () => {
    DeleteStudent.dashboard_visit();
});

And('I search for the course "Sample"', () => {
    DeleteStudent.searchCourse("Sample");
});

Then('I should see the course card for "Sample"', () => {
    DeleteStudent.verifyCourseCard("Sample");
});

When('I click on the course card for "Sample"', () => {
    DeleteStudent.clickCourseCard("Sample");
});

And("I navigate to the Students tab", () => {
    DeleteStudent.goToStudentsTab();
});

And('I search for the student "Jenny Doe" in the student list', () => {
    DeleteStudent.searchStudent("Jenny Doe");
});

Then('I should see the email of the student as "Jenny.doe@example.com"', () => {
    DeleteStudent.verifyStudentEmail("Jenny.doe@example.com");
});

When('I click on the delete icon in the row for "Jenny Doe"', () => {
    DeleteStudent.clickDeleteStudentIcon("Jenny Doe");
});

And('I confirm deletion by clicking the "Continue" button in the confirmation popup', () => {
    DeleteStudent.confirmDeletion();
});

Then('I should see a success message "Student Successfully Deleted"', () => {
    DeleteStudent.verifySuccessMessage("Student Successfully Deleted");
});
