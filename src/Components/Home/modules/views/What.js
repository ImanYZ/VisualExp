import React, { useState, useEffect } from "react";
// import { useRecoilValue } from "recoil";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Container from "@mui/material/Container";

import Typography from "../components/Typography";

// import { firebaseOnecademyState } from "../../../../store/OneCademyAtoms";

import communities from "./communitiesOrder";

import sectionsOrder from "./sectionsOrder";
const sectionIdx = sectionsOrder.findIndex(
  (sect) => sect.id === "CommunitiesSection"
);

const ImageBackdrop = styled("div")(({ theme }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  background: "#000",
  opacity: 0.5,
  transition: theme.transitions.create("opacity"),
}));

const ImageIconButton = styled(ButtonBase)(({ theme }) => ({
  position: "relative",
  display: "block",
  padding: 0,
  borderRadius: 0,
  height: "40vh",
  [theme.breakpoints.down("md")]: {
    width: "100% !important",
    height: 100,
  },
  "&:hover": {
    zIndex: 1,
  },
  "&:hover .imageBackdrop": {
    opacity: 0.15,
  },
  "&:hover .imageMarked": {
    opacity: 0,
  },
  "&:hover .imageTitle": {
    border: "4px solid currentColor",
  },
  "& .imageTitle": {
    position: "relative",
    padding: `${theme.spacing(2)} ${theme.spacing(4)} 14px`,
  },
  "& .imageMarked": {
    height: 3,
    width: 18,
    background: theme.palette.common.white,
    position: "absolute",
    bottom: -2,
    left: "calc(50% - 9px)",
    transition: theme.transitions.create("opacity"),
  },
}));

const goToCommPage = (commId) => (event) => {
  window.open("/community/" + commId, "_blank");
};

const What = (props) => {
  // const firebase = useRecoilValue(firebaseOnecademyState);

  // const [nodesChanges, setNodesChanges] = useState([]);
  // const [nodes, setNodes] = useState({});
  // const [nodesLoaded, setNodesLoaded] = useState(false);
  // const [teams, setTeams] = useState({});

  // useEffect(() => {
  //   let groups = {};
  //   for (let communi of communities) {
  //     groups[communi.id] = {
  //       tags: communi.tags,
  //       nodes: 0,
  //       links: 0,
  //       members: 0,
  //     };
  //   }
  //   setTeams(groups);
  // }, []);

  // useEffect(() => {
  //   if (firebase) {
  //     const nodesQuery = firebase.db.collection("nodes");
  //     const nodesSnapshot = nodesQuery.onSnapshot((snapshot) => {
  //       const docChanges = snapshot.docChanges();
  //       setNodesChanges((oldNodesChanges) => {
  //         return [...oldNodesChanges, ...docChanges];
  //       });
  //     });
  //     return () => {
  //       setNodesChanges([]);
  //       nodesSnapshot();
  //     };
  //   }
  // }, [firebase]);

  // useEffect(() => {
  //   if (nodesChanges.length > 0) {
  //     let nds = { ...nodes };
  //     let groups = { ...teams };
  //     for (let change of nodesChanges) {
  //       const nodeData = change.doc.data();
  //       if (change.type === "removed" || nodeData.deleted) {
  //         if (change.doc.id in nds) {
  //           delete nds[change.doc.id];
  //         }
  //       } else {
  //         if (!(change.doc.id in nds)) {
  //           const node = change.doc.data();
  //           nds[change.doc.id] = node;
  //           for (let communi of communities) {
  //             for (let deTag of communi.tags) {
  //               for (let tag of node.tags) {
  //                 if (tag.node === deTag) {
  //                   groups[communi.id].nodes += 1;
  //                   groups[communi.id].links += node.children.length;
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //     setNodesChanges([]);
  //     setNodes(nds);
  //     setTeams(groups);
  //     setNodesLoaded(true);
  //   }
  // }, [nodesChanges, nodes, teams]);

  return (
    <Container
      id="CommunitiesSection"
      component="section"
      sx={{ pt: 10, pb: 4 }}
    >
      <Typography variant="h4" marked="center" align="center" sx={{ mb: 7 }}>
        {sectionsOrder[sectionIdx].title}
      </Typography>
      <Box sx={{ mt: 7, display: "flex", flexWrap: "wrap" }}>
        {communities.map((communi, idx) => (
          <ImageIconButton
            key={communi.id}
            onClick={goToCommPage(communi.id)}
            style={{
              width: communi.width,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundSize: "cover",
                backgroundPosition: "center 40%",
                backgroundImage: `url(${communi.url})`,
              }}
            />
            <ImageBackdrop className="imageBackdrop" />
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            >
              <Typography
                component="h3"
                variant="h6"
                color="inherit"
                className="imageTitle"
              >
                {communi.title}
                {/* Adding the number of members, nodes, and links to the community buttons in the homepage.
                <br />
                {nodesLoaded && (
                  <Typography
                    variant="body2"
                    color="inherit"
                    sx={{ textTransform: "none" }}
                  >
                    220 Members - {teams[communi.id].nodes} Nodes -{" "}
                    {teams[communi.id].links} Links
                  </Typography>
                )} */}
                <div className="imageMarked" />
              </Typography>
            </Box>
          </ImageIconButton>
        ))}
      </Box>
    </Container>
  );
};

export default What;
