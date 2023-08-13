const express = require("express");
const firebaseAuth = require("../middlewares/firebaseAuth");
const isAdmin = require("../middlewares/isAdmin");

const manageEvents = require("../actions/administrator/manageEvents");
const markAsPaidActivities = require("../actions/administrator/markAsPaidActivities");
const notifyApplicationStatus = require("../actions/administrator/notifyApplicationStatus");

const adminRouter = express.Router();

adminRouter.use(firebaseAuth);
adminRouter.use(isAdmin);

// POST /api/administrator/manageevents
adminRouter.post("/manageEvents", manageEvents);

// POST /api/administrator/markAsPaidActivities
adminRouter.post("/markAsPaidActivities", markAsPaidActivities);

// POST /api/administrator/notifyApplicationStatus
adminRouter.post("/notifyApplicationStatus", notifyApplicationStatus);

module.exports = adminRouter;
