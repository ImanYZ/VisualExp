import React, { useEffect, useState, useMemo } from "react";
import { firebaseState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";
import { useRecoilValue } from "recoil";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import { Select } from "@mui/material";
import TrendsPlotRow from "./TrendsPlotRow";
import CircularProgress from "@mui/material/CircularProgress";
const moment = require("moment");

const Accumulative = props => {
  const firebase = useRecoilValue(firebaseState);
  const [accumulatePoints, setAccumulatePoints] = useState({});
  const project = useRecoilValue(projectState);
  const [selectResearcher, setSelectResearcher] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const retrievePoints = async () => {
      setAccumulatePoints({});
      setLoading(true);
      const _accumulatePoints = {};
      const researcherMap = {};
      const researchersDocs = await firebase.db.collection("researchers").get();
      researchersDocs.forEach(researcher => {
        if (
          researcher.data().projects &&
          researcher.data().projects.hasOwnProperty(project) &&
          researcher.data().projects[project].hasOwnProperty("active") &&
          researcher.data().projects[project].active
        ) {
          researcherMap[researcher.data().email] = researcher.id;
        }
      });
      const sessionsExpDocs = await firebase.db.collection("expSessions").where("project", "==", project).get();
      const administratorVotesDocs = await firebase.db
        .collection("administratorVotes")
        .where("project", "==", project)
        .get();
      const instructorVotesDocs = await firebase.db.collection("instructorVotes").where("project", "==", project).get();
      const activitiesVotesDocs = await firebase.db.collection("votes").where("project", "==", project).get();
      const administratorsDocs = await firebase.db.collection("administrators").where("project", "==", project).get();
      const instructorsDocs = await firebase.db.collection("instructors").where("project", "==", project).get();
      const feedbackCodeLogsDocs = await firebase.db
        .collection("feedbackCodeLogs")
        .where("project", "==", project)
        .get();
      const recallGradeLogsDocs = await firebase.db.collection("recallGradesLogs").where("project", "==", project).get();

      [...recallGradeLogsDocs.docs, ...feedbackCodeLogsDocs.docs].forEach(logDoc => {
        const logData = logDoc.data();
        if (Object.values(researcherMap).includes(logData.researcher)) {
          const logDate = moment(logData.createdAt.toDate()).format("YYYY-MM-DD");
          if (_accumulatePoints.hasOwnProperty(logData.researcher)) {
            if (_accumulatePoints[logData.researcher].hasOwnProperty(logDate)) {
              _accumulatePoints[logData.researcher][logDate] += logData.points;
            } else {
              _accumulatePoints[logData.researcher][logDate] = logData.points;
            }
          } else {
            _accumulatePoints[logData.researcher] = {};
            _accumulatePoints[logData.researcher][logDate] = logData.points;
          }
        }
      });

      [...administratorsDocs.docs, ...instructorsDocs.docs].forEach(adminInst => {
        const adminInstData = adminInst.data();
        if (Object.values(researcherMap).includes(adminInstData.fullname)) {
          const voteDate = moment(adminInstData.createdAt.toDate()).format("YYYY-MM-DD");
          if (_accumulatePoints.hasOwnProperty(adminInstData.fullname)) {
            if (_accumulatePoints[adminInstData.fullname].hasOwnProperty(voteDate)) {
              _accumulatePoints[adminInstData.fullname][voteDate] += 1;
            } else {
              _accumulatePoints[adminInstData.fullname][voteDate] = 1;
            }
          } else {
            _accumulatePoints[adminInstData.fullname] = {};
            _accumulatePoints[adminInstData.fullname][voteDate] = 1;
          }
        }
      });

      activitiesVotesDocs.docs.forEach(vote => {
        const voteData = vote.data();
        if ((voteData.upVote || voteData.noVote) && Object.values(researcherMap).includes(voteData.voter)) {
          const voteDate = moment(voteData.createdAt.toDate()).format("YYYY-MM-DD");
          if (_accumulatePoints.hasOwnProperty(voteData.voter)) {
            if (_accumulatePoints[voteData.voter].hasOwnProperty(voteDate)) {
              _accumulatePoints[voteData.voter][voteDate] += 1 / 25;
            } else {
              _accumulatePoints[voteData.voter][voteDate] = 1 / 25;
            }
          } else {
            _accumulatePoints[voteData.voter] = {};
            _accumulatePoints[voteData.voter][voteDate] = 1 / 25;
          }
        }
      });

      instructorVotesDocs.docs.forEach(vote => {
        const voteData = vote.data();
        if ((voteData.upVote || voteData.downVote) && Object.values(researcherMap).includes(voteData.voter)) {
          const voteDate = moment(voteData.createdAt.toDate()).format("YYYY-MM-DD");
          if (_accumulatePoints.hasOwnProperty(voteData.voter)) {
            if (_accumulatePoints[voteData.voter].hasOwnProperty(voteDate)) {
              _accumulatePoints[voteData.voter][voteDate] += 1 / 16;
            } else {
              _accumulatePoints[voteData.voter][voteDate] = 1 / 16;
            }
          } else {
            _accumulatePoints[voteData.voter] = {};
            _accumulatePoints[voteData.voter][voteDate] = 1 / 16;
          }
        }
      });

      administratorVotesDocs.docs.forEach(vote => {
        const voteData = vote.data();
        if ((voteData.upVote || voteData.downVote) && Object.values(researcherMap).includes(voteData.voter)) {
          const voteDate = moment(voteData.createdAt.toDate()).format("YYYY-MM-DD");
          if (_accumulatePoints.hasOwnProperty(voteData.voter)) {
            if (_accumulatePoints[voteData.voter].hasOwnProperty(voteDate)) {
              _accumulatePoints[voteData.voter][voteDate] += 1 / 16;
            } else {
              _accumulatePoints[voteData.voter][voteDate] = 1 / 16;
            }
          } else {
            _accumulatePoints[voteData.voter] = {};
            _accumulatePoints[voteData.voter][voteDate] = 1 / 16;
          }
        }
      });
      sessionsExpDocs.docs.forEach(session => {
        const _session = moment(session.data().sTime.toDate()).format("YYYY-MM-DD");

        for (let attendee of session.data().attendees) {
          if (researcherMap.hasOwnProperty(attendee)) {
            if (_accumulatePoints.hasOwnProperty(researcherMap[attendee])) {
              if (_accumulatePoints[researcherMap[attendee]].hasOwnProperty(_session)) {
                _accumulatePoints[researcherMap[attendee]][_session] += session.data().points;
              } else {
                _accumulatePoints[researcherMap[attendee]][_session] = session.data().points;
              }
            } else {
              _accumulatePoints[researcherMap[attendee]] = {};
              _accumulatePoints[researcherMap[attendee]][_session] = session.data().points;
            }
          }
        }
      });
      setSelectResearcher(Object.keys(_accumulatePoints)[0]);
      setAccumulatePoints(_accumulatePoints);
      setLoading(false);
    };
    if (firebase) {
      retrievePoints();
    }
  }, [firebase, project]);

  const handlChange = event => {
    setSelectResearcher(event.target.value);
  };
  const accumulateData = useMemo(() => {
    if (!accumulatePoints[selectResearcher]) return [];
    const _accumulatePoints = accumulatePoints[selectResearcher];
    const _accumulateData = [];
    for (let date in _accumulatePoints) {
      _accumulateData.push({ date: new Date(date), num: _accumulatePoints[date] });
    }
    return _accumulateData;
  }, [accumulatePoints, selectResearcher]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        <CircularProgress color="warning" sx={{ margin: "0" }} size="50px" />
      </div>
    );

  if (!accumulatePoints[selectResearcher])
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        There is no data for the project{" "}
        <strong style={{ color: "green", fontSize: "16.5px", marginLeft: "5px" }}>{project} </strong>
      </div>
    );
  return (
    <Box sx={{ mr: "5px" }}>
      <Box sx={{ mb: "15px", textAlign: "center" }}>
        <Select value={selectResearcher} onChange={handlChange}>
          {Object.keys(accumulatePoints).map(researcher => {
            return <MenuItem value={researcher}>{researcher}</MenuItem>;
          })}
        </Select>
      </Box>
      <Box>
        <TrendsPlotRow
          trendData={accumulateData}
          x="date"
          y="num"
          scaleX="time"
          scaleY="linear"
          labelX="Day"
          labelY="# of Proposals"
          width={1000}
          height={200}
        >
          mldqskdmlqs
        </TrendsPlotRow>
      </Box>
      <Box sx={{ textAlign: "center", mt: "5px" }}></Box>
    </Box>
  );
};

export default Accumulative;
