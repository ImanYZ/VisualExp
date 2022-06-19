import React, { useState, useEffect, Suspense } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import axios from "axios";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

import { DataGrid } from "@mui/x-data-grid";

import FullscreenIcon from "@mui/icons-material/Fullscreen";

import {
  firebaseState,
  fullnameState,
  isAdminState,
} from "../../../store/AuthAtoms";
import {
  projectState,
  instructorsState,
  othersInstructorsState,
  instructorsTodayState,
  upvotedInstructorsTodayState,
} from "../../../store/ProjectAtoms";

import SnackbarComp from "../../SnackbarComp";
import CSCObjLoader from "./CSCObjLoader";
import GridCellToolTip from "../../GridCellToolTip";
import communities from "../../Home/modules/views/communitiesOrder";

import { isToday, getISODateString } from "../../../utils/DateFunctions";
import { isValidHttpUrl, isEmail } from "../../../utils/general";

import GoogleScholarIcon from "../../../assets/GoogleScholarIcon.svg";

import "./AddInstructor.css";

const CountryStateCity = React.lazy(() =>
  import("./CountryStateCity/CountryStateCity")
);

const prefixes = [
  "1st Lt",
  "Adm",
  "Atty",
  "Brother",
  "Capt",
  "Chief",
  "Cmdr",
  "Col",
  "Dean",
  "Dr",
  "Elder",
  "Father",
  "Gen",
  "Gov",
  "Hon",
  "Lt Col",
  "Maj",
  "MSgt",
  "Mr",
  "Mrs",
  "Ms",
  "Prince",
  "Prof",
  "Rabbi",
  "Rev",
  "Sister",
];

const occupations = ["Instructor", "Administrator"];

// From https://www.act.org/content/act/en/research/reports/act-publications/college-choice-report-class-of-2013/college-majors-and-occupational-choices/college-majors-and-occupational-choices.html
// Later on, add other majors.
// const majors = [
//   "ARTS: VISUAL & PERFORMING",
//   "BUSINESS",
//   "COMMUNICATIONS",
//   "COMMUNITY, FAMILY, & PERSONAL SERVICES",
//   "COMPUTER SCIENCE & MATHEMATICS",
//   "EDUCATION",
//   "ENGLISH & FOREIGN LANGUAGES",
//   "INFORMATION SCIENCE",
//   "PHILOSOPHY, RELIGION, & THEOLOGY",
//   "SOCIAL SCIENCES & LAW",
// ];
const majors = communities.map((communi) => communi.title);

const initialState = {
  country: "🇺🇸 United States;US",
  stateInfo: "Michigan;MI;US",
  city: "Ann Arbor",
  major: "",
  occupation: "Instructor",
  position: "",
  prefix: "Prof",
  webURL: "",
  GoogleScholar: "",
  citations: 0,
};

let lastCountry;

const doNothing = () => {};

const renderInstitution = (params) => (
  <TextField {...params} label="Institution" variant="outlined" />
);

const getCountry = (c) => {
  const matches = c.match(/(.+);[A-Z]+/);
  return matches.length > 1 ? matches[1] : "";
};

const getStateId = (s) => {
  const matches = s.match(/(.+);[A-Z]+;[A-Z]+/);
  return matches.length > 1 ? matches[1] : "";
};

let instructorsColumns = [
  {
    field: "GoogleScholar",
    headerName: "Google Scholar/ResearchGate Address",
    width: 100,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={true} cellValues={cellValues} />;
    },
  },
  {
    field: "citations",
    headerName: "Citations",
    type: "number",
    width: 100,
  },
  {
    field: "webURL",
    headerName: "Website Address",
    width: 100,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={true} cellValues={cellValues} />;
    },
  },
  {
    field: "prefix",
    headerName: "Prefix",
    width: 70,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "firstname",
    headerName: "Firstname",
    width: 130,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "lastname",
    headerName: "Lastname",
    width: 130,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 130,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "institution",
    headerName: "Institution",
    width: 130,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "occupation",
    headerName: "Occupation",
    width: 130,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "position",
    headerName: "Position",
    width: 130,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "major",
    headerName: "1Cademy Community",
    width: 130,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "country",
    headerName: "Country",
    width: 130,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip={cellValues.value ? getCountry(cellValues.value) : ""}
        />
      );
    },
  },
  {
    field: "stateInfo",
    headerName: "State",
    width: 100,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip={cellValues.value ? getStateId(cellValues.value) : ""}
        />
      );
    },
  },
  {
    field: "city",
    headerName: "City",
    width: 100,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  // {
  //   field: "deleteButton",
  //   headerName: "Delete",
  //   width: 7,
  //   disableColumnMenu: true,
  //   type: "actions",
  //   renderCell: (cellValues) => {
  // return <GridCellToolTip isLink={false} actionCell={true} Tooltip="Delete" cellValues={cellValues} />;
  //   },
  // },
];

let othersInstructorsColumns = [
  ...instructorsColumns,
  {
    field: "upVote",
    headerName: "Up Vote",
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
    field: "downVote",
    headerName: "Down Vote",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          actionCell={true}
          Tooltip="Down Vote"
          cellValues={cellValues}
        />
      );
    },
  },
  {
    field: "comment",
    headerName: "comment",
    width: 250,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
];

const extraColumns = [
  {
    field: "upVotes",
    headerName: "Up Votes",
    type: "number",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "downVotes",
    headerName: "Down Votes",
    type: "number",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "comments",
    headerName: "comments",
    width: 250,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "explanation",
    headerName: "Extra Information",
    width: 250,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
];

instructorsColumns = [...instructorsColumns, ...extraColumns];
othersInstructorsColumns = [...othersInstructorsColumns, ...extraColumns];

const AddInstructor = (props) => {
  const firebase = useRecoilValue(firebaseState);
  // The authenticated researcher fullname
  const fullname = useRecoilValue(fullnameState);
  const isAdmin = useRecoilValue(isAdminState);
  const project = useRecoilValue(projectState);
  // The instructors/school administrators added by this authenticated
  // researcher
  const [instructors, setInstructors] = useRecoilState(instructorsState);
  // The instructors/school administrators added by researchers other than this
  // authenticated researcher
  const [othersInstructors, setOthersInstructors] = useRecoilState(
    othersInstructorsState
  );
  // The instructors/school administrators added by this authenticated
  // researcher today.
  const [instructorsToday, setInstructorsToday] = useRecoilState(
    instructorsTodayState
  );
  // The instructors/school administrators added by other researchers that this
  // authenticated researcher upvoted today.
  const [upvotedInstructorsToday, setUpvotedInstructorsToday] = useRecoilState(
    upvotedInstructorsTodayState
  );

  // States for the fileds that the authenticated researcher enters for each
  // instructor/school administrator.
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [explanation, setExplanation] = useState("");
  const [institution, setInstitution] = useState(
    "University of Michigan - Ann Arbor"
  );
  const [institutionInput, setInstitutionInput] = useState("");
  // Every other filed value that the authenticated user can add/modify goes
  // into this state.
  const [values, setValues] = useState(initialState);

  // To show the corresponding error
  const [invalidInstructor, setInvalidInstructor] = useState("");

  // Whether the instructor that the authenticated researcher is trying to add
  // already exists, based on their email address. In this case, we should show
  // an error message.
  const [alreadyExists, setAlreadyExists] = useState(false);
  // These are the arrays of all the countries, states, cities, and institutions
  // to load in the drop-down menu.
  const [CSCObj, setCSCObj] = useState(null);
  const [allCountries, setAllCountries] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  // Helper states to accumulate changes in all the instructors/votes commming
  // from the database and indicate that all the instructors are loaded.
  const [instructorsLoaded, setInstructorsLoaded] = useState(false);
  const [instructorsChanges, setInstructorsChanges] = useState([]);
  const [votesChanges, setVotesChanges] = useState([]);

  // When clicking each row of the datagrid, which consists of the
  // instructors/school adinistrators added by the authenticated researcher, we
  // keep those rows in this state to let the authenticated researcher update
  // the data for this row.
  const [selectedRows, setSelectedRows] = useState([]);

  // Number of times the authenticated researcher voted others' instructors.
  const [unvotedNum, setUnvotedNum] = useState(0);
  // A single instructor/school administrator that the authenticated researcher
  // has not voted on yet.
  const [otherInstructor, setOtherInstructor] = useState({});
  // The autheniticated researcher has submitted their vote but the response has
  // not returned from the database yet.
  const [otherVoting, setOtherVoting] = useState(false);
  // The comment that the authenticated researcher can add to any instructor
  // entry.
  const [comment, setComment] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const loadCSCObj = CSCObjLoader(CSCObj, setCSCObj, setAllCountries);

  // Load the array of all the institutions located in the US or Canada to load
  // in the drop-down menu.
  useEffect(() => {
    const loadInstitutions = async () => {
      if (institutions.length === 0) {
        const institutionsObj = await import(
          "../../../assets/edited_universities.json"
        );
        let institutionsList = institutionsObj.default
          .filter((l) => ["United States", "Canada"].includes(l.country))
          .map((l) => l.name);
        institutionsList = [...new Set(institutionsList)];
        setInstitutions(institutionsList);
      }
    };
    loadInstitutions();
  }, []);

  // Listen to all the changes to the instructors' collection and put all of
  // them in instructorsChanges. After that, set INstructorsLoaded to true.
  useEffect(() => {
    if (firebase) {
      const instructorsQuery = firebase.db.collection("instructors");
      const instructorsSnapshot = instructorsQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setInstructorsChanges((oldInstructorsChanges) => {
          return [...oldInstructorsChanges, ...docChanges];
        });
        setInstructorsLoaded(true);
      });
      return () => {
        setInstructorsChanges([]);
        instructorsSnapshot();
      };
    }
  }, [firebase]);

  // After making sure the the instructors are loaded for the first time, define
  // a new spashot listener to listen to all the instructor votes by the
  // authenticated researcher and save all of them in votesChanges.
  useEffect(() => {
    if (firebase && project && fullname && instructorsLoaded) {
      const instructorVotesQuery = firebase.db
        .collection("instructorVotes")
        .where("voter", "==", fullname)
        .where("project", "==", project);
      const instructorVotesSnapshot = instructorVotesQuery.onSnapshot(
        (snapshot) => {
          const docChanges = snapshot.docChanges();
          setVotesChanges((oldVotesChanges) => {
            return [...oldVotesChanges, ...docChanges];
          });
        }
      );
      return () => {
        setVotesChanges([]);
        instructorVotesSnapshot();
      };
    }
  }, [firebase, project, fullname, instructorsLoaded]);

  const assignDayUpVotesPoint = async (nUpVotedToday) => {
    if (nUpVotedToday === 16) {
      const today = getISODateString(new Date());
      const dayUpVotesDocs = await firebase.db
        .collection("dayInstructorUpVotes")
        .where("project", "==", project)
        .where("voter", "==", fullname)
        .where("date", "==", today)
        .limit(1)
        .get();
      if (dayUpVotesDocs.docs.length === 0) {
        try {
          const dayUpVoteRef = firebase.db
            .collection("dayInstructorUpVotes")
            .doc();
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
                  dayInstructorUpVotes: 1,
                },
              },
            };
            if ("dayInstructorUpVotes" in researcherData.projects[project]) {
              researcherDayUpVotePoints.projects[project].dayInstructorUpVotes =
                researcherData.projects[project].dayInstructorUpVotes + 1;
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
            "You did not get today's point for 16 upvotes on others' instructors. Copy the text of this complete message to Iman on Microsoft Teams. Do not take a screenshot. The error message is: " +
              err
          );
        }
      }
    }
  };

  // Based on the changes to the instructors and votes comming from the database
  // listeners, make the corresponding changes to differnt states.
  useEffect(() => {
    if (instructorsChanges.length > 0) {
      // We make a copy of all the instructor changes and delete all the content
      // of the instructorChanges, so that if new changes come from the database
      // listener while we're working on the previous changes, they do not mess
      // up.
      const tempInstructorsChanges = [...instructorsChanges];
      setInstructorsChanges([]);
      let insts = [...instructors];
      let oInsts = [...othersInstructors];
      let instToday = instructorsToday;
      for (let change of tempInstructorsChanges) {
        const instructorData = change.doc.data();
        // If the change indicates that the instructor doc is removed:
        if (instructorData.deleted || change.type === "removed") {
          // If the instructor was added by the authenticated researcher:
          if (instructorData.fullname === fullname) {
            // Then, we need to remove it from instructors.
            const instructorIdx = insts.findIndex(
              (instruct) => instruct.id === change.doc.id
            );
            if (instructorIdx !== -1) {
              insts.splice(instructorIdx, 1);
            }
          } else {
            // If the instructor was added by other researchers:
            // Then, we need to remove it from othersInstructors.
            const instructorIdx = oInsts.findIndex(
              (instruct) => instruct.id === change.doc.id
            );
            if (instructorIdx !== -1) {
              oInsts.splice(instructorIdx, 1);
            }
          }
        } else {
          // Otherwise, we know that the entry was added/updated.
          // If the entry was added by the authenticated researcher:
          if (instructorData.fullname === fullname) {
            // We combine the document data with its id and enty array for
            // comments to start with.
            const newInstructor = {
              comments: [],
              ...instructorData,
              // deleteButton: "❌",
              id: change.doc.id,
            };
            const instructorIdx = insts.findIndex(
              (instruct) => instruct.id === change.doc.id
            );
            // If the instructor previously existed in the instructors, we just
            // need to update it to the new values.
            if (instructorIdx !== -1) {
              insts[instructorIdx] = {
                ...insts[instructorIdx],
                ...newInstructor,
              };
            } else {
              // If the instructor did not previously exist in the instructors,
              // we add it.
              insts.push(newInstructor);
              // If this instructor document is created today, we increment the
              // value of instructorsToday.
              if (isToday(instructorData.createdAt.toDate())) {
                instToday += 1;
              }
            }
          } else {
            // Otherwise, if the entry was added by researchers other than the
            // authenticated researcher:
            // We combine the document data with its id and enty array for
            // comments to start with.
            const newInstructor = {
              comments: [],
              ...instructorData,
              id: change.doc.id,
            };
            // We check whether the instructor object already exists in
            // othersInstructors, and if it exists, what is its index to update
            // it.
            const instructorIdx = oInsts.findIndex(
              (instruct) => instruct.id === change.doc.id
            );
            if (instructorIdx !== -1) {
              oInsts[instructorIdx] = {
                ...oInsts[instructorIdx],
                ...newInstructor,
              };
            } else {
              // If it does not exist, we just push it together with default
              // values for upVote, downVote, and currentVote. The value of
              // currentVote is always upVote - downVote, which can be -1, 0, or
              // 1.
              oInsts.push({
                ...newInstructor,
                upVote: "◻",
                downVote: "◻",
                currentVote: 0,
              });
            }
          }
        }
      }
      // When a researcher adds 7 instructors/school administrators in a single
      // day, they get a point for it. No partial points for less than 7, and no
      // extra points for more than 7. So, if they've already added 7, they can
      // keep adding more, but we do not increase the number on the toolbar to
      // make sure they do not think they can earn more points by adding more.
      setInstructorsToday(instToday <= 7 ? instToday : 7);
      setInstructors(insts);
      setOthersInstructors(oInsts);
    }
    if (votesChanges.length > 0) {
      // We make a copy of all the vote changes and delete all the content of
      // the voteChanges, so that if new changes come from the database listener
      // while we're working on the previous changes, they do not mess up.
      const tempVotesChanges = [...votesChanges];
      setVotesChanges([]);
      let oInsts = [...othersInstructors];
      let nUpVotedToday = upvotedInstructorsToday;
      for (let change of tempVotesChanges) {
        const voteData = change.doc.data();
        // We need to figure out whether they cast this vote today to determine
        // whether they should receive the point for the day.
        let didVoteToday = isToday(voteData.createdAt.toDate());
        if ("updatedAt" in voteData) {
          didVoteToday = isToday(voteData.updatedAt.toDate());
        }
        // They only receive a point for upvotin, not ignoring (noVote).
        const didUpVoteToday = didVoteToday && voteData.upVote;
        // They only vote on the instructors/school administrators added by
        // other researchers. So, we should find and update the corresponding
        // object in othersInstructors.
        const oInstsIdx = oInsts.findIndex(
          (instr) => instr.id === voteData.instructor
        );
        if (change.type === "removed") {
          // If the vote is removed and othersInstructor exists, we should reset
          // its votes and comment and decrement nUpVotedToday only if
          // didUpVoteToday.
          if (oInstsIdx !== -1) {
            oInsts[oInstsIdx].upVote = false;
            oInsts[oInstsIdx].downVote = false;
            oInsts[oInstsIdx].currentVote = 0;
            oInsts[oInstsIdx].comment = "";
            nUpVotedToday += didUpVoteToday ? -1 : 0;
          }
        } else {
          // Otherwise, if the vote is added/modified:
          // If othersInstructor exists:
          if (oInstsIdx !== -1) {
            // If the vote today:
            if (didVoteToday) {
              // If they previously downvoted:
              if (oInsts[oInstsIdx].currentVote < 1) {
                // If they're upvoting now:
                if (voteData.upVote) {
                  nUpVotedToday += 1;
                }
              } else {
                // If they previously upvoted and now they are downvoting:
                if (!voteData.upVote) {
                  nUpVotedToday -= 1;
                }
              }
            }
            // Update the othersInstructor object accordingly.
            oInsts[oInstsIdx] = {
              ...oInsts[oInstsIdx],
              comment: voteData.comment ? voteData.comment : "",
              upVote: voteData.upVote ? "👍" : "◻",
              downVote: voteData.downVote ? "👎" : "◻",
              currentVote: voteData.upVote - voteData.downVote,
            };
          } else {
            // If the othersInstructor object does not exist, create it with
            // default values for other fields until we load those values. This
            // will probably never happen becuase an othersInstructor should be
            // loaded for the researcher to be able to vote on it.
            oInsts.push({
              comment: voteData.comment ? voteData.comment : "",
              upVote: voteData.upVote ? "👍" : "◻",
              downVote: voteData.downVote ? "👎" : "◻",
              currentVote: voteData.upVote - voteData.downVote,
              firstname: "",
              lastname: "",
              email: "",
              explanation: "",
              institution: "",
              ...initialState,
              id: voteData.instructor,
            });
          }
        }
      }
      assignDayUpVotesPoint(nUpVotedToday);
      // When a researcher upvotes 16 instructors/school administrators that are
      // added by other researchers, today, they get a point for it. No partial
      // points for less than 16, and no extra points for more than 16. So, if
      // they've already upvote 16, they can keep adding more, but we do not
      // increase the number on the toolbar to make sure they do not think they
      // can earn more points by upvoting more.
      setUpvotedInstructorsToday(nUpVotedToday <= 16 ? nUpVotedToday : 16);
      setOthersInstructors(oInsts);
    }
  }, [
    votesChanges,
    upvotedInstructorsToday,
    instructorsToday,
    instructors,
    instructorsChanges,
    othersInstructors,
    fullname,
    project,
  ]);

  // Every time a chnage happens to othersInstructors, we should look for the
  // othersInstructor that the authenticated researcher has not voted yet, and
  // it has received fewer than 3 total votes by researchers, to show it in the
  // upper box to facilitate evaluating (voting) it by the authenticated
  // researcher. If a othersInstructor has already received greater than or
  // equal to 3 votes from researchers, we should remove it from
  // othersInstructors.
  useEffect(() => {
    let theInstructor;
    let uInstructorsNum = 0;
    let oInsts = [...othersInstructors];
    let oInstsChanged = false;
    for (let oInstructor of othersInstructors) {
      if (oInstructor.upVote === "◻" && oInstructor.downVote === "◻") {
        if (oInstructor.upVotes + oInstructor.downVotes >= 3) {
          oInsts = oInsts.filter((instruct) => instruct.id !== oInstructor.id);
          oInstsChanged = true;
        } else {
          if (!theInstructor) {
            theInstructor = oInstructor;
          }
          uInstructorsNum += 1;
        }
      }
    }
    if (theInstructor) {
      setOtherInstructor(theInstructor);
    }
    setUnvotedNum(uInstructorsNum);
    if (oInstsChanged) {
      setOthersInstructors(oInsts);
    }
  }, [othersInstructors]);

  // If the authenticated research clicks one of the rows in the other
  // instructors' data grid, we should load that as the other instructor to show
  // it in the upper box to facilitate evaluating (voting) it by the
  // authenticated researcher.
  const othersInstructorsRowClick = (clickedRow) => {
    const theRow = clickedRow.row;
    if (theRow) {
      const instrIdx = othersInstructors.findIndex(
        (othInstr) => othInstr.id === clickedRow.id
      );
      if (instrIdx !== -1) {
        setOtherInstructor(othersInstructors[instrIdx]);
        setComment(othersInstructors[instrIdx].comment);
      }
    }
  };

  // Validator useEffect: Based on the changes in the input field, we validate
  // them and generate corresponding error messages.
  useEffect(() => {
    const validwebURL = isValidHttpUrl(values.webURL);
    const validGoogleScholar = isValidHttpUrl(values.GoogleScholar);
    const validEmail = isEmail(email);
    const validFirstname = firstname.length > 1;
    const validLastname = lastname.length > 1;
    if (alreadyExists) {
      setInvalidInstructor(
        "This instructor with email address " +
          email +
          " is already invited to " +
          "our experiment! Invite another instructor or school " +
          "administrator please."
      );
    } else if (!validwebURL) {
      setInvalidInstructor(
        "Please enter a valid website address that we can get this" +
          "instructor/administrator's information from!"
      );
    } else if (isNaN(values.citations)) {
      setInvalidInstructor(
        "Please enter a valid number of citations from their Google Scholar/ResearchGate profile!"
      );
    } else if (!validEmail) {
      setInvalidInstructor("Please enter a valid email address!");
    } else if (!validFirstname) {
      setInvalidInstructor("Please enter a valid firstname!");
    } else if (!validLastname) {
      setInvalidInstructor("Please enter a valid lastname!");
    } else if (!values.prefix) {
      setInvalidInstructor("Please specify their prefix!");
    } else if (!values.country) {
      setInvalidInstructor("Please specify their country!");
    } else if (!values.stateInfo) {
      setInvalidInstructor("Please specify their state!");
    } else if (!values.city) {
      setInvalidInstructor("Please specify their city!");
    } else if (!values.major) {
      setInvalidInstructor("Please specify their related 1Cademy Community!");
    } else if (!values.position) {
      setInvalidInstructor("Please specify their position!");
    } else {
      setInvalidInstructor("");
    }
  }, [
    alreadyExists,
    email,
    firstname,
    lastname,
    values.webURL,
    values.GoogleScholar,
    values.citations,
    values.prefix,
    values.country,
    values.stateInfo,
    values.city,
    values.major,
    values.position,
  ]);

  // This is for the vote buttons in the data grid that displays other
  // instructors.
  const voteOthersInstructors = async (clickedCell) => {
    if (clickedCell.field === "upVote" || clickedCell.field === "downVote") {
      try {
        let oInstructors = [...othersInstructors];
        const instructorIdx = oInstructors.findIndex(
          (instr) => instr.id === clickedCell.id
        );
        if (
          instructorIdx !== -1 &&
          oInstructors[instructorIdx][clickedCell.field] !== "O"
        ) {
          oInstructors[instructorIdx] = {
            ...oInstructors[instructorIdx],
            [clickedCell.field]: "O",
          };
          setOthersInstructors(oInstructors);
          // We need to refresh the Firebase Auth idToken because in the
          // backend, we'll retrive the authenticated researcher. This way, we
          // do not let anyone hack the system to vote on their own entries.
          await firebase.idToken();
          await axios.post("/voteInstructor", {
            instructor: clickedCell.id,
            vote: clickedCell.field,
          });
          setComment("");
          setSnackbarMessage(
            "You successfully voted for others' instructor/administrator!"
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // This is for the vote buttons in the box above the page that displays the single other instructor.
  const voteOtherInstructor = (instructorId, voteType) => async (event) => {
    try {
      if (!otherVoting) {
        setOtherVoting(true);
        // We need to refresh the Firebase Auth idToken because in the
        // backend, we'll retrive the authenticated researcher. This way, we
        // do not let anyone hack the system to vote on their own entries.
        await firebase.idToken();
        await axios.post("/voteInstructor", {
          instructor: instructorId,
          vote: voteType,
          comment,
        });
        setSnackbarMessage(
          "You successfully voted for others' instructor/administrator!"
        );
        setOtherVoting(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const changeComment = (event) => {
    setComment(event.target.value);
  };

  const changeInstitution = (event, value) => setInstitution(value);

  const changeInstitutionInput = (event, value) => setInstitutionInput(value);

  const firstnameChange = (event) => {
    let fName = event.target.value;
    fName = fName.replace(/[0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;\.:[\]]/gi, "");
    setFirstname(fName);
  };

  const lastnameChange = (event) => {
    let lName = event.target.value;
    lName = lName.replace(/[0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;\.:[\]]/gi, "");
    setLastname(lName);
  };

  const emailChange = (event) => {
    setEmail(event.target.value.toLowerCase());
  };

  const explanationChange = (event) => {
    setExplanation(event.target.value);
  };

  // One handleChnage for all the text fields depending on the
  // event.target.name.
  const handleChange = (event) => {
    if ("persist" in event) {
      event.persist();
    }
    setValues((previousValues) => {
      const newValues = {
        ...previousValues,
        [event.target.name]: event.target.value,
      };
      return newValues;
    });
  };

  // When emailBlur happens, we should check whether this instructor/school
  // administrator was enterred before. In that case, we should return an error
  // message to prevent entering duplicate records.
  const emailBlur = async (event) => {
    const instructorDocs = await firebase.db
      .collection("instructors")
      .where("email", "==", email)
      .get();
    if (instructorDocs.docs.length > 0) {
      const instructorData = instructorDocs.docs[0].data();
      if (instructorData.deleted) {
        setAlreadyExists(false);
      } else {
        setAlreadyExists(true);
      }
    } else {
      setAlreadyExists(false);
    }
  };

  const clearInstructor = (event) => {
    setSelectedRows([]);
    setAlreadyExists(false);
    setInvalidInstructor("");
    setFirstname("");
    setLastname("");
    setEmail("");
    setExplanation("");
    // setInstitution("University of Michigan - Ann Arbor");
    setValues({
      ...initialState,
      country: values.country,
      stateInfo: values.stateInfo,
      city: values.city,
      major: values.major,
    });
  };

  // If the authenticated researcher clicks any of the rows in the datagrid that
  // contains the instructors/school administrators that they enterred before,
  // we should populate its data in the above fields so that they can update
  // their previously enterred information.
  const myInstructorsRowClick = (clickedRow) => {
    const theRow = clickedRow.row;
    if (theRow) {
      setSelectedRows([clickedRow.id]);
      setAlreadyExists(false);
      setInvalidInstructor("");
      setFirstname(theRow.firstname);
      setLastname(theRow.lastname);
      setEmail(theRow.email);
      setExplanation(theRow.explanation ? theRow.explanation : "");
      setInstitution(theRow.institution);
      setValues({
        country: theRow.country,
        stateInfo: theRow.stateInfo,
        city: theRow.city,
        major: theRow.major,
        occupation: theRow.occupation,
        position: theRow.position,
        prefix: theRow.prefix,
        webURL: theRow.webURL,
        GoogleScholar: theRow.GoogleScholar,
        citations: theRow.citations,
      });
    } else {
      clearInstructor("Nothing");
    }
  };

  const submitInstructor = async (event) => {
    if (!invalidInstructor) {
      // If a row is selected, it means they're trying to update the record.
      const updating = selectedRows.length > 0;
      try {
        // We use this flag to check if they updated their existing record to
        // reset its votes in the database.
        let gotUpdated = false;
        await firebase.db.runTransaction(async (t) => {
          // First check whether the instructor already exists to make sure they
          // don't add duplicate entries.
          const instructorDocs = await firebase.db
            .collection("instructors")
            .where("email", "==", email)
            .get();
          let instructorExists = false;
          if (instructorDocs.docs.length > 0) {
            const instructorData = instructorDocs.docs[0].data();
            if (
              !instructorData.deleted &&
              (!updating ||
                // Even if they are updating an existing record, we should make
                // sure it is not different from the row that they have selected
                // to update.
                (updating && instructorDocs.docs[0].id !== selectedRows[0]))
            ) {
              instructorExists = true;
            }
          }
          if (instructorExists) {
            setAlreadyExists(true);
          } else {
            const currentTime = firebase.firestore.Timestamp.fromDate(
              new Date()
            );
            const researcherRef = firebase.db
              .collection("researchers")
              .doc(fullname);
            const researcherDoc = await researcherRef.get();
            const researcherData = researcherDoc.data();
            const today = getISODateString(new Date());
            const dayInstructorsDocs = await firebase.db
              .collection("dayInstructors")
              .where("project", "==", project)
              .where("fullname", "==", fullname)
              .where("date", "==", today)
              .limit(1)
              .get();

            let instructorRef = firebase.db.collection("instructors").doc();
            if (updating) {
              instructorRef = firebase.db
                .collection("instructors")
                .doc(selectedRows[0]);
            }
            const instructorData = {
              project,
              fullname,
              firstname,
              lastname,
              email,
              explanation,
              institution,
              ...values,
            };
            if (updating) {
              instructorData.updatedAt = currentTime;
              t.update(instructorRef, instructorData);
              gotUpdated = true;
            } else {
              instructorData.researcher = fullname;
              instructorData.createdAt = currentTime;
              t.set(instructorRef, instructorData);
            }
            const instructorLogRef = firebase.db
              .collection("instructorsLogs")
              .doc();
            t.set(instructorLogRef, {
              ...instructorData,
              id: instructorRef.id,
            });
            if (!updating) {
              // If they collect 7 instructors/school administrators' information
              // in a single day, we should giv them a point.
              if (
                instructorsToday === 6 &&
                dayInstructorsDocs.docs.length === 0
              ) {
                const dayInstructorRef = firebase.db
                  .collection("dayInstructors")
                  .doc();
                await dayInstructorRef.set({
                  project,
                  fullname,
                  date: today,
                });
                const researcherInstructors = {
                  projects: {
                    ...researcherData.projects,
                    [project]: {
                      ...researcherData.projects[project],
                      instructors: 1,
                      instructorsNum: 1,
                    },
                  },
                };
                if ("instructors" in researcherData.projects[project]) {
                  researcherInstructors.projects[project].instructors =
                    researcherData.projects[project].instructors + 1;
                }
                if ("instructorsNum" in researcherData.projects[project]) {
                  researcherInstructors.projects[project].instructorsNum =
                    researcherData.projects[project].instructorsNum + 1;
                }
                t.update(researcherRef, researcherInstructors);
                const researcherLogRef = firebase.db
                  .collection("researcherLogs")
                  .doc();
                t.set(researcherLogRef, {
                  ...researcherInstructors,
                  id: researcherRef.id,
                  updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                });
              } else {
                // Even if we don't give the authenticated researher a point for
                // adding 7 instructors in a day, we still need to increase the
                // total number of instructors/school administrators they have
                // collected.
                const researcherInstructors = {
                  projects: {
                    ...researcherData.projects,
                    [project]: {
                      ...researcherData.projects[project],
                      instructorsNum: 1,
                    },
                  },
                };
                if ("instructorsNum" in researcherData.projects[project]) {
                  researcherInstructors.projects[project].instructorsNum =
                    researcherData.projects[project].instructorsNum + 1;
                }
                t.update(researcherRef, researcherInstructors);
                const researcherLogRef = firebase.db
                  .collection("researcherLogs")
                  .doc();
                t.set(researcherLogRef, {
                  ...researcherInstructors,
                  id: researcherRef.id,
                  updatedAt: firebase.firestore.Timestamp.fromDate(new Date()),
                });
              }
            }
            setSnackbarMessage(
              "You successfully submitted your instructor/administrator!"
            );
            clearInstructor("Nothing");
          }
        });
        if (gotUpdated) {
          await firebase.idToken();
          await axios.post("/voteInstructorReset", {
            instructor: selectedRows[0],
          });
        }
      } catch (e) {
        console.log("Transaction failure:", e);
      }
    }
  };

  const onKeyPress = (event) => {
    if (event.key === "Enter" && !invalidInstructor) {
      submitInstructor();
    }
  };

  const deleteInstructor = async (clickedCell) => {
    if (clickedCell.field === "deleteButton") {
      try {
        let instructs = [...instructors];
        const instructorIdx = instructs.findIndex(
          (instruct) => instruct.id === clickedCell.id
        );
        if (
          instructorIdx !== -1 &&
          instructs[instructorIdx][clickedCell.field] !== "O"
        ) {
          instructs[instructorIdx][clickedCell.field] = "O";
          setInstructors(instructs);
          const instructorRef = firebase.db
            .collection("instructors")
            .doc(clickedCell.id);
          const instructorDoc = await instructorRef.get();
          await instructorRef.update({ deleted: true });
          setTimeout(() => {
            clearInstructor("Nothing");
          }, 400);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <>
      <h2>Instructors Added by Others:</h2>
      <div className="ColumnsAuto_Auto">
        <div>
          <Alert className="VoteActivityAlert" severity="success">
            <ul>
              <li>
                <strong>
                  You earn points for evaluating the instructors added by
                  others:
                </strong>{" "}
                you receive one point for every 16 upvotes you cast on the
                instructors added by your colleagues in every single day.
              </li>
              <li>
                <strong>No partial or extra points:</strong> if on a single day
                you cast more than 16 upvotes, you'll not receive any extra
                points. If you cast fewer than 16 upvotes, you'll not receive
                any partial points, either.
              </li>
            </ul>
          </Alert>
          <Alert className="VoteActivityAlert" severity="error">
            <h3>Downvotes:</h3>
            <p>
              If you find an instructor's information that does not match the
              information on their website, downvote (👎) it. The researcher who
              has posted the incomplete/wrong information will be penalized.
            </p>
          </Alert>
        </div>
        {Object.keys(otherInstructor).length > 0 ? (
          <Paper className="VoteActivityPaper">
            <h3>
              You've not evaluated {unvotedNum.toLocaleString()} instructor
              {unvotedNum === 1 ? "'s" : "s'"} info yet!
            </h3>
            <h3>This is one of them:</h3>
            <p>
              <a href={otherInstructor.webURL} target="_blank">
                {otherInstructor.webURL}
              </a>
            </p>
            <p>
              <a href={otherInstructor.GoogleScholar} target="_blank">
                {otherInstructor.GoogleScholar}
              </a>{" "}
              <span>{otherInstructor.citations} Citations</span>
            </p>
            <p>
              {otherInstructor.prefix +
                " " +
                otherInstructor.firstname +
                " " +
                otherInstructor.lastname +
                " at " +
                otherInstructor.email}
            </p>
            <p>
              {otherInstructor.occupation +
                "/" +
                otherInstructor.position +
                " in 1Cademy Community: " +
                otherInstructor.major +
                ", from " +
                otherInstructor.institution}
            </p>
            {!majors.includes(otherInstructor.major) && (
              <Alert severity="error">
                This researcher needs to update the 1Cademy Community for this
                instructor!
              </Alert>
            )}
            <p>
              {getCountry(otherInstructor.country) +
                ", " +
                getStateId(otherInstructor.stateInfo) +
                ", " +
                otherInstructor.city}
            </p>
            <p>
              <i>Extra Info:</i> {otherInstructor.explanation}
            </p>
            <TextareaAutosize
              ariaLabel="Comment Text box"
              minRows={4}
              style={{ width: "94%" }}
              placeholder="Comment"
              onChange={changeComment}
              value={comment}
            />
            <Box sx={{ textAlign: "center" }}>
              To submit your comment, click one of the vote buttons!
            </Box>
            <div id="VoteOtherFooter">
              <Tooltip title="Skip" placement="top">
                <Button
                  id="VoteOtherDownVoteBtn"
                  onClick={voteOtherInstructor(otherInstructor.id, "downVote")}
                  className="Button"
                  variant="contained"
                >
                  {otherVoting ? (
                    <CircularProgress color="warning" size="16px" />
                  ) : (
                    <Box
                      sx={
                        otherInstructor.downVote === "👎"
                          ? {
                              textDecoration: "line-through",
                              color: "red",
                              fontWeight: 700,
                            }
                          : {}
                      }
                    >
                      👎
                    </Box>
                  )}
                </Button>
              </Tooltip>
              <Tooltip title="Up Vote" placement="top">
                <Button
                  id="VoteOtherUpVoteBtn"
                  onClick={voteOtherInstructor(otherInstructor.id, "upVote")}
                  className="Button"
                  variant="contained"
                >
                  {otherVoting ? (
                    <CircularProgress color="warning" size="16px" />
                  ) : (
                    <Box
                      sx={
                        otherInstructor.upVote === "👍"
                          ? {
                              textDecoration: "line-through",
                              color: "red",
                              fontWeight: 700,
                            }
                          : {}
                      }
                    >
                      👍
                    </Box>
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
          rows={othersInstructors}
          columns={othersInstructorsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          // checkboxSelection
          hideFooterSelectedRowCount
          onRowClick={othersInstructorsRowClick}
          loading={!instructorsLoaded}
          onCellClick={voteOthersInstructors}
        />
      </div>
      <div id="AddInstructor">
        <div className="Columns40_60">
          <Alert className="VoteActivityAlert" severity="success">
            <h2>Prefixes:</h2>
            <p>
              If there is any declaration of their prefix on their profile page,
              we should use that exact prefix, otherwise, add "Prof." However,
              if someone is a Dean or has any administrative position other than
              instructor, they should not be called a Prof.
            </p>
            <h2>Google Scholar / ResearchGate Profile:</h2>
            <p>
              First try to find the Google Scholar Profile info for the
              instructor/administrator through the following instructions:
            </p>
            <ul>
              <li>
                Before starting the activity, first install{" "}
                <a
                  href="https://chrome.google.com/webstore/detail/google-scholar-button/ldipcbpaocekfooobnbcddclnhejkcpn?hl=en"
                  target="_blank"
                >
                  the Google Scholar Chrome Extension
                </a>
              </li>
              <li>
                Select the name of the instructor/administrator on their
                website, then click the Google Scholar Chrome Extension icon{" "}
                <img
                  src={GoogleScholarIcon}
                  alt="Google Scholar Icon"
                  width="40px"
                  sx={{ mb: "-25px" }}
                />{" "}
                at the top right corner of your Google Chrome browser.
              </li>
              <li>
                The Google Scholar Chrome Extension shows you a few search
                results of publications by this instructor/administrator. Just
                ignore them and click the expand button <FullscreenIcon /> at
                the bottom of the search results.
              </li>
              <li>
                On top of the search results, you should see "User profiles for
                [the name]." Right below it, you should find the link to their
                Google Scholar profile and below it, their number of citations.
              </li>
              <li>
                Copy their Google Scholar profile address and their number of
                citations to the input boxes on the right.
              </li>
            </ul>
            <div>
              If they do not have a Google Scholar profile, report their
              ResearchGate info through the following instructions:
              <ul>
                <li>
                  Open{" "}
                  <a
                    href="https://www.google.com/search?q=site%3Ahttps%3A%2F%2Fwww.researchgate.net"
                    target="_blank"
                  >
                    Google Search restricted to only the content of ResearchGate
                    website
                  </a>{" "}
                  in your Internet browser. Then search the full name of the
                  instructor/administrator plus their school name. Doing this is
                  as easy as typing "site:https://www.researchgate.net FULLNAME
                  SCHOOL_NAME" in Google Search. Note that you should replace
                  FULLNAME and SCHOOL_NAME in this query string. Also, don't
                  miss the first part of the query string
                  "site:https://www.researchgate.net " that restrics your search
                  to only the content of the ResearchGate website.
                </li>
                <li>
                  In the list of Google Search results, click their ResearchGate
                  profile page. If there are multiple profiles for people with
                  the same name, please choose the right one based on their
                  institution and profile picture.
                </li>
                <li>
                  In their ResearchGate profile page, you should be able to find
                  their number of citations either:
                  <ul>
                    <li>
                      In the middle of the page, there should be a section
                      titled "Stats overview"
                    </li>
                    <li>
                      Or, on the right sidebar, you should be able to find a
                      section titled "Publication Stats."
                    </li>
                  </ul>
                  From either of these sections, copy their number of citations
                  in the corresponding input boxes.
                </li>
                <li>
                  Copy the URL of this webpage in the corresponding input box.
                </li>
              </ul>
            </div>
            <p>
              <strong>Note:</strong> If they don't have have either a Google
              Scholar or a ResearchGate profile, leave the address empty and
              enter 0 for their number of citations.
            </p>
          </Alert>
          <Paper className="VoteActivityPaper">
            <Alert className="VoteActivityAlert" severity="warning">
              <h2>Who to add:</h2>
              <p>
                Enter a US-based college/university instructor/administrator's
                information that relate to our 1Cademy communities:
              </p>
              <ul>
                {majors.map((maj) => {
                  return <li key={maj}>{maj}</li>;
                })}
              </ul>
              <h2>Earning points:</h2>
              <ul>
                <li>
                  <strong>Only 1 point per day:</strong> to earn the point of
                  each day, you need to add 7 instructors' contact information.
                </li>
                <li>
                  <strong>No partial points:</strong> if you add fewer than 7
                  instructors on a day, you'll not earn any partial points.
                </li>
                <li>
                  <strong>No extra points:</strong> if you add more than 7
                  instructors on a day, you'll not earn any extra points.
                </li>
              </ul>
            </Alert>
            <TextField
              className="TextField"
              label="Google Scholar/ResearchGate Profile"
              onChange={handleChange}
              name="GoogleScholar"
              value={values.GoogleScholar}
              onKeyPress={onKeyPress}
            />
            <TextField
              className="TextField"
              label="Google Scholar/ResearchGate Citations #"
              onChange={handleChange}
              name="citations"
              type="number"
              value={values.citations}
              onKeyPress={onKeyPress}
            />
            <TextField
              className="TextField"
              label="Website to find the info"
              onChange={handleChange}
              name="webURL"
              value={values.webURL}
              onKeyPress={onKeyPress}
            />
            <FormControl className="Select">
              <InputLabel id="PrefixSelectLabel">Prefix:</InputLabel>
              <Select
                labelId="PrefixSelectLabel"
                id="PrefixSelect"
                value={values.prefix}
                label="Prefix"
                name="prefix"
                onChange={handleChange}
              >
                {prefixes.map((pref) => {
                  return (
                    <MenuItem key={pref} value={pref}>
                      {pref}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <TextField
              className="TextField"
              label="Firstname"
              onChange={firstnameChange}
              name="firstname"
              value={firstname}
              onKeyPress={onKeyPress}
            />
            <TextField
              className="TextField"
              label="Lastname"
              onChange={lastnameChange}
              name="lastname"
              value={lastname}
              onKeyPress={onKeyPress}
            />
            <TextField
              className="TextField"
              label="Email address"
              onChange={emailChange}
              onBlur={emailBlur}
              name="email"
              value={email}
              onKeyPress={onKeyPress}
            />
            <FormControl className="Select">
              <InputLabel id="OccupationSelectLabel">Occupation:</InputLabel>
              <Select
                labelId="OccupationSelectLabel"
                id="OccupationSelect"
                value={values.occupation}
                label="Occupation"
                name="occupation"
                onChange={handleChange}
              >
                {occupations.map((pref) => {
                  return (
                    <MenuItem key={pref} value={pref}>
                      {pref}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <TextField
              className="TextField"
              label="position"
              onChange={handleChange}
              name="position"
              value={values.position}
              onKeyPress={onKeyPress}
            />
            <FormControl className="Select">
              <InputLabel id="MajorSelectLabel">1Cademy Community:</InputLabel>
              <Select
                labelId="MajorSelectLabel"
                id="MajorSelect"
                value={values.major}
                label="1Cademy Community"
                name="major"
                onChange={handleChange}
              >
                {majors.map((cour) => {
                  return (
                    <MenuItem key={cour} value={cour}>
                      {cour}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {CSCObj && allCountries.length > 0 && (
              <Suspense fallback={<div></div>}>
                <CountryStateCity
                  handleChange={handleChange}
                  handleBlur={doNothing}
                  values={values}
                  CSCObj={CSCObj}
                  allCountries={allCountries}
                />
              </Suspense>
            )}
            {institutions.length > 0 && (
              <Autocomplete
                className="InstitutionAutocomplete"
                value={institution}
                onChange={changeInstitution}
                inputValue={institutionInput}
                onInputChange={changeInstitutionInput}
                options={institutions}
                renderInput={renderInstitution}
              />
            )}
            <TextareaAutosize
              ariaLabel="Extra Information Text box"
              minRows={4}
              style={{ width: "100%", marginTop: "10px" }}
              placeholder="You can enter extra information here."
              onChange={explanationChange}
              value={explanation}
            />
            <div>
              {invalidInstructor && (
                <div className="Error">{invalidInstructor}</div>
              )}
              <Button
                onClick={submitInstructor}
                className={
                  !invalidInstructor
                    ? "Button SubmitButton"
                    : "Button SubmitButton Disabled"
                }
                variant="contained"
                disabled={!invalidInstructor ? null : true}
              >
                {selectedRows.length === 0
                  ? "Add Instructor"
                  : "Update Instructor"}
              </Button>
              {selectedRows.length > 0 && (
                <Button
                  className="Button ClearButton"
                  onClick={clearInstructor}
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
            rows={instructors}
            columns={instructorsColumns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            autoPageSize
            autoHeight
            hideFooterSelectedRowCount
            loading={!instructorsLoaded}
            onRowClick={myInstructorsRowClick}
            onCellClick={deleteInstructor}
            onSelectionChange={(newSelection) => {
              setSelectedRows(newSelection.rowIds);
            }}
            selectionModel={selectedRows}
          />
        </div>
      </div>
      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </>
  );
};

export default AddInstructor;
