import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import axios from "axios";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Autocomplete from "@mui/material/Autocomplete";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

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
  { field: "approved", headerName: "Approved", width: 100 },
  { field: "paid", headerName: "Paid", width: 70 },
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

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

  const [shownActivities, setShownActivities] = useState([]);
  const [amount, setAmount] = useState(0);
  const [researchers, setResearchers] = useState([]);
  const [onlyResearchers, setOnlyResearchers] = useState([]);
  const [researcherActivities, setResearcherActivities] = useState([]);
  const [activityDateFrom, setActivityDateFrom] = useState(null);
  const [activityDateTo, setActivityDateTo] = useState(null);
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [onlyUnpaid, setOnlyUnpaid] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (firebase && project) {
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
      });
      return () => {
        setVotesChanges([]);
        setOthersActivities([]);
        votesSnapshot();
      };
    }
  }, [firebase, project, activitiesLoaded]);

  useEffect(() => {
    if (activitiesChanges.length > 0) {
      const tempActivitiesChanges = [...activitiesChanges];
      setActivitiesChanges([]);

      let oActivities = [...othersActivities];
      const oResearchers = [...researchers];
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
          if (onlyApproved && !activityData.approved) {
            isIncluded = false;
          }
          if (onlyUnpaid && !activityData.paid) {
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
          if (!oResearchers.includes(activityData.fullname)) {
            oResearchers.push(activityData.fullname);
          }
        }
      }
      setOthersActivities(oActivities);
      setResearchers(oResearchers);
      setOnlyResearchers(oResearchers);
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
    researchers,
    activitiesChanges,
    votesChanges,
    project,
    activityDateFrom,
    activityDateTo,
    onlyApproved,
    onlyUnpaid,
  ]);

  useEffect(() => {
    const rActivities = {};
    const oActivities = [];
    for (let oActivity of othersActivities) {
      if (
        (onlyResearchers.length === researchers.length ||
          onlyResearchers.includes(oActivity.fullname)) &&
        (!onlyApproved || oActivity.approved === "✅") &&
        (!onlyUnpaid || oActivity.paid === "") &&
        (!activityDateFrom || oActivity.start >= activityDateFrom) &&
        (!activityDateTo || oActivity.start <= activityDateTo)
      ) {
        oActivities.push(oActivity);
        if (oActivity.fullname in rActivities) {
          rActivities[oActivity.fullname] += 1;
        } else {
          rActivities[oActivity.fullname] = 1;
        }
      }
    }
    setResearcherActivities(
      Object.keys(rActivities).map((researcher) => ({
        researcher,
        num: rActivities[researcher],
      }))
    );
    setShownActivities(oActivities);
    setAmount(oActivities.length * 10);
    if (
      onlyResearchers.length !== researchers.length ||
      onlyApproved ||
      onlyUnpaid ||
      activityDateFrom ||
      activityDateTo
    ) {
      setShowAll(false);
    }
  }, [
    othersActivities,
    onlyResearchers,
    researchers,
    onlyApproved,
    onlyUnpaid,
    activityDateFrom,
    activityDateTo,
  ]);

  const markPaid = async () => {
    if (!isSubmitting) {
      try {
        setIsSubmitting(true);
        await firebase.idToken();
        await axios.post("/markPaid", { activities: shownActivities });
        setSnackbarMessage("You successfully marked these activities as paid!");
        setIsSubmitting(false);
      } catch (err) {
        setSnackbarMessage(
          "Your request was not successfully saved! Please try again!"
        );
      }
    }
  };

  const handleOnlyResearchers = (event) => {
    const {
      target: { value },
    } = event;
    // On autofill we get a stringified value.
    const oResearchers = typeof value === "string" ? value.split(",") : value;
    setOnlyResearchers(oResearchers);
  };

  const handleOnlyApproved = (event) => {
    setOnlyApproved(event.target.checked);
  };

  const handleOnlyUnpaid = (event) => {
    setOnlyUnpaid(event.target.checked);
  };

  const handleShowAll = (event) => {
    if (event.target.checked) {
      setActivityDateFrom(null);
      setActivityDateTo(null);
      setOnlyApproved(false);
      setOnlyUnpaid(false);
      setOnlyResearchers(researchers);
      setShowAll(true);
    }
  };

  const handleActivityDateFrom = (newValue) => {
    setActivityDateFrom(newValue);
    const oActivities = [];
  };

  const handleActivityDateTo = (newValue) => {
    setActivityDateTo(newValue);
  };

  return (
    <>
      <h2 style={{ marginTop: "25px" }}>Researcher Activities & Expenses</h2>
      <Paper sx={{ m: "13px", p: "19px 19px 0px 19px" }}>
        <Stack direction="row" spacing={2}>
          <FormControl sx={{ width: 280 }}>
            <InputLabel id="multiple-researcher-label">
              Researcher(s)
            </InputLabel>
            <Select
              labelId="multiple-researcher-label"
              id="multiple-researcher"
              multiple
              value={onlyResearchers}
              onChange={handleOnlyResearchers}
              input={<OutlinedInput label="Researcher(s)" />}
              MenuProps={MenuProps}
            >
              {researchers.map((researcher) => (
                <MenuItem key={researcher} value={researcher}>
                  {researcher}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Activities Since"
              value={activityDateFrom}
              onChange={handleActivityDateFrom}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Activities Until"
              value={activityDateTo}
              onChange={handleActivityDateTo}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </Stack>
        <FormGroup sx={{ m: "10px 10px 0px 10px" }} row>
          <FormControlLabel
            control={
              <Switch
                checked={onlyApproved}
                onChange={handleOnlyApproved}
                inputProps={{ "aria-label": "Change only approved filter" }}
              />
            }
            label="Only Approved"
          />
          <FormControlLabel
            control={
              <Switch
                checked={onlyUnpaid}
                onChange={handleOnlyUnpaid}
                inputProps={{ "aria-label": "Switch only unpaid filter" }}
              />
            }
            label="Only Unpaid"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showAll}
                onChange={handleShowAll}
                inputProps={{ "aria-label": "Clear all filters" }}
              />
            }
            label="Show All"
          />
        </FormGroup>
        <Table sx={{ m: "25px 0px 0px 0px", width: 550 }} aria-label="Expenses">
          <TableBody>
            {researcherActivities.map((rObj) => {
              return (
                <TableRow key={rObj.researcher}>
                  <TableCell>{rObj.researcher}</TableCell>
                  <TableCell>
                    {(rObj.num / 2).toLocaleString()} hrs x $20
                  </TableCell>
                  <TableCell>= ${(rObj.num * 10).toLocaleString()}</TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell sx={{ fontSize: "19px" }}>Total</TableCell>
              <TableCell sx={{ fontSize: "19px" }}>
                {(shownActivities.length / 2).toLocaleString()} hrs x $20
              </TableCell>
              <TableCell sx={{ fontSize: "19px" }}>
                = ${amount.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Box sx={{ position: "relative", left: 610, top: -55 }}>
          <LoadingButton
            variant="contained"
            size="large"
            onClick={markPaid}
            loading={isSubmitting}
            loadingPosition="end"
            endIcon={<AttachMoneyIcon />}
          >
            Mark as Paid
          </LoadingButton>
        </Box>
      </Paper>
      <Paper sx={{ m: "13px 13px 40px 13px", p: "19px" }}>
        <DataGrid
          rows={shownActivities}
          columns={othersActivitiesColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          // checkboxSelection
          // components={{ Toolbar: GridToolbar }}
          FooterSelectedRowCount
          loading={!activitiesLoaded}
        />
      </Paper>
      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </>
  );
};

export default ExpenseReports;
