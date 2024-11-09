class AddBatch {
    dashboard_visit() {
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

    goToBatchesTab() {
        cy.get('a[href$="/admin/courses/491/batches"]').click(); // Click the Batches tab using href ending in /batches
    }

    clickNewBatchButton() {
        cy.contains('button', 'New Batch').click(); // Click the "New Batch" button
    }

    enterBatchName(batchName) {
        cy.get('input[placeholder="Batch Name"]').clear().type(batchName); // Enter the batch name
    }

    enterInstructorEmail(email) {
        cy.get('input[name="instructorEmail"]').clear().type(email); // Enter the instructor's email
    }

    enterCapEnrollment(cap) {
        cy.get('input[name="capEnrollment"]').clear().type(cap); // Enter the cap enrollment as an integer
    }

    confirmCreateBatch() {
        cy.contains('button', 'Create batch').click(); // Click the "Create Batch" button in the popup
    }

    verifySuccessMessage(message) {
        cy.get('li[role="status"][data-state="open"]')
            .should('contain.text', message)
            .should('be.visible'); // Verify the success message is displayed
    }
}

const addBatch = new AddBatch();
export default addBatch;
