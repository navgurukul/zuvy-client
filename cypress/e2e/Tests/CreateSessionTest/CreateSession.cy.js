/// <reference types="cypress" />
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import CreateSession from "../../Pages/CreateSessionPage/CreateSession.cy";

Given("I am logged in", () => {
    CreateSession.login();
});

When("I navigate inside the course", () => {
    CreateSession.dashboardVisit();
});

And("I search for the course {string}", (courseName) => {
    CreateSession.searchCourse(courseName);
});

And("I click on the course card for {string}", (courseName) => {
    CreateSession.clickCourseCard(courseName);
});

And("I go to the Sessions tab", () => {
    CreateSession.goToSessionsTab();
});

And('I click on the "Create Session" button', () => {
    CreateSession.clickCreateSessionButton();
});

And('in the popup, I enter the session name as {string}', (sessionName) => {
    CreateSession.enterSessionName(sessionName);
});

And("I click on the Classes Start Date box", () => {
    CreateSession.openStartDateCalendar();
});

And("I select a date two days after the current date from the calendar", () => {
    CreateSession.selectDateTwoDaysAfterToday();
});

And("I close the calendar popup", () => {
    CreateSession.closeCalendarPopup();
});

And("I enter the start time as {string}", (startTime) => {
    CreateSession.enterStartTime(startTime);
});

And("I enter the end time as {string}", (endTime) => {
    CreateSession.enterEndTime(endTime);
});

And("I click on the Batches dropdown and select a batch", () => {
    CreateSession.openBatchesDropdown();
    CreateSession.selectBatch("Batch A"); // Replace "Batch A" with the actual batch name if necessary
    CreateSession.closeBatchesDropdown();
});

And("I click on the Days of Week dropdown", () => {
    CreateSession.openDaysOfWeekDropdown();
});

And("I select the days of the week as {string}", (days) => {
    const daysArray = days.split(", ");
    CreateSession.selectDaysOfWeek(daysArray);
});

And("I close the Days of Week dropdown", () => {
    CreateSession.closeDaysOfWeekDropdown();
});

Then("I should see the number of days autofilled with {string}", (expectedDays) => {
    CreateSession.verifyNumberOfDays(expectedDays);
});

When("I click on the Create Session button", () => {
    CreateSession.confirmCreateSession();
});

Then('I should see a success message "Created Classes Successfully"', () => {
    CreateSession.verifySuccessMessage("Created Classes Successfully");
});
