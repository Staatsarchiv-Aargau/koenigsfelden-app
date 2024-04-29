// module.exports = {
//   e2e: {
//     setupNodeEvents(on, config) {
//       // implement node event listeners here
//     },
//   },
// };

const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:8080/exist/apps/koenigsfelden/",
    reporter: 'tap',
    reporterOptions: {
      toConsole: true,
    },
    includeShadowDom: true
  },
});