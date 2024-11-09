/// <reference types="cypress" />
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import DeleteSession from "../../Pages/DeleteSessionPage/DeleteSession.cy";

Given("I am logged in", () => {
    DeleteSession.login();
});

When("I visit the dashboard", () => {
    DeleteSession.dashboardVisit();
});

And("I search for the course {string}", (courseName) => {
    DeleteSession.searchCourse(courseName);
});

Then("I should see the course card for {string}", (courseName) => {
    DeleteSession.verifyCourseCard(courseName);
});

When("I click on the course card for {string}", (courseName) => {
    DeleteSession.clickCourseCard(courseName);
});

And("I go to the Sessions tab", () => {
    DeleteSession.goToSessionsTab();
});

And("I navigate to the Upcoming tab", () => {
    DeleteSession.goToUpcomingTab();
});

And("I click on the delete icon on the session's card", () => {
    DeleteSession.clickDeleteIconOnSessionCard();
});

And("I click on the Delete Session button in the confirmation popup", () => {
    DeleteSession.confirmDeleteSession();
});

Then('I should see a success message {string}', (message) => {
    DeleteSession.verifySuccessMessage(message);
});
