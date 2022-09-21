import React from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
// import Collapse from "@mui/material/Collapse";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
// import { CardActionArea } from "@mui/material";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Accordion from "@mui/material/Accordion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Button from "../components/Button";
import Typography from "../components/Typography";
import YoutubeEmbed from "../components/YoutubeEmbed/YoutubeEmbed";
import Tooltip from "@mui/material/Tooltip";
import sectionsOrder from "./sectionsOrder";
import { fontSize } from "@mui/system";
import UMLogo from "../../../../assets/umsi-logo-vert-u.png";
import GoogleCloud from "../../../../assets/GoogleCloud.svg";
import HonorEducation from "../../../../assets/Honor_Education_Logo.jpeg";
import { useNavigate, createSearchParams } from "react-router-dom";
const sectionIdx = sectionsOrder.findIndex(sect => sect.id === "OurProcessSection");


const howElements = [
  {
    id: "calendar",
    title: "calendar",
    content: `Start the process by scheduling your availability.`
  },
  {
    id: "videoCall",
    title: "Conduct Experiments",
    content: `Conduct Experiments`
  },
  {
    id: "Reward",
    title: "Get Your Reward",
    content: `Get Your Reward`
  },
  {
    id: "GetOpportunities",
    title: "Get Opportunities to Join Our Research Team",
    content: `Get Opportunities to Join Our Research Team`
  }
];

const BenefitsofJoiningElemnets = [
  {
    id: "",
    title: "",
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`
  },
  {
    id: "",
    title: "",
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`
  }
];
const TeamAndSponsorsElements = [
  {
    id: "",
    title: "Recently Published Papers",
    content: ``
  },
  {
    id: "Team and Sponsors",
    title: "Team and Sponsors",
    content: ``
  }
];

const FaqElements = [
  {
    id: "",
    title: "How to join the experiment?",
    content: `Scedule your experiment here (link)`
  },
  {
    id: "",
    title: "Who can join the experiment?",
    content: `Every one????`
  },
  {
    id: "",
    title: "What is the experiment for?",
    content: `Once you complete the research, you will earn [$??] as the compensation. `
  },
  {
    id: "",
    title: "How much compensation I can get?",
    content: `Once you complete the research, you will earn [$??] as the compensation. `
  },
  {
    id: "",
    title: "What is the 1Cademy research team? How to join?",
    content: `1Cademy is a academic organization purposing to visualize learning pathways from books & research papers. There are several research community such as...`
  }
];

const recentlyPublishedPapers = [
  {
    title: "ACM ICER 2021",
    content: (
      <Typography variant="body2" color="text.secondary">
        YeckehZaare, I., Fox, E., Grot, G., Chen, S., Walkosak, C., Kwon, K., ... &amp; Silverstein, N. (2021, August).
        Incentivized Spacing and Gender in Computer Science Education. In{" "}
        <Box component="span" sx={{ fontStyle: "italic" }}>
          Proceedings of the 17th ACM Conference on International Computing Education Research
        </Box>{" "}
        (pp. 18-28).
      </Typography>
    ),
    href: "https://dl.acm.org/doi/abs/10.1145/3446871.3469760"
  },
  {
    title: "ACM CHI 2020",
    content: (
      <Typography variant="body2" color="text.secondary">
        Yeckehzaare, I., Barghi, T., &amp; Resnick, P. (2020, April). QMaps: Engaging Students in Voluntary Question
        Generation and Linking. In{" "}
        <Box component="span" sx={{ fontStyle: "italic" }}>
          Proceedings of the 2020 CHI Conference on Human Factors in Computing Systems
        </Box>{" "}
        (pp. 1-14).
      </Typography>
    ),
    href: "https://dl.acm.org/doi/abs/10.1145/3313831.3376882"
  },
  {
    title: "ACM ICER 2019",
    content: (
      <Typography variant="body2" color="text.secondary">
        YeckehZaare, I., Resnick, P., &amp; Ericson, B. (2019, July). A spaced, interleaved retrieval practice tool that
        is motivating and effective. In{" "}
        <Box component="span" sx={{ fontStyle: "italic" }}>
          Proceedings of the 2019 ACM Conference on International Computing Education Research
        </Box>{" "}
        (pp. 71-79).
      </Typography>
    ),
    href: "https://dl.acm.org/doi/abs/10.1145/3291279.3339411"
  },
  {
    title: "ACM SIGCSE 2019",
    content: (
      <Typography variant="body2" color="text.secondary">
        YeckehZaare, I., &amp; Resnick, P. (2019, February). Speed and Studying: Gendered Pathways to Success. In{" "}
        <Box component="span" sx={{ fontStyle: "italic" }}>
          Proceedings of the 50th ACM Technical Symposium on Computer Science Education
        </Box>{" "}
        (pp. 693-698).
      </Typography>
    ),
    href: "https://dl.acm.org/doi/abs/10.1145/3287324.3287417"
  },
  {
    title: "SPLICE 2019",
    content: (
      <Typography variant="body2" color="text.secondary">
        Ericson, B. J., YeckehZaare, I., &amp; Guzdial, M. J. (2019). Runestone Interactive Ebooks: A Research Platform
        for On-line Computer Science Learning. In{" "}
        <Box component="span" sx={{ fontStyle: "italic" }}>
          Proceedings of SPLICE 2019 workshop Computing Science Education Infrastructure: From Tools to Data at 15th ACM
          International Computing Education Research Conference, Aug 11, 2019, Toronto, Canada.
        </Box>
      </Typography>
    ),
    href: "https://www.researchgate.net/profile/Iman-Yeckehzaare/publication/341966650_Runestone_Interactive_Ebooks_A_Research_Platform_for_On-line_Computer_Science_Learning/links/5edb704945851529453ca208/Runestone-Interactive-Ebooks-A-Research-Platform-for-On-line-Computer-Science-Learning.pdf"
  }
];

// const iniStepChecked = [];
// for (let value of howElements) {
//   iniStepChecked.push(false);
// }

const Progress = props => {
  const navigateTo = useNavigate();
  const params = { navigateToSchedulePage: true };
  const navigateToActivities = () => {
    navigateTo({
      pathname: "/Activities",
      search: `?${createSearchParams(params)}`
    });
  };
  return (
    <Container
      id="HowItWorksSection"
      component="section"
      sx={{
        pt: 7,
        pb: 10,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "secondary.light"
      }}
    >
      <Typography variant="h4" marked="center" sx={{ mb: 7 }}>
        {sectionsOrder[sectionIdx].title}
      </Typography>
      <Box sx={{ zIndex: 1, mx: "auto" }}>
        <Grid container spacing={2.5} align="center">
          {howElements.map((elem, idx) => {
            return (
              <Grid key={elem + idx} item xs={12} sm={6} md={4} lg={3}>
                {/* <CardActionArea onClick={flipCard(idx)}> */}
                <Box
                  alignItems="center"
                  sx={{
                    display: "flex",
                    justify: "center",
                    alignItems: "center",
                    height: "190px",
                    fontSize: "50px"
                  }}
                >
                  <Box sx={{ m: "0px 0px 0px 90px" }}>
                    <img component="img" src={"/static/" + elem.id + ".svg"} alt={elem.id} sx={{ px: "10px" }} />
                  </Box>
                  <Box sx={{ m: "0px 0px 0px 90px" }}>{!(elem.id === "GetOpportunities") && <ArrowForwardIcon />}</Box>
                </Box>
                <Box sx ={{mb:"10px"}}>
                  {elem.id === "calendar" && (
                    <Tooltip title="Learn More">
                      <Button
                        sx={{
                          fontSize: 16,
                          color: "common.black",
                          backgroundColor: "common.white"
                        }}
                        onClick={navigateToActivities}
                      >
                        Schedule
                      </Button>
                    </Tooltip>
                  )}
                </Box>

                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ textAlign: "center", fontFamily: "Raleway", texttransform: "none" }}
                >
                  {elem.content}
                </Typography>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <Typography variant="h4" marked="center" sx={{ mb: 7 }}>
        Benefits of Joining
      </Typography>
      <Box sx={{ mt: "19px", m: "20px 20px 0px 20px" }}>
        <Grid container spacing={70} align="center">
          {BenefitsofJoiningElemnets.map((elem, idx) => {
            return (
              <Grid key={elem + idx} item xs={12} sm={6} md={2} lg={3}>
                <Card sx={{ minWidth: 500 }}>
                  <Box sx={{ m: "20px 20px 0px 20px" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left" }}>
                      {elem.content}
                    </Typography>
                  </Box>
                  <Tooltip title="Learn More">
                    <Button
                      sx={{
                        fontSize: 10,
                        color: "common.black",
                        backgroundColor: "common.white",
                        ml: 2.5,
                        borderRadius: 40
                      }}
                    >
                      Learn More
                    </Button>
                  </Tooltip>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <Box sx={{ mt: "19px", m: "20px 20px 0px 20px" , height: "600px"}}>
        <Grid container spacing={70} align="center">
          <Grid key={"RecentPublishedPaper"} item xs={12} sm={6} md={2} lg={3}>
            <Card sx={{ minWidth: 500 }}>
              <Box>
                <Box
                  sx={{
                    color: "#fff",
                    fontSize: "19px",
                    backgroundColor: "#28282A",
                    padding: "20px 15px 20px 15px"
                  }}
                >
                  {/* <div style={{
                    marginBottom: "10px",
                  }}> */}

                  <span
                    style={{
                      // textDecoration: "underline",
                      // textDecorationColor: "#ff8a33"
                      borderBottom: "solid 1px #ff8a33",
                      paddingBottom: "5px"
                    }}
                  >
                    Recently Published Papers
                  </span>
                  {/* </div> */}
                </Box>
                {recentlyPublishedPapers.map((elem, index) => {
                  return (
                    <Accordion key={index}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <a target="_blank" rel="noreferrer" href={elem.href}>
                          <Typography variant="h6" component="div">
                            {`${elem.title}`}
                          </Typography>
                        </a>
                      </AccordionSummary>
                      <AccordionDetails>
                        <ListItemButton component="a" target="_blank" href={elem.href}>
                          <ListItemText primary="SPLICE 2019" secondary={elem.content} />
                        </ListItemButton>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            </Card>
          </Grid>
          <Grid key={"TeamandSponsors"} item xs={12} sm={6} md={2} lg={3}>
            <Card sx={{ minWidth: 500 }}>
              <Box sx={{ m: "20px 20px 0px 20px" }}>
                <Box sx={{ m: "20px 20px 0px 20px" }}>
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: "34px", textTransform: "capitalize", fontWeight: "normal" }}
                  >
                    Team and Sponsors
                  </Typography>
                </Box>
                <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                  <Stack direction="row" sx={{ marginLeft: "70px" }} spacing={2}>
                    <ListItemButton component="a" target="_blank" href="https://www.si.umich.edu/people/paul-resnick">
                      <ListItemAvatar>
                        <Avatar
                          alt="Paul Resnick Picture"
                          src="/static/Paul_Resnick.jpg"
                          sx={{ width: 100, height: 130, mr: 2.5 }}
                        />
                        <ListItemText
                          primary="Paul Resnick"
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary">
                                1Cademy Advisor
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItemAvatar>
                    </ListItemButton>
                    <ListItemButton
                      alignItems="flex-start"
                      component="a"
                      target="_blank"
                      href="https://www.si.umich.edu/people/iman-yeckehzaare"
                    >
                      <ListItemAvatar>
                        <Avatar
                          alt="Iman YeckehZaare Picture"
                          src="/static/Iman_YeckehZaare.jpg"
                          sx={{ width: 100, height: 130, mr: 2.5 }}
                        />

                        <ListItemText
                          primary="Iman YeckehZaare"
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                1Cademy Architect
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItemAvatar>
                    </ListItemButton>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <ListItemButton
                      alignItems="flex-start"
                      component="a"
                      target="_blank"
                      href="https://www.si.umich.edu/"
                    >
                      <ListItemAvatar>
                        <Avatar
                          alt="University of Michigan School of Information Logo"
                          src={UMLogo}
                          sx={{ width: 150, height: 150, mr: 2.5 }}
                        />
                      </ListItemAvatar>
                    </ListItemButton>
                    <ListItemButton
                      alignItems="flex-start"
                      component="a"
                      target="_blank"
                      href="https://www.honor.education/"
                    >
                      <ListItemAvatar>
                        <Avatar alt="Honor Education" src={HonorEducation} sx={{ width: 100, height: 100, mr: 2.5 }} />
                        <ListItemText
                          primary=""
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                Honor Education
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItemAvatar>
                    </ListItemButton>
                    <ListItemButton
                      alignItems="flex-start"
                      component="a"
                      target="_blank"
                      href="https://cloud.google.com/edu/researchers"
                    >
                      <ListItemAvatar>
                        <Avatar alt="Google Cloud Logo" src={GoogleCloud} sx={{ width: 100, height: 100, mr: 2.5 }} />
                        <ListItemText
                          primary=""
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                Google Cloud
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItemAvatar>
                    </ListItemButton>
                  </Stack>
                </List>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <Typography variant="h4" marked="center" sx={{ mb: 7 }}>
        FAQ
      </Typography>
      <Box sx={{ width: "100%" }}>
        {FaqElements.map((elem, index) => {
          return (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                <Typography variant="h6" component="div">
                  {`${elem.title}`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>{`${elem.content}`}</AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Container>
  );
};

export default Progress;
