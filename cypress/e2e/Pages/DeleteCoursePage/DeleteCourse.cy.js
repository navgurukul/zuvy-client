class DeleteCourse {
    dashboard_visit() {
        cy.visit("/admin/courses");
    }

    login() {
        cy.loginByJWT();
    }

    searchCourse(courseName) {
        cy.get('input[placeholder="Search"]').clear().type(courseName); // Searching for the course
    }

    verifyCourseCard(courseName) {
        cy.get('p.capitalize.font-semibold').should('contain.text', courseName); // Verifying the course card shows the course name
    }

    clickCourseCard(courseName) {
        cy.get('p.capitalize.font-semibold').contains(courseName).click(); // Clicking the course card for the specified course
    }

    goToSettingsTab() {
        cy.get('a[href$="/settings"]').click(); // Assuming this selector goes to the settings tab
    }

    clickDeleteCourseButton() {
        cy.contains('button', 'Delete Course').click(); // Clicks the initial "Delete Course" button
    }

    confirmDeletion() {
        cy.get('div[role="dialog"]')
        .contains('button', 'Delete Course')
        .click(); // Clicks the "Delete Course" button in the confirmation popup
    }

    verifyDeletionSuccessMessage() {
        cy.get('li[role="status"]').contains('Bootcamp deleted successfully').should('be.visible'); // Verifying the success message is displayed
    }
}

const deleteCourse = new DeleteCourse();
export default deleteCourse;
