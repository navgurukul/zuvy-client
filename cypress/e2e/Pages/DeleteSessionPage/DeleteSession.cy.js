class DeleteSession {
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
        cy.get('a[href$="/sessions"]').click(); // Click the Sessions tab using href ending in /sessions
    }

    goToUpcomingTab() {
        cy.wait(10000);
        cy.get('.justify-start > .bg-secondary').click(); // Click the Upcoming tab to view upcoming sessions
    }

    clickDeleteIconOnSessionCard() {
        cy.get('svg.lucide-trash2.text-destructive[data-state="closed"]').click({ force: true, multiple: true }); // Click the delete icon on the session card (replace with actual selector if necessary)
    }

    confirmDeleteSession() {
        cy.contains('button', 'Delete Session').click(); // Click the "Delete Session" button in the confirmation popup
    }

    verifySuccessMessage(message) {
        cy.get('li[role="status"][data-state="open"]')
            .should('contain.text', message)
            .should('be.visible'); // Verify the success message is displayed
    }
}

const deleteSession = new DeleteSession();
export default deleteSession;
