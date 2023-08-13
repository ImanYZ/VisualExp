import React, { useState, useEffect, Suspense } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import axios from "axios";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";

import { firebaseState, fullnameState, isAdminState } from "../../../store/AuthAtoms";
import {
  projectState,
  projectSpecsState,
  administratorsState,
  othersAdministratorsState,
  administratorsTodayState,
  upvotedAdministratorsTodayState
} from "../../../store/ProjectAtoms";

import SnackbarComp from "../../SnackbarComp";
import CSCObjLoader from "../../CountryStateCity/CSCObjLoader";
import GridCellToolTip from "../../GridCellToolTip";
import communities from "../../Home/modules/views/communitiesOrder";

import { isEmail, isToday, isValidHttpUrl, getISODateString } from "../../../utils";

import "./AddAdministrator.css";

const CountryStateCity = React.lazy(() => import("../../CountryStateCity/CountryStateCity"));

const initialState = {
  country: "🇺🇸 United States;US",
  stateInfo: "Michigan;MI;US",
  city: "Ann Arbor",
  position: "",
  webURL: ""
};

let lastCountry;

const doNothing = () => {};

const renderInstitution = params => <TextField {...params} label="Institution" variant="outlined" />;

const getCountry = c => {
  const matches = c.match(/(.+);[A-Z]+/);
  return matches.length > 1 ? matches[1] : "";
};

const getStateId = s => {
  const matches = s.match(/(.+);[A-Z]+;[A-Z]+/);
  return matches.length > 1 ? matches[1] : "";
};

let administratorsColumns = [
  {
    field: "webURL",
    headerName: "Website Address",
    width: 100,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={true} cellValues={cellValues} />;
    }
  },
  {
    field: "howToAddress",
    headerName: "How to Address",
    width: 130,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "email",
    headerName: "Email",
    width: 130,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "institution",
    headerName: "Institution",
    width: 130,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "position",
    headerName: "Position",
    width: 130,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "country",
    headerName: "Country",
    width: 130,
    renderCell: cellValues => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip={cellValues.value ? getCountry(cellValues.value) : ""}
        />
      );
    }
  },
  {
    field: "stateInfo",
    headerName: "State",
    width: 100,
    renderCell: cellValues => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip={cellValues.value ? getStateId(cellValues.value) : ""}
        />
      );
    }
  },
  {
    field: "city",
    headerName: "City",
    width: 100,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  }
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

let othersAdministratorsColumns = [
  ...administratorsColumns,
  {
    field: "upVote",
    headerName: "Up Vote",
    width: 10,
    disableColumnMenu: true,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} actionCell={true} Tooltip="Up Vote" cellValues={cellValues} />;
    }
  },
  {
    field: "downVote",
    headerName: "Down Vote",
    width: 10,
    disableColumnMenu: true,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} actionCell={true} Tooltip="Down Vote" cellValues={cellValues} />;
    }
  },
  {
    field: "comment",
    headerName: "comment",
    width: 250,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  }
];

const extraColumns = [
  {
    field: "upVotes",
    headerName: "Up Votes",
    type: "number",
    width: 10,
    disableColumnMenu: true,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "downVotes",
    headerName: "Down Votes",
    type: "number",
    width: 10,
    disableColumnMenu: true,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "comments",
    headerName: "comments",
    width: 250,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "explanation",
    headerName: "Extra Information",
    width: 250,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  }
];

administratorsColumns = [...administratorsColumns, ...extraColumns];
othersAdministratorsColumns = [...othersAdministratorsColumns, ...extraColumns];

const AddAdministrator = props => {
  const firebase = useRecoilValue(firebaseState);
  // The authenticated researcher fullname
  const fullname = useRecoilValue(fullnameState);
  const project = useRecoilValue(projectState);
  const projectSpecs = useRecoilValue(projectSpecsState);
  const projectPoints = projectSpecs?.points || {};

  // The administrators added by this authenticated
  // researcher
  const [administrators, setAdministrators] = useRecoilState(administratorsState);
  // The administrators added by researchers other than this
  // authenticated researcher
  const [othersAdministrators, setOthersAdministrators] = useRecoilState(othersAdministratorsState);
  // The administrators added by this authenticated
  // researcher today.
  const [administratorsToday, setAdministratorsToday] = useRecoilState(administratorsTodayState);
  // The administrators added by other researchers that this
  // authenticated researcher upvoted today.
  const [upvotedAdministratorsToday, setUpvotedAdministratorsToday] = useRecoilState(upvotedAdministratorsTodayState);
  // States for the fileds that the authenticated researcher enters for each
  // administrator.
  const [howToAddress, setHowToAddress] = useState("");
  const [email, setEmail] = useState("");
  const [explanation, setExplanation] = useState("");
  const [institution, setInstitution] = useState("University of Michigan - Ann Arbor");
  const [institutionInput, setInstitutionInput] = useState("");
  // Every other filed value that the authenticated user can add/modify goes
  // into this state.
  const [values, setValues] = useState(initialState);

  // To show the corresponding error
  const [invalidAdministrator, setInvalidAdministrator] = useState("");

  // Whether the Administrator that the authenticated researcher is trying to add
  // already exists, based on their email address. In this case, we should show
  // an error message.
  const [alreadyExists, setAlreadyExists] = useState(false);
  // These are the arrays of all the countries, states, cities, and institutions
  // to load in the drop-down menu.
  const [CSCObj, setCSCObj] = useState(null);
  const [allCountries, setAllCountries] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  // Helper states to accumulate changes in all the Administrators/votes commming
  // from the database and indicate that all the Administrators are loaded.
  const [administratorsLoaded, setAdministratorsLoaded] = useState(false);
  const [administratorsChanges, setAdministratorsChanges] = useState([]);
  const [votesChanges, setVotesChanges] = useState([]);

  // When clicking each row of the datagrid, which consists of the
  // adinistrators added by the authenticated researcher, we
  // keep those rows in this state to let the authenticated researcher update
  // the data for this row.
  const [selectedRows, setSelectedRows] = useState([]);

  // Number of times the authenticated researcher voted others' administrators.
  const [unvotedNum, setUnvotedNum] = useState(0);
  // A single administrator that the authenticated researcher
  // has not voted on yet.
  const [otherAdministrator, setOtherAdministrator] = useState({});
  // The autheniticated researcher has submitted their vote but the response has
  // not returned from the database yet.
  const [otherVoting, setOtherVoting] = useState(false);
  // The comment that the authenticated researcher can add to any Administrator
  // entry.
  const [comment, setComment] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [otherAdministratorData, setOtherAdministratorData] = useState({});

  useEffect(() => {
    setSelectedRows([]);
    setValues(initialState);
    setInvalidAdministrator("");
    setHowToAddress("");
    setEmail("");
    setExplanation("");
    CSCObjLoader(CSCObj, setCSCObj, setAllCountries);
  }, [project]);

  // Load the array of all the institutions located in the countries where English is the first language to load
  // in the drop-down menu.
  useEffect(() => {
    const loadInstitutions = async () => {
      if (institutions.length === 0) {
        const institutionsObj = await import("../../../assets/edited_universities.json");
        let institutionsList = institutionsObj.default
          // .filter(l => ["United States", "Canada"].includes(l.country))
          .map(l => l.name);
        institutionsList = [...new Set(institutionsList)];
        setInstitutions(institutionsList);
      }
    };
    loadInstitutions();
  }, []);

  // Listen to all the changes to the administrators' collection and put all of
  // them in AdministratorsChanges. After that, set AdministratorsLoaded to true.
  useEffect(() => {
    if (firebase && project) {
      setAdministrators([]);
      setOthersAdministrators([]);
      setAdministratorsToday(0);
      setUpvotedAdministratorsToday(0);
      setOtherAdministrator({});
      const administratorsQuery = firebase.db.collection("administrators");
      const administratorsSnapshot = administratorsQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setAdministratorsChanges(oldAdministratorsChanges => {
          return [...oldAdministratorsChanges, ...docChanges];
        });
        setAdministratorsLoaded(true);
      });
      return () => {
        setAdministratorsChanges([]);
        administratorsSnapshot();
      };
    }
  }, [firebase, project]);

  // After making sure the the Administrators are loaded for the first time, define
  // a new spashot listener to listen to all the Administrator votes by the
  // authenticated researcher and save all of them in votesChanges.
  useEffect(() => {
    if (firebase && project && fullname && administratorsLoaded) {
      const administratorVotesQuery = firebase.db.collection("administratorVotes").where("voter", "==", fullname);

      const administratorVotesSnapshot = administratorVotesQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setVotesChanges(oldVotesChanges => {
          return [...oldVotesChanges, ...docChanges];
        });
      });
      return () => {
        setVotesChanges([]);
        administratorVotesSnapshot();
      };
    }
  }, [firebase, project, fullname, administratorsLoaded]);

  const assignDayUpVotesPoint = async nUpVotedToday => {
    if (nUpVotedToday === 16) {
      const today = getISODateString(new Date());
      const dayUpVotesDocs = await firebase.db
        .collection("dayAdministratorUpVotes")
        .where("voter", "==", fullname)
        .where("date", "==", today)
        .limit(1)
        .get();
      if (dayUpVotesDocs.docs.length === 0) {
        try {
          const dayUpVoteRef = firebase.db.collection("dayAdministratorUpVotes").doc();
          await dayUpVoteRef.set({
            project,
            voter: fullname,
            date: today
          });
          await firebase.db.runTransaction(async t => {
            const researcherRef = firebase.db.collection("researchers").doc(fullname);
            const researcherDoc = await t.get(researcherRef);
            const researcherData = researcherDoc.data();
            const researcherDayUpVotePoints = {
              projects: {
                ...researcherData.projects,
                [project]: {
                  ...researcherData.projects[project],
                  dayAdministratorUpVotes: 1
                }
              }
            };
            if ("dayAdministratorUpVotes" in researcherData.projects[project]) {
              researcherDayUpVotePoints.projects[project].dayAdministratorUpVotes =
                researcherData.projects[project].dayAdministratorUpVotes + 1;
            }
            t.update(researcherRef, researcherDayUpVotePoints);
            const researcherLogRef = firebase.db.collection("researcherLogs").doc();
            t.set(researcherLogRef, {
              ...researcherDayUpVotePoints,
              id: researcherRef.id,
              updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
            });
          });
        } catch (err) {
          console.log("Transaction failure:", err);
          window.alert(
            "You did not get today's point for 16 upvotes on others' administrators. Copy the text of this complete message to Iman on Microsoft Teams. Do not take a screenshot. The error message is: " +
              err
          );
        }
      }
    }
  };

  // Based on the changes to the administrators and votes comming from the database
  // listeners, make the corresponding changes to differnt states.
  useEffect(() => {
    if (administratorsChanges.length > 0) {
      // We make a copy of all the administrator changes and delete all the content
      // of the administratorChanges, so that if new changes come from the database
      // listener while we're working on the previous changes, they do not mess
      // up.
      const tempAdministratorsChanges = [...administratorsChanges];
      setAdministratorsChanges([]);
      let insts = [...administrators];
      let oInsts = [...othersAdministrators];
      let instToday = administratorsToday;
      for (let change of tempAdministratorsChanges) {
        const administratorData = change.doc.data();
        // If the change indicates that the administrator doc is removed:
        if (administratorData.deleted || change.type === "removed") {
          // If the administrator was added by the authenticated researcher:
          if (administratorData.fullname === fullname) {
            // Then, we need to remove it from administrators.
            const administratorIdx = insts.findIndex(instruct => instruct.id === change.doc.id);
            if (administratorIdx !== -1) {
              insts.splice(administratorIdx, 1);
            }
          } else {
            // If the administrator was added by other researchers:
            // Then, we need to remove it from othersAdministrators.
            const administratorIdx = oInsts.findIndex(instruct => instruct.id === change.doc.id);
            if (administratorIdx !== -1) {
              oInsts.splice(administratorIdx, 1);
            }
          }
        } else {
          // Otherwise, we know that the entry was added/updated.
          // If the entry was added by the authenticated researcher:
          if (administratorData.fullname === fullname) {
            // We combine the document data with its id and enty array for
            // comments to start with.
            const newAdministrator = {
              comments: [],
              ...administratorData,
              // deleteButton: "❌",
              id: change.doc.id
            };
            const administratorIdx = insts.findIndex(instruct => instruct.id === change.doc.id);
            // If the administrator previously existed in the administrators, we just
            // need to update it to the new values.
            if (administratorIdx !== -1) {
              insts[administratorIdx] = {
                ...insts[administratorIdx],
                ...newAdministrator
              };
            } else {
              // If the administrator did not previously exist in the administrators,
              // we add it.
              insts.push(newAdministrator);
              // If this administrator document is created today, we increment the
              // value of administratorsToday.
              if (isToday(administratorData.createdAt.toDate())) {
                instToday += 1;
              }
            }
          } else {
            // Otherwise, if the entry was added by researchers other than the
            // authenticated researcher:
            // We combine the document data with its id and enty array for
            // comments to start with.
            const newAdministrator = {
              comments: [],
              ...administratorData,
              id: change.doc.id
            };
            // We check whether the administrator object already exists in
            // othersadministrators, and if it exists, what is its index to update
            // it.
            const administratorIdx = oInsts.findIndex(instruct => instruct.id === change.doc.id);
            if (administratorIdx !== -1) {
              oInsts[administratorIdx] = {
                ...oInsts[administratorIdx],
                ...newAdministrator
              };
            } else {
              // If it does not exist, we just push it together with default
              // values for upVote, downVote, and currentVote. The value of
              // currentVote is always upVote - downVote, which can be -1, 0, or
              // 1.
              oInsts.push({
                ...newAdministrator,
                upVote: "◻",
                downVote: "◻",
                currentVote: 0
              });
            }
          }
        }
      }
      // When a researcher adds 7 administrators in a single
      // day, they get a point for it. No partial points for less than 7, and no
      // extra points for more than 7. So, if they've already added 7, they can
      // keep adding more, but we do not increase the number on the toolbar to
      // make sure they do not think they can earn more points by adding more.
      setAdministratorsToday(instToday <= 7 ? instToday : 7);
      setAdministrators(insts);
      setOthersAdministrators(oInsts);
    }
    if (votesChanges.length > 0) {
      // We make a copy of all the vote changes and delete all the content of
      // the voteChanges, so that if new changes come from the database listener
      // while we're working on the previous changes, they do not mess up.
      const tempVotesChanges = [...votesChanges];
      setVotesChanges([]);
      let oInsts = [...othersAdministrators];
      let nUpVotedToday = upvotedAdministratorsToday;
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
        // They only vote on the administrators added by
        // other researchers. So, we should find and update the corresponding
        // object in othersAdministrators.
        const oInstsIdx = oInsts.findIndex(instr => instr.id === voteData.administrator);
        if (change.type === "removed") {
          // If the vote is removed and othersAdministrator exists, we should reset
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
          // If othersAdministrator exists:
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
            // Update the othersAdministrator object accordingly.
            oInsts[oInstsIdx] = {
              ...oInsts[oInstsIdx],
              comment: voteData.comment ? voteData.comment : "",
              upVote: voteData.upVote ? "👍" : "◻",
              downVote: voteData.downVote ? "👎" : "◻",
              currentVote: voteData.upVote - voteData.downVote
            };
          } else {
            // If the othersAdministrator object does not exist, create it with
            // default values for other fields until we load those values. This
            // will probably never happen becuase an othersAdministrator should be
            // loaded for the researcher to be able to vote on it.
            oInsts.push({
              comment: voteData.comment ? voteData.comment : "",
              upVote: voteData.upVote ? "👍" : "◻",
              downVote: voteData.downVote ? "👎" : "◻",
              currentVote: voteData.upVote - voteData.downVote,
              howToAddress: "",
              email: "",
              explanation: "",
              institution: "",
              ...initialState,
              id: voteData.administrator
            });
          }
        }
      }
      assignDayUpVotesPoint(nUpVotedToday);
      // When a researcher upvotes 16 administrators that are
      // added by other researchers, today, they get a point for it. No partial
      // points for less than 16, and no extra points for more than 16. So, if
      // they've already upvote 16, they can keep adding more, but we do not
      // increase the number on the toolbar to make sure they do not think they
      // can earn more points by upvoting more.
      setUpvotedAdministratorsToday(nUpVotedToday <= 16 ? nUpVotedToday : 16);
      setOthersAdministrators(oInsts);
    }
  }, [
    votesChanges,
    upvotedAdministratorsToday,
    administratorsToday,
    administrators,
    administratorsChanges,
    othersAdministrators,
    fullname,
    project
  ]);

  // Every time a chnage happens to othersAdministrators, we should look for the
  // othersAdministrator that the authenticated researcher has not voted yet, and
  // it has received fewer than 3 total votes by researchers, to show it in the
  // upper box to facilitate evaluating (voting) it by the authenticated
  // researcher. If a othersAdministrator has already received greater than or
  // equal to 3 votes from researchers, we should remove it from
  // othersAdministrators.
  useEffect(() => {
    let theAdministrator;
    let uAdministratorsNum = 0;
    let oInsts = [...othersAdministrators];
    let oInstsChanged = false;
    for (let oAdministrator of othersAdministrators) {
      if (oAdministrator.upVote === "◻" && oAdministrator.downVote === "◻") {
        if (oAdministrator.upVotes + oAdministrator.downVotes >= 3) {
          oInsts = oInsts.filter(instruct => instruct.id !== oAdministrator.id);
          oInstsChanged = true;
        } else {
          if (!theAdministrator) {
            theAdministrator = oAdministrator;
          }
          uAdministratorsNum += 1;
        }
      }
    }
    if (theAdministrator) {
      setOtherAdministrator(theAdministrator);
    }
    setUnvotedNum(uAdministratorsNum);
    if (oInstsChanged) {
      setOthersAdministrators(oInsts);
    }
  }, [othersAdministrators]);

  // If the authenticated research clicks one of the rows in the other
  // Administrators' data grid, we should load that as the other Administrator to show
  // it in the upper box to facilitate evaluating (voting) it by the
  // authenticated researcher.
  const othersAdministratorsRowClick = clickedRow => {
    const theRow = clickedRow.row;
    if (theRow) {
      setOtherAdministratorData(theRow);
      const instrIdx = othersAdministrators.findIndex(othInstr => othInstr.id === clickedRow.id);
      if (instrIdx !== -1) {
        setOtherAdministrator(othersAdministrators[instrIdx]);
        setComment(othersAdministrators[instrIdx].comment);
      }
    }
  };

  // Validator useEffect: Based on the changes in the input field, we validate
  // them and generate corresponding error messages.
  useEffect(() => {
    const validwebURL = isValidHttpUrl(values.webURL);
    const validEmail = isEmail(email);
    const validHowToAddress = howToAddress.length > 4 && howToAddress.includes(" ");
    if (alreadyExists) {
      setInvalidAdministrator(
        `This administrator with email address ${email} is already invited to our experiment! Invite another administrator or school administrator please.`
      );
    } else if (!validwebURL) {
      setInvalidAdministrator(
        `Please enter a valid website address that we can get this administrator's information from!`
      );
    } else if (!validEmail) {
      setInvalidAdministrator("Please enter a valid email address!");
    } else if (!validHowToAddress) {
      setInvalidAdministrator("Please enter a valid howToAddress!");
    } else if (!values.country) {
      setInvalidAdministrator("Please specify their country!");
    } else if (!values.stateInfo) {
      setInvalidAdministrator("Please specify their state!");
    } else if (!values.city) {
      setInvalidAdministrator("Please specify their city!");
      // } else if (!values.position) {
      //   setInvalidAdministrator("Please specify their position!");
    } else {
      setInvalidAdministrator("");
    }
  }, [
    alreadyExists,
    email,
    howToAddress,
    values.webURL,
    values.country,
    values.stateInfo,
    values.city,
    values.position
  ]);

  // This is for the vote buttons in the data grid that displays other
  // Administrators.
  const voteOthersAdministrators = async clickedCell => {
    if (clickedCell.field === "upVote" || clickedCell.field === "downVote") {
      try {
        let oAdministrators = [...othersAdministrators];
        const administratorIdx = oAdministrators.findIndex(instr => instr.id === clickedCell.id);
        if (administratorIdx !== -1 && oAdministrators[administratorIdx][clickedCell.field] !== "O") {
          oAdministrators[administratorIdx] = {
            ...oAdministrators[administratorIdx],
            [clickedCell.field]: "O"
          };
          setOthersAdministrators(oAdministrators);
          // We need to refresh the Firebase Auth idToken because in the
          // backend, we'll retrive the authenticated researcher. This way, we
          // do not let anyone hack the system to vote on their own entries.
          await firebase.idToken();
          await axios.post("/researchers/voteAdministrator", {
            administrator: clickedCell.id,
            vote: clickedCell.field,
            voterProject: project
          });
          setComment("");
          setSnackbarMessage("You successfully voted for others' administrator!");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // This is for the vote buttons in the box above the page that displays the single other administrator.
  const voteOtherAdministrator = (administratorId, voteType) => async event => {
    try {
      if (!otherVoting) {
        setOtherVoting(true);
        // We need to refresh the Firebase Auth idToken because in the
        // backend, we'll retrive the authenticated researcher. This way, we
        // do not let anyone hack the system to vote on their own entries.
        await firebase.idToken();
        await axios.post("/researchers/voteAdministrator", {
          administrator: administratorId,
          vote: voteType,
          comment,
          voterProject: project
        });
        setSnackbarMessage("You successfully voted for others' administrator!");
        setOtherVoting(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const changeComment = event => setComment(event.target.value);

  const changeInstitution = (event, value) => setInstitution(value);

  const changeInstitutionInput = (event, value) => setInstitutionInput(value);

  const howToAddressChange = event => {
    let hName = event.target.value;
    hName = hName.replace(/[0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;\.:[\]]/gi, "");
    setHowToAddress(hName);
  };

  const emailChange = event => {
    setEmail(event.target.value.toLowerCase());
  };

  const explanationChange = event => setExplanation(event.target.value);

  // One handleChnage for all the text fields depending on the
  // event.target.name.
  const handleChange = event => {
    if ("persist" in event) {
      event.persist();
    }
    setValues(previousValues => {
      const newValues = {
        ...previousValues,
        [event.target.name]: event.target.value
      };
      return newValues;
    });
  };

  // When emailBlur happens, we should check whether this administrator was
  // enterred before. In that case, we should return an error message to prevent
  // entering duplicate records.
  const emailBlur = async event => {
    const administratorDocs = await firebase.db.collection("administrators").where("email", "==", email).get();
    if (administratorDocs.docs.length > 0) {
      const administratorData = administratorDocs.docs[0].data();
      if (administratorData.deleted) {
        setAlreadyExists(false);
      } else {
        setAlreadyExists(true);
      }
    } else {
      setAlreadyExists(false);
    }
  };

  const clearAdministrator = event => {
    setSelectedRows([]);
    setAlreadyExists(false);
    setInvalidAdministrator("");
    setHowToAddress("");
    setEmail("");
    setExplanation("");
    // setInstitution("University of Michigan - Ann Arbor");
    setValues({
      ...initialState,
      country: values.country,
      stateInfo: values.stateInfo,
      city: values.city
    });
  };

  // If the authenticated researcher clicks any of the rows in the datagrid that
  // contains the administrators that they enterred before,
  // we should populate its data in the above fields so that they can update
  // their previously enterred information.
  const myAdministratorsRowClick = clickedRow => {
    const theRow = { ...clickedRow.row };
    if (theRow) {
      setSelectedRows([clickedRow.id]);
      setAlreadyExists(false);
      setInvalidAdministrator("");
      setHowToAddress(theRow.howToAddress);
      setEmail(theRow.email);
      setExplanation(theRow.explanation ? theRow.explanation : "");
      setInstitution(theRow.institution);
      setValues({
        country: theRow.country,
        stateInfo: theRow.stateInfo,
        city: theRow.city,
        position: theRow.position,
        webURL: theRow.webURL
      });
    } else {
      clearAdministrator("Nothing");
    }
  };

  const submitAdministrator = async event => {
    if (!invalidAdministrator) {
      // If a row is selected, it means they're trying to update the record.
      const updating = selectedRows.length > 0;
      try {
        // We use this flag to check if they updated their existing record to
        // reset its votes in the database.
        let gotUpdated = false;
        await firebase.db.runTransaction(async transaction => {
          // First check whether the administrator already exists to make sure they
          // don't add duplicate entries.
          const administratorDocs = await firebase.db.collection("administrators").where("email", "==", email).get();
          let administratorExists = false;
          if (administratorDocs.docs.length > 0) {
            const administratorData = administratorDocs.docs[0].data();
            if (
              !administratorData.deleted &&
              (!updating ||
                // Even if they are updating an existing record, we should make
                // sure it is not different from the row that they have selected
                // to update.
                (updating && administratorDocs.docs[0].id !== selectedRows[0]))
            ) {
              administratorExists = true;
            }
          }
          if (administratorExists) {
            setAlreadyExists(true);
          } else {
            const currentTime = firebase.firestore.Timestamp.fromDate(new Date());
            const researcherRef = firebase.db.collection("researchers").doc(fullname);
            const researcherDoc = await researcherRef.get();
            const researcherData = researcherDoc.data();
            const today = getISODateString(new Date());
            const dayAdministratorsDocs = await firebase.db
              .collection("dayAdministrators")
    
              .where("fullname", "==", fullname)
              .where("date", "==", today)
              .limit(1)
              .get();

            let administratorRef = firebase.db.collection("administrators").doc();
            if (updating) {
              administratorRef = firebase.db.collection("administrators").doc(selectedRows[0]);
            }
            const administratorData = {
              project,
              fullname,
              howToAddress,
              email,
              explanation,
              institution,
              ...values
            };
            if (updating) {
              administratorData.updatedAt = currentTime;
              transaction.update(administratorRef, administratorData);
              gotUpdated = true;
            } else {
              administratorData.createdAt = currentTime;
              transaction.set(administratorRef, administratorData);
            }
            const administratorLogRef = firebase.db.collection("administratorsLogs").doc();
            transaction.set(administratorLogRef, {
              ...administratorData,
              id: administratorRef.id
            });
            if (!updating) {
              // If they collect 7 administrators' information
              // in a single day, we should giv them a point.
              if (
                administratorsToday === 6 &&
                dayAdministratorsDocs.docs.length === 0 &&
                !("dayAdministratorUpVotes" in projectPoints)
              ) {
                const dayAdministratorRef = firebase.db.collection("dayAdministrators").doc();
                await dayAdministratorRef.set({
                  project,
                  fullname,
                  date: today
                });
                const researcherAdministrators = {
                  projects: {
                    ...researcherData.projects,
                    [project]: {
                      ...researcherData.projects[project],
                      administrators: 1,
                      administratorsNum: 1
                    }
                  }
                };
                if ("administrators" in researcherData.projects[project]) {
                  researcherAdministrators.projects[project].administrators =
                    researcherData.projects[project].administrators + 1;
                }
                if ("administratorsNum" in researcherData.projects[project]) {
                  researcherAdministrators.projects[project].administratorsNum =
                    researcherData.projects[project].administratorsNum + 1;
                }
                transaction.update(researcherRef, researcherAdministrators);
                const researcherLogRef = firebase.db.collection("researcherLogs").doc();
                transaction.set(researcherLogRef, {
                  ...researcherAdministrators,
                  id: researcherRef.id,
                  updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
                });
              } else {
                // Even if we don't give the authenticated researher a point for
                // adding 7 administrators in a day, we still need to increase the
                // total number of administrators they have
                // collected.
                const researcherAdministrators = {
                  projects: {
                    ...researcherData.projects,
                    [project]: {
                      ...researcherData.projects[project],
                      administratorsNum: 1
                    }
                  }
                };
                if ("administratorsNum" in researcherData.projects[project]) {
                  researcherAdministrators.projects[project].administratorsNum =
                    researcherData.projects[project].administratorsNum + 1;
                }
                transaction.update(researcherRef, researcherAdministrators);
                const researcherLogRef = firebase.db.collection("researcherLogs").doc();
                transaction.set(researcherLogRef, {
                  ...researcherAdministrators,
                  id: researcherRef.id,
                  updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
                });
              }
            }
            setSnackbarMessage("You successfully submitted your administrator!");
            clearAdministrator("Nothing");
          }
        });
        if (gotUpdated) {
          await firebase.idToken();
          await axios.post("/researchers/voteAdministratorReset", {
            administrator: selectedRows[0]
          });
        }
      } catch (e) {
        console.log("Transaction failure:", e);
      }
    }
  };

  const onKeyPress = event => {
    if (event.key === "Enter" && !invalidAdministrator) {
      submitAdministrator();
    }
  };

  const deleteAdministrator = async clickedCell => {
    if (clickedCell.field === "deleteButton") {
      try {
        let instructs = [...administrators];
        const administratorIdx = instructs.findIndex(instruct => instruct.id === clickedCell.id);
        if (administratorIdx !== -1 && instructs[administratorIdx][clickedCell.field] !== "O") {
          instructs[administratorIdx][clickedCell.field] = "O";
          setAdministrators(instructs);
          const administratorRef = firebase.db.collection("administrators").doc(clickedCell.id);
          // const administratorDoc = await administratorRef.get();
          await administratorRef.update({ deleted: true });
          setTimeout(() => {
            clearAdministrator("Nothing");
          }, 400);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <>
      <h2>Administrators Added by Others:</h2>
      <div className="ColumnsAuto_Auto">
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <Alert className="VoteActivityAlert" severity="success">
              <ul>
                <li>
                  <strong>You earn points for evaluating the administrators added by others:</strong> you receive one
                  point for every 16 upvotes you cast on the administrators added by your colleagues in every single
                  day.
                </li>
                <li>
                  <strong>No partial or extra points:</strong> if on a single day you cast more than 16 upvotes, you'll
                  not receive any extra points. If you cast fewer than 16 upvotes, you'll not receive any partial
                  points, either.
                </li>
              </ul>
            </Alert>
            <Alert className="VoteActivityAlert" severity="error">
              <h3>Downvotes:</h3>
              <p>
                If you find an administrator's information that does not match the information on their website,
                downvote (👎) it. The researcher who has posted the incomplete/wrong information will be penalized.
              </p>
            </Alert>
          </div>
        </div>
        {Object.keys(otherAdministrator).length > 0 ? (
          <Paper className="VoteActivityPaper">
            <h3>
              You've not evaluated {unvotedNum.toLocaleString()} administrator
              {unvotedNum === 1 ? "'s" : "s'"} info yet!
            </h3>
            <h3>This is one of them:</h3>
            <p>
              <a href={otherAdministrator.webURL} target="_blank">
                {otherAdministrator.webURL}
              </a>
            </p>
            <p>{otherAdministrator.howToAddress + " at " + otherAdministrator.email}</p>
            <p>{otherAdministrator.position + " from " + otherAdministrator.institution}</p>
            <p>
              {getCountry(otherAdministrator.country) +
                ", " +
                getStateId(otherAdministrator.stateInfo) +
                ", " +
                otherAdministrator.city}
            </p>
            <p>
              <i>Extra Info:</i> {otherAdministrator.explanation}
            </p>
            <TextareaAutosize
              ariaLabel="Comment Text box"
              minRows={4}
              style={{ width: "94%" }}
              placeholder="Comment"
              onChange={changeComment}
              value={comment}
            />
            <Box sx={{ textAlign: "center" }}>To submit your comment, click one of the vote buttons!</Box>
            <div id="VoteOtherFooter">
              <Tooltip title="Down-vote" placement="top">
                <Button
                  id="VoteOtherDownVoteBtn"
                  onClick={voteOtherAdministrator(otherAdministrator.id, "downVote")}
                  className="Button"
                  variant="contained"
                >
                  {otherVoting ? (
                    <CircularProgress color="warning" size="16px" />
                  ) : (
                    <Box
                      sx={
                        otherAdministrator.downVote === "👎"
                          ? {
                              textDecoration: "line-through",
                              color: "red",
                              fontWeight: 700
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
                  onClick={voteOtherAdministrator(otherAdministrator.id, "upVote")}
                  className="Button"
                  variant="contained"
                >
                  {otherVoting ? (
                    <CircularProgress color="warning" size="16px" />
                  ) : (
                    <Box
                      sx={
                        otherAdministrator.upVote === "👍"
                          ? {
                              textDecoration: "line-through",
                              color: "red",
                              fontWeight: 700
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
          rows={othersAdministrators}
          columns={othersAdministratorsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          // checkboxSelection
          hideFooterSelectedRowCount
          onRowClick={othersAdministratorsRowClick}
          loading={!administratorsLoaded}
          onCellClick={voteOthersAdministrators}
        />
      </div>
      <div id="AddAdministrator">
        <div className="Columns40_60">
          <Box>
            <Alert className="VoteActivityAlert" severity="success">
              <h2>How to Address:</h2>
              <p>We need this field to include it in the first line of the email after the word "Hello,"</p>
              <ul>
                <li>
                  If the email address belongs to a specific person, please add the fullname of that persion; e.g.,
                  "Hello John Doe,"
                </li>
                <li>
                  If the email address belongs to an office/department, please add the name of that office/department;
                  e.g., "Hello Office of Career Development at the University of Michigan, School of Information,"
                </li>
              </ul>
              <h2>Points to earn:</h2>
              <ul>
                <li>
                  <strong>Your contribution:</strong> every upvote minus downvote you receive from others on your
                  proposed administrators gives you one point.
                </li>
              </ul>
            </Alert>
          </Box>
          <Paper className="VoteActivityPaper">
            <Alert className="VoteActivityAlert" severity="warning">
              <h2>Who to add:</h2>
              <p>
                Enter a college/university administrator's information, based in the countries where English is the
                first language.
              </p>
              {"dayAdministratorUpVotes" in projectPoints ? null : (
                <>
                  <h2>Earning points:</h2>
                  <ul>
                    <li>
                      <strong>Only 1 point per day:</strong> to earn the point of each day, you need to add 7
                      administrators' contact information.
                    </li>
                    <li>
                      <strong>No partial points:</strong> if you add fewer than 7 administrators on a day, you'll not
                      earn any partial points.
                    </li>
                    <li>
                      <strong>No extra points:</strong> if you add more than 7 administrators on a day, you'll not earn
                      any extra points.
                    </li>
                  </ul>
                </>
              )}
            </Alert>
            <TextField
              className="TextField"
              label="Website to find the info"
              onChange={handleChange}
              name="webURL"
              value={values.webURL}
              onKeyPress={onKeyPress}
            />
            <TextField
              className="TextField"
              label="How to Address"
              onChange={howToAddressChange}
              name="howToAddress"
              value={howToAddress}
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
            <TextField
              className="TextField"
              label="position"
              onChange={handleChange}
              name="position"
              value={values.position}
              onKeyPress={onKeyPress}
            />
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
                style={{ margin: "10px" }}
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
              {invalidAdministrator && <div className="Error">{invalidAdministrator}</div>}
              <Button
                onClick={submitAdministrator}
                className={!invalidAdministrator ? "Button SubmitButton" : "Button SubmitButton Disabled"}
                variant="contained"
                disabled={!invalidAdministrator ? null : true}
              >
                {selectedRows.length === 0 ? "Add Administrator" : "Update Administrator"}
              </Button>
              {selectedRows.length > 0 && (
                <Button className="Button ClearButton" onClick={clearAdministrator} variant="contained">
                  Clear Selection
                </Button>
              )}
            </div>
          </Paper>
        </div>
        <div className="DataGridBox">
          <DataGrid
            rows={administrators}
            columns={administratorsColumns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            autoPageSize
            autoHeight
            hideFooterSelectedRowCount
            loading={!administratorsLoaded}
            onRowClick={myAdministratorsRowClick}
            onCellClick={deleteAdministrator}
            onSelectionChange={newSelection => {
              setSelectedRows(newSelection.rowIds);
            }}
            selectionModel={selectedRows}
          />
        </div>
      </div>
      <SnackbarComp newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />
    </>
  );
};

export default AddAdministrator;
