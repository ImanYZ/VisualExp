import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    viewportHeight: 1000,
    viewportWidth: 1280,
    defaultCommandTimeout: 20000,
    requestTimeout: 20000,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {}
  }
});
