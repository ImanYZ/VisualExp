require("dotenv").config({
  path: "./.env.test"
});

/** @type {import('jest').Config} */
const config = {
  verbose: true,
  testMatch: ["**/__tests__/**/*.[jt]s?(x)"],
};

module.exports = config;
