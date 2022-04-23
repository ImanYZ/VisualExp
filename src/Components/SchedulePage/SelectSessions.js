import React, { useState, useEffect } from "react";

import ScheduleSelector from "react-schedule-selector";

const startingTomorrow = (d1) => {
  let d = new Date();
  d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
  return (
    d1.getDate() >= d.getDate() &&
    d1.getMonth() >= d.getMonth() &&
    d1.getFullYear() >= d.getFullYear()
  );
};

const daysLater = (d1, d2, days) => {
  let d = new Date(d1);
  d = new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
  return (
    d.getDate() === d2.getDate() &&
    d.getMonth() === d2.getMonth() &&
    d.getFullYear() === d2.getFullYear()
  );
};

const currentTime = new Date();
const tZoneOffset = currentTime.getTimezoneOffset();
const tZoneDiff = Math.floor((240 - tZoneOffset) / 60);
let start = 6 + tZoneDiff;
if (start < 6) {
  start = 6;
}
let end = 23 + tZoneDiff;
if (end > 23) {
  end = 23;
}

// A wrapper around ScheduleSelector to label available, unavailable, selected,
// and 1st, 2nd, and 3rd sessions that satisfy the experiment criteria.
// It also sets props.setFirstSession, props.setSecondSession, and
// props.setThirdSession based on the selected time slots.
const SelectSessions = (props) => {
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
      let fSession = null;
      let sSession = null;
      let tSession = null;
      for (let sIdx = 0; sIdx < orderedSch.length - 2; sIdx++) {
        if (
          // startingTomorrow(orderedSch[sIdx]) &&
          orderedSch[sIdx] > new Date() &&
          orderedSch[sIdx].getTime() + 30 * 60000 ===
            orderedSch[sIdx + 1].getTime()
          //    &&
          // orderedSch[sIdx + 1].getTime() + 30 * 60000 ===
          //   orderedSch[sIdx + 2].getTime()
        ) {
          const secondSIdx = orderedSch.findIndex((s) =>
            daysLater(orderedSch[sIdx], s, 3)
          );
          if (secondSIdx !== -1) {
            const thirdSIdx = orderedSch.findIndex((s) =>
              daysLater(orderedSch[sIdx], s, 7)
            );
            if (thirdSIdx !== -1) {
              fSession = orderedSch[sIdx];
              sSession = orderedSch[secondSIdx];
              tSession = orderedSch[thirdSIdx];
              break;
            }
          }
        }
      }
      if (fSession && sSession && tSession) {
        props.setFirstSession(fSession);
        props.setSecondSession(sSession);
        props.setThirdSession(tSession);
      }
      if (sSession && tSession) {
        props.setSubmitable(true);
      } else {
        props.setSubmitable(false);
      }
    }
  }, [props.schedule]);

  const renderDateCell = (datetime, selected, refSetter) => {
    const datetimeStr = datetime.toLocaleString();
    // We should enable the sessions for the user to select only
    // if they are in props.availableSessions and there is at
    // least one researcher available to take them.
    const availableSess =
      datetimeStr in props.availableSessions &&
      props.availableSessions[datetimeStr].length > 0;
    // If the session satisfies all the criteria for first, second,
    // or third sessions, we check-mark it to show the user which
    // sessions they are going to attend.
    const scheduledSession =
      (props.firstSession &&
        (props.firstSession.getTime() === datetime.getTime() ||
          props.firstSession.getTime() ===
            new Date(datetime.getTime() - 30 * 60000).getTime())) ||
      (props.secondSession &&
        props.secondSession.getTime() === datetime.getTime()) ||
      (props.thirdSession &&
        props.thirdSession.getTime() === datetime.getTime());
    return (
      <div
        className={
          "ScheduleCell " +
          (availableSess
            ? "UnavailableCell"
            : selected
            ? "SelectedCell"
            : "UnselectedCell")
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
              hour12: false,
            })}
      </div>
    );
  };

  const scheduleChange = (newSchedule) => {
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
        if (
          newSessStr in props.availableSessions &&
          props.availableSessions[newSessStr].length > 0
        ) {
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
      hourlyChunks={2}
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
    prevProps.firstSession === nextProps.firstSession &&
    prevProps.secondSession === nextProps.secondSession &&
    prevProps.thirdSession === nextProps.thirdSession &&
    prevProps.startDate === nextProps.startDate &&
    prevProps.numDays === nextProps.numDays
  );
});
