import React, { useState, useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Masonry from "@mui/lab/Masonry";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LinkIcon from "@mui/icons-material/Link";
import EmailIcon from "@mui/icons-material/Email";

import { firebaseOneState } from "../../store/OneCademyAtoms";

import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";
import YoutubeEmbed from "./modules/components/YoutubeEmbed/YoutubeEmbed";

import JoinUs from "./modules/views/JoinUs";

import allCommunities from "./modules/views/communitiesOrder";
import { Button, Card, CardActionArea, CardContent, CardMedia, Divider } from "@mui/material";
import { Stack } from "@mui/system";
import { transition } from "d3";
import { Link } from "react-router-dom";

export const orangeDark = "#FF6D00";
export const orangeLight = "#f77a1a";
export const gray200 = "#EAECF0";
export const gray600 = "#475467";

const subSections = [
  {
    title: "Qualifications",
    component: community => {
      return community ? (
        <ul>
          {community.qualifications &&
            community.qualifications.map((qualification, qIdx) => {
              return <li key={qIdx}>{qualification}</li>;
            })}
        </ul>
      ) : null;
    }
  },
  {
    title: "By Joining Us, You Will ...",
    component: community => {
      return community ? (
        <ul>
          {community.gains &&
            community.gains.map((gain, gIdx) => {
              return <li key={gIdx}>{gain}</li>;
            })}
          <li>Submit your most current resume and unofficial transcripts, indicating a GPA above 3.4/4.0</li>
          <li>Explain in a few paragraphs why you apply to this specific community.</li>
          <li>
            Complete our community-specific quiz by answering a set of questions about some research papers or book
            chapters and get a satisfying score.
          </li>
          {community.coursera && (
            <li>
              Complete{" "}
              <a href={community.coursera} target="_blank">
                this Coursera course
              </a>{" "}
              and upload your certificate as a part of the application.
            </li>
          )}
        </ul>
      ) : null;
    }
  },
  {
    title: "Responsibilities",
    component: community => {
      return community ? (
        <ul>
          {community.responsibilities &&
            community.responsibilities.map((responsibility, rIdx) => {
              return <li key={rIdx}>{responsibility}</li>;
            })}
        </ul>
      ) : null;
    }
  },
  {
    title: "Apply to Join this Community",
    component: community => (community ? <JoinUs community={community} /> : null),
    image: "Apply_to_Join_this_Community.svg"
  }
];

const accumulatePoints = (groups, reputationData, user, points) => {
  for (let communi of groups) {
    for (let deTag of communi.tags) {
      if (reputationData.tag === deTag.title) {
        const userIdx = communi.allTime.findIndex(obj => obj.uname === reputationData.uname);
        if (userIdx !== -1) {
          communi.allTime[userIdx].points += points;
        } else {
          communi.allTime.push({
            uname: reputationData.uname,
            ...user,
            points
          });
        }
      }
    }
  }
};

const Communities = props => {
  const firebase = useRecoilValue(firebaseOneState);

  const [reputationsChanges, setReputationsChanges] = useState([]);
  const [reputations, setReputations] = useState({});
  const [reputationsLoaded, setReputationsLoaded] = useState(false);
  const [usersChanges, setUsersChanges] = useState([]);
  const [users, setUsers] = useState({});
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [communities, setCommunities] = useState(allCommunities);
  const [community, setCommunity] = useState(props.commIdx >= 0 ? allCommunities[props.commIdx] : allCommunities[0]);
  const [expandedOption, setExpandedOption] = useState("");
  const [limit, setLimit] = useState(3);

  const carouselRef = useRef(null);

  useEffect(() => {
    if (props.commIdx !== undefined && props.commIdx !== -1) {
      setCommunity(oldCommunity => {
        const newCommunity = allCommunities[props.commIdx];
        return newCommunity ?? oldCommunity;
      });
    }
  }, [props.commIdx]);

  useEffect(() => {
    if (firebase) {
      const usersQuery = firebase.db.collection("users");
      const usersSnapshot = usersQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setUsersChanges(oldUsersChanges => {
          return [...oldUsersChanges, ...docChanges];
        });
      });
      return () => {
        setUsersChanges([]);
        usersSnapshot();
      };
    }
  }, [firebase]);

  useEffect(() => {
    if (usersChanges.length > 0) {
      const tempUsersChanges = [...usersChanges];
      setUsersChanges([]);
      let members = { ...users };
      for (let change of tempUsersChanges) {
        const userData = change.doc.data();
        if (change.type === "removed" || userData.deleted) {
          if (change.doc.id in members) {
            delete members[change.doc.id];
          }
        } else {
          members[change.doc.id] = {
            uname: userData.uname,
            fullname: userData.fName + " " + userData.lName,
            imageUrl: userData.imageUrl
          };
        }
      }
      setUsers(members);
      setUsersLoaded(true);
    }
  }, [usersChanges, users]);

  useEffect(() => {
    if (firebase && usersLoaded) {
      const reputationsQuery = firebase.db.collection("reputations");
      const reputationsSnapshot = reputationsQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setReputationsChanges(oldReputationsChanges => {
          return [...oldReputationsChanges, ...docChanges];
        });
      });
      return () => {
        setReputationsChanges([]);
        reputationsSnapshot();
      };
    }
  }, [firebase, usersLoaded]);

  useEffect(() => {
    if (reputationsChanges.length > 0) {
      const tempReputationsChanges = [...reputationsChanges];
      setReputationsChanges([]);
      let rpts = { ...reputations };
      const groups = [...communities];
      for (let change of tempReputationsChanges) {
        const reputationData = change.doc.data();
        const points =
          reputationData.cdCorrects +
          reputationData.iCorrects +
          reputationData.mCorrects -
          reputationData.cdWrongs -
          reputationData.iWrongs -
          reputationData.mWrongs;
        if (change.type === "removed" || reputationData.deleted) {
          if (reputationData.uname in rpts) {
            delete rpts[reputationData.uname];
          }
        } else {
          const user = users[reputationData.uname];
          if (!(reputationData.uname in rpts)) {
            accumulatePoints(groups, reputationData, user, points);
            rpts[reputationData.uname] = { [reputationData.tag]: points };
          } else {
            if (!(reputationData.tag in rpts[reputationData.uname])) {
              accumulatePoints(groups, reputationData, user, points);
              rpts[reputationData.uname][reputationData.tag] = points;
            } else {
              accumulatePoints(groups, reputationData, user, points - rpts[reputationData.uname][reputationData.tag]);
              rpts[reputationData.uname][reputationData.tag] = points;
            }
          }
        }
      }
      for (let communi of groups) {
        communi.allTime.sort((a, b) => b.points - a.points);
      }
      setReputations(rpts);
      setCommunities(groups);
      setReputationsLoaded(true);
    }
  }, [reputationsChanges, reputations, communities]);

  const handleChangeOption = option => (event, newExpanded) => {
    setExpandedOption(newExpanded ? option : false);
  };

  const getImage = (subSectionTitle, sx) => {
    const subSection = subSections.find(subSection => subSection.title === subSectionTitle);
    console.log({ subSectionTitle, subSection });
    if (!subSection?.image) return null;

    return subSection ? (
      <Box
        sx={{
          width: { xs: "350px", sm: "400px", md: "450px", lg: "500px" },
          minWidth: { xs: "350px", sm: "400px", md: "450px", lg: "500px" },
          height: { xs: "350px", sm: "400px", md: "450px", lg: "500px" },
          alignSelf: "center",
          ...sx
        }}
      >
        <img src={`/static/${subSection.image}`} alt={subSection.title} style={{ width: "100%", height: "100%" }} />
      </Box>
    ) : null;
  };

  const joinUsClick = event => {
    window.location.replace("/#JoinUsSection");
  };

  return (
    <PagesNavbar communities={true} thisPage={"Communities"} newHeader={true}>
      <Box
        sx={{
          // display: "grid",
          // gridTemplateColumns: { xs: "1fr", md: "minmax(min-content,250px) 1fr" },
          // columnGap: "16px",
          maxWidth: "1284px",
          m: "auto"
        }}
      >
        {/* <Box>
          <Box sx={{ position: "sticky", top: "150px" }}>
            <Typography
              variant="h5"
              gutterBottom
              align="left"
              sx={{ mb: "24px", fontSize: "20px", px: { xs: "10px", sm: "0px" } }}
            >
              1CADEMY COMMUNITIES
            </Typography>
            <Stack
              component={"ul"}
              spacing={"24px"}
              sx={{
                listStyle: "none",
                p: { xs: "8px", sm: "0" },
                maxHeight: { xs: "200px", md: "none" },
                overflowY: "auto"
              }}
            >
              {communities.map((communi, idx) => (
                <Box
                  key={`${idx}-${communi.title}`}
                  component={"li"}
                  // onClick={() => changeCommunity(idx)}
                  sx={{
                    position: "relative",
                    color: communi.title === community.title ? orangeDark : "#28282A",
                    fontWeight: "regular",
                    // ":before": {
                    //   content: '""',
                    //   position: "absolute",
                    //   top: 0,
                    //   left: "-8px",
                    //   width: "2px",
                    //   height: "100%",
                    //   border: "1px solid #EF7E2B",
                    //   opacity: communi.title === community.title ? "1" : "0",
                    //   transition: "opacity 300ms"
                    // },
                    borderLeft: communi.title === community.title ? `2px solid ${orangeDark}` : "2px solid transparent",

                    p: "2px 16px",
                    "&:hover": { cursor: "pointer", color: "#EF7E2B" }
                  }}
                >
                  <Link to={`/community/${communi.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {communi.title}
                  </Link>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box> */}

        <Box
          sx={{
            maxWidth: "958px",
            margin: "auto"
          }} /* columns={{ xs: 1, md: 2, lg: 2, xl: 3 }} spacing={{ xs: 1, md: 2.2 }} */
        >
          <Box sx={{ position: "relative" }}>
            <Button
              variant="outlined"
              onClick={() => {
                if (!carouselRef.current) return;

                carouselRef.current.scrollBy(600, 0);
              }}
              sx={{
                background: gray200,
                position: "absolute",
                right: "-28px",
                top: "calc(50% - 28px)",
                zIndex: "9",
                ":hover": { background: gray200, borderColor: "#d8d8d8", opacity: "0.9" },
                width: "32px",
                minWidth: "56px",
                height: "56px",
                p: "0px",
                borderRadius: "50%",
                opacity: "0.7",
                borderColor: gray200,
                transition: "opacity .3s"
              }}
            >
              <ArrowForwardIcon />
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                if (!carouselRef.current) return;

                carouselRef.current.scrollBy(-600, 0);
              }}
              sx={{
                background: gray200,
                position: "absolute",
                left: "-28px",
                top: "calc(50% - 28px)",
                zIndex: "9",
                ":hover": { background: gray200, borderColor: "#d8d8d8", opacity: "0.9" },
                width: "32px",
                minWidth: "56px",
                height: "56px",
                p: "0px",
                borderRadius: "50%",
                opacity: "0.7",
                borderColor: gray200,
                transition: "opacity .3s"
              }}
            >
              <ArrowBackIcon />
            </Button>
            <Stack
              ref={carouselRef}
              direction={"row"}
              alignItems="stretch"
              spacing={"24px"}
              sx={{
                position: "relative",
                overflowX: "hidden",
                maxWidth: "958px",
                py: "16px",
                scrollBehavior: "smooth"
              }}
            >
              {communities.map((item, idx) => (
                <Link key={item.id} to={`/community/${item.id}`} style={{ textDecoration: "none", color: "inherit",display:"block" }}>
                  <Card elevation={0} sx={{ minWidth: "210px", maxWidth: "220px",height:"100%", flex: 1 }} square>
                    <CardActionArea
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        p: "16px",
                        border: `1px solid ${gray200}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        height: "100%",
                        ":hover": {
                          borderColor: orangeDark
                        }
                      }}
                    >
                      <CardMedia
                        component={"img"}
                        image={item.url}
                        width="180px"
                        height="140"
                        alt={item.title}
                        sx={{ borderRadius: "8px" }}
                      />
                      <CardContent sx={{ p: "16px 0 0 0" }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, pt: "0" }}>{item.title}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Link>
              ))}
            </Stack>
          </Box>

          <br />
          <Divider />
          <br />

          <Stack direction={"row"} alignItems="center" justifyContent={"space-between"}>
            <Typography variant="h4" gutterBottom align="left" sx={{ textTransform: "capitalize", p: { xs: "10px" } }}>
              {community.title}
            </Typography>
            <Button
              onClick={joinUsClick}
              sx={{
                textTransform: "initial",
                color: "common.white",
                backgroundColor: orangeDark,
                cursor: "pointer",
                ":hover": {
                  cursor: "pointer",
                  backgroundColor: orangeLight
                }
              }}
            >
              Apply to join this community
            </Button>
          </Stack>

          <Box sx={{ py: "10px", px: { xs: "10px" }, mb: "19px" }}>
            <YoutubeEmbed embedId={community.YouTube} />

            <br />

            {typeof community.description === "object" && community.description !== null ? (
              community.description
            ) : (
              <Typography variant="body1" color="text.primary" sx={{ textAlign: "left" }}>
                {community.description}
              </Typography>
            )}
            <br />

            <Box
              sx={{
                m: "2.5px",
                minHeight: "130px"
              }}
            >
              <Stack
                direction={"row"}
                flexWrap="wrap"
                justifyContent={"flex-start"}
                sx={{
                  listStyle: "none",
                  p: 0.5,
                  m: 0
                }}
                component="ul"
                spacing={"24px"}
              >
                {community.leaders &&
                  community.leaders.map((leader, idx) => {
                    return (
                      <li key={leader.name}>
                        <Stack
                          alignItems={"center"}
                          spacing="8px"
                          sx={{
                            padding: "24px ",
                            border: `1px solid ${gray200}`,
                            borderRadius: "12px",
                            width: "280px"
                          }}
                        >
                          <Avatar
                            src={"/static/CommunityLeaders/" + leader.image}
                            alt={leader.name}
                            sx={{
                              width: "100px",
                              height: "100px",
                              mb: "4px"
                            }}
                          />
                          <Typography variant="h5" component="div" fontWeight={600}>
                            {leader.name}
                          </Typography>
                          <Typography variant="h5" component="div" sx={{ color: gray600, fontSize: "16px" }}>
                            Community leader
                          </Typography>
                          <Stack direction={"row"} spacing="8px">
                            {leader.websites &&
                              leader.websites.map((wSite, wIdx) => {
                                return (
                                  <IconButton
                                    key={wIdx}
                                    component="a"
                                    href={wSite.url}
                                    target="_blank"
                                    aria-label={wSite.name}
                                  >
                                    {wSite.name === "LinkedIn" ? <LinkedInIcon /> : <LinkIcon />}
                                  </IconButton>
                                );
                              })}
                            <IconButton
                              component="a"
                              href={
                                "mailto:onecademy@umich.edu?subject=" + community.title + " Question for " + leader.name
                              }
                              target="_blank"
                              aria-label="email"
                            >
                              <EmailIcon />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </li>
                    );
                  })}
              </Stack>
            </Box>
          </Box>

          <Divider />
          <br />

          <Stack
            direction={{ xs: "column-reverse", md: "row" }}
            justifyContent={"space-between"}
            sx={{ margin: "auto" }}
          >
            <Box>
              {subSections.map((subSection, idx) => (
                <Accordion
                key={idx}
                  disableGutters
                  elevation={0}
                  square
                  sx={{
                    background: "transparent",
                    border: "none",
                    borderLeft: `4px solid ${expandedOption === subSection.title ? orangeDark : "#F8F8F8"}`,
                    "&:before": {
                      display: "none"
                    }
                  }}
                  expanded={expandedOption === subSection.title}
                  onChange={handleChangeOption(subSection.title)}
                >
                  <AccordionSummary>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        fontWeight: "regular"
                      }}
                    >
                      {subSection.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>{subSection.component(community)}</AccordionDetails>
                </Accordion>
              ))}
            </Box>

            {/* {getImage(expandedOption, { display: { xs: "none", md: "block" } })} */}
          </Stack>

          <br />
          <Divider />
          <br />

          {typeof community.accomplishments === "object" &&
            !Array.isArray(community.accomplishments) &&
            community.accomplishments !== null && (
              <Box sx={{ padding: "10px", mb: "19px" }}>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    pt: "19px",
                    pb: "19px"
                  }}
                >
                  Community Accomplishments
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left" }}>
                  {community.accomplishments}
                </Typography>
              </Box>
            )}
          {/* <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        pt: "19px",
                        pb: "19px",
                      }}
                    >
                      Community Members
                    </Typography> */}

          <Box
            sx={{
              m: "2.5px",
              mt: "10px",
              minHeight: "130px"
            }}
          >
            <Typography
              sx={{
                display: "block"
              }}
            >
              <b>Leaderboard</b> <br />
              <span> Only those with &gt; 25 points </span>
            </Typography>
            <br />
            <Stack
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(auto-fit,minmax(50%,auto))",
                  sm: "repeat(auto-fit,minmax(20%,auto))"
                },
                gap: "4px",
                listStyle: "none",
                p: 0.5,
                m: 0
              }}
              component="ul"
            >
              {community.allTime &&
                community.allTime.slice(0, limit).map((member, idx) => {
                  return member.points >= 25 ? (
                    <li key={member.uname}>
                      <Stack
                        direction={"row"}
                        alignItems={"center"}
                        sx={{
                          minWidth: "150px",
                          maxWidth: "260px",
                          height: "84px",
                          borderRadius: "12px",
                          border: `1px solid ${gray200}`,
                          p: "16px 24px"
                        }}
                      >
                        <Avatar
                          src={member.imageUrl}
                          alt={member.fullname}
                          sx={{
                            width: "50px",
                            height: "50px",
                            mr: 2.5
                          }}
                        />
                        <Stack>
                          <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>{member.fullname}</Typography>
                          <Typography variant="body2" component="div">
                            {idx < 3 ? "🏆" : "✔️"}
                            {" " + Math.round((member.points + Number.EPSILON) * 100) / 100}
                          </Typography>
                        </Stack>
                      </Stack>
                    </li>
                  ) : null;
                })}
              <Button
                onClick={() => (community.allTime ? setLimit(community.allTime.length) : setLimit(3))}
                sx={{
                  display: limit === 3 ? "block" : "none",
                  textTransform: "capitalize",
                  color: orangeDark,
                  cursor: "pointer",
                  placeSelf: "center"
                }}
              >
                View more...
              </Button>
            </Stack>
          </Box>
          {/* <Grid
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
                                      leader.websites.map((wSite, wIdx) => {
                                        return (
                                          <IconButton
                                            key={wIdx}
                                            component="a"
                                            href={wSite.url} target="_blank"
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
                                      } target="_blank"
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
                    </Grid> */}
        </Box>
      </Box>
    </PagesNavbar>
  );
};

export default Communities;
