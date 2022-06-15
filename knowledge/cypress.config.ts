import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    viewportHeight: 1000,
    viewportWidth: 1280,
    defaultCommandTimeout: 20000,
    requestTimeout: 20000,
    video: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {}
  }
});
