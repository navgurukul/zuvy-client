/// <reference types="cypress" />
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import DeleteBatch from "../../Pages/DeleteBatchPage/deletebatch.cy";

Given("I am logged in", () => {
    DeleteBatch.login();
});

When("I visit the dashboard", () => {
    DeleteBatch.dashboard_visit();
});

And('I search for the course "Sample"', () => {
    DeleteBatch.searchCourse("Sample");
});

Then('I should see the course card for "Sample"', () => {
    DeleteBatch.verifyCourseCard("Sample");
});

When('I click on the course card for "Sample"', () => {
    DeleteBatch.clickCourseCard("Sample");
});

And("I navigate to the Batches tab", () => {
    DeleteBatch.goToBatchesTab();
});

And('I search for the batch "Batch A" in the search bar', () => {
    DeleteBatch.searchBatch("Batch A");
});

Then('I should see the batch card for "Batch A"', () => {
    DeleteBatch.verifyBatchCard("Batch A");
});

When('I click on the batch card for "Batch A"', () => {
    DeleteBatch.clickBatchCard("Batch A");
});

And("I click on the delete icon", () => {
    DeleteBatch.clickDeleteIcon();
});

And('in the confirmation popup, I type the batch name as {string}', (batchName) => {
    DeleteBatch.enterBatchNameInPopup(batchName);
});

And('I click on the "Delete Batch" button', () => {
    DeleteBatch.confirmDeleteBatch();
});

Then('I should see a success message "Batch Deleted Successfully"', () => {
    DeleteBatch.verifySuccessMessage("Batch Deleted Successfully");
});
