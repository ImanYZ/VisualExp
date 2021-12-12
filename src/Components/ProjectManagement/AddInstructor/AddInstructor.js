import React, { useState, useEffect, Suspense } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import axios from "axios";

import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
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
  instructorsTodayState,
  upvotedInstructorsTodayState,
} from "../../../store/ProjectAtoms";

import CSCObjLoader from "./CSCObjLoader";
import { isToday } from "../../../utils/DateFunctions";

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
const majors = [
  "ARTS: VISUAL & PERFORMING",
  "BUSINESS",
  "COMMUNICATIONS",
  "COMMUNITY, FAMILY, & PERSONAL SERVICES",
  "COMPUTER SCIENCE & MATHEMATICS",
  "EDUCATION",
  "ENGLISH & FOREIGN LANGUAGES",
  "INFORMATION SCIENCE",
  "PHILOSOPHY, RELIGION, & THEOLOGY",
  "SOCIAL SCIENCES & LAW",
];

const initialState = {
  country: "🇺🇸 United States;US",
  stateInfo: "Michigan;MI;US",
  city: "Ann Arbor",
  major: "",
  occupation: "Instructor",
  position: "",
  prefix: "",
  webURL: "",
  GoogleScholar: "",
  citations: 0,
};

let lastCountry;

const isValidHttpUrl = (string) => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

const isEmail = (email) => {
  // eslint-disable-next-line
  const regEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

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

const instructorsColumns = [
  {
    field: "GoogleScholar",
    headerName: "Google Scholar Address",
    width: 100,
    renderCell: (cellValues) => {
      return (
        <Tooltip
          title={cellValues.value ? cellValues.value : ""}
          placement="top"
        >
          <a href={cellValues.value} target="_blank">
            <div
              style={{
                fontSize: 13,
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {cellValues.value}
            </div>
          </a>
        </Tooltip>
      );
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
      return (
        <Tooltip
          title={cellValues.value ? cellValues.value : ""}
          placement="top"
        >
          <a href={cellValues.value} target="_blank">
            <div
              style={{
                fontSize: 13,
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {cellValues.value}
            </div>
          </a>
        </Tooltip>
      );
    },
  },
  {
    field: "prefix",
    headerName: "Prefix",
    width: 70,
    renderCell: (cellValues) => {
      return (
        <Tooltip
          title={cellValues.value ? cellValues.value : ""}
          placement="top"
        >
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {cellValues.value}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "firstname",
    headerName: "Firstname",
    width: 130,
    renderCell: (cellValues) => {
      return (
        <Tooltip
          title={cellValues.value ? cellValues.value : ""}
          placement="top"
        >
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {cellValues.value}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "lastname",
    headerName: "Lastname",
    width: 130,
    renderCell: (cellValues) => {
      return (
        <Tooltip
          title={cellValues.value ? cellValues.value : ""}
          placement="top"
        >
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {cellValues.value}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 130,
    renderCell: (cellValues) => {
      return (
        <Tooltip
          title={cellValues.value ? cellValues.value : ""}
          placement="top"
        >
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {cellValues.value}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "institution",
    headerName: "Institution",
    width: 130,
    renderCell: (cellValues) => {
      return (
        <Tooltip
          title={cellValues.value ? cellValues.value : ""}
          placement="top"
        >
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {cellValues.value}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "occupation",
    headerName: "Occupation",
    width: 130,
    renderCell: (cellValues) => {
      return (
        <Tooltip
          title={cellValues.value ? cellValues.value : ""}
          placement="top"
        >
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {cellValues.value}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "position",
    headerName: "Position",
    width: 130,
    renderCell: (cellValues) => {
      return (
        <Tooltip
          title={cellValues.value ? cellValues.value : ""}
          placement="top"
        >
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {cellValues.value}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "major",
    headerName: "Major",
    width: 130,
    renderCell: (cellValues) => {
      return (
        <Tooltip
          title={cellValues.value ? cellValues.value : ""}
          placement="top"
        >
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {cellValues.value}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "country",
    headerName: "Country",
    width: 130,
    renderCell: (cellValues) => {
      return (
        <Tooltip
          title={cellValues.value ? getCountry(cellValues.value) : ""}
          placement="top"
        >
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {getCountry(cellValues.value)}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "stateInfo",
    headerName: "State",
    width: 100,
    renderCell: (cellValues) => {
      return (
        <Tooltip
          title={cellValues.value ? getStateId(cellValues.value) : ""}
          placement="top"
        >
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {getStateId(cellValues.value)}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "city",
    headerName: "City",
    width: 100,
    renderCell: (cellValues) => {
      return (
        <Tooltip
          title={cellValues.value ? cellValues.value : ""}
          placement="top"
        >
          <div
            style={{
              fontSize: 13,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {cellValues.value}
          </div>
        </Tooltip>
      );
    },
  },
  // {
  //   field: "deleteButton",
  //   headerName: "Delete",
  //   width: 7,
  //   disableColumnMenu: true,
  //   type: "actions",
  //   renderCell: (cellValues) => {
  //     return (
  //       <Tooltip title="Delete" placement="top">
  //         <div
  //           style={{
  //             color: "red",
  //             fontSize: 19,
  //             fontWeight: "bold",
  //             cursor: cellValues.value === "O" ? "default" : "pointer",
  //             width: "100%",
  //             textAlign: "center",
  //           }}
  //         >
  //           {cellValues.value === "O" ? (
  //             <CircularProgress color="warning" size="16px" />
  //           ) : (
  //             cellValues.value
  //           )}
  //         </div>
  //       </Tooltip>
  //     );
  //   },
  // },
];

const othersInstructorsColumns = [
  ...instructorsColumns,
  {
    field: "upVote",
    headerName: "upVote",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <Tooltip title="Up Vote" placement="top">
          <div
            style={{
              fontSize: 19,
              fontWeight: "bold",
              cursor: cellValues.value === "O" ? "default" : "pointer",
              width: "100%",
              textAlign: "center",
            }}
          >
            {cellValues.value === "O" ? (
              <CircularProgress color="warning" size="16px" />
            ) : (
              cellValues.value
            )}
          </div>
        </Tooltip>
      );
    },
  },
  {
    field: "downVote",
    headerName: "downVote",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <Tooltip title="Skip" placement="top">
          <div
            style={{
              fontSize: 19,
              fontWeight: "bold",
              cursor: cellValues.value === "O" ? "default" : "pointer",
              width: "100%",
              textAlign: "center",
            }}
          >
            {cellValues.value === "O" ? (
              <CircularProgress color="warning" size="16px" />
            ) : (
              cellValues.value
            )}
          </div>
        </Tooltip>
      );
    },
  },
];

const AddInstructor = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const isAdmin = useRecoilValue(isAdminState);
  const project = useRecoilValue(projectState);
  const [instructorsToday, setInstructorsToday] = useRecoilState(
    instructorsTodayState
  );
  const [upvotedInstructorsToday, setUpvotedInstructorsToday] = useRecoilState(
    upvotedInstructorsTodayState
  );

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [CSCObj, setCSCObj] = useState(null);
  const [allCountries, setAllCountries] = useState([]);
  const [values, setValues] = useState(initialState);
  const [institution, setInstitution] = useState(
    "University of Michigan - Ann Arbor"
  );
  const [institutionInput, setInstitutionInput] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [invalidInstructor, setInvalidInstructor] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [othersInstructors, setOthersInstructors] = useState([]);
  const [otherInstructor, setOtherInstructor] = useState({});
  const [instructorsLoaded, setInstructorsLoaded] = useState(false);
  const [instructorsChanges, setInstructorsChanges] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [votesChanges, setVotesChanges] = useState([]);
  const [unvotedNum, setUnvotedNum] = useState(0);
  const [otherVoting, setOtherVoting] = useState(false);

  const loadCSCObj = CSCObjLoader(CSCObj, setCSCObj, setAllCountries);

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

  useEffect(() => {
    if (firebase) {
      const instructorsQuery = firebase.db.collection("instructors");
      const instructorsSnapshot = instructorsQuery.onSnapshot(function (
        snapshot
      ) {
        const docChanges = snapshot.docChanges();
        setInstructorsChanges(docChanges);
        setInstructorsLoaded(true);
      });
      return () => {
        setInstructorsChanges([]);
        setInstructorsToday(0);
        setInstructors([]);
        setOthersInstructors([]);
        setOtherInstructor({});
        instructorsSnapshot();
      };
    }
  }, []);

  useEffect(() => {
    if (firebase && project && fullname && instructorsLoaded) {
      const instructorVotesQuery = firebase.db
        .collection("instructorVotes")
        .where("voter", "==", fullname)
        .where("project", "==", project);
      const instructorVotesSnapshot = instructorVotesQuery.onSnapshot(function (
        snapshot
      ) {
        const docChanges = snapshot.docChanges();
        setVotesChanges(docChanges);
      });
      return () => {
        setVotesChanges([]);
        setUpvotedInstructorsToday(0);
        instructorVotesSnapshot();
      };
    }
  }, [firebase, project, fullname, instructorsLoaded]);

  const assignDayUpVotesPoint = async (nUpVotedToday) => {
    if (nUpVotedToday === 25) {
      const now = new Date();
      const today =
        now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
      const dayUpVotesDocs = await firebase.db
        .collection("dayInstructorUpVotes")
        .where("project", "==", project)
        .where("voter", "==", fullname)
        .where("date", "==", today)
        .limit(1)
        .get();
      if (dayUpVotesDocs.docs.length === 0) {
        try {
          await firebase.db.runTransaction(async (t) => {
            const researcherRef = firebase.db
              .collection("researchers")
              .doc(fullname);
            const researcherDoc = await researcherRef.get();
            const researcherData = researcherDoc.data();
            const dayUpVoteRef = firebase.db
              .collection("dayInstructorUpVotes")
              .doc();
            await dayUpVoteRef.set({
              project,
              voter: fullname,
              date: today,
            });
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
        } catch (e) {
          console.log("Transaction failure:", e);
        }
      }
    }
  };

  useEffect(() => {
    if (instructorsChanges.length > 0) {
      let insts = [...instructors];
      let oInsts = [...othersInstructors];
      let instToday = instructorsToday;
      for (let change of instructorsChanges) {
        const instructorData = change.doc.data();
        if (instructorData.deleted || change.type === "removed") {
          insts.filter((instruct) => instruct.id === change.doc.id);
          oInsts.filter((instruct) => instruct.id === change.doc.id);
        } else {
          if (instructorData.fullname === fullname) {
            const newInstructor = {
              ...instructorData,
              deleteButton: "❌",
              id: change.doc.id,
            };
            const instructorIdx = insts.findIndex(
              (instruct) => instruct.id === change.doc.id
            );
            if (instructorIdx !== -1) {
              insts[instructorIdx] = {
                ...insts[instructorIdx],
                ...newInstructor,
              };
            } else {
              insts.push(newInstructor);
              if (isToday(instructorData.createdAt.toDate())) {
                instToday += 1;
              }
            }
          } else {
            const instructorIdx = oInsts.findIndex(
              (instruct) => instruct.id === change.doc.id
            );
            const newInstructor = {
              ...instructorData,
              id: change.doc.id,
            };
            if (instructorIdx !== -1) {
              oInsts[instructorIdx] = {
                ...oInsts[instructorIdx],
                ...newInstructor,
              };
            } else {
              if (
                !instructorData.upVotes ||
                !instructorData.downVotes ||
                instructorData.upVotes + instructorData.downVotes < 3
              ) {
                oInsts.push({
                  ...newInstructor,
                  upVote: "◻",
                  downVote: "◻",
                  currentVote: 0,
                });
              } else {
                oInsts.filter((instruct) => instruct.id !== change.doc.id);
              }
            }
          }
        }
      }
      setInstructorsChanges([]);
      setInstructorsToday(instToday <= 10 ? instToday : 10);
      setInstructors(insts);
      setOthersInstructors(oInsts);
    }
    if (votesChanges.length > 0) {
      let oInsts = [...othersInstructors];
      let nUpVotedToday = upvotedInstructorsToday;
      for (let change of votesChanges) {
        const voteData = change.doc.data();
        let didVoteToday = isToday(voteData.createdAt.toDate());
        if ("updatedAt" in voteData) {
          didVoteToday = isToday(voteData.updatedAt.toDate());
        }
        const didUpVoteToday = didVoteToday && voteData.upVote;
        const oInstsIdx = oInsts.findIndex(
          (instr) => instr.id === voteData.instructor
        );
        if (change.type === "removed") {
          if (oInstsIdx !== -1) {
            oInsts[oInstsIdx].upVote = false;
            oInsts[oInstsIdx].downVote = false;
            oInsts[oInstsIdx].currentVote = 0;
            nUpVotedToday += didUpVoteToday ? -1 : 0;
          }
        } else {
          if (oInstsIdx !== -1) {
            if (didVoteToday) {
              if (oInsts[oInstsIdx].currentVote < 1) {
                if (voteData.upVote) {
                  nUpVotedToday += 1;
                }
              } else {
                if (!voteData.upVote) {
                  nUpVotedToday -= 1;
                }
              }
            }
            oInsts[oInstsIdx] = {
              ...oInsts[oInstsIdx],
              upVote: voteData.upVote ? "👍" : "◻",
              downVote: voteData.downVote ? "👎" : "◻",
              currentVote: voteData.upVote - voteData.downVote,
            };
          } else {
            oInsts.push({
              upVote: voteData.upVote ? "👍" : "◻",
              downVote: voteData.downVote ? "👎" : "◻",
              currentVote: voteData.upVote - voteData.downVote,
              firstname: "",
              lastname: "",
              email: "",
              institution: "",
              ...initialState,
              id: voteData.instructor,
            });
          }
        }
      }
      assignDayUpVotesPoint(nUpVotedToday);
      setVotesChanges([]);
      setUpvotedInstructorsToday(nUpVotedToday <= 25 ? nUpVotedToday : 25);
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

  useEffect(() => {
    let theInstructor;
    let uInstructorsNum = 0;
    for (let oInstructor of othersInstructors) {
      if (oInstructor.upVote === "◻" && oInstructor.downVote === "◻") {
        if (!theInstructor) {
          theInstructor = oInstructor;
        }
        uInstructorsNum += 1;
      }
    }
    if (theInstructor) {
      setOtherInstructor(theInstructor);
    }
    setUnvotedNum(uInstructorsNum);
  }, [othersInstructors]);

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
        "Please enter a valid number of citations from their Google Scholar profile!"
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
      setInvalidInstructor("Please specify their major!");
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

  function handleChange(event) {
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
  }

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
    setInstitution("University of Michigan - Ann Arbor");
    setValues(initialState);
  };

  const gridRowClick = (clickedRow) => {
    const theRow = clickedRow.row;
    if (theRow) {
      setSelectedRows([clickedRow.id]);
      setAlreadyExists(false);
      setInvalidInstructor("");
      setFirstname(theRow.firstname);
      setLastname(theRow.lastname);
      setEmail(theRow.email);
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
      const updating = selectedRows.length > 0;
      try {
        await firebase.db.runTransaction(async (t) => {
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
            const now = new Date();
            const today =
              now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
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
              institution,
              ...values,
            };
            if (updating) {
              instructorData.updatedAt = currentTime;
              t.update(instructorRef, instructorData);
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

            if (instructorsToday === 9) {
              if (dayInstructorsDocs.docs.length === 0) {
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
                    },
                  },
                };
                if ("instructors" in researcherData.projects[project]) {
                  researcherInstructors.projects[project].instructors =
                    researcherData.projects[project].instructors + 1;
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
            clearInstructor("Nothing");
          }
        });
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
          oInstructors[instructorIdx][clickedCell.field] = "O";
          setOthersInstructors(oInstructors);
          await firebase.idToken();
          await axios.post("/voteInstructor", {
            instructor: clickedCell.id,
            vote: clickedCell.field,
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const voteOtherInstructor = (instructorId, voteType) => async (event) => {
    try {
      if (!otherVoting) {
        setOtherVoting(true);
        await firebase.idToken();
        await axios.post("/voteInstructor", {
          instructor: instructorId,
          vote: voteType,
        });
        setOtherVoting(false);
      }
    } catch (err) {
      console.error(err);
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
                you receive one point for every 25 upvotes you cast on the
                instructors added by your colleagues in every single day.
              </li>
              <li>
                <strong>No partial or extra points:</strong> if on a single day
                you cast more than 25 upvotes, you'll not receive any extra
                points. If you cast fewer than 25 upvotes, you'll not receive
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
              You've not evaluated {unvotedNum} instructor
              {unvotedNum === 1 ? "'s" : "s'"} info yet.
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
                " in " +
                otherInstructor.major +
                " from " +
                otherInstructor.institution}
            </p>
            <p>
              {getCountry(otherInstructor.country) +
                ", " +
                getStateId(otherInstructor.stateInfo) +
                ", " +
                otherInstructor.city}
            </p>
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
                    "👎"
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
          rows={othersInstructors}
          columns={othersInstructorsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          // checkboxSelection
          hideFooterSelectedRowCount
          loading={!instructorsLoaded}
          onCellClick={voteOthersInstructors}
        />
      </div>
      <div id="AddInstructor">
        <div className="Columns40_60">
          <Alert className="VoteActivityAlert" severity="success">
            <h2>Who to add:</h2>
            <p>
              Enter a US-based college/university instructor/administrator's
              information from majors:
            </p>
            <ul>
              {majors.map((maj) => {
                return <li key={maj}>{maj}</li>;
              })}
            </ul>
            <h2>Google Scholar Profile:</h2>
            <p>
              To find the Google Scholar Profile info for the
              instructor/administrator, please do the following:
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
              <li>
                Note: If there is no Google Scholar profile for an individual,
                leave the address empty and enter 0 for their number of
                citations.
              </li>
            </ul>
          </Alert>
          <Paper className="VoteActivityPaper">
            <Alert className="VoteActivityAlert" severity="success">
              <h2>Earning points:</h2>
              <ul>
                <li>
                  <strong>Only 1 point per day:</strong> to earn the point of
                  each day, you need to add 10 instructors' contact information.
                </li>
                <li>
                  <strong>No partial points:</strong> if you add fewer than 10
                  instructors on a day, you'll not earn any partial points.
                </li>
                <li>
                  <strong>No extra points:</strong> if you add more than 10
                  instructors on a day, you'll not earn any extra points.
                </li>
              </ul>
            </Alert>
            <TextField
              className="TextField"
              label="Google Scholar Profile"
              onChange={handleChange}
              name="GoogleScholar"
              value={values.GoogleScholar}
              onKeyPress={onKeyPress}
            />
            <TextField
              className="TextField"
              label="Google Scholar Citations #"
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
              <InputLabel id="MajorSelectLabel">Major:</InputLabel>
              <Select
                labelId="MajorSelectLabel"
                id="MajorSelect"
                value={values.major}
                label="Major"
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
            <div>
              {invalidInstructor && (
                <div className="Error">{invalidInstructor}</div>
              )}
              <Button
                id="InstructorSubmitButton"
                onClick={submitInstructor}
                className={!invalidInstructor ? "Button" : "Button Disabled"}
                variant="contained"
                disabled={!invalidInstructor ? null : true}
              >
                {selectedRows.length === 0
                  ? "Add Instructor"
                  : "Update Instructor"}
              </Button>
              {selectedRows.length > 0 && (
                <Button
                  id="ClearInstructorButton"
                  className="Button"
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
            onRowClick={gridRowClick}
            onCellClick={deleteInstructor}
            onSelectionChange={(newSelection) => {
              setSelectedRows(newSelection.rowIds);
            }}
            selectionModel={selectedRows}
          />
        </div>
      </div>
    </>
  );
};

export default AddInstructor;
