import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import { ResponsiveSankey } from "@nivo/sankey";
import { ResponsiveBump } from "@nivo/bump";

import { firebaseState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";

import "./IntellectualPoints.css";

const AdminIntellectualPoints = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const project = useRecoilValue(projectState);

  const [allVotes, setAllVotes] = useState({ nodes: [], links: [] });
  const [dailyVotes, setDailyVotes] = useState([]);
  const [allVotesChanges, setAllVotesChanges] = useState([]);

  useEffect(() => {
    if (project) {
      const votesQuery = firebase.db
        .collection("votes")
        .where("project", "==", project);
      const votesSnapshot = votesQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setAllVotesChanges((oldAllVotesChanges) => {
          return [...oldAllVotesChanges, ...docChanges];
        });
      });
      return () => {
        setAllVotes({ nodes: [], links: [] });
        setDailyVotes([]);
        setAllVotesChanges([]);
        votesSnapshot();
      };
    }
  }, [project]);

  useEffect(() => {
    if (allVotesChanges.length > 0) {
      const tempAllVotesChanges = [...allVotesChanges];
      setAllVotesChanges([]);
      let aVotes = { ...allVotes };
      let dVotes = [...dailyVotes];
      const allVoteDates = [];
      for (let change of tempAllVotesChanges) {
        const voteData = change.doc.data();
        let voteDate = voteData.createdAt.toDate();
        // ******************************************************
        // Change the timestamp to make sure we see all the daily
        // votes on the corresponding days.
        // ******************************************************
        voteDate = voteDate.toISOString().split("T")[0];
        if (!allVoteDates.includes(voteDate)) {
          allVoteDates.push(voteDate);
        }
        if (change.type === "removed") {
          const linkIdx = aVotes.links.findIndex(
            (link) =>
              link.source === voteData.voter &&
              link.target === voteData.fullname + " T"
          );
          if (linkIdx !== -1) {
            aVotes.links[linkIdx].value -= voteData.upVote ? 1 : 0;
          }
          const dVotesIdx = dVotes.findIndex(
            (vot) => vot.id === voteData.voter
          );
          if (dVotesIdx !== -1) {
            const dVotesDataIdx = dVotes[dVotesIdx].data.findIndex(
              (vot) => vot.x === voteDate
            );
            if (dVotesDataIdx !== -1) {
              dVotes[dVotesIdx].data[dVotesDataIdx].y -= voteData.upVote
                ? 1
                : 0;
            }
          }
        } else {
          const voterIdx = aVotes.nodes.findIndex(
            (node) => node.id === voteData.voter
          );
          if (voterIdx === -1) {
            aVotes.nodes.push({ id: voteData.voter });
          }
          const fullnameIdx = aVotes.nodes.findIndex(
            (node) => node.id === voteData.fullname + " T"
          );
          if (fullnameIdx === -1) {
            aVotes.nodes.push({ id: voteData.fullname + " T" });
          }
          const linkIdx = aVotes.links.findIndex(
            (link) =>
              link.source === voteData.voter &&
              link.target === voteData.fullname + " T"
          );
          if (linkIdx === -1) {
            aVotes.links.push({
              source: voteData.voter,
              target: voteData.fullname + " T",
              value: voteData.upVote ? 1 : 0,
              preUpVote: voteData.upVote,
            });
          } else {
            if (change.type === "added") {
              aVotes.links[linkIdx].value += voteData.upVote ? 1 : 0;
            } else if (change.type === "modified") {
              if (aVotes.links[linkIdx].preUpVote && !voteData.upVote) {
                aVotes.links[linkIdx].value -= 1;
              } else if (!aVotes.links[linkIdx].preUpVote && voteData.upVote) {
                aVotes.links[linkIdx].value += 1;
              }
            }
          }
          const dVotesIdx = dVotes.findIndex(
            (vot) => vot.id === voteData.voter
          );
          if (dVotesIdx !== -1) {
            const dVotesDataIdx = dVotes[dVotesIdx].data.findIndex(
              (vot) => vot.x === voteDate
            );
            if (dVotesDataIdx !== -1) {
              if (change.type === "added") {
                dVotes[dVotesIdx].data[dVotesDataIdx].y += voteData.upVote
                  ? 1
                  : 0;
              } else if (change.type === "modified") {
                if (aVotes.links[linkIdx].preUpVote && !voteData.upVote) {
                  dVotes[dVotesIdx].data[dVotesDataIdx].y -= 1;
                } else if (
                  !aVotes.links[linkIdx].preUpVote &&
                  voteData.upVote
                ) {
                  dVotes[dVotesIdx].data[dVotesDataIdx].y += 1;
                }
              }
            } else {
              dVotes[dVotesIdx].data.push({
                x: voteDate,
                y: voteData.upVote ? 1 : 0,
              });
            }
          } else {
            dVotes.push({
              id: voteData.voter,
              data: [{ x: voteDate, y: voteData.upVote ? 1 : 0 }],
            });
          }
        }
      }
      setAllVotes(aVotes);
      for (let dVote of dVotes) {
        for (let voteDate of allVoteDates) {
          const dVotesDataIdx = dVote.data.findIndex(
            (vot) => vot.x === voteDate
          );
          if (dVotesDataIdx === -1) {
            dVote.data.push({ x: voteDate, y: 0 });
          }
        }
        dVote.data.sort((votA, votB) => new Date(votA.x) - new Date(votB.x));
      }
      setDailyVotes(dVotes);
    }
  }, [allVotes, dailyVotes, allVotesChanges]);

  return (
    <>
      {dailyVotes.length > 0 && (
        <ResponsiveBump
          data={dailyVotes}
          margin={{ top: 70, right: 100, bottom: 70, left: 55 }}
          xScale={{
            type: "dateTime",
            format: "%Y-%m-%d",
            precision: "day",
          }}
          xFormat="time:%Y-%m-%d"
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: true,
            reverse: true,
          }}
          yFormat=" >-.2f"
          colors={{ scheme: "spectral" }}
          lineWidth={3}
          activeLineWidth={6}
          inactiveLineWidth={3}
          inactiveOpacity={0.15}
          pointSize={10}
          activePointSize={16}
          inactivePointSize={0}
          pointColor={{ theme: "background" }}
          pointBorderWidth={3}
          activePointBorderWidth={3}
          pointBorderColor={{ from: "serie.color" }}
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 40,
            legend: "",
            legendPosition: "middle",
            legendOffset: -36,
          }}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 40,
            legend: "",
            legendPosition: "middle",
            legendOffset: 32,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Votes",
            legendPosition: "middle",
            legendOffset: -40,
          }}
        />
      )}
      {allVotes.nodes.length > 0 && (
        <ResponsiveSankey
          data={allVotes}
          margin={{ top: 40, right: 250, bottom: 40, left: 100 }}
          align="justify"
          colors={{ scheme: "category10" }}
          nodeOpacity={1}
          nodeHoverOthersOpacity={0.35}
          nodeThickness={18}
          nodeSpacing={24}
          nodeBorderWidth={0}
          nodeBorderColor={{ from: "color", modifiers: [["darker", 0.8]] }}
          nodeBorderRadius={3}
          linkOpacity={0.5}
          linkHoverOthersOpacity={0.1}
          linkContract={3}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="horizontal"
          labelPadding={16}
          labelTextColor={{ from: "color", modifiers: [["darker", 1]] }}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              translateX: 250,
              itemWidth: 100,
              itemHeight: 14,
              itemDirection: "right-to-left",
              itemsSpacing: 2,
              itemTextColor: "#999",
              symbolSize: 14,
              effects: [
                {
                  on: "hover",
                  style: {
                    itemTextColor: "#000",
                  },
                },
              ],
            },
          ]}
        />
      )}
    </>
  );
};

export default AdminIntellectualPoints;
