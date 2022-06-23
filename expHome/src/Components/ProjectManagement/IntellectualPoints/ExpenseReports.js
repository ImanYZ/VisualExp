import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import axios from "axios";
import { ResponsiveCalendar } from "@nivo/calendar";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import CalendarPicker from "@mui/x-date-pickers";
import TimePicker from "@mui/lab/TimePicker";
import DatePicker from "@mui/lab/DatePicker";

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
  { field: "fullname", headerName: "Fullname", width: 190, filterable: false },
  { field: "start", headerName: "Start", type: "dateTime", width: 190 },
  {
    field: "description",
    headerName: "Description",
    width: 400,
    filterable: false,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "upVotes",
    headerName: "Points",
    type: "number",
    filterable: false,
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
  const [displayActivities, setDisplayActivities] = useState([]);

  const [activitiesChanges, setActivitiesChanges] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [votesChanges, setVotesChanges] = useState([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [clear, setClear] = useState(false);
  const [showPayButton, setShowPayButton] = useState(false);
  const [showAllActivitiesButton, setShowAllActivitiesButton] = useState(false);
  const [pay, setPay] = useState(0);

  const [activityDateFrom, setActivityDateFrom] = useState(null);
  const [activityDateTo, setActivityDateTo] = useState(null);
  const [onlyAproved, setOnlyAproved] = useState(false);
  const [onlyPaid, setOnlyPaid] = useState(false);

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
  }, [firebase, project, clear]);

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
        setOthersActivities([]);
        votesSnapshot();
      };
    }
  }, [firebase, project, activitiesLoaded, clear]);

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
          let isIncluded = true;
          if (activityDateFrom && activityData.start < activityDateFrom) {
            isIncluded = false;
          }
          if (activityDateTo && activityData.start > activityDateTo) {
            isIncluded = false;
          }
          if (onlyAproved && !activityData.approved) {
            isIncluded = false;
          }
          if (onlyPaid && !activityData.paid) {
            isIncluded = false;
          }
          const newActivity = {
            fullname: activityData.fullname,
            description: activityData.description,
            start: activityData.sTime.toDate(),
            tags: activityData.tags,
            upVotes: activityData.upVotes,
            paid: activityData.paid ? "PAID" : "",
            id: change.doc.id,
            isIncluded,
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
  }, [
    othersActivities,
    activitiesChanges,
    votesChanges,
    project,
    activityDateFrom,
    activityDateTo,
    onlyAproved,
    onlyPaid,
  ]);

  useEffect(() => {
    const oActivities = othersActivities.map((oActi) => oActi.isIncluded);
    setDisplayActivities(oActivities);
  }, [othersActivities]);

  const filterDate = () => {
    let oActivities = [];
    for (let act of displayActivities) {
      if (act.start >= activityDateFrom && act.start <= activityDateTo) {
        oActivities.push({ ...act });
      }
    }
    setDisplayActivities(oActivities);
    setShowPayButton(true);
    setShowAllActivitiesButton(true);
  };

  const markPaid = async () => {
    let oActivities = [];
    for (let act of displayActivities) {
      oActivities.push({ ...act, paid: "PAID" });
      const ActivitiesRef = firebase.db.collection("activities").doc(act.id);
      const actDoc = await firebase.db
        .collection("activities")
        .doc(act.id)
        .get();

      const actData = actDoc.data();
      console.log({ ...actData, paid: true });
      ActivitiesRef.set({ ...actData, paid: true });
      console.log(act.id);
    }
    setPay(pay + oActivities.length * 20);
    console.log(oActivities);
    setDisplayActivities(oActivities);
    setShowPayButton(false);
  };
  const showAllActivities = () => {
    setDisplayActivities(othersActivities);
    setShowPayButton(false);
    setShowAllActivitiesButton(false);
  };

  const handleOnlyApproved = (event) => {
    setOnlyAproved(event.target.checked);
    let oActivities = [];
    for (let act of othersActivities) {
      if (
        event.target.checked &&
        act.approved === "✅" &&
        !event.target.checked &&
        act.approved === "◻"
      ) {
        oActivities.push({ ...act });
      }
    }
    setDisplayActivities(oActivities);
    setShowPayButton(true);
    setShowAllActivitiesButton(true);
  };

  return (
    <>
      <h2>Activities:</h2>
      <Paper>
        <div style={{ align: "center" }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="ActivityDateTimePicker">
              <DatePicker
                label="from"
                value={activityDateFrom}
                onChange={(newValue) => {
                  setActivityDateFrom(newValue);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </div>
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="ActivityDateTimePicker">
              <DatePicker
                label="To"
                value={activityDateTo}
                onChange={(newValue) => {
                  setActivityDateTo(newValue);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </div>
          </LocalizationProvider>
          <Switch
            checked={onlyAproved}
            onChange={handleOnlyApproved}
            inputProps={{ "aria-label": "Change Only Approved Filter" }}
          />

          <div style={{ position: "relative", top: "5px", bottom: "20px" }}>
            <Stack spacing={2} direction="row">
              <Button variant="contained" onClick={filterDate} size="large">
                {" "}
                Show the activities for this period{" "}
              </Button>
            </Stack>
          </div>
        </div>

        <div style={{ position: "relative", left: "45%", top: "35px" }}>
          {showAllActivitiesButton && (
            <Button variant="contained" onClick={showAllActivities}>
              Show all The activities
            </Button>
          )}
        </div>

        {showPayButton && (
          <Button variant="contained" color="success" onClick={markPaid}>
            Mark as Paid
          </Button>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            height: "100px",
          }}
        ></div>
      </Paper>

      <Box sx={{ mb: "40px" }}>
        <DataGrid
          rows={displayActivities}
          columns={othersActivitiesColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          // checkboxSelection
          components={{ Toolbar: GridToolbar }}
          FooterSelectedRowCount
          loading={!activitiesLoaded}
        />
      </Box>

      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </>
  );
};

export default ExpenseReports;
