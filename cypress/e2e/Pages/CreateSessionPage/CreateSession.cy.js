class CreateSession {
    dashboardVisit() {
        cy.visit("/admin/courses");
    }

    login() {
        cy.loginByJWT(); // Assuming there's a custom command for JWT login
    }

    searchCourse(courseName) {
        cy.get('input[placeholder="Search"]').clear().type(courseName); // Search for the course by name
    }

    verifyCourseCard(courseName) {
        cy.get('p.capitalize.font-semibold').should('contain.text', courseName); // Verify the course card displays the course name
    }

    clickCourseCard(courseName) {
        cy.get('p.capitalize.font-semibold').contains(courseName).click(); // Click the course card for the specified course
    }

    goToSessionsTab() {
        cy.get('a[href$="/admin/courses/491/sessions"]').click(); // Click the Sessions tab using href ending in /sessions
    }

    clickCreateSessionButton() {
        cy.contains('button', 'Create Session').click(); // Click the "Create Session" button
    }

    enterSessionName(sessionName) {
        cy.get('input[placeholder="Session Title"]').clear().type(sessionName); // Enter the session name
    }

    openStartDateCalendar() {
        cy.get('svg.lucide.lucide-calendar').click(); // Selects the date icon by its classes 
    }

    selectDateTwoDaysAfterToday() {
        const targetDay = new Date();
        targetDay.setDate(targetDay.getDate() + 2); // Add two days to the current date
        const day = targetDay.getDate();
    
        // Select the button with the calculated day
        cy.get('button[name="day"]').contains(day).click();
    }

    closeCalendarPopup() {
        cy.get('div[role="dialog"][data-state="open"] button.absolute.right-4.top-4') .click({ multiple: true, force: true, position: 'topRight' }); // This targets the SVG with the exact combination of classes

    }

    enterStartTime(startTime) {
        cy.get('input[placeholder="Start Time"]').clear().type(startTime); // Enter the start time
    }

    enterEndTime(endTime) {
        cy.get('input[placeholder="End Time"]').clear().type(endTime); // Enter the end time
    }

    openBatchesDropdown() {
        cy.get('input[placeholder="Select Batch"]').click(); // Open the Batches dropdown
    }

    selectBatch(batchName) {
        cy.contains('li', batchName).click(); // Select the batch from the dropdown list
    }

    closeBatchesDropdown() {
        cy.get('.close-batch-dropdown-icon').click(); // Close the Batches dropdown (replace with actual selector if different)
    }

    openDaysOfWeekDropdown() {
        cy.get('input[placeholder="Select Days of Week"]').click(); // Open the Days of Week dropdown
    }

    selectDaysOfWeek(days) {
        days.forEach(day => {
            cy.contains('li', day).click(); // Select each specified day from the dropdown
        });
    }

    closeDaysOfWeekDropdown() {
        cy.get('.close-days-dropdown-icon').click(); // Close the Days of Week dropdown (replace with actual selector if different)
    }

    verifyNumberOfDays(expectedDays) {
        cy.get('input[placeholder="Number of Days"]').should('have.value', expectedDays); // Verify the number of days is auto-filled
    }

    confirmCreateSession() {
        cy.contains('button', 'Create Session').click(); // Click the "Create Session" button
    }

    verifySuccessMessage(message) {
        cy.get('li[role="status"][data-state="open"]')
            .should('contain.text', message)
            .should('be.visible'); // Verify the success message is displayed
    }
}

const createSession = new CreateSession();
export default createSession;
