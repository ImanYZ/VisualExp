const { db } = require("../../admin");
const { toOrdinal } = require("number-to-words");
const { createExperimentEvent } = require("../../helpers/createExperimentEvent");

module.exports = async (req, res) => {
  try {
    if ("email" in req.body && "sessions" in req.body && "project" in req.body) {
      const events = [];
      const email = req.body.email;

      const projectSpecs = await db.collection("projectSpecs").doc(req.body.project).get();
      if (!projectSpecs.exists) {
        throw new Error("Project Specs not found.");
      }
      const projectSpecsData = projectSpecs.data();
      // 1 hour / 2 = 30 mins
      const slotDuration = 60 / (projectSpecsData.hourlyChunks || 2);

      for (let i = 0; i < req.body.sessions.length; ++i) {
        const sess = req.body.sessions[i];
        const start = new Date(sess.startDate);
        // adding slotDuration * number of slots for the session
        const end = new Date(start.getTime() + slotDuration * (projectSpecsData.sessionDuration?.[i] || 2) * 60000);
        const eventCreated = await createExperimentEvent(
          email,
          sess.researcher,
          toOrdinal(i + 1),
          start,
          end,
          projectSpecsData
        );
        events.push(eventCreated);
      }
      return res.status(200).json({ events });
    } else {
      throw new Error("Invalid request body.");
    }
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
};
