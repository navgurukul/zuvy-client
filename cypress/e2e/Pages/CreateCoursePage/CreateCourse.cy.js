class CreateCourse {
    dashboard_vist() {
        cy.visit("/admin/courses");
    }

    login() {
        cy.loginByJWT();
    }

    logout() {
        cy.logOut();
    }

    clickNewCourseButton() {
        cy.get('button[aria-haspopup="dialog"]').contains('New Course').click(); // Clicking the "New Course" button
    }

    searchCourse(courseName) {
        cy.get('input[placeholder="Search"]').clear().type(courseName); // Searching for the course
    }

    checkIfCourseExists(courseName) {
        // Checks if a course with the specified name already exists
        cy.get('p.capitalize.font-semibold').then(($el) => {
            if ($el.text().includes(courseName)) {
                cy.log(`Course with the name "${courseName}" already exists.`);
                this.courseExists = true;
            } else {
                this.courseExists = false;
            }
        });
    }

    createCourseIfNotExists(courseName) {
        if (!this.courseExists) {
            this.clickNewCourseButton();
            cy.get('input#name').type(courseName); // Typing the course name
            cy.contains('button', 'Create Course').click(); // Clicking the "Create Course" button
            cy.log(`Course with the name "${courseName}" created.`);
        } else {
            cy.log(`Skipping creation. Course "${courseName}" already exists.`);
        }
    }

    verifyCourseCard(courseName) {
        cy.get('p.capitalize.font-semibold').should('contain.text', courseName); // Verifying the course card shows the course name
    }
}

const createCourse = new CreateCourse();
export default createCourse;
