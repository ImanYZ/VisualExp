import React, { useState, useEffect } from "react";

import "./TimePicker.css";

const START_TIME = 7;
const END_TIME = 22;

const TimePicker = (props) => {
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    const tSlots = [];
    for (let tIdx = START_TIME; tIdx < END_TIME; tIdx += props.increments) {
      let startSlot = "";
      let amPM = " AM";
      let startIdx = tIdx;
      if (startIdx >= 13) {
        startIdx -= 12;
        amPM = " PM";
      } else if (startIdx >= 12) {
        amPM = " PM";
      }
      if (startIdx % 1 === 0) {
        const hour = startIdx < 10 ? "0" + startIdx : startIdx;
        startSlot += hour + ":00" + amPM;
      } else {
        const hour = startIdx < 10 ? "0" + (startIdx - 0.5) : startIdx - 0.5;
        startSlot += hour + ":30" + amPM;
      }
      let endSlot = "";
      amPM = " AM";
      let endIdx = tIdx + props.duration;
      if (endIdx >= 13) {
        endIdx -= 12;
        amPM = " PM";
      } else if (endIdx >= 12) {
        amPM = " PM";
      }
      if (endIdx % 1 === 0) {
        const hour = endIdx < 10 ? "0" + endIdx : endIdx;
        endSlot += hour + ":00" + amPM;
      } else {
        const hour = endIdx < 10 ? "0" + (endIdx - 0.5) : endIdx - 0.5;
        endSlot += hour + ":30" + amPM;
      }
      tSlots.push(startSlot + " - " + endSlot);
    }
    setTimeSlots(tSlots);
  }, [props.duration, props.increments]);

  return (
    <div className="TimePickerContainer">
      <div className="DateText">{props.title}</div>
      <div className="TimeSlotsColumn">
        {timeSlots.map((tSlot, tIdx) => {
          return (
            <div key={tIdx} className="TimeSlot">
              {tSlot}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimePicker;
