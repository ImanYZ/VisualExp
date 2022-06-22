import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import { DataGrid } from "@mui/x-data-grid";

import GridCellToolTip from "../GridCellToolTip";
import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";
import { firebaseState, fullnameState } from "../../store/AuthAtoms";
import communitiesPapers from "./modules/views/communitiesPapers";

const applicationscolumns = [
  {
    field: "Community",
    headerName: "Community",
    width: 220,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "title",
    headerName: "Title",
    width: 220,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "question",
    headerName: "Question",
    width: 220,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },

  {
    field: "explanation",
    headerName: "Explanation",
    width: 220,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },
  {
    field: "Leader",
    headerName: "Leader",
    width: 190,
  },
  {
    field: "applicant",
    headerName: "applicant",
    width: 220,
    renderCell: (cellValues) => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    },
  },

  {
    field: "checkedBy",
    headerName: "Checked By",
    width: 190,
  },
  {
    field: "checked",
    headerName: "Checked",
    width: 10,
    disableColumnMenu: true,
    renderCell: (cellValues) => {
      return (
        <GridCellToolTip
          isLink={false}
          actionCell={true}
          Tooltip="Click to check/uncheck!"
          cellValues={cellValues}
        />
      );
    },
  },
  { field: "posted", headerName: "Posted", type: "dateTime", width: 190 },
];

const MonitorFeedBack = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [applications, setApplications] = useState([]);
  const [applicationsChanges, setApplicationsChanges] = useState([]);
  const [applicationLoaded, setApplicationLoaded] = useState(false);

  useEffect(() => {
    if (firebase) {
      const applicationsQuery = firebase.db.collection("applications");
      const applicationsSnapshot = applicationsQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setApplicationsChanges((oldApplicationsChanges) => {
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
        if (change.type === "removed") {
          apps = apps.filter((app) => app.id.split("@")[0] !== change.doc.id);
        } else {
          const applicaData = change.doc.data();

          if (applicaData.attempts) {
            const keys = Object.keys(applicaData.attempts).filter((ele) => {
              return ele != "Congratulations";
            });

            for (let key of keys) {
              if (applicaData.attempts[key].questions) {
                let quests = Object.keys(applicaData.attempts[key].questions);

                for (let question of quests) {
                  if (
                    applicaData.attempts[key].questions[question].explanation
                  ) {
                    const newApp = {
                      Community: applicaData.communiId,
                      question:
                        communitiesPapers[applicaData.communiId][key].questions[
                          question
                        ].stem,
                      applicant: applicaData.fullname,
                      explanation:
                        applicaData.attempts[key].questions[question]
                          .explanation,
                      Leader: applicaData.leader,
                      checked: "◻",
                      checkedBy: "",
                      posted: applicaData.createdAt.toDate(),
                      title:
                        communitiesPapers[applicaData.communiId][key].title,
                      id: change.doc.id + "@" + question,
                    };

                    if (
                      "checked" in
                        applicaData.attempts[key].questions[question] &&
                      applicaData.attempts[key].questions[question].checked
                    ) {
                      newApp.checked = "✅";
                      newApp.checkedBy =
                        applicaData.attempts[key].questions[question].checkedBy;
                    } else {
                      newApp.checked = "◻";
                      newApp.checkedBy = "";
                    }
                    const appIdx = applications.findIndex(
                      (app) => app.id === change.doc.id + "@" + question
                    );
                    if (appIdx !== -1) {
                      apps[appIdx] = {
                        ...apps[appIdx],
                        ...newApp,
                      };
                    } else {
                      apps.push({
                        ...newApp,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }

      setApplications(apps);
    }
  }, [applications, applicationsChanges]);

  const checkApplication = async (clickedCell) => {
    if (clickedCell.field === "checked") {
      try {
        let apps = [...applications];
        const appIdx = apps.findIndex((acti) => acti.id === clickedCell.id);
        const isChecked = apps[appIdx][clickedCell.field] === "✅";
        console.log(apps[appIdx]);
        if (appIdx !== -1 && apps[appIdx][clickedCell.field] !== "O") {
          const id = clickedCell.id.split("@")[0];

          apps[appIdx] = {
            ...apps[appIdx],
            [clickedCell.field]: "O",
          };
          setApplications(apps);
          let appData = [];

          const appDoc = await firebase.db
            .collection("applications")
            .doc(id)
            .get();

          appData = appDoc.data();
          const question = clickedCell.id.split("@")[1];

          //we make theses changes in the collection applicants so that for the question that has an explanation
          //and the leader have checked

          const appUpdate = {
            ...appData,
            attempts: {
              ...appData.attempts,
              [apps[appIdx].key]: {
                questions: {
                  ...appData.attempts[apps[appIdx].key].questions,
                  [question]: {
                    ...appData.attempts[apps[appIdx].key].questions[question],
                    checked: !isChecked,
                    checkedBy: fullname,
                  },
                },
              },
            },
          };
          setApplications(apps);
          let appRef = await firebase.db.collection("applications").doc(id);
          await appRef.update(appUpdate);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <PagesNavbar thisPage="Monitor FeedBack">
      <Typography variant="h3" gutterBottom marked="center" align="center">
        1Cademy for Cummunity leaders to monitor the feedback received from the
        the applicants about their community-specific quiz questions
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
export default MonitorFeedBack;
