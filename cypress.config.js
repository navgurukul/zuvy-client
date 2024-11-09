const { defineConfig } = require("cypress");
const cucumber = require("cypress-cucumber-preprocessor").default;
require("dotenv").config()


module.exports = defineConfig({
 e2e: {
   specPattern: "**/*.feature",
   setupNodeEvents(on, config) {
     on("file:preprocessor", cucumber());
   },

   baseUrl: 'https://dev.app.zuvy.org/', // Update this to your application's base URL if different
 },

 viewportWidth: 1920,
 viewportHeight: 1080,
 env:{
   AUTH: process.env.AUTH,
   loggedOut: process.env.loggedOut,
   loggedOutToken: process.env.loggedOutToken,
   token: process.env.token,
   cookie: process.env.cookie
  },



});