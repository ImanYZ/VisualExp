import React, { useState } from "react";

import ScheduleSelector from "react-schedule-selector";

const currentTime = new Date();
const tZoneOffset = currentTime.getTimezoneOffset();
const tZoneDiff = Math.floor((240 - tZoneOffset) / 60);
let start = 6 + tZoneDiff;
// if (start < 6) {
//   start = 6;
// }
let end = 23 + tZoneDiff;
// if (end > 23) {
//   end = 23;
// }

const renderDateCell = (datetime, selected, refSetter) => {
  return (
    <div
      className={
        selected ? "ScheduleCell SelectedCell" : "ScheduleCell UnselectedCell"
      }
      ref={refSetter}
    >
      {datetime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
    </div>
  );
};

const ResearcherAvailabilities = (props) => {
  const [firstRender, setFirstRender] = useState(true);

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

export default React.memo(ResearcherAvailabilities, (prevProps, nextProps) => {
  return (
    prevProps.schedule.length === nextProps.schedule.length &&
    prevProps.startDate === nextProps.startDate &&
    prevProps.numDays === nextProps.numDays
  );
});
