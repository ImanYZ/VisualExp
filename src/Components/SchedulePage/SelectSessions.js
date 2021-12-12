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

const SelectSessions = (props) => {
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    const orderedSch = [...props.schedule];
    orderedSch.sort();
    const fSessions = [];
    let sSession, tSession;
    for (let sIdx = 0; sIdx < orderedSch.length - 2; sIdx++) {
      if (
        // startingTomorrow(orderedSch[sIdx]) &&
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
            if (!fSessions.includes(orderedSch[sIdx])) {
              fSessions.push(orderedSch[sIdx]);
            }
            sSession = sSession ? sSession : orderedSch[secondSIdx];
            tSession = tSession ? tSession : orderedSch[thirdSIdx];
          }
        }
      }
    }
    props.setFirstSessions(fSessions);
    props.setSecondSession(sSession);
    props.setThirdSession(tSession);
    if (sSession && tSession) {
      props.setSubmitable(true);
    } else {
      props.setSubmitable(false);
    }
  }, [props.schedule]);

  const renderDateCell = (datetime, selected, refSetter) => {
    const scheduledSession =
      props.firstSessions.findIndex(
        (fSess) => fSess.getTime() === datetime.getTime()
      ) !== -1 ||
      props.firstSessions.findIndex(
        (fSess) =>
          fSess.getTime() ===
          new Date(datetime.getTime() - 30 * 60000).getTime()
      ) !== -1 ||
      props.firstSessions.findIndex(
        (fSess) =>
          fSess.getTime() ===
          new Date(datetime.getTime() - 60 * 60000).getTime()
      ) !== -1 ||
      (props.secondSession &&
        props.secondSession.getTime() === datetime.getTime()) ||
      (props.thirdSession &&
        props.thirdSession.getTime() === datetime.getTime());
    return (
      <div
        className={
          selected ? "ScheduleCell SelectedCell" : "ScheduleCell UnselectedCell"
        }
        ref={refSetter}
      >
        {scheduledSession ? "✅" : ""}
      </div>
    );
  };

  const scheduleChange = (newSchedule) => {
    if (!firstRender || newSchedule.length > 0) {
      props.setSchedule(newSchedule);
      setFirstRender(false);
    }
  };

  return (
    <ScheduleSelector
      selection={props.schedule}
      selectionScheme="linear"
      startDate={props.startDate}
      numDays={props.numDays}
      minTime={8}
      maxTime={22}
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
    prevProps.schedule.length === nextProps.schedule.length &&
    prevProps.firstSessions === nextProps.firstSessions &&
    prevProps.secondSession === nextProps.secondSession &&
    prevProps.thirdSession === nextProps.thirdSession &&
    prevProps.startDate === nextProps.startDate &&
    prevProps.numDays === nextProps.numDays
  );
});
