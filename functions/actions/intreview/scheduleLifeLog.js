const admin = require("firebase-admin");
const { insertLifeLogEvent } = require("../../GoogleCalendar");
module.exports = async (req, res) => {
  try {
    const authUser = await admin.auth().verifyIdToken(req.headers.authorization);
    if (authUser.email === "oneweb@umich.edu") {
      let start, end;
      if (req.body.backwards) {
        end = new Date();
        start = new Date(end.getTime() - req.body.duration * 60 * 1000);
      } else {
        start = new Date();
        end = new Date(start.getTime() + req.body.duration * 60 * 1000);
      }
      const summary = req.body.summary;
      const description = "";
      const eventCreated = await insertLifeLogEvent(start, end, summary, description);
      return res.status(200).json({ done: true });
    }
  } catch (err) {
    console.log({ err });
    return res.status(400).json({ err });
  }
  return res.status(400).json({ done: false });
};
