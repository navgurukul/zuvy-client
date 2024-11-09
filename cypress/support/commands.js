// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
const userObj = Cypress.env();
console.log(userObj)
Cypress.Commands.add('loginByJWT', () => {
    // Click the Google login button  
    // cy.lo  
    cy.visit('https://dev.app.zuvy.org/', {
      onBeforeLoad(win) {
          win.localStorage.setItem("AUTH",userObj["AUTH"])
          win.localStorage.setItem("loggedOut",userObj["loggedOut"])
          win.localStorage.setItem("loggedOutToken",userObj["loggedOutToken"])
          win.localStorage.setItem("token",userObj["token"])
          win.document.cookie = `secure_typeuser=${userObj['cookie']}; path=/;`;
      },
    })   
  })



Cypress.Commands.add('logOut', () => {
    // Click the Google login button  
    // cy.lo  
    cy.clearLocalStorage("AUTH")
    cy.clearLocalStorage("loggedOut")
    cy.clearLocalStorage("loggedOutToken")
    cy.clearLocalStorage("token")
    cy.clearAllCookies()
  })
Cypress.Commands.add('login', (email, password) => { 
 
 })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })