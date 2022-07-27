import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import { DataGrid } from "@mui/x-data-grid";

import GridCellToolTip from "../GridCellToolTip";
import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";
import { firebaseState, fullnameState } from "../../store/AuthAtoms";
import communitiesPapers from "./modules/views/communitiesPapers";
import communitiesOrder from "./modules/views/communitiesOrder";

const ATTEMPTKEYS = {
  CONGRATULATIONS: "Congratulations"
};

const applicationscolumns = [
  {
    field: "Community",
    headerName: "Community",
    width: 220,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "question",
    headerName: "Question",
    width: 220,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },

  {
    field: "explanation",
    headerName: "Difficulty Reported",
    width: 220,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "applicant",
    headerName: "applicant",
    width: 220,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },

  {
    field: "checkedBy",
    headerName: "Checked By",
    width: 190
  },
  {
    field: "checked",
    headerName: "Checked",
    width: 10,
    disableColumnMenu: true,
    renderCell: cellValues => {
      return (
        <GridCellToolTip isLink={false} actionCell={true} Tooltip="Click to check/uncheck!" cellValues={cellValues} />
      );
    }
  },
  { field: "posted", headerName: "Posted", type: "dateTime", width: 190 }
];

const QuizFeedBack = props => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [applications, setApplications] = useState([]);
  const [applicationsChanges, setApplicationsChanges] = useState([]);
  const [applicationLoaded, setApplicationLoaded] = useState(false);

  useEffect(() => {
    if (firebase) {
      const applicationsQuery = firebase.db.collection("applications");
      const applicationsSnapshot = applicationsQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setApplicationsChanges(oldApplicationsChanges => {
          return [...oldApplicationsChanges, ...docChanges];
        });
        setApplicationLoaded(true);
      });
      return () => {
        setApplications([]);
        setApplicationLoaded(false);
        applicationsSnapshot();
      };
    }
  }, [firebase]);

  useEffect(() => {
    if (applicationsChanges.length > 0) {
      const tempAplicationsChanges = [...applicationsChanges];
      setApplicationsChanges([]);
      let apps = [...applications];

      for (let change of tempAplicationsChanges) {
        // type: 'removed' || 'added'
        if (change.type === "removed") {
          apps = apps.filter(app => app.id.split("@")[0] !== change.doc.id);
        } else {
          const applicaData = change.doc.data();

          const checkCommunityForUser = (props.communiIds || []).includes(applicaData.communiId);
          if (applicaData.attempts && checkCommunityForUser) {
            const keys = Object.keys(applicaData.attempts).filter(ele => ele !== ATTEMPTKEYS.CONGRATULATIONS);

            for (let key of keys) {
              if (applicaData.attempts[key].questions) {
                let quests = Object.keys(applicaData.attempts[key].questions);

                for (let question of quests) {
                  if (applicaData.attempts[key].questions[question].explanation) {
                    const newApp = {
                      Community: communitiesOrder.find(elm => elm.id === applicaData.communiId).title,
                      question: communitiesPapers[applicaData.communiId][key].questions[question].stem,
                      applicant: applicaData.fullname,
                      explanation: applicaData.attempts[key].questions[question].explanation,
                      posted: applicaData.createdAt.toDate(),
                      id: `${change.doc.id}@${question}@${key}`,
                      checked: applicaData.attempts[key].questions[question].checked ? "✅" : "◻",
                      checkedBy: applicaData.attempts[key].questions[question].checkedBy
                        ? applicaData.attempts[key].questions[question].checkedBy
                        : ""
                    };

                    const appIdx = applications.findIndex(app => app.id === `${change.doc.id}@${question}@${key}`);

                    if (appIdx >= 0) {
                      apps[appIdx] = {
                        ...apps[appIdx],
                        ...newApp
                      };
                    } else {
                      apps.push({
                        ...newApp
                      });
                    }
                  }
                }
              }
            }
          }
          // }
        }
      }
      setApplications(apps);
    }
  }, [applications, applicationsChanges]);

  const checkApplication = async clickedCell => {
    if (clickedCell.field === "checked") {
      let apps = [...applications];
      const appIdx = apps.findIndex(acti => acti.id === clickedCell.id);
      const isChecked = apps[appIdx][clickedCell.field] === "✅";

      if (appIdx >= 0 && apps[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id.split("@")[0];

        apps[appIdx] = {
          ...apps[appIdx],
          checked: isChecked ? "◻" : "✅",
          checkedBy: isChecked ? "" : fullname
        };
        setApplications(apps);
        let appData = [];

        const appDoc = await firebase.db.collection("applications").doc(id).get();

        appData = appDoc.data();
        const key = clickedCell.id.split("@")[2];
        const question = clickedCell.id.split("@")[1];
        let appUpdate = {
          ...appData,
          attempts: {
            ...appData.attempts,
            [key]: {
              questions: {
                ...appData.attempts[key].questions,
                [question]: {
                  ...appData.attempts[key].questions[question],
                  checked: !isChecked,
                  checkedBy: isChecked ? "" : fullname
                }
              }
            }
          }
        };
        let applicationRef = await firebase.db.collection("applications").doc(clickedCell.id.split("@")[0]);
        await applicationRef.update(appUpdate);
      }
    }
  };

  return (
    <PagesNavbar thisPage="Monitor FeedBack">
      <Typography variant="h3" gutterBottom marked="center" align="center">
        1Cademy for Cummunity leaders to monitor the feedback received from the the applicants about their
        community-specific quiz questions
      </Typography>
      <DataGrid
        rows={applications}
        columns={applicationscolumns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        autoPageSize
        autoHeight
        hideFooterSelectedRowCount
        loading={!applicationLoaded}
        onCellClick={checkApplication}
      />
    </PagesNavbar>
  );
};
export default QuizFeedBack;
