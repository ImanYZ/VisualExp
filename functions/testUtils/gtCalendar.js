const { calendar } = require("../GoogleCalendar");

exports.gtDeleteAllEvents = async () => {
  if(process.env.NODE_ENV !== "test" || !process.env.TEST_CALENDAR) {
    return;
  }
  const eventList = await calendar.events.list({
    calendarId: process.env.UX_CALENDAR_ID
  });
  const eventIds = eventList.data.items.map((event) => event.id);
  for(const eventId of eventIds) {
    await calendar.events.delete({
      calendarId: process.env.UX_CALENDAR_ID,
      eventId
    })
  }
}