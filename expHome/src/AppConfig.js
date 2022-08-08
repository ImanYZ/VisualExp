const AppConfig = {
  defaultProject: "H1L2",
  defaultSurveyProject: "Annotating",
  defaultNumberOfSessions: 3,
  defaultHourlyChunks: 2, // divider for hour used to determine timeslot size, 2 means 30mins, 4 means 15 mins.
  // defaultSessionDuration should always have 3 items, each representing one session.
  // used to determine duration for each session
  // 2 * 30 mins = 1 hour
  // 1 * 30 mins = 30 mins
  defaultSessionDuration: [2, 1, 1],
  daysLater: [3, 7]
};

export default AppConfig;
