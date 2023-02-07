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
import { Button, Card, CardActionArea, CardContent, CardMedia, Divider, styled } from "@mui/material";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";

export const orangeDark = "#FF6D00";
export const orangeLight = "#f77a1a";
export const orangeLighter = "#faa666";
export const darkblue = "#0A0D14";
export const gray200 = "#EAECF0";
export const gray400 = "#98A2B3";
export const gray600 = "#475467";
export const gray700 = "#344054";
export const gray800 = "#1D2939";
export const gray900 = "#0A0D14";
const subSections = [
  {
    title: "Qualifications",
    image: "/static/requirements/qualifications.svg",
    component: community => {
      return community ? (
        <ul>
          {community.qualifications &&
            community.qualifications.map((qualifi, qIdx) => {
              return <li key={qIdx}>{qualifi}</li>;
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
    title: "By Joining Us, You Will ...",
    image: "/static/requirements/joining-us.svg",

    component: community => {
      return community ? (
        <ul>
          {community.gains &&
            community.gains.map((gain, gIdx) => {
              return <li key={gIdx}>{gain}</li>;
            })}
        </ul>
      ) : null;
    }
  },
  {
    title: "Responsibilities",
    image: "/static/requirements/responsabilities.svg",
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

const DividerStyled = styled(props => <Divider {...props} />)(() => ({
  marginTop: "32px",
  marginBottom: "32px"
}));

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
    <PagesNavbar communities={true} thisPage={"Communities"} newHeader={true} theme="dark">
      <Box
        sx={{
          maxWidth: "1280px",
          margin: "auto",
          px: { xs: "12px", md: "0px" }
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Button
            variant="outlined"
            onClick={() => {
              if (!carouselRef.current) return;

              carouselRef.current.scrollBy(600, 0);
            }}
            sx={{
              background: gray600,
              position: "absolute",
              right: { xs: "0px", xl: "-28px" },
              top: "calc(50% - 28px)",
              zIndex: "9",
              ":hover": { background: gray600, opacity: "0.9" },
              width: { xs: "32px", md: "56px" },
              minWidth: { xs: "32px", md: "56px" },
              height: { xs: "32px", md: "56px" },
              p: "0px",
              borderRadius: "50%",
              opacity: "0.7",
              transition: "opacity .3s"
            }}
          >
            <ArrowForwardIcon sx={{ color: "common.white" }} />
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              if (!carouselRef.current) return;

              carouselRef.current.scrollBy(-600, 0);
            }}
            sx={{
              background: gray600,
              position: "absolute",
              left: { xs: "0px", xl: "-28px" },
              top: "calc(50% - 28px)",
              zIndex: "9",
              ":hover": { background: gray600, opacity: "0.9" },
              width: { xs: "32px", md: "56px" },
              minWidth: { xs: "32px", md: "56px" },
              height: { xs: "32px", md: "56px" },
              p: "0px",
              borderRadius: "50%",
              opacity: "0.7",

              transition: "opacity .3s"
            }}
          >
            <ArrowBackIcon sx={{ color: "common.white" }} />
          </Button>
          <Stack
            ref={carouselRef}
            direction={"row"}
            alignItems="stretch"
            spacing={"24px"}
            sx={{
              position: "relative",
              overflowX: "scroll",
              maxWidth: "1280px",
              py: "16px",
              scrollBehavior: "smooth",
              "&::-webkit-scrollbar": {
                width: "4px",
                height: "4px"
              },
              "::-webkit-scrollbar-thumb": {
                backgroundColor: gray600,
                borderRadius: "10px"
              }
            }}
          >
            {communities.map((item, idx) => (
              <Link
                key={item.id}
                to={`/community/${item.id}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <Card
                  elevation={0}
                  sx={{
                    minWidth: { xs: "150px", sm: "210px" },
                    maxWidth: { xs: "160px", sm: "220px" },
                    height: { xs: "100%", sm: "100%" },
                    flex: 1,
                    backgroundColor: "transparent"
                  }}
                  square
                >
                  <CardActionArea
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      p: "16px",
                      border: `1px solid ${gray800}`,
                      backgroundColor: "black",
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
                      alt={item.title}
                      sx={{ borderRadius: "8px", height: { xs: "100px", sm: "140px" } }}
                    />
                    <CardContent sx={{ p: "16px 0 0 0" }}>
                      <Typography sx={{ fontSize: "14px", fontWeight: 600, pt: "0", color: gray200 }}>
                        {item.title}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            ))}
          </Stack>
        </Box>

        <DividerStyled />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: "16px", sm: "0px" }}
          alignItems="center"
          justifyContent={"space-between"}
          mb="16px"
        >
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            sx={{ textTransform: "capitalize", m: "0px", color: gray200 }}
          >
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
          {/* Community video */}

          <YoutubeEmbed embedId={community.YouTube} />

          <br />

          {/* Community description */}

          {typeof community.description === "object" && community.description !== null ? (
            community.description
          ) : (
            <Typography variant="body1" color={gray200} sx={{ textAlign: "left" }}>
              {community.description}
            </Typography>
          )}

          <br />

          {/* Communiiity leader */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              placeItems: "center",
              gap: "16px",
              m: "2.5px",
              minHeight: "130px"
            }}
          >
            {community.leaders &&
              community.leaders.map((leader, idx) => {
                return (
                  <Stack
                    alignItems={"center"}
                    spacing="8px"
                    sx={{
                      padding: "24px ",
                      border: `1px solid ${gray800}`,
                      borderRadius: "12px",
                      width: "280px",
                      backgroundColor: "black"
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
                    <Typography variant="h5" component="div" fontWeight={600} sx={{ color: gray200 }}>
                      {leader.name}
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ color: gray200, fontSize: "16px" }}>
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
                              sx={{ color: gray400 }}
                            >
                              {wSite.name === "LinkedIn" ? <LinkedInIcon /> : <LinkIcon />}
                            </IconButton>
                          );
                        })}
                      <IconButton
                        component="a"
                        href={"mailto:onecademy@umich.edu?subject=" + community.title + " Question for " + leader.name}
                        target="_blank"
                        aria-label="email"
                        sx={{ color: gray400 }}
                      >
                        <EmailIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                );
              })}
          </Box>
        </Box>

        <DividerStyled />

        {/* Qualification, Joinning and responsabilities */}

        <Box>
          {subSections.map((subSection, idx) => (
            <Stack
              key={idx}
              direction={{ xs: "column", sm: "row" }}
              alignItems="center"
              spacing={{ xs: "24px", sm: "100px" }}
              sx={{ mb: { xs: "40px", sm: "16px" } }}
            >
              <Box
                sx={{
                  color: gray200,
                  flex: 1,
                  maxWidth: "650px",
                  "& ul": {
                    pl: "28px"
                  },
                  "& li": {
                    listStyle: "none",
                    position: "relative"
                  },
                  "& li:before": {
                    content: '""',
                    width: "6px",
                    height: "6px",
                    backgroundColor: gray200,
                    color: gray200,
                    borderRadius: "2px",
                    position: "absolute",
                    left: "-20px",
                    top: "8px"
                  },
                  "& li:not(:last-child)": {
                    marginBottom: "12px"
                  }
                }}
              >
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: 600,
                    color: gray200
                  }}
                >
                  {subSection.title}
                </Typography>
                {subSection.component(community)}
              </Box>
              <Box sx={{ width: { sm: "250px", lg: "300px" }, height: { sm: "250px", lg: "300px" } }}>
                <img src={subSection.image} alt={subSection.title} style={{ width: "100%", height: "100%" }} />
              </Box>
            </Stack>
          ))}

          {/* {getImage(expandedOption, { display: { xs: "none", md: "block" } })} */}
        </Box>

        <DividerStyled />

        <Typography variant="h4" gutterBottom align="center" sx={{ textTransform: "capitalize", p: { xs: "10px" } }}>
          Apply to Join this Community
        </Typography>
        <JoinUs community={community}  themeName="dark"/>

        <DividerStyled />
        {typeof community.accomplishments === "object" &&
          !Array.isArray(community.accomplishments) &&
          community.accomplishments !== null && (
            <Box
              sx={{
                padding: "10px",
                mb: "19px",
                "& a:link": {
                  color: orangeDark
                },
                
              }}
            >
              <Typography
                variant="h5"
                component="div"
                sx={{
                  pt: "19px",
                  pb: "19px",
                  color: gray200
                }}
              >
                Community Accomplishments
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "left", color: gray200 }}>
                {community.accomplishments}
              </Typography>
            </Box>
          )}

        <Box
          sx={{
            m: "2.5px",
            mt: "10px",
            minHeight: "130px"
          }}
        >
          <Typography
            sx={{
              display: "block",
              color: gray200,
              "& span": {
                color: gray400
              }
            }}
          >
            <b>Leaderboard</b>
            <br />
            <span> Only those with &gt; 25 points </span>
          </Typography>
          <br />
          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
              placeItems: "stretch",
              gap: "8px",
              listStyle: "none",
              p: 0.5,
              m: 0
            }}
          >
            {community.allTime &&
              community.allTime.slice(0, limit).map((member, idx) => {
                return member.points >= 25 ? (
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    sx={{
                      minWidth: "150px",
                      maxWidth: "100%",
                      height: "84px",
                      borderRadius: "12px",
                      border: `1px solid ${gray800}`,
                      backgroundColor: "black",
                      p: { xs: "6px 8px", sm: "16px 24px" }
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
                      <Typography sx={{ fontSize: "16px", fontWeight: 600, color: gray200 }}>
                        {member.fullname}
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ color: gray200 }}>
                        {idx < 3 ? "🏆" : "✔️"}
                        {" " + Math.round((member.points + Number.EPSILON) * 100) / 100}
                      </Typography>
                    </Stack>
                  </Stack>
                ) : null;
              })}
            <Button
              onClick={() => (community.allTime ? setLimit(community.allTime.length) : setLimit(3))}
              sx={{
                display: limit === 3 ? "block" : "none",
                textTransform: "capitalize",
                color: orangeDark,
                cursor: "pointer"
                // placeSelf: "center"
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
    </PagesNavbar>
  );
};

export default Communities;
