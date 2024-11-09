/// <reference types="cypress" />
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import DeleteModule from "../../Pages/DeleteModulePage/DeleteModule.cy";

Given("I am logged in", () => {
    DeleteModule.login();
});

When("I visit the dashboard", () => {
    DeleteModule.dashboardVisit();
});

And("I search for the course {string}", (courseName) => {
    DeleteModule.searchCourse(courseName);
});

Then("I should see the course card for {string}", (courseName) => {
    DeleteModule.verifyCourseCard(courseName);
});

When("I click on the course card for {string}", (courseName) => {
    DeleteModule.clickCourseCard(courseName);
});

And("I go to the Curriculum tab", () => {
    DeleteModule.goToCurriculumTab();
});

And("I click on the delete icon on the Module card", () => {
    DeleteModule.clickDeleteIconOnModuleCard();
});

And("I click on the Delete Module button in the confirmation popup", () => {
    DeleteModule.confirmDeleteModule();
});

Then('I should see a success message "Module Deleted Successfully"', () => {
    DeleteModule.verifySuccessMessage("Module Deleted Successfully");
});
