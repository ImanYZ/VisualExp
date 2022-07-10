import React, { useState, useEffect } from "react";

import ScheduleSelector from "react-schedule-selector";

// Checks whther d1 is at any time after 12:00 am tomorrow local time.
const startingTomorrow = d1 => {
  let d = new Date();
  d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
  return d1.getDate() >= d.getDate() && d1.getMonth() >= d.getMonth() && d1.getFullYear() >= d.getFullYear();
};

// Checks if d2 is days later than d1.
const daysLater = (d1, d2, days) => {
  let d = new Date(d1);
  d = new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
  return d.getDate() === d2.getDate() && d.getMonth() === d2.getMonth() && d.getFullYear() === d2.getFullYear();
};

// We want the participants to only choose timeslots that are between 6am to 11pm
// in both their timezone and EST.
const currentTime = new Date();
const tZoneOffset = currentTime.getTimezoneOffset();
const tZoneDiff = Math.floor((240 - tZoneOffset) / 60);
let start = 8 + tZoneDiff;
if (start < 8) {
  start = 8;
}
let end = 23 + tZoneDiff;
if (end > 23) {
  end = 23;
}

/* 
  consecutiveTimeSlotsExists is a function that takes an
  array of dates and return the first slot that is consecutive

  ******* PARAMS ********
  slots: an array of dates, must be sorted in ascending order.
  count: number of consecutive slots that we want to check for
  slotDifference: minutes of a slot, ususally 30 mins.
*/
const consecutiveTimeSlotsExists = (slots = [], count = 1, slotDifference = 30) => {
  // loop through all the slots
  for (let i = 0; i < slots.length; ++i) {
    // have a variable to know in the end of the below loop
    // wether we have a consecutive array or not
    // be default set to true, and set to false if next entries are not consecutive.
    let exists = true;

    // looping to check the next elements of array to be consecutive
    // j represents the nth next element of the current element represented by i.
    for (let j = 0; j < count; ++j) {
      // if [i + j] don't exist then set to false and break
      // convert slotDifference minutes into timestamp seconds and multiply with j
      // if we add this to the current time slot this should be equal to the next jth element
      if (!slots[i + j] || slots[i].getTime() + slotDifference * j * 60000 !== slots[i + j].getTime()) {
        exists = false;
        break;
      }
    }
    if (exists) {
      return slots[i];
    }
  }
  return null;
};

// A wrapper around ScheduleSelector to label available, unavailable, selected,
// and 1st, 2nd, and 3rd sessions that satisfy the experiment criteria.
// It also sets props.setFirstSession, props.setSecondSession, and
// props.setThirdSession based on the selected time slots.
const SelectSessions = props => {
  // There is a bug in ScheduleSelector that unreasonably calls this function
  // when the component is just rendered. Obviously at that point props.schedule
  // is still empty and we don't want to set it to null.
  // firstRender helps us to only run this function body when it is invoked
  // after the very first render.
  const [firstRender, setFirstRender] = useState(true);

  // Checks whether each of the selected sessions satisfies the 1st, 2nd,
  // or 3rd session criteria.
  useEffect(() => {
    if (props.schedule && props.schedule.length > 0) {
      const orderedSch = [...props.schedule];
      // Before checking whether a session satisfies the 1st, 2nd, or 3rd
      // session criteria, we should sort all the selected sessions in
      // chronological order to be able to examin the consecutive sessions
      // against each criterion.
      orderedSch.sort((a, b) => a.getTime() - b.getTime());
      // We start all the 1st, 2nd, and 3rd sessions with null so that if
      // the user does not select anything or their selection does not
      // satisfy the criteria, we keep the previous values for
      // props.firstSession, props.secondSession, and props.thirdSession.

      let hasAllSessions = true;
      const sessions = [];
      // 60 / 2 = 30 (mins)
      const slotDuration = 60 / props.hourlyChunks;

      for (let i = 0; i < props.numberOfSessions; ++i) {
        let session = null;
        if (i === 0) {
          // checking the first session
          session = consecutiveTimeSlotsExists(orderedSch, props.sessionDuration[0], slotDuration);
        } else {
          const scheduleForNextDay = orderedSch.filter(s => daysLater(sessions[0], s, props.daysLater[i - 1]));
          session = consecutiveTimeSlotsExists(scheduleForNextDay, props.sessionDuration[i], slotDuration);
        }

        if (!session) {
          hasAllSessions = false;
          break;
        }

        sessions.push(session);
      }

      if (hasAllSessions) {
        props.setSubmitable(true);
        props.setSelectedSession(sessions);
      } else {
        props.setSubmitable(false);
        props.setSelectedSession([]);
      }
    }
  }, [props.schedule]);

  // ScheduleSelector calls this function for every cell that changes,
  // every time the user makes any changes to the schedule.
  const renderDateCell = (datetime, selected, refSetter) => {
    const datetimeStr = datetime.toLocaleString();
    // We should enable the sessions for the user to select only
    // if they are in props.availableSessions and there is at
    // least one researcher available to take them.
    const availableSess = datetimeStr in props.availableSessions && props.availableSessions[datetimeStr].length > 0;
    // If the session satisfies all the criteria for first, second,
    // or third sessions, we check-mark it to show the user which
    // sessions they are going to attend.

    let scheduledSession = false;
    if (availableSess) {
      for (let i = 0; i < props.selectedSession.length; ++i) {
        const sess = props.selectedSession[i];
        for (let j = 0; j < props.sessionDuration[i]; ++j) {
          const minsToSubtract = (60 / props.hourlyChunks) * j;
          const check = sess.getTime() === new Date(datetime.getTime() - minsToSubtract * 60000).getTime();
          if (check) {
            scheduledSession = true;
            break;
          }
        }
        //stopping loop from executing further
        if (scheduledSession) break;
      }
    }

    return (
      <div
        className={
          "ScheduleCell " + (!availableSess ? "UnavailableCell" : selected ? "SelectedCell" : "UnselectedCell")
        }
        ref={refSetter}
      >
        {!availableSess
          ? "UNAVBL"
          : scheduledSession
          ? "✅"
          : datetime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            })}
      </div>
    );
  };

  // Every time the user makes any changes, ScheduleSelector calls this function
  // with the new value for the schedule array.
  const scheduleChange = newSchedule => {
    // There is a bug in ScheduleSelector that unreasonably calls this function
    // when the component is just rendered. Obviously at that point props.schedule
    // is still empty and we don't want to set it to null.
    // firstRender helps us to only run this function body when it is invoked
    // after the very first render.
    if (!firstRender || newSchedule.length > 0) {
      // We should add the sessions that the user selects to props.schedule only
      // if the selected session is in props.availableSessions and there is at
      // least one researcher available to take it.
      const newSche = [];
      for (let newSess of newSchedule) {
        const newSessStr = newSess.toLocaleString();
        if (newSessStr in props.availableSessions && props.availableSessions[newSessStr].length > 0) {
          newSche.push(newSess);
        }
      }
      props.setSchedule(newSche);
      setFirstRender(false);
    }
  };

  return (
    <ScheduleSelector
      selection={props.schedule}
      selectionScheme="linear"
      startDate={props.startDate}
      numDays={props.numDays}
      minTime={start}
      maxTime={end}
      hourlyChunks={props.hourlyChunks || 2}
      dateFormat="ddd MM/DD"
      timeFormat="hh:mma"
      onChange={scheduleChange}
      renderDateCell={renderDateCell}
    />
  );
};

export default React.memo(SelectSessions, (prevProps, nextProps) => {
  return (
    // Because React does not do a deep comparison, we need to take a proxy.
    // Since it is very unlikely that a session gets removed and at the same
    // time another session gets selescted, it is reasonable to assume that
    // any change in the schedule would impact its length.
    // So, we only rerender this component if the length of schedule changes
    // or any of the other props get changed.
    prevProps.schedule.length === nextProps.schedule.length &&
    prevProps.selectedSession.length === nextProps.selectedSession.length &&
    prevProps.startDate === nextProps.startDate &&
    prevProps.numDays === nextProps.numDays
  );
});
