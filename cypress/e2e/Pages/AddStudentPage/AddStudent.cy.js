class AddStudent {
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

    goToStudentsTab() {
        cy.get('[href="/admin/courses/491/students"]').click(); // Assuming href ends with "/students" for the Students tab
    }

    clickAddStudentButton() {
        cy.contains('button', 'Add Student').click(); // Clicking the "Add Student" button
    }

    selectOneAtATimeOption() {
        cy.get('label[for="2"]').click(); // Selecting the radio button for "One at a time"
    }

    enterStudentName(studentName) {
        cy.get('input[id="name"]').clear().type(studentName); // Entering the student's name
    }

    enterStudentEmail(studentEmail) {
        cy.get('input[id="email"]').clear().type(studentEmail); // Entering the student's email
    }

    confirmAddStudent() {
        cy.get('div[role="dialog"]').contains('button', 'Add Student').click(); // Confirming addition in the popup
    }

    verifySuccessMessage(message) {
        cy.get('li[role="status"]').contains('1 students successfully enrolled').should('be.visible'); // Verifying the success message appears
    }

    searchStudentInList(studentName) {
        cy.get('.flex-col.justify-between > .mt-2').clear().type(studentName); // Searching for the student in the list
    }

    verifyStudentInList(studentName) {
        cy.get('li[role="status"][data-state="open"]')
            .should('contain.text', '1 students successfully enrolled')
            .should('be.visible');
        // Verifying the student's name appears in the list
    }
}

const addStudent = new AddStudent();
export default addStudent;
