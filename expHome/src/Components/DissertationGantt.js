import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import { Chart } from "react-google-charts";

import { firebaseState } from "../store/AuthAtoms";

const daysToMilliseconds = days => {
  return days * 24 * 60 * 60 * 1000;
};

const columns = [
  { type: "string", label: "Task ID" },
  { type: "string", label: "Task Name" },
  { type: "string", label: "Resource" },
  { type: "date", label: "Start Date" },
  { type: "date", label: "End Date" },
  { type: "number", label: "Duration" },
  { type: "number", label: "Percent Complete" },
  { type: "string", label: "Dependencies" }
];

const DissertationGantt = () => {
  const firebase = useRecoilValue(firebaseState);
  const [dt, setDt] = useState(false);

  useEffect(() => {
    const drawChart = async () => {
      if (firebase) {
        // const dissertationTimeLineRef = firebase.db.collection("dissertationTimeLine").doc();
        // await dissertationTimeLineRef.set({
        //   name: "Authoring Between-instructor Experiment Paper",
        //   resource: "Fall-back Plan",
        //   start: new Date("04/01/2023"),
        //   end: new Date("06/30/2023"),
        //   duration: null,
        //   completed: 0,
        //   dependencies: "zzP2i9zo9C4xzyH2wpER"
        // });
        const dissertationTimeLineQuery = firebase.db.collection("dissertationTimeLine");
        const dissertationTimeLineSnapshot = dissertationTimeLineQuery.onSnapshot(snapshot => {
          const docChanges = snapshot.docChanges();
          const rows = [];
          for (let docChange of docChanges) {
            const { name, resource, start, end, duration, completed, dependencies } = docChange.doc.data();
            rows.push([
              docChange.doc.id,
              name,
              resource,
              start.toDate(),
              end.toDate(),
              duration,
              completed,
              dependencies
            ]);
          }
          setDt([columns, ...rows]);
        });
        //   const rows = [
        //   ["Research", "Find sources", null, new Date(2015, 0, 1), new Date(2015, 0, 5), null, 100, null],
        //   ["Write", "Write paper", "write", null, new Date(2015, 0, 9), daysToMilliseconds(3), 25, "Research,Outline"],
        //   ["Cite", "Create bibliography", "write", null, new Date(2015, 0, 7), daysToMilliseconds(1), 20, "Research"],
        //   ["Complete", "Hand in paper", "complete", null, new Date(2015, 0, 10), daysToMilliseconds(1), 0, "Cite,Write"],
        //   ["Outline", "Outline paper", "write", null, new Date(2015, 0, 6), daysToMilliseconds(1), 100, "Research"]
        // ];
        return () => {
          dissertationTimeLineSnapshot();
        };
      }
    };
    return drawChart();
  }, [firebase]);

  return (
    dt && (
      <div style={{ width: "100%", height: "100vh", overflowX: "hidden", overflowY: "auto" }}>
        <Chart chartType="Gantt" data={dt} width="100%" height={1600} legendToggle />
      </div>
    )
  );
};

export default DissertationGantt;
