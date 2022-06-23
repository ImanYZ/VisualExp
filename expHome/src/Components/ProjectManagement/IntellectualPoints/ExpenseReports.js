import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import axios from "axios";
import { ResponsiveCalendar } from "@nivo/calendar";

import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

import { DataGrid } from "@mui/x-data-grid";

import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";
import TimePicker from "@mui/lab/TimePicker";

import { firebaseState } from "../../../store/AuthAtoms";
import {
  projectState,
  upVotedTodayState,
  allTagsState,
  allActivitiesState,
  othersActivitiesState,
  otherActivityState,
} from "../../../store/ProjectAtoms";

import SnackbarComp from "../../SnackbarComp";
// import AdminIntellectualPoints from "./AdminIntellectualPoints";
import GridCellToolTip from "../../GridCellToolTip";
import { isToday, getISODateString } from "../../../utils/DateFunctions";
import {
  ActivityInfoAlert,
  ActivityInstructionsAlert,
  CalendarVisualizationAlert,
  IntellectualActivitiesAlert,
} from "./Alerts";
import "./IntellectualPoints.css";

const othersActivitiesColumns = [
  { field: "fullname", headerName: "Fullname", width: 190 },
  { field: "start", headerName: "Start", type: "dateTime", width: 190 },
  {
    field: "description",
    headerName: "Description",
    width: 400,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "upVotes",
    headerName: "Points",
    type: "number",
    width: 70,
    valueFormatter: (params) => {
      return `${params.value} 👍`;
    },
  },
  { field: "approved", headerName: "approved", width: 190 },
  { field: "paid", headerName: "Paid", width: 190 },
];

const ExpenseReports = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const project = useRecoilValue(projectState);
  const [othersActivities, setOthersActivities] = useRecoilState(
    othersActivitiesState
  );

  const [activitiesChanges, setActivitiesChanges] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [votesChanges, setVotesChanges] = useState([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (firebase && project) {
      console.log("fetched activities Data");
      const activitiesQuery = firebase.db
        .collection("activities")
        .where("project", "==", project);
      const activitiesSnapshot = activitiesQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setActivitiesChanges((oldActivitiesChanges) => {
          return [...oldActivitiesChanges, ...docChanges];
        });
        //we don't want to create multiple sockets at the same time. That's why
        //we track whichever is loaded to started loading the next one after
        //that.
        setActivitiesLoaded(true);
        console.log("fetched activities Data onSnapshot");
      });
      return () => {
        setActivitiesLoaded(false);
        activitiesSnapshot();
      };
    }
  }, [firebase, project]);

  useEffect(() => {
    if (firebase && project && activitiesLoaded) {
      const votesQuery = firebase.db
        .collection("votes")
        .where("voter", "==", "Iman YeckehZaare")
        .where("project", "==", project);
      const votesSnapshot = votesQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setVotesChanges((oldVotesChanges) => {
          return [...oldVotesChanges, ...docChanges];
        });
        console.log("fetch votes snapshot");
      });
      return () => {
        setVotesChanges([]);
        votesSnapshot();
      };
    }
  }, [firebase, project, activitiesLoaded]);

  useEffect(() => {
    console.log("activitiesChanges");
    if (activitiesChanges.length > 0) {
      const tempActivitiesChanges = [...activitiesChanges];
      setActivitiesChanges([]);

      let oActivities = [...othersActivities];
      for (let change of tempActivitiesChanges) {
        if (change.type === "removed") {
          oActivities = oActivities.filter((acti) => acti.id !== change.doc.id);
        } else {
          const activityData = change.doc.data();
          const newActivity = {
            fullname: activityData.fullname,
            description: activityData.description,
            start: activityData.sTime.toDate(),
            tags: activityData.tags,
            upVotes: activityData.upVotes,
            paid: activityData.paid ? "PAID" : "",
            id: change.doc.id,
          };
          const activityIdx = oActivities.findIndex(
            (acti) => acti.id === change.doc.id
          );
          if (activityIdx !== -1) {
            oActivities[activityIdx] = {
              ...oActivities[activityIdx],
              ...newActivity,
            };
          } else {
            oActivities.push({
              ...newActivity,
              approved: "◻",
            });
          }
        }
      }
      setOthersActivities(oActivities);
    }
    if (votesChanges.length > 0) {
      const tempVotesChanges = [...votesChanges];
      setVotesChanges([]);
      let oActivities = [...othersActivities];
      for (let change of tempVotesChanges) {
        const voteData = change.doc.data();
        const activityIdx = oActivities.findIndex(
          (acti) => acti.id === voteData.activity
        );
        if (change.type === "removed") {
          oActivities[activityIdx].approved = "◻";
        } else {
          if (activityIdx !== -1) {
            oActivities[activityIdx] = {
              ...oActivities[activityIdx],
              approved: voteData.upVote ? "✅" : "◻",
            };
          } else {
            oActivities.push({
              approved: voteData.upVote ? "✅" : "◻",
              fullname: "",
              description: "",
              start: new Date(),
              tags: " ",
              upVotes: 0,
              id: voteData.activity,
            });
          }
        }
      }
      setOthersActivities(oActivities);
    }
  }, [othersActivities, activitiesChanges, votesChanges, project]);

  return (
    <>
      <h2>Others' Intellectual Activities:</h2>
      <div className="DataGridBox">
        <DataGrid
          rows={othersActivities}
          columns={othersActivitiesColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          // checkboxSelection
          hideFooterSelectedRowCount
          loading={!activitiesLoaded}
        />
      </div>
      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </>
  );
};

export default ExpenseReports;
