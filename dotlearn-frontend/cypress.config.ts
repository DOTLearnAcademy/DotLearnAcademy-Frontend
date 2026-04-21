import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // Points to your LIVE deployed site
    baseUrl: "https://3.27.174.183.nip.io",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  viewportWidth: 1280,
  viewportHeight: 900,
  video: true,
  videoCompression: 32,
  screenshotOnRunFailure: true,
  screenshotsFolder: "cypress/screenshots",
  videosFolder: "cypress/videos",
  defaultCommandTimeout: 10000,
  requestTimeout: 15000,
});
