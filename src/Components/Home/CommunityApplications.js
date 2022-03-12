import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import { DataGrid } from "@mui/x-data-grid";

import {
  firebaseState,
  fullnameState,
  leadingState,
} from "../../store/AuthAtoms";

import GridCellToolTip from "../GridCellToolTip";
import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";

const applicationsColumns = [
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
    width: 10,
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
    width: 10,
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
    width: 10,
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
    width: 10,
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
    width: 10,
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
  const [applicationsChanges, setApplicationsChanges] = useState([]);
  const [applicationsLoaded, setApplicationsLoaded] = useState(false);

  useEffect(() => {
    if (firebase) {
      const applicationsQuery = firebase.db
        .collection("applications")
        .where("communiId", "==", props.communiId);
      const applicationsSnapshot = applicationsQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setApplicationsChanges((oldApplicationsChanges) => {
          return [...oldApplicationsChanges, ...docChanges];
        });
        setApplicationsLoaded(true);
      });
      return () => {
        setApplicationsLoaded(false);
        applicationsSnapshot();
      };
    }
  }, [firebase]);

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
              applicant: applicData.fullname,
              createdAt: applicData.createdAt.toDate(),
              explanation: applicData.explanation,
              quizCorrects: applicData.corrects,
              quizWrongs: applicData.wrongs,
              checkedAt: null,
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
            } else {
              newApplic.accepted = "◻";
            }
            if ("rejected" in applicData && applicData.rejected) {
              newApplic.rejected = "✅";
            } else {
              newApplic.rejected = "◻";
            }
            const userDoc = await firebase.db
              .collection("users")
              .doc(applicData.fullname)
              .get();
            const userData = userDoc.data();
            if ("email" in applicData && applicData.email) {
              newApplic.email = applicData.email;
            } else {
              newApplic.email = "";
            }
            if ("Transcript" in applicData && applicData.Transcript) {
              newApplic.transcript = applicData.Transcript;
            } else {
              newApplic.transcript = "";
            }
            if ("Resume" in applicData && applicData.Resume) {
              newApplic.resume = applicData.Resume;
            } else {
              newApplic.resume = "";
            }
            if ("Portfolio" in applicData && applicData.Portfolio) {
              newApplic.portfolio = applicData.Portfolio;
            } else {
              newApplic.portfolio = "";
            }
            if ("pConditions" in applicData && applicData.pConditions) {
              newApplic.readingImmediate = 0;
              newApplic.reading3Days = 0;
              newApplic.reading1Week = 0;
              for (let pCondition of applicData.pConditions) {
                if (
                  "testScoreRatio" in pCondition &&
                  pCondition.testScoreRatio
                ) {
                  newApplic.readingImmediate += applicData.testScoreRatio;
                }
                if (
                  "test3DaysScoreRatio" in pCondition &&
                  pCondition.test3DaysScoreRatio
                ) {
                  newApplic.reading3Days += applicData.test3DaysScoreRatio;
                }
                if (
                  "test1WeekScoreRatio" in pCondition &&
                  pCondition.test1WeekScoreRatio
                ) {
                  newApplic.reading1Week += applicData.test1WeekScoreRatio;
                }
              }
              newApplic.readingImmediate /= 2;
              newApplic.reading3Days /= 2;
              newApplic.reading1Week /= 2;
            } else {
              newApplic.readingImmediate = 0;
              newApplic.reading3Days = 0;
              newApplic.reading1Week = 0;
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
              applics.push({
                ...newApplic,
              });
            }
          }
        }
      }
      setApplicationsChanges([]);
      setApplications(applics);
    };
    if (firebase && applicationsChanges.length > 0) {
      loadApplications();
    }
  }, [firebase, applications, applicationsChanges]);

  const checkApplication = async (clickedCell) => {
    if (["accepted", "rejected"].includes(clickedCell.field)) {
      try {
        let applics = [...applications];
        const applicIdx = applics.findIndex(
          (acti) => acti.id === clickedCell.id
        );
        const isChecked = applics[applicIdx][clickedCell.field] === "✅";
        if (applicIdx !== -1 && applics[applicIdx][clickedCell.field] !== "O") {
          applics[applicIdx] = {
            ...applics[applicIdx],
            [clickedCell.field]: "O",
          };
          setApplications(applics);
          const applicRef = firebase.db
            .collection("applications")
            .doc(applics[applicIdx].id);
          await applicRef.update({
            [clickedCell.field]: !isChecked,
            leader: fullname,
            checkedAt: firebase.firestore.Timestamp.fromDate(new Date()),
          });
          applics[applicIdx] = {
            ...applics[applicIdx],
            [clickedCell.field]: isChecked ? "◻" : "✅",
            checkedAt: new Date(),
          };
          setApplications(applics);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <PagesNavbar>
      <Typography variant="h3" gutterBottom marked="center" align="center">
        {props.communiId} Completed Applications
      </Typography>
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
      />
    </PagesNavbar>
  );
};

export default CommunityApplications;
