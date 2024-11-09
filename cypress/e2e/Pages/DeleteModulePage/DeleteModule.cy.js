class DeleteModule {
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

    goToCurriculumTab() {
        cy.get('a[href$="/curriculum"]').click(); // Click the Curriculum tab using href ending in /curriculum
    }

    clickDeleteIconOnModuleCard() {
        cy.get('svg.lucide-trash2.hover\\:text-destructive.cursor-pointer').click({ multiple: true, force: true }); // Click on the delete icon in the module card (replace with actual selector if necessary)
    }

    confirmDeleteModule() {
        cy.contains('button', 'Delete Module').click(); // Click the "Delete Module" button in the confirmation popup
    }

    verifySuccessMessage(message) {
        cy.get('li[role="status"][data-state="open"]')
            .should('contain.text', message)
            .should('be.visible'); // Verify the success message is displayed
    }
}

const deleteModule = new DeleteModule();
export default deleteModule;
