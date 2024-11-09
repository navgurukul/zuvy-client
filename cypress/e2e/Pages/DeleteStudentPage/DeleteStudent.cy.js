class DeleteStudent {
    dashboard_visit() {
        cy.visit("/admin/courses");
    }

    login() {
        cy.loginByJWT();
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

    goToStudentsTab() {
        cy.get('a[href$="/students"]').click(); // Click the Students tab using href ending in /students
    }

    searchStudent(studentName) {
        cy.get('input[placeholder="Search students"]').clear().type(studentName); // Search for the student by name
    }

    verifyStudentEmail(expectedEmail) {
        cy.contains('Jenny.doe@example.com').should('be.visible'); // Verify the student's email in the row
    }

    clickDeleteStudentIcon(studentName) {
        cy.get('svg.lucide.lucide-trash2').eq(0).click(); // Clicks the first instance of the delete icon // Click the delete icon in that row
    }

    confirmDeletion() {
        cy.contains('button', 'Continue').click(); // Click the "Continue" button in the confirmation popup
    }

    verifySuccessMessage(message) {
        cy.get('li[role="status"]').contains('Student removed for the bootcamp').should('be.visible'); // Verify the success message appears
    }
}

const deleteStudent = new DeleteStudent();
export default deleteStudent;
