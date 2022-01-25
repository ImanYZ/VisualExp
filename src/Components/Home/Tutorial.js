import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LinkIcon from "@mui/icons-material/Link";
import EmailIcon from "@mui/icons-material/Email";

import {
  firebaseState,
  emailState,
  fullnameState,
  hasScheduledState,
} from "../../store/AuthAtoms";

import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";
import YoutubeEmbed from "./modules/components/YoutubeEmbed/YoutubeEmbed";

const Tutorial = (props) => {
  const firebase = useRecoilValue(firebaseOnecademyState);

  const [expanded, setExpanded] = useState(props.commId);

  return (
    <PagesNavbar>
      <Typography variant="h3" gutterBottom marked="center" align="center">
        1Cademy Tutorial
      </Typography>
      {communities.map((communi, idx) => (
        <Accordion
          key={communi.id}
          expanded={expanded === communi.id}
          onChange={handleChange(communi.id)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ fontWeight: "700" }}
            >
              {communi.title + " Community"}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={{ xs: 1, md: 2.2 }}>
              <Grid item xs={12} lg={6} xl={4}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      pt: "19px",
                      pb: "19px",
                    }}
                  >
                    Community Introduction
                  </Typography>
                  <YoutubeEmbed embedId={communi.YouTube} />
                </Paper>
              </Grid>
              <Grid item xs={12} lg={6} xl={4}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      pt: "19px",
                      pb: "19px",
                    }}
                  >
                    Community Description
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "left" }}
                  >
                    {communi.description}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={6} xl={4}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      pt: "19px",
                      pb: "19px",
                    }}
                  >
                    Community Accomplishments
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "left" }}
                  >
                    {communi.accomplishments}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={6} xl={4}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      pt: "19px",
                      pb: "19px",
                    }}
                  >
                    By Joining Us, You Will ...
                  </Typography>
                  <ul>
                    {communi.gains &&
                      communi.gains.map((gain) => {
                        return <li>{gain}</li>;
                      })}
                  </ul>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={6} xl={4}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      pt: "19px",
                      pb: "19px",
                    }}
                  >
                    Community Requirements
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "left" }}
                  >
                    {communi.requirements}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={6} xl={4}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      pt: "19px",
                      pb: "19px",
                    }}
                  >
                    Qualifications
                  </Typography>
                  <ul>
                    {communi.qualifications &&
                      communi.qualifications.map((qualifi) => {
                        return <li>{qualifi}</li>;
                      })}
                  </ul>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={6} xl={4}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      pt: "19px",
                      pb: "19px",
                    }}
                  >
                    Responsibilities
                  </Typography>
                  <ul>
                    {communi.responsibilities &&
                      communi.responsibilities.map((responsibility) => {
                        return <li>{responsibility}</li>;
                      })}
                  </ul>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={6} xl={4}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      pt: "19px",
                      pb: "19px",
                    }}
                  >
                    Community Members
                  </Typography>
                  <Paper
                    sx={{
                      m: "2.5px",
                      minHeight: "130px",
                    }}
                  >
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        display: "block",
                        padding: "19px 0px 0px 19px",
                        fontStyle: "italic",
                      }}
                    >
                      Community Leaders
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "left",
                        flexWrap: "wrap",
                        listStyle: "none",
                        p: 0.5,
                        m: 0,
                      }}
                      component="ul"
                    >
                      {communi.leaders &&
                        communi.leaders.map((leader, idx) => {
                          return (
                            <li key={leader.name}>
                              <Chip
                                sx={{
                                  height: "109px",
                                  margin: "10px",
                                  borderRadius: "58px",
                                }}
                                icon={
                                  <Avatar
                                    src={
                                      "/static/CommunityLeaders/" + leader.image
                                    }
                                    alt={leader.name}
                                    sx={{
                                      width: "100px",
                                      height: "100px",
                                      mr: 2.5,
                                    }}
                                  />
                                }
                                variant="outlined"
                                label={
                                  <>
                                    <Typography variant="h5" component="div">
                                      {leader.name}
                                    </Typography>
                                    {leader.websites &&
                                      leader.websites.map((wSite) => {
                                        return (
                                          <IconButton
                                            component="a"
                                            href={wSite.url}
                                            target="_blank"
                                            aria-label={wSite.name}
                                          >
                                            {wSite.name === "LinkedIn" ? (
                                              <LinkedInIcon />
                                            ) : (
                                              <LinkIcon />
                                            )}
                                          </IconButton>
                                        );
                                      })}
                                    <IconButton
                                      component="a"
                                      href={
                                        "mailto:onecademy@umich.edu?subject=" +
                                        communi.title +
                                        " Question for " +
                                        leader.name
                                      }
                                      target="_blank"
                                      aria-label="email"
                                    >
                                      <EmailIcon />
                                    </IconButton>
                                  </>
                                }
                              />
                            </li>
                          );
                        })}
                    </Box>
                  </Paper>
                  <Paper
                    sx={{
                      m: "2.5px",
                      minHeight: "130px",
                    }}
                  >
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        display: "block",
                        padding: "19px 0px 0px 19px",
                        fontStyle: "italic",
                      }}
                    >
                      Leaderboard (Only those with &gt; 25 points)
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "left",
                        flexWrap: "wrap",
                        listStyle: "none",
                        p: 0.5,
                        m: 0,
                      }}
                      component="ul"
                    >
                      {communi.allTime &&
                        communi.allTime.map((member, idx) => {
                          return member.points >= 25 ? (
                            <li key={member.uname}>
                              <Chip
                                sx={{
                                  height: "49px",
                                  margin: "4px",
                                  borderRadius: "28px",
                                }}
                                icon={
                                  <Avatar
                                    src={member.imageUrl}
                                    alt={member.fullname}
                                    sx={{
                                      width: "40px",
                                      height: "40px",
                                      mr: 2.5,
                                    }}
                                  />
                                }
                                variant="outlined"
                                label={
                                  <>
                                    <Typography variant="body2" component="div">
                                      {member.fullname}
                                    </Typography>
                                    <Typography variant="body2" component="div">
                                      {idx < 3 ? "🏆" : "✔️"}
                                      {" " +
                                        Math.round(
                                          (member.points + Number.EPSILON) * 100
                                        ) /
                                          100}
                                    </Typography>
                                  </>
                                }
                              />
                            </li>
                          ) : null;
                        })}
                    </Box>
                  </Paper>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={6} xl={4}>
                <Paper sx={{ padding: "10px", mb: "19px" }}>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      pt: "19px",
                      pb: "0px",
                    }}
                  >
                    Apply to Join this Community
                  </Typography>
                  <JoinUs community={communi} />
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </PagesNavbar>
  );
};

export default Tutorial;
