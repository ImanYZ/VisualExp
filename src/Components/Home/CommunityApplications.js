import React, { useState, useEffect, useCallback } from "react";
import { useRecoilValue } from "recoil";

import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import MoreVert from "@mui/icons-material/MoreVert";

import { DataGrid } from "@mui/x-data-grid";

import {
  firebaseState,
  fullnameState,
  leadingState,
} from "../../store/AuthAtoms";

import GridCellToolTip from "../GridCellToolTip";
import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";
import SnackbarComp from "../SnackbarComp";
import PDFView from "./modules/components/PDFView";

const applicationsColumns = [
  {
    field: "community",
    headerName: "Community",
    width: 190,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  { field: "createdAt", headerName: "Started", type: "dateTime", width: 190 },
  {
    field: "applicant",
    headerName: "Applicant",
    width: 190,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 190,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "readingImmediate",
    headerName: "ReImScore",
    type: "number",
    width: 100,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip="Reading Comprehension Immediate Score"
        />
      );
    },
  },
  {
    field: "reading3Days",
    headerName: "Re3DaysScore",
    type: "number",
    width: 100,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip="Reading Comprehension After Three Days Score"
        />
      );
    },
  },
  {
    field: "reading1Week",
    headerName: "Re1WeekScore",
    type: "number",
    width: 100,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip="Reading Comprehension After One Week Score"
        />
      );
    },
  },
  {
    field: "tutorialWrongs",
    headerName: "Tut-",
    type: "number",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip="Tutorial Wrong Attemps"
        />
      );
    },
  },
  {
    field: "tutorialEnded",
    headerName: "Completed Tutorial",
    width: 40,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          actionCell={true}
          Tooltip="Completed Tutorial"
          cellValues={{ ...cellValues, value: cellValues.value ? "✅" : "" }}
        />
      );
    },
  },
  {
    field: "quizWrongs",
    headerName: "Quiz-",
    type: "number",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip="Quiz Wrong Attemps"
        />
      );
    },
  },
  {
    field: "transcript",
    headerName: "Transcript",
    width: 100,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={true} cellValues={cellValues} />;
    },
  },
  {
    field: "resume",
    headerName: "Resume",
    width: 100,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={true} cellValues={cellValues} />;
    },
  },
  {
    field: "portfolio",
    headerName: "Portfolio",
    width: 100,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={true} cellValues={cellValues} />;
    },
  },
  {
    field: "accepted",
    headerName: "Accepted",
    width: 40,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          actionCell={true}
          Tooltip="Accept"
          cellValues={cellValues}
        />
      );
    },
  },
  {
    field: "rejected",
    headerName: "Rejected",
    width: 40,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          actionCell={true}
          Tooltip="Reject"
          cellValues={cellValues}
        />
      );
    },
  },
  {
    field: "explanation",
    headerName: "Explanation",
    width: 280,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "leader",
    headerName: "Decision Made By",
    width: 190,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          cellValues={cellValues}
          Tooltip={"Decision made by " + cellValues.value}
        />
      );
    },
  },
  {
    field: "checkedAt",
    headerName: "Decision Made On",
    type: "dateTime",
    width: 190,
  },
];

const CommunityApplications = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);

  const [applications, setApplications] = useState([]);
  const [application, setApplication] = useState({});
  const [applicationsChanges, setApplicationsChanges] = useState([]);
  const [applicationsLoaded, setApplicationsLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [checkedFullname, setCheckedFullname] = useState(false);

  useEffect(() => {
    if (fullname === "Iman YeckehZaare") {
      applicationsColumns.push({
        field: "invited",
        headerName: "Invited",
        width: 10,
        disableColumnMenu: true,
        renderCell: (cellValues) => {
          return (
            <GridCellToolTip
              isLink={false}
              actionCell={true}
              Tooltip="Invite"
              cellValues={cellValues}
            />
          );
        },
      });
    }
    setCheckedFullname(true);
  }, [fullname]);

  useEffect(() => {
    if (firebase) {
      const appliSnapshots = [];
      for (
        let communiBatch = 0;
        communiBatch < props.communiIds.length / 10;
        communiBatch++
      ) {
        const communiIds = [];
        for (
          let communiIdx = 10 * communiBatch;
          communiIdx < 10 * (communiBatch + 1) &&
          communiIdx < props.communiIds.length;
          communiIdx++
        ) {
          communiIds.push(props.communiIds[communiIdx]);
        }
        const applicationsQuery = firebase.db
          .collection("applications")
          .where("communiId", "in", communiIds);
        appliSnapshots.push(
          applicationsQuery.onSnapshot((snapshot) => {
            const docChanges = snapshot.docChanges();
            setApplicationsChanges((oldApplicationsChanges) => {
              return [...oldApplicationsChanges, ...docChanges];
            });
          })
        );
      }
      return () => {
        setApplicationsLoaded(false);
        for (let appliSnapshot of appliSnapshots) {
          appliSnapshot();
        }
      };
    }
  }, [firebase, props.communiIds]);

  useEffect(() => {
    const loadApplications = async () => {
      let applics = [...applications];
      for (let change of applicationsChanges) {
        if (change.type === "removed") {
          applics = applics.filter((applic) => applic.id !== change.doc.id);
        } else {
          const applicData = change.doc.data();
          if (applicData.ended) {
            const newApplic = {
              community: applicData.communiId,
              applicant: applicData.fullname,
              createdAt: applicData.createdAt.toDate(),
              explanation: applicData.explanation,
              quizCorrects: applicData.corrects,
              quizWrongs: applicData.wrongs,
              checkedAt: null,
              accepted: "◻",
              rejected: "◻",
              invited: "◻",
              email: "",
              transcript: "",
              resume: "",
              portfolio: "",
              readingImmediate: 0,
              reading3Days: 0,
              reading1Week: 0,
              tutorialWrongs: 0,
              tutorialEnded: false,
              id: change.doc.id,
            };
            if ("leader" in applicData && applicData.leader) {
              newApplic.leader = applicData.leader;
            }
            if ("checkedAt" in applicData && applicData.checkedAt) {
              newApplic.checkedAt = applicData.checkedAt.toDate();
            }
            if ("accepted" in applicData && applicData.accepted) {
              newApplic.accepted = "✅";
            }
            if ("rejected" in applicData && applicData.rejected) {
              newApplic.rejected = "🚫";
            }
            if ("invited" in applicData && applicData.invited) {
              newApplic.invited = "✉️";
            }
            const userDoc = await firebase.db
              .collection("users")
              .doc(applicData.fullname)
              .get();
            const userData = userDoc.data();
            if ("email" in userData && userData.email) {
              newApplic.email = userData.email;
            }
            if ("Transcript" in userData && userData.Transcript) {
              newApplic.transcript = userData.Transcript;
            }
            if ("Resume" in userData && userData.Resume) {
              newApplic.resume = userData.Resume;
            }
            if ("Portfolio" in userData && userData.Portfolio) {
              newApplic.portfolio = userData.Portfolio;
            }
            if ("pConditions" in userData && userData.pConditions) {
              for (let pCondition of userData.pConditions) {
                if (
                  "testScoreRatio" in pCondition &&
                  pCondition.testScoreRatio
                ) {
                  newApplic.readingImmediate += pCondition.testScoreRatio;
                }
                if (
                  "test3DaysScoreRatio" in pCondition &&
                  pCondition.test3DaysScoreRatio
                ) {
                  newApplic.reading3Days += pCondition.test3DaysScoreRatio;
                }
                if (
                  "test1WeekScoreRatio" in pCondition &&
                  pCondition.test1WeekScoreRatio
                ) {
                  newApplic.reading1Week += pCondition.test1WeekScoreRatio;
                }
              }
              newApplic.readingImmediate = newApplic.readingImmediate / 2;
              newApplic.reading3Days = newApplic.reading3Days / 2;
              newApplic.reading1Week = newApplic.reading1Week / 2;
            }
            const tutorialDoc = await firebase.db
              .collection("tutorial")
              .doc(applicData.fullname)
              .get();
            if (tutorialDoc.exists) {
              const tutorialData = tutorialDoc.data();
              if ("wrongs" in tutorialData && tutorialData.wrongs) {
                newApplic.tutorialWrongs = tutorialData.wrongs;
              }
              if ("ended" in tutorialData && tutorialData.ended) {
                newApplic.tutorialEnded = true;
              }
            }
            const applicIdx = applications.findIndex(
              (acti) => acti.id === change.doc.id
            );
            if (applicIdx !== -1) {
              applics[applicIdx] = {
                ...applics[applicIdx],
                ...newApplic,
              };
            } else {
              applics.push(newApplic);
            }
          }
        }
      }
      setApplicationsChanges([]);
      console.log({
        applics,
      });
      setApplications(applics);
      setApplicationsLoaded(true);
    };
    if (firebase && applicationsChanges.length > 0) {
      loadApplications();
    }
  }, [firebase, applications, applicationsChanges]);

  useEffect(() => {
    let theApplicant;
    for (let applic of applications) {
      if (applic.accepted === "◻" && applic.rejected === "◻" && !theApplicant) {
        theApplicant = applic;
      }
    }
    if (theApplicant) {
      setApplication(theApplicant);
    }
  }, [applications]);

  const applicationsRowClick = (clickedRow) => {
    const theRow = clickedRow.row;
    if (theRow) {
      const applicIdx = applications.findIndex(
        (applic) => applic.id === clickedRow.id
      );
      if (applicIdx !== -1) {
        setApplication(applications[applicIdx]);
      }
    }
  };

  const checkApplicant = useCallback(
    (applicId, voteType) => async () => {
      try {
        if (!submitting) {
          setSubmitting(true);
          try {
            let applics = [...applications];
            const applicIdx = applics.findIndex((acti) => acti.id === applicId);
            if (applicIdx !== -1 && applics[applicIdx][voteType] !== "O") {
              const applicData = {};
              if (voteType === "accepted") {
                applicData[voteType] = applics[applicIdx][voteType] !== "✅";
              } else if (voteType === "rejected") {
                applicData[voteType] = applics[applicIdx][voteType] !== "🚫";
              } else if (voteType === "invited") {
                applicData[voteType] = applics[applicIdx][voteType] !== "✉️";
              }
              if (fullname !== "Iman YeckehZaare") {
                applicData.leader = fullname;
                applicData.checkedAt = firebase.firestore.Timestamp.fromDate(
                  new Date()
                );
              }
              console.log({
                applics,
                applicIdx,
                voteType,
                mark: applics[applicIdx][voteType],
                applicData,
              });

              applics[applicIdx] = {
                ...applics[applicIdx],
                [voteType]: "O",
                leader: fullname,
              };
              setApplications(applics);

              const applicRef = firebase.db
                .collection("applications")
                .doc(applics[applicIdx].id);
              await applicRef.update(applicData);
              // applics[applicIdx] = {
              //   ...applics[applicIdx],
              //   [voteType]: isChecked
              //     ? "◻"
              //     : voteType === "accepted"
              //     ? "✅"
              //     : voteType === "invited"
              //     ? "✉️"
              //     : "🚫",
              //   checkedAt: new Date(),
              // };
              // setApplications(applics);
              if (voteType === "accepted") {
                setSnackbarMessage("You successfully accepted this applicant!");
              } else if (voteType === "rejected") {
                setSnackbarMessage("You successfully rejected this applicant!");
              } else if (voteType === "invited") {
                setSnackbarMessage(
                  "You successfully invited this applicant to Microsoft Teams!"
                );
              }
            }
          } catch (err) {
            console.error(err);
          }
          setSubmitting(false);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [applications]
  );

  const checkApplication = useCallback(
    (clickedCell) => {
      if (["accepted", "rejected", "invited"].includes(clickedCell.field)) {
        checkApplicant(clickedCell.id, clickedCell.field)();
      }
    },
    [applications]
  );

  return (
    <PagesNavbar>
      <Typography variant="h3" gutterBottom marked="center" align="center">
        Applications to Your{" "}
        {props.communiIds.length > 1 ? "Communityies" : "Community"}
      </Typography>
      <Alert severity="success">
        <ul>
          <li>
            <strong>Expanding each row:</strong> by default, the expanded
            version of one of the applications that you have not
            accepted/rejected is shown below the table. If you click any row,
            that application will be expanded below.
          </li>
          <li>
            <strong>Reviewing:</strong> to review each application, BEFORE
            clicking the accept ✅ or reject 🚫 buttons, please send the
            applicant your community-specific acceptance/orientation or
            rejection email through onecademy@umich.edu. Make sure you
            coordinate with your co-leaders and do not double-contact applicants
            (ex: you shouldn’t both email them to accept them, just one).
          </li>
          <li>
            <strong>Accepting/rejecting:</strong> you can either click the
            accept ✅ or reject 🚫 buttons to indicate that you completed the
            review of each application.
          </li>
          <li>
            <strong>Inviting to Microsoft Teams:</strong> you do NOT need to
            add/remove your interns in the interns' spreadsheet anymore. By only
            clicking the accept ✅ or reject 🚫 buttons, you notify Iman whether
            to invite the applicant to Microsoft Teams.
          </li>
          <li>
            <strong>Each row:</strong> shows you one of the applicants who have
            completed every part of the application for your{" "}
            {props.communiIds.length > 1 ? "communityies" : "community"}.
          </li>
          <li>
            <strong>Each cell:</strong> hovering on each cell shows you the
            content or its description as a tooltip.
          </li>
          <li>
            <strong>Filtering and Sorting:</strong> by clicking each column
            title, you can sort the table based on that column. Some columns
            also give you an option to filter through their content by clicking{" "}
            <MoreVert /> on the column title.
          </li>
          <li>
            <strong>Wrong attempts:</strong> for the 1Cademy tutorial and
            community-specific quiz, you can see the number of wrong attempts
            for the 1cademy tutorial, and in a separate column the wrong
            attempts. So, the lower the number, the better.
          </li>
          <li>
            <strong>Click links:</strong> to open their transcripts, resume, or
            portfolios in a new browser tab w/o downloading.
          </li>
          <li>
            <strong>Multiple leaders:</strong> if a community has multiple
            leaders, and accepts/rejects someone, you will be able to see who
            accepted/rejected the applicant and when in the last two columns.
          </li>
          <li>
            <strong>Notes:</strong>
            <ul>
              <li>
                Community leaders should manually send the acceptance or
                rejection emails through onecademy@umich.edu, it will not
                automatically email.
              </li>
              <li>
                After clicking the accept ✅ or reject 🚫 buttons, if you change
                your decision, you should directly contact Iman on Microsoft
                Teams.
              </li>
            </ul>
          </li>
        </ul>
      </Alert>
      {checkedFullname && (
        <DataGrid
          rows={applications}
          columns={applicationsColumns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoPageSize
          autoHeight
          // checkboxSelection
          hideFooterSelectedRowCount
          loading={!applicationsLoaded}
          onCellClick={checkApplication}
          onRowClick={applicationsRowClick}
        />
      )}
      {Object.keys(application).length > 0 && (
        <Paper>
          <h3>You've not evaluated or clicked this application:</h3>
          <p>
            {application.applicant +
              " at " +
              application.email +
              " applied on " +
              application.createdAt.toLocaleString()}
          </p>
          <p>
            Their immediate reading comprehension test score is:{" "}
            {application.readingImmediate}
          </p>
          <p>
            Their three days later reading comprehension test score is:{" "}
            {application.reading3Days}
          </p>
          <p>
            Their one week later reading comprehension test score is:{" "}
            {application.reading1Week}
          </p>
          <p>
            Their number of wrong attempts in 1Cademy tutorial is:{" "}
            {application.tutorialWrongs}
          </p>
          <p>
            Their number of wrong attempts in your community's quiz is:{" "}
            {application.quizWrongs}
          </p>
          <div>
            <p>
              Their explanation for why they've applied to join this community:
            </p>
            <p style={{ marginLeft: "10px" }}>
              <i>{application.explanation}</i>
            </p>
          </div>
          <PDFView fileUrl={application.resume} height="400px" />
          <PDFView fileUrl={application.transcript} height="400px" />
          <PDFView fileUrl={application.portfolio} height="400px" />
          {"leader" in application && application.leader && (
            <p>
              This application was reviewed by {application.leader}{" "}
              {"checkedAt" in application &&
                application.checkedAt &&
                "on " + application.checkedAt.toLocaleDateString()}
            </p>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: "19px",
            }}
          >
            <Tooltip title="Skip" placement="top">
              <Button
                style={{
                  backgroundColor: "rgb(129, 198, 255)",
                  margin: 0,
                }}
                onClick={checkApplicant(application.id, "rejected")}
                className="Button"
                variant="contained"
              >
                {submitting ? (
                  <CircularProgress color="warning" size="16px" />
                ) : application.rejected === "🚫" ? (
                  "◻"
                ) : (
                  "🚫"
                )}
              </Button>
            </Tooltip>
            <Tooltip title="Up Vote" placement="top">
              <Button
                style={{
                  backgroundColor: "rgb(112, 187, 0)",
                  margin: 0,
                }}
                onClick={checkApplicant(application.id, "accepted")}
                className="Button"
                variant="contained"
              >
                {submitting ? (
                  <CircularProgress color="warning" size="16px" />
                ) : application.accepted === "✅" ? (
                  "◻"
                ) : (
                  "✅"
                )}
              </Button>
            </Tooltip>
          </div>
        </Paper>
      )}
      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </PagesNavbar>
  );
};

export default CommunityApplications;
