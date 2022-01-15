import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LinkIcon from "@mui/icons-material/Link";
import EmailIcon from "@mui/icons-material/Email";

import Typography from "./modules/components/Typography";
import AppAppBar from "./modules/views/AppAppBar";
import AppFooter from "./modules/views/AppFooter";
import withRoot from "./modules/withRoot";
import Button from "./modules/components/Button";
import YoutubeEmbed from "./modules/components/YoutubeEmbed/YoutubeEmbed";

import JoinUs from "./modules/views/JoinUs";

import allCommunities from "./modules/views/communitiesOrder";
import sectionsOrder from "./modules/views/sectionsOrder";

const switchSection = (newValue) => (event) => {
  window.location.replace("/Home#" + sectionsOrder[newValue + 1].id);
};

const homeClick = (event) => {
  window.location.replace("/Home");
};

const joinUsClick = (event) => {
  window.location.replace("/Home#JoinUsSection");
};

const Communities = (props) => {
  const [expanded, setExpanded] = useState(props.commId);
  const [communities, setCommunities] = useState(allCommunities);

  useEffect(() => {
    if (props.commId) {
      let newCommunities = [...allCommunities];
      const commIdx = newCommunities.findIndex(
        (communi) => communi.id === props.commId
      );
      const theCommunity = newCommunities.splice(commIdx, 1);
      newCommunities = [...theCommunity, ...newCommunities];
      setCommunities(newCommunities);
    }
  }, [props.commId]);

  const handleChange = (commId) => (event, newExpanded) => {
    const idx = communities.findIndex((communi) => communi.id === commId);
    if (idx !== -1) {
      window.history.replaceState(
        null,
        communities[idx].title,
        "/community/" + commId
      );
    }
    setExpanded(newExpanded ? commId : false);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
      }}
    >
      <AppAppBar
        switchSection={switchSection}
        homeClick={homeClick}
        joinUsClick={joinUsClick}
      />
      <Box
        sx={{
          margin: { xs: 0, sm: "4px", md: "10px", lg: "16px", xl: "25px" },
        }}
      >
        <Typography variant="h3" gutterBottom marked="center" align="center">
          1Cademy Communities
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
                      Community Leaders
                    </Typography>
                    <Grid
                      container
                      spacing={2.5}
                      align="center"
                      justify="center"
                      alignItems="center"
                    >
                      {communi.leaders &&
                        communi.leaders.map((leader, idx) => {
                          return (
                            <Grid key={leader.name} xs={12}>
                              <List
                                sx={{
                                  width: "100%",
                                  bgcolor: "background.paper",
                                }}
                              >
                                <ListItem>
                                  <ListItemAvatar>
                                    <Avatar
                                      src={
                                        "/static/CommunityLeaders/" +
                                        leader.image
                                      }
                                      alt={leader.name}
                                      sx={{ width: 100, height: 100, mr: 2.5 }}
                                    />
                                    {leader.websites &&
                                      leader.websites.map((wSite) => {
                                        return (
                                          <IconButton
                                            component="a"
                                            href={wSite.url}
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
                                      aria-label="email"
                                    >
                                      <EmailIcon />
                                    </IconButton>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={leader.name}
                                    secondary={
                                      <React.Fragment>
                                        <Typography
                                          sx={{ display: "inline" }}
                                          component="span"
                                          variant="body2"
                                          color="text.primary"
                                        >
                                          {leader.about}
                                        </Typography>
                                      </React.Fragment>
                                    }
                                  />
                                </ListItem>
                                <Divider variant="inset" component="li" />
                              </List>
                            </Grid>
                          );
                        })}
                    </Grid>
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
      </Box>
      <AppFooter />
    </Box>
  );
};

export default withRoot(Communities);
