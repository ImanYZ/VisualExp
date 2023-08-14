const { insertEvent } = require("../GoogleCalendar");

exports.createExperimentEvent = async (email, researcher, order, start, end, projectSpecs, surveyType) => {
  const isAnnotating = projectSpecs.numberOfSessions === 1;
  const summary = isAnnotating
    ? "[1Cademy] Introduction Session" +
      (surveyType === "student" ? " for student" : surveyType === "instructor" ? " for professor" : " ")
    : "1Cademy UX Research Experiment - " + order + " Session";
  const description =
    "<div><p><strong><u>IMPORTANT: On your Internet browser, please log in to Gmail using your " +
    email.toLowerCase() +
    " credentials before entering this session. If you have logged in using your other email addresses, Google Meet will not let you in!</u></strong></p>" +
    isAnnotating
      ? "<p><strong><u>Please confirm your attendance in this session by accepting the invitation on Google Calendar or through the link at the bottom of the invitation email.</u></strong></p>" +
        "<p><strong><u>Note that accepting the invitation through Microsoft Outlook does not work!</u></strong></p><div>"
      : "<p>This is your " +
        order +
        " session of the UX Research experiment.</p>" +
        // projectSpecs.numberOfSessions === 3 just a temporary quick thing,
        // a proper solution will be implemented for annotating project
        (order === "1st" && projectSpecs.numberOfSessions === 3
          ? "<p>We've also scheduled your 2nd session 3 days later, and 3rd session one week later.</p>"
          : order === "2nd" && projectSpecs.numberOfSessions === 3
          ? "<p>We've also scheduled your 3rd session 4 days later.</p>"
          : "") +
        "<p><strong><u>Please confirm your attendance in this session by accepting the invitation on Google Calendar or through the link at the bottom of the invitation email.</u></strong></p>" +
        "<p><strong><u>Note that accepting the invitation through Microsoft Outlook does not work!</u></strong></p><div>";
  let colorId = order === "1st" ? "4" : "3";
  if (isAnnotating && surveyType) {
    colorId = surveyType === "student" ? "5" : surveyType === "instructor" ? "6" : "4";
  }
  const attendees = [{ email }, { email: researcher }, { email: "ouhrac@gmail.com" }];
  if (isAnnotating && surveyType === "instructor") {
    attendees.push({ email: "oneweb@umich.edu" });
  }
  const eventCreated = await insertEvent(start, end, summary, description, [...attendees], colorId);
  return eventCreated;
};
