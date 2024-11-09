class DeleteBatch {
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

    searchBatch(batchName) {
        cy.get('input[placeholder="Search"]').clear().type(batchName); // Search for the batch by name
    }

    verifyBatchCard(batchName) {
        cy.contains('h3', batchName).should('be.visible'); // Verify the batch card displays the batch name
    }

    clickBatchCard(batchName) {
        cy.contains('h3', batchName).click(); // Click the batch card for the specified batch
    }

    clickDeleteIcon() {
        cy.contains('span', 'Delete').click(); // Click the delete icon within the batch card
    }

    enterBatchNameInPopup(batchName) {
        cy.get('input[placeholder="Type Batch Name"]').clear().type(batchName); // Enter the batch name in the confirmation popup
    }

    confirmDeleteBatch() {
        cy.contains('button', 'Delete Batch').click(); // Click the "Delete Batch" button in the confirmation popup
    }

    verifySuccessMessage(message) {
        cy.get('li[role="status"][data-state="open"]')
            .should('contain.text', message)
            .should('be.visible'); // Verify the success message is displayed
    }
}

const deleteBatch = new DeleteBatch();
export default deleteBatch;
