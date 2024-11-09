/// <reference types="cypress" />
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import AddBatch from "../../Pages/AddBatchPage/AddBatch.cy";

Given("I am logged in", () => {
    AddBatch.login();
});

When("I visit the dashboard", () => {
    AddBatch.dashboard_visit();
});

And('I search for the course "Sample"', () => {
    AddBatch.searchCourse("Sample");
});

Then('I should see the course card for "Sample"', () => {
    AddBatch.verifyCourseCard("Sample");
});

When('I click on the course card for "Sample"', () => {
    AddBatch.clickCourseCard("Sample");
});

And("I navigate to the Batches tab", () => {
    AddBatch.goToBatchesTab();
});

And('I click on the "New Batch" button', () => {
    AddBatch.clickNewBatchButton();
});

And('in the popup, I enter the batch name as {string}', (batchName) => {
    AddBatch.enterBatchName(batchName);
});

And('I enter the instructor\'s email as {string}', (email) => {
    AddBatch.enterInstructorEmail(email);
});

And('I enter the cap enrollment as {string}', (cap) => {
    AddBatch.enterCapEnrollment(cap);
});

And('I click the "Create Batch" button in the popup', () => {
    AddBatch.confirmCreateBatch();
});

Then('I should see a success message "Batch created successfully"', () => {
    AddBatch.verifySuccessMessage("Batch created successfully");
});
