/// <reference types="cypress" />
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import CreateModule from "../../Pages/CreateModulePage/CreateModule.cy";

Given("I am logged in", () => {
    CreateModule.login();
});

When("I visit the dashboard", () => {
    CreateModule.dashboardVisit();
});

And("I search for the course {string}", (courseName) => {
    CreateModule.searchCourse(courseName);
});

Then("I should see the course card for {string}", (courseName) => {
    CreateModule.verifyCourseCard(courseName);
});

When("I click on the course card for {string}", (courseName) => {
    CreateModule.clickCourseCard(courseName);
});

And("I go to the Curriculum tab", () => {
    CreateModule.goToCurriculumTab();
});

And('I click on the "Add Module" button', () => {
    CreateModule.clickAddModuleButton();
});

And("in the popup, I select the Learning Material radio button", () => {
    CreateModule.selectLearningMaterial();
});

And("I enter the module name as {string}", (moduleName) => {
    CreateModule.enterModuleName(moduleName);
});

And("I enter the module description as {string}", (moduleDescription) => {
    CreateModule.enterModuleDescription(moduleDescription);
});

And("I enter {string} in the months box, {string} in the weeks box, and {string} in the days box", (months, weeks, days) => {
    CreateModule.enterDuration(months, weeks, days);
});

And("I click on the Create Module button", () => {
    CreateModule.confirmCreateModule();
});

Then('I should see a success message "Module Created Successfully"', () => {
    CreateModule.verifySuccessMessage("Module Created Successfully");
});
