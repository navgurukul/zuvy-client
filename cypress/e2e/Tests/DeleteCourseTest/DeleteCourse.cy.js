/// <reference types="cypress" />
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import DeleteCourse from "../../Pages/DeleteCoursePage/DeleteCourse.cy";

Given("I am logged in", () => {
    DeleteCourse.login();
});

When("I visit the dashboard", () => {
    DeleteCourse.dashboard_visit();
});

And('I search for the course "Sample"', () => {
    DeleteCourse.searchCourse("Sample");
});

Then('I should see the course card for "Sample"', () => {
    DeleteCourse.verifyCourseCard("Sample");
});

When('I click on the course card for "Sample"', () => {
    DeleteCourse.clickCourseCard("Sample");
});

And("I navigate to the settings tab", () => {
    DeleteCourse.goToSettingsTab();
});

And('I click on the "Delete Course" button', () => {
    DeleteCourse.clickDeleteCourseButton();
});

And("I confirm deletion in the confirmation popup", () => {
    DeleteCourse.confirmDeletion();
});

Then('I should see a success message "Bootcamp Deleted Successfully"', () => {
    DeleteCourse.verifyDeletionSuccessMessage();
});
