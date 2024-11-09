// class CreateModule {
//     dashboardVisit() {
//         cy.visit("/admin/courses");
//     }

//     login() {
//         cy.loginByJWT(); // Assuming there's a custom command for JWT login
//     }

//     searchCourse(courseName) {
//         cy.get('input[placeholder="Search"]').clear().type(courseName); // Search for the course by name
//     }

//     verifyCourseCard(courseName) {
//         cy.get('p.capitalize.font-semibold').should('contain.text', courseName); // Verify the course card displays the course name
//     }

//     clickCourseCard(courseName) {
//         cy.get('p.capitalize.font-semibold').contains(courseName).click(); // Click the course card for the specified course
//     }

//     goToCurriculumTab() {
//         cy.get('a[href$="/curriculum"]').click(); // Click the Curriculum tab using href ending in /curriculum
//     }

//     clickAddModuleButton() {
//         cy.contains('button', 'Add module').click(); // Click the "Add Module" button
//     }

//     selectLearningMaterial() {
//         cy.get('label[for="learning-material"].text-sm.font-medium.m-2').click(); // Select the Learning Material radio button
//     }

//     enterModuleName(moduleName) {
//         cy.get('input[placeholder="Module Name"]').clear().type(moduleName); // Enter the module name
//     }

//     enterModuleDescription(moduleDescription) {
//         cy.get('input#desc[placeholder="Module Description"]').type(moduleDescription); // Enter the module description
//     }

//     enterDuration(months, weeks, days) {
//         cy.get('input[placeholder="Months"]').clear().type(months); // Enter months
//         cy.get('input[placeholder="Weeks"]').clear().type(weeks); // Enter weeks
//         cy.get('input[placeholder="Days"]').clear().type(days); // Enter days
//     }

//     confirmCreateModule() {
//         cy.contains('button', 'Create Module').click(); // Click the "Create Module" button
//     }

//     verifySuccessMessage(message) {
//         cy.get('li[role="status"][data-state="open"]')
//             .should('contain.text', message)
//             .should('be.visible'); // Verify the success message is displayed
//     }
// }

// const createModule = new CreateModule();
// export default createModule;


class CreateModule {
    dashboardVisit() {
        cy.visit("/admin/courses");
    }

    login() {
        cy.loginByJWT();
    }

    searchCourse(courseName) {
        cy.get('input[placeholder="Search"]').clear().type(courseName);
    }

    verifyCourseCard(courseName) {
        cy.get('p.capitalize.font-semibold').should('contain.text', courseName);
    }

    clickCourseCard(courseName) {
        cy.get('p.capitalize.font-semibold').contains(courseName).click();
    }

    goToCurriculumTab() {
        cy.get('a[href$="/curriculum"]').click();
    }

    clickAddModuleButton() {
        // Use regex to match "Add Module" or "Add module" in a case-insensitive way
        cy.contains('button', /Add Module|Add module/i).then(($button) => {
            // Check if the button is visible and located at the top-right position
            if ($button.is(':visible') && $button.closest('.top-right-class').length) {
                cy.wrap($button).click();
            } else {
                // If not at the top-right, assume it’s the bottom button when no modules are present
                cy.contains('button', /Add Module|Add module/i).last().click({ force: true });
            }
        });
    }
    

    selectLearningMaterial() {
        cy.get('label[for="learning-material"].text-sm.font-medium.m-2').click();
    }

    enterModuleName(moduleName) {
        cy.get('input[placeholder="Module Name"]').clear().type(moduleName);
    }

    enterModuleDescription(moduleDescription) {
        cy.get('input#desc[placeholder="Module Description"]').clear().type(moduleDescription);
    }

    enterDuration(months, weeks, days) {
        cy.get('input[placeholder="Months"]').clear().type(months);
        cy.get('input[placeholder="Weeks"]').clear().type(weeks);
        cy.get('input[placeholder="Days"]').clear().type(days);
    }

    confirmCreateModule() {
        cy.contains('button', 'Create Module').click();
    }

    verifySuccessMessage(message) {
        cy.get('li[role="status"][data-state="open"]')
            .should('contain.text', message)
            .should('be.visible');
    }
}

const createModule = new CreateModule();
export default createModule;
