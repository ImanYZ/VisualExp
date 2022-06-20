import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import axios from "axios";
import { ResponsiveCalendar } from "@nivo/calendar";

import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

import { DataGrid } from "@mui/x-data-grid";

import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";
import TimePicker from "@mui/lab/TimePicker";

import {
  firebaseState,
  fullnameState,
  isAdminState,
} from "../../../store/AuthAtoms";
import {
  projectState,
  upVotedTodayState,
  allTagsState,
  allActivitiesState,
  othersActivitiesState,
  otherActivityState,
} from "../../../store/ProjectAtoms";

import SnackbarComp from "../../SnackbarComp";
import AdminIntellectualPoints from "./AdminIntellectualPoints";
import GridCellToolTip from "../../GridCellToolTip";
import { isToday, getISODateString } from "../../../utils/DateFunctions";

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
  // {
  //   field: "upVotes",
  //   headerName: "Points",
  //   type: "number",
  //   width: 70,
  //   valueFormatter: (params) => {
  //     return `${params.value} 👍`;
  //   },
  // },
  {
    field: "upVote",
    headerName: "upVote",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          actionCell={true}
          Tooltip="Up Vote"
          cellValues={cellValues}
        />
      );
    },
  },
  {
    field: "noVote",
    headerName: "noVote",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          actionCell={true}
          Tooltip="Skip"
          cellValues={cellValues}
        />
      );
    },
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 190,
    renderCell: (cellValues) => {
      const tooltipTitle = cellValues.value ? cellValues.value.join(", ") : " ";
      return (
        <Tooltip title={tooltipTitle} placement="top">
          <div>
            {cellValues.value.map((tag, index) => (
              <Chip key={tag + index} variant="outlined" label={tag} />
            ))}
          </div>
        </Tooltip>
      );
    },
  },
];

const activitiesColumns = [
  { field: "start", headerName: "Start", type: "dateTime", width: 190 },
  // { field: "end", headerName: "End", type: "dateTime", width: 190 },
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
    width: 130,
    valueFormatter: (params) => {
      return `${params.value} 👍`;
    },
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 190,
    renderCell: (cellValues) => {
      const tooltipTitle = cellValues.value ? cellValues.value.join(", ") : " ";
      return (
        <Tooltip title={tooltipTitle} placement="top">
          <div>
            {cellValues.value.map((tag, index) => (
              <Chip key={tag + index} variant="outlined" label={tag} />
            ))}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "deleteButton",
    headerName: "Delete",
    width: 7,
    disableColumnMenu: true,
    type: "actions",
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          actionCell={true}
          Tooltip="Delete"
          cellValues={cellValues}
        />
      );
    },
  },
];

const IntellectualPoints = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const isAdmin = useRecoilValue(isAdminState);
  const project = useRecoilValue(projectState);
  const [upVotedToday, setUpVotedToday] = useRecoilState(upVotedTodayState);
  const [allTags, setAllTags] = useRecoilState(allTagsState);
  const [allActivities, setAllActivities] = useRecoilState(allActivitiesState);
  const [othersActivities, setOthersActivities] = useRecoilState(
    othersActivitiesState
  );
  const [otherActivity, setOtherActivity] = useRecoilState(otherActivityState);

  const [dailyPoints, setDailyPoints] = useState([]);
  const [activityDate, setActivityDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  // const [endTime, setEndTime] = useState(null);
  const [activityDescription, setActivityDescription] = useState("");
  const [invalidActivity, setInvalidActivity] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [activitiesChanges, setActivitiesChanges] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [votesChanges, setVotesChanges] = useState([]);
  const [unvotedNum, setUnvotedNum] = useState(0);
  const [otherVoting, setOtherVoting] = useState(false);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const loadTags = async () => {
      console.log('fetch tags Data');
      const tagDocs = await firebase.db.collection("tags").get();
      console.log('fetched tags Data');
      const aTags = [];
      for (let tagDoc of tagDocs.docs) {
        aTags.push(tagDoc.id);
      }
      setAllTags(aTags);
    };
    if (firebase) {
      loadTags();
    }
  }, [firebase]);

  useEffect(() => {
    if (firebase && project && fullname) {
      console.log('fetched activities Data');
      const activitiesQuery = firebase.db
        .collection("activities")
        .where("project", "==", project);
      const activitiesSnapshot = activitiesQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setActivitiesChanges((oldActivitiesChanges) => {
          return [...oldActivitiesChanges, ...docChanges];
        });
        //we don't want to create multiple sockets 
        setActivitiesLoaded(true);
        console.log('fetched activities Data onSnapshot');
      });
      return () => {
        setActivitiesLoaded(false);
        activitiesSnapshot();
      };
    }
  }, [firebase, project, fullname]);

  useEffect(() => {
    if (firebase && project && fullname && activitiesLoaded) {
      console.log('fetch votes');
      const votesQuery = firebase.db
        .collection("votes")
        .where("voter", "==", fullname)
        .where("project", "==", project);
      const votesSnapshot = votesQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setVotesChanges((oldVotesChanges) => {
          return [...oldVotesChanges, ...docChanges];
        });
        console.log('fetch votes snapshot');
      });
      return () => {
        setVotesChanges([]);
        votesSnapshot();
      };
    }
  }, [firebase, project, fullname, activitiesLoaded]);

  const assignDayUpVotesPoint = async (nUpVotedToday) => {
    if (nUpVotedToday === 25) {
      const today = getISODateString(new Date());
      const dayUpVotesDocs = await firebase.db
        .collection("dayUpVotes")
        .where("project", "==", project)
        .where("voter", "==", fullname)
        .where("date", "==", today)
        .limit(1)
        .get();
      if (dayUpVotesDocs.docs.length === 0) {
        try {
          const dayUpVoteRef = firebase.db.collection("dayUpVotes").doc();
          await dayUpVoteRef.set({
            project,
            voter: fullname,
            date: today,
          });
          await firebase.db.runTransaction(async (t) => {
            const researcherRef = firebase.db
              .collection("researchers")
              .doc(fullname);
            const researcherDoc = await t.get(researcherRef);
            const researcherData = researcherDoc.data();
            const researcherDayUpVotePoints = {
              projects: {
                ...researcherData.projects,
                [project]: {
                  ...researcherData.projects[project],
                  dayUpVotePoints: 1,
                },
              },
            };
            if ("dayUpVotePoints" in researcherData.projects[project]) {
              researcherDayUpVotePoints.projects[project].dayUpVotePoints =
                researcherData.projects[project].dayUpVotePoints + 1;
            }
            t.update(researcherRef, researcherDayUpVotePoints);
            const researcherLogRef = firebase.db
              .collection("researcherLogs")
              .doc();
            t.set(researcherLogRef, {
              ...researcherDayUpVotePoints,
              id: researcherRef.id,
              updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
            });
          });
        } catch (err) {
          console.log("Transaction failure:", err);
          window.alert(
            "You did not get today's point for 25 upvotes on others' activities. Copy the text of this complete message to Iman on Microsoft Teams. Do not take a screenshot. The error message is: " +
              err
          );
        }
      }
    }
  };

  useEffect(() => {
    console.log('activitiesChanges');
    if (activitiesChanges.length > 0) {
      const tempActivitiesChanges = [...activitiesChanges];
      setTimeout(()=>{
        setActivitiesChanges([]);
      },0);

      let aActivities = [...allActivities];
      let oActivities = [...othersActivities];
      for (let change of tempActivitiesChanges) {
        if (change.type === "removed") {
          aActivities = aActivities.filter((acti) => acti.id !== change.doc.id);
          oActivities = oActivities.filter((acti) => acti.id !== change.doc.id);
        } else {
          const activityData = change.doc.data();
          if (activityData.fullname === fullname) {
            const newActivity = {
              description: activityData.description,
              start: activityData.sTime.toDate(),
              tags: activityData.tags,
              upVotes: activityData.upVotes,
              deleteButton: "❌",
              id: change.doc.id,
            };
            const activityIdx = aActivities.findIndex(
              (acti) => acti.id === change.doc.id
            );
            if (activityIdx !== -1) {
              aActivities[activityIdx] = {
                ...aActivities[activityIdx],
                ...newActivity,
              };
            } else {
              aActivities.push(newActivity);
            }
          } else {
            const newActivity = {
              fullname: activityData.fullname,
              description: activityData.description,
              start: activityData.sTime.toDate(),
              tags: activityData.tags,
              upVotes: activityData.upVotes,
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
                upVote: "◻",
                noVote: "◻",
                currentVote: 0,
              });
            }
          }
        }
      }
      setOthersActivities(oActivities);
      setAllActivities(aActivities);
    }
    if (votesChanges.length > 0) {
      const tempVotesChanges = [...votesChanges];
      setVotesChanges([]);
      let oActivities = [...othersActivities];
      let dPoints = [...dailyPoints];
      let nUpVotedToday = upVotedToday;
      for (let change of tempVotesChanges) {
        const voteData = change.doc.data();
        let voteDate = voteData.createdAt.toDate();
        if ("updatedAt" in voteData) {
          voteDate = voteData.updatedAt.toDate();
        }
        const didVoteToday = isToday(voteDate);
        voteDate = getISODateString(voteDate);
        const didUpVoteToday = didVoteToday && voteData.upVote;
        const activityIdx = oActivities.findIndex(
          (acti) => acti.id === voteData.activity
        );
        const dPointsIdx = dPoints.findIndex(
          (dPoint) => dPoint.day === voteDate
        );
        if (change.type === "removed") {
          oActivities[activityIdx].upVote = false;
          oActivities[activityIdx].noVote = false;
          oActivities[activityIdx].currentVote = 0;
          nUpVotedToday += didUpVoteToday ? -1 : 0;
          dPoints[dPointsIdx] -= voteData.upVote ? 1 : 0;
        } else {
          if (activityIdx !== -1) {
            if (didVoteToday) {
              if (oActivities[activityIdx].currentVote < 1) {
                if (voteData.upVote) {
                  nUpVotedToday += 1;
                }
              } else {
                if (!voteData.upVote) {
                  nUpVotedToday -= 1;
                }
              }
            }
            oActivities[activityIdx] = {
              ...oActivities[activityIdx],
              upVote: voteData.upVote ? "👍" : "◻",
              noVote: voteData.noVote ? "✘" : "◻",
              currentVote: voteData.upVote - voteData.noVote,
            };
          } else {
            oActivities.push({
              upVote: voteData.upVote ? "👍" : "◻",
              noVote: voteData.noVote ? "✘" : "◻",
              currentVote: voteData.upVote - voteData.noVote,
              fullname: "",
              description: "",
              start: new Date(),
              tags: " ",
              upVotes: 0,
              id: voteData.activity,
            });
          }
          if (dPointsIdx !== -1) {
            if (activityIdx !== -1) {
              if (oActivities[activityIdx].currentVote < 1) {
                if (voteData.upVote) {
                  dPoints[dPointsIdx].value += 1;
                }
              } else {
                if (!voteData.upVote) {
                  dPoints[dPointsIdx].value -= 1;
                }
              }
            } else {
              dPoints[dPointsIdx].value += voteData.upVote ? 1 : 0;
            }
          } else {
            dPoints.push({
              day: voteDate,
              value: voteData.upVote ? 1 : 0,
            });
          }
        }
      }
      assignDayUpVotesPoint(nUpVotedToday);
      setUpVotedToday(nUpVotedToday <= 25 ? nUpVotedToday : 25);
      setOthersActivities(oActivities);
      setDailyPoints(dPoints);
    }
  }, [
    allActivities,
    othersActivities,
    dailyPoints,
    activitiesChanges,
    votesChanges,
    upVotedToday,
    fullname,
    project,
  ]);

  useEffect(() => {
    console.log('othersActivities');
    let theActivity;
    let uActivitiesNum = 0;
    for (let oActivity of othersActivities) {
      if (oActivity.upVote === "◻" && oActivity.noVote === "◻") {
        if (!theActivity) {
          theActivity = oActivity;
        }
        uActivitiesNum += 1;
      }
    }
    if (theActivity) {
      setOtherActivity(theActivity);
    }
    setUnvotedNum(uActivitiesNum);
  }, [othersActivities]);

  useEffect(() => {
    // if (activityDate && startTime && endTime && activityDescription) {
      console.log('activityDate && startTime && activityDescription');
    if (activityDate && startTime && activityDescription) {
      setInvalidActivity(false);
    } else {
      if (!activityDate) {
        setInvalidActivity("Please specify the activity date!");
      } else if (!startTime) {
        setInvalidActivity("Please specify the start time!");
        // } else if (!endTime) {
        //   setInvalidActivity("Please specify the end time!");
      } else if (!activityDescription) {
        setInvalidActivity("Please specify description!");
      }
    }
  }, [activityDate, startTime, activityDescription]);

  const activityDescriptionChange = (event) => {
    setActivityDescription(event.target.value);
  };

  const getActivityTimeStamps = (aDate, sTime, eTime) => {
    const year = aDate.getFullYear();
    const month = aDate.getMonth();
    const date = aDate.getDate();
    const startHours = sTime.getHours();
    const startMinutes = sTime.getMinutes();
    const endHours = eTime.getHours();
    const endMinutes = eTime.getMinutes();
    const stTime = new Date(year, month, date, startHours, startMinutes);
    const etTime = new Date(year, month, date, endHours, endMinutes);

    const sTimestamp = firebase.firestore.Timestamp.fromDate(stTime);
    const eTimestamp = firebase.firestore.Timestamp.fromDate(etTime);
    return { sTimestamp, eTimestamp };
  };

  const activitySubmit = async (event) => {
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
    const { sTimestamp, eTimestamp } = getActivityTimeStamps(
      activityDate,
      startTime,
      endTime
    );
    {
      // let invActivity = false;
      // const activityStartedEarlierDocs = await firebase.db
      //   .collection("activities")
      //   .where("fullname", "==", fullname)
      //   .where("date", "==", activityDate)
      //   .where("startTime", "<=", endTimeStamp)
      //   .get();
      // const activityEntedLaterDocs = await firebase.db
      //   .collection("activities")
      //   .where("fullname", "==", fullname)
      //   .where("date", "==", activityDate)
      //   .where("endTime", ">=", startTimeStamp)
      //   .get();
      // if (
      //   activityStartedEarlierDocs.docs.length > 0 &&
      //   activityEntedLaterDocs.docs.length > 0
      // ) {
      //   for (let activityStartedEarlierDoc of activityStartedEarlierDocs.docs) {
      //     for (let activityEntedLaterDoc of activityEntedLaterDocs.docs) {
      //       if (activityStartedEarlierDoc.id === activityEntedLaterDoc.id) {
      //         invActivity = true;
      //       }
      //     }
      //   }
      // }
      // if (invActivity) {
      //   setInvalidActivity(
      //     "You previously reported an activity overlappig this one."
      //   );
      // } else {
    }
    const currentTime = firebase.firestore.Timestamp.fromDate(new Date());
    for (let sTag of selectedTags) {
      const tagDoc = await firebase.db.collection("tags").doc(sTag).get();
      const tagRef = firebase.db.collection("tags").doc(sTag);
      if (tagDoc.exists) {
        const tagData = tagDoc.data();
        if (!tagData.projects.includes(project)) {
          await firebase.batchUpdate(tagRef, {
            projects: [...tagData.projects, project],
          });
        }
      } else {
        await firebase.batchSet(tagRef, {
          fullname,
          createdAt: currentTime,
          projects: [project],
        });
      }
    }
    const activityData = {
      sTime: sTimestamp,
      eTime: eTimestamp,
      description: activityDescription,
      tags: selectedTags,
    };
    let activityUpdated = false;
    let activityRef;
    if (selectedRows.length > 0) {
      activityData.updatedAt = currentTime;
      activityRef = firebase.db.collection("activities").doc(selectedRows[0]);
      await firebase.batchUpdate(activityRef, activityData);
      activityUpdated = true;
    } else {
      activityData.fullname = fullname;
      activityData.project = project;
      activityData.createdAt = currentTime;
      activityData.upVotes = 0;
      activityRef = firebase.db.collection("activities").doc();
      await firebase.batchSet(activityRef, activityData);
      setStartTime(null);
    }
    const activityLogRef = firebase.db.collection("activityLogs").doc();
    await firebase.batchSet(activityLogRef, {
      ...activityData,
      id: activityRef.id,
    });
    await firebase.commitBatch();
    if (activityUpdated) {
      await firebase.idToken();
      await axios.post("/voteActivityReset", { activity: selectedRows[0] });
    }
    setSnackbarMessage("You successfully submitted your activity!");
    // }
  };

  const clearActivity = (event) => {
    setSelectedRows([]);
    setActivityDate(null);
    setStartTime(null);
    // setEndTime(null);
    setActivityDescription("");
    setSelectedTags([]);
  };

  const gridRowClick = (clickedRow) => {
    const theRow = clickedRow.row;
    if (theRow) {
      setSelectedRows([clickedRow.id]);
      setActivityDate(theRow.start);
      setStartTime(theRow.start);
      // setEndTime(theRow.end);
      setActivityDescription(theRow.description);
      setSelectedTags(theRow.tags);
    } else {
      clearActivity("Nothing");
    }
  };

  const deleteActivity = async (clickedCell) => {
    if (clickedCell.field === "deleteButton") {
      try {
        let aActivities = [...allActivities];
        const activityIdx = aActivities.findIndex(
          (acti) => acti.id === clickedCell.id
        );
        if (
          activityIdx !== -1 &&
          aActivities[activityIdx][clickedCell.field] !== "O"
        ) {
          aActivities[activityIdx][clickedCell.field] = "O";
          setAllActivities(aActivities);
          await firebase.idToken();
          await axios.post("/deleteActivity", {
            activity: clickedCell.id,
          });
          setTimeout(() => {
            clearActivity("Nothing");
          }, 400);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const voteOthersActivities = async (clickedCell) => {
    if (clickedCell.field === "upVote" || clickedCell.field === "noVote") {
      try {
        let oActivities = [...othersActivities];
        const activityIdx = oActivities.findIndex(
          (acti) => acti.id === clickedCell.id
        );
        if (
          activityIdx !== -1 &&
          oActivities[activityIdx][clickedCell.field] !== "O"
        ) {
          oActivities[activityIdx] = {
            ...oActivities[activityIdx],
            [clickedCell.field]: "O",
          };
          setOthersActivities(oActivities);
          await firebase.idToken();
          await axios.post("/vote", {
            activity: clickedCell.id,
            vote: clickedCell.field,
          });
          setSnackbarMessage(
            "You successfully voted for someone else's activity!"
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const voteOtherActivity = (activityId, voteType) => async (event) => {
    try {
      if (!otherVoting) {
        setOtherVoting(true);
        await firebase.idToken();
        await axios.post("/vote", {
          activity: activityId,
          vote: voteType,
        });
        setOtherVoting(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // console.log({ isAdmin, otherActivity, });

  return (
    <>
      {isAdmin && <AdminIntellectualPoints />}
      <h2>Others' Intellectual Activities:</h2>
      <Alert className="VoteActivityAlert" severity="success">
        <h2>Calendar visualization:</h2>
        <ul>
          <li>
            <strong>Each small square</strong> indicates a day. The shades of
            the color indicate the number of points you earned on that day. You
            can hover your mouse over each of the green squares to see the exact
            date and the number of points you earned on that day.
          </li>
          <li>
            <strong>A point per day</strong>: you've earned one point for every
            25 upvotes you cast on your colleagues' activities in every single
            day. So, on each single day, you've earned one or zero points.
          </li>
        </ul>
      </Alert>
      <div id="DataVisualization">
        <ResponsiveCalendar
          data={dailyPoints}
          from="2021-05-01"
          to="2022-05-01"
          emptyColor="#eeeeee"
          colors={["#61cdbb", "#97e3d5"]}
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
          yearSpacing={40}
          monthBorderColor="#ffffff"
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
          legends={[
            {
              anchor: "bottom-right",
              direction: "row",
              translateY: 36,
              itemCount: 4,
              itemWidth: 42,
              itemHeight: 36,
              itemsSpacing: 14,
              itemDirection: "right-to-left",
            },
          ]}
        />
      </div>
      <div className="ColumnsAuto_Auto">
        <Alert className="VoteActivityAlert" severity="success">
          <ul>
            <li>
              <strong>30-minute slots:</strong> every reported activity has
              taken 30 minutes. Please evaluate them accordingly.
            </li>
            <li>
              <strong>
                You earn points for evaluating others' activities:
              </strong>{" "}
              you receive one point for every 25 upvotes you cast on your
              colleagues' activities in every single day.
            </li>
            <li>
              <strong>No partial or extra points:</strong> if on a single day
              you cast more than 25 upvotes, you'll not receive any extra
              points. If you cast fewer than 25 upvotes, you'll not receive any
              partial points, either.
            </li>
            <li>
              <strong>Activity description:</strong> to read the long
              descriptions, you can hover or tap on the description.
            </li>
            <li>
              <strong>Total upvotes:</strong> the total number of upvotes for
              each activity, including your upvote if any, is shown in the third
              column. You can sort and filter every column by clicking the
              column titles.
            </li>
            <li>
              <strong>Upvote ( 👍 ):</strong> you can upvote each activity by
              clicking the fourth column in the corresponding row. You can also
              sort activities by clicking the title of this column to see which
              activities you have or have not upvoted so far.
            </li>
            <li>
              <strong>Skip vote ( ✘ ):</strong> if you prefer not to vote on any
              reported activity, please skip it by clicking the fifth column of
              the corresponding row. This will help you not to waste any time on
              activities that you've already evaluated and decided not to vote
              for.
            </li>
          </ul>
        </Alert>
        {Object.keys(otherActivity).length > 0 ? (
          <Paper className="VoteActivityPaper">
            <h3>
              You've not evaluated {unvotedNum.toLocaleString()} activit
              {unvotedNum === 1 ? "y" : "ies"} yet!
            </h3>
            <h3>One of them is by {otherActivity.fullname}:</h3>
            <p>
              <strong>Start:</strong> {otherActivity.start.toLocaleString()}
            </p>
            <p>
              <strong>Description:</strong> {otherActivity.description}
            </p>
            <div>
              <strong>Tags:</strong>
              {otherActivity.tags.map((tag, index) => (
                <Chip key={tag + index} variant="outlined" label={tag} />
              ))}
            </div>
            <div id="VoteOtherFooter">
              <Tooltip title="Skip" placement="top">
                <Button
                  id="VoteOtherNoVoteBtn"
                  onClick={voteOtherActivity(otherActivity.id, "noVote")}
                  className="Button"
                  variant="contained"
                >
                  {otherVoting ? (
                    <CircularProgress color="warning" size="16px" />
                  ) : (
                    "✘"
                  )}
                </Button>
              </Tooltip>
              <Tooltip title="Up Vote" placement="top">
                <Button
                  id="VoteOtherUpVoteBtn"
                  onClick={voteOtherActivity(otherActivity.id, "upVote")}
                  className="Button"
                  variant="contained"
                >
                  {otherVoting ? (
                    <CircularProgress color="warning" size="16px" />
                  ) : (
                    "👍"
                  )}
                </Button>
              </Tooltip>
            </div>
          </Paper>
        ) : (
          <div></div>
        )}
      </div>
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
          onCellClick={voteOthersActivities}
        />
      </div>
      {!isAdmin && (
        <>
          <h2>Your Intellectual Activities:</h2>
          <Alert severity="error">
            <strong>
              Please DO NOT report the following activities; you'll
              automatically receive points for them:
            </strong>
            <ul>
              <li>
                <strong>Running experiment sessions:</strong> you receive 16
                points for every first session and 7 points for every second or
                third session you run.
              </li>
              <li>
                <strong>Evaluating others' activities:</strong> you receive one
                point for every 25 upvotes you cast on your colleagues
                activities in every single day.
              </li>
              <li>
                <strong>
                  Adding instructors/administrators' contact info:
                </strong>{" "}
                you receive one point for every 25 instructors/administrators'
                contact information that you add in every single day.
              </li>
              <li>
                <strong>
                  Verifying instructors/administrators' contact info:
                </strong>{" "}
                you receive one point for every 25 upvotes you cast in every
                single day, verifying the contact information of the
                instructors/administrators added by other researchers.
              </li>
              <li>
                <strong>Coding participants' feedback:</strong> you receive one
                point for every code you assign to any participant feedback,
                only if the same code is assigned to the feedback by 2 other
                researchers.
              </li>
              <li>
                <strong>Coding participants' free recall responses:</strong> you
                receive one point for every code you assign to any participant
                free recall response, only if the same code is assigned to the
                response by 2 other researchers.
              </li>
            </ul>
          </Alert>
          <h3>
            You're reporting your activities for project{" "}
            <strong>{project}</strong>.
          </h3>
          <div className="Columns40_60">
            <Alert className="VoteActivityAlert" severity="success">
              <ul>
                <li>
                  <strong>30-minute slots:</strong> report your activities in
                  only 30-minute time slots.
                </li>
                <li>
                  <strong>To enter an activity:</strong> input the activity info
                  in the corresponding boxes below and click the "ADD ACTIVITY"
                  button.
                </li>
                <li>
                  <strong>To update an activity:</strong> click the
                  corresponding row. All the activity info shows up in the boxes
                  below. Modify them and then click the "UPDATE ACTIVITY"
                  button. To switch to another activity to update, you can click
                  the other row.
                </li>
                <li>
                  <strong>To delete an activity:</strong> click the ❌ button in
                  the corresponding row.
                </li>
                <li>
                  <strong>To clear the input boxes:</strong> click the "CLEAR
                  SELECTION" button to unselect the activity and clear the input
                  boxes.
                </li>
              </ul>
            </Alert>
            <Paper className="VoteActivityPaper">
              <div id="ActivityDateTimeContainer">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <div className="ActivityDateTimePicker">
                    <DatePicker
                      label="Activity Date"
                      value={activityDate}
                      onChange={(newValue) => {
                        setActivityDate(newValue);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </div>
                  <div className="ActivityDateTimePicker">
                    <TimePicker
                      className="ActivityDateTimePicker"
                      label="Start Time"
                      value={startTime}
                      onChange={(newValue) => {
                        setStartTime(newValue);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </div>
                  {/* <div className="ActivityDateTimePicker">
            <TimePicker
              className="ActivityDateTimePicker"
              label="End Time"
              value={endTime}
              onChange={(newValue) => {
                setEndTime(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </div> */}
                </LocalizationProvider>
              </div>
              <div id="ActivityDescriptionContainer">
                <TextareaAutosize
                  id="ActivityDescriptionTextArea"
                  aria-label="Activity Description Text Area"
                  minRows={7}
                  placeholder={
                    "Explain what you did in detail so that others can understand its value."
                  }
                  onChange={activityDescriptionChange}
                  value={activityDescription}
                />
              </div>
              <div>
                <Autocomplete
                  multiple
                  freeSolo
                  id="TagsSelector"
                  options={allTags.map((tag) => tag)}
                  value={selectedTags}
                  onChange={(event, tags) => {
                    const sTags = [];
                    for (let tag of tags) {
                      sTags.push(
                        tag
                          .replace(".", " ")
                          .replace("__", " ")
                          .replace("/", " ")
                      );
                    }
                    setSelectedTags(sTags);
                  }}
                  renderTags={(tags, getTagProps) =>
                    tags.map((tag, index) => (
                      <Chip
                        key={tag + index}
                        variant="outlined"
                        label={tag}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Tags (without dots or slashes!)"
                      // placeholder="Tags"
                    />
                  )}
                />
              </div>
              {invalidActivity && (
                <div className="Error">{invalidActivity}</div>
              )}
              <div id="ActivityDateTimeContainer">
                <Button
                  onClick={activitySubmit}
                  className={
                    !invalidActivity
                      ? "Button SubmitButton"
                      : "Button SubmitButton Disabled"
                  }
                  variant="contained"
                  disabled={!invalidActivity ? null : true}
                >
                  {selectedRows.length === 0
                    ? "Add Activity"
                    : "Update Activity"}
                </Button>
                {selectedRows.length > 0 && (
                  <Button
                    className="Button ClearButton"
                    onClick={clearActivity}
                    variant="contained"
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
            </Paper>
          </div>
          <div className="DataGridBox">
            <DataGrid
              rows={allActivities}
              columns={activitiesColumns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoPageSize
              autoHeight
              hideFooterSelectedRowCount
              loading={!activitiesLoaded}
              onRowClick={gridRowClick}
              onCellClick={deleteActivity}
              onSelectionChange={(newSelection) => {
                setSelectedRows(newSelection.rowIds);
              }}
              selectionModel={selectedRows}
            />
          </div>
        </>
      )}
      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </>
  );
};

export default IntellectualPoints;
