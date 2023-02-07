import LogoutIcon from "@mui/icons-material/Logout";
import BiotechIcon from "@mui/icons-material/Biotech";
import AccountCircle from "@mui/icons-material/AccountCircle";
import React, { Suspense, useCallback, useRef, useState } from "react";

import LogoDarkMode from "../../assets/DarkModeLogoMini.png";
import Box from "@mui/material/Box";

import AppFooter from "./modules/views/AppFooter";
import HowItWorks from "./modules/views/HowItWorks";
import withRoot from "./modules/withRoot";

import sectionsOrder from "./modules/views/sectionsOrder";
import {
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery
} from "@mui/material";
import CustomTypography from "./modules/components/Typography";
import { useRecoilState, useRecoilValue } from "recoil";
import { emailState, firebaseState, fullnameState } from "../../store/AuthAtoms";
import { useNavigate } from "react-router-dom";
import { notAResearcherState } from "../../store/ProjectAtoms";
import { MemoizedTableOfContent } from "./modules/components/TableOfContent";
import { useWindowSize } from "./hooks/useWindowSize";
import { showSignInorUpState } from "../../store/GlobalAtoms";
import { gray02 } from "./modules/views/WhoWeAre";
import { useInView } from "./modules/hooks/useObserver";
import { HeroMemoized } from "./modules/views/Hero";
import Which from "./modules/views/Which";
import { darkblue } from "./Communities";
import Mechanism, { MECHANISM_ITEMS } from "./modules/views/Mechanism";
import Magnitude from "./modules/views/Magnitude";
import Benefits from "./modules/views/Benefits";
import Topics from "./modules/views/Topics";
import Systems from "./modules/views/Systems";
import About from "./modules/views/About";

const Values = React.lazy(() => import("./modules/views/Values"));
const What = React.lazy(() => import("./modules/views/What"));
const UniversitiesMap = React.lazy(() => import("./modules/views/UniversitiesMap/UniversitiesMap"));
const WhoWeAre = React.lazy(() => import("./modules/views/WhoWeAreWrapper"));
const JoinUs = React.lazy(() => import("./modules/views/JoinUsWrapper"));

const HEADER_HEIGTH = 70;
export const gray03 = "#AAAAAA";

const section1ArtBoards = [
  { name: "artboard-1", durationMs: 1000, getHeight: vh => vh - HEADER_HEIGTH, color: "#ff28c9" }
];
const artboards = [
  {
    name: "Summarizing",
    artoboard: "artboard-3",
    getHeight: isMobile => (isMobile ? 900 : 600),
    color: "#f33636",
    description: `We gather valuable information from various sources such as books, articles, and videos, and divide it into granular pieces. We then combine these pieces into concise notes that focus on a single concept. \nTraditional note-taking methods often only benefit the individual for a short period of time, typically for a semester or two. 1Cademy's collaborative note-taking approach ensures that the notes are useful and usable for multiple students studying the same topics. \nThrough this process, we aim to improve the notes semester by semester, making the learning experience more efficient for all. This way, students can spend less time on note-taking and gain the most benefit from the notes.`
  },
  {
    name: "Linking",
    artoboard: "artboard-4",
    getHeight: isMobile => (isMobile ? 900 : 600),
    color: "#f38b36",
    description: `Our notes, which are organized in granular pieces, can be transformed into a knowledge graph that visually illustrates the hierarchical relationships between concepts. The linking of concepts is beneficial as it helps us understand how concepts relate to one another and their place in broader topics, fields, or disciplines. All concepts are linked in a logical and ordered manner, starting with the broadest concepts and progressing to the most specific. \nThis step-by-step approach allows us to take a concept we don't understand and trace it back to its prerequisite concepts until we have the necessary knowledge to comprehend it. Additionally, once we understand a concept, we can follow links to more specific concepts to deepen our understanding. These step-by-step learning pathways provide the necessary context when we don't understand something and allow us to delve deeper if we want to learn more.
    `
  },
  {
    name: "Voting",
    artoboard: "artboard-5",
    getHeight: isMobile => (isMobile ? 900 : 600),
    color: "#e6f336",
    description: `To ensure the quality of the knowledge graph on 1Cademy, we have implemented a peer-review process. Each individual concept, represented as a node, can be voted on by members of the community, and the score of the node will determine its level of modification or the possibility of deletion. \nNodes that receive a significant number of negative votes will be removed as unhelpful. Additionally, 1Cademy uses a reputation system to incentivize high-quality contributions and discourage unhelpful or idle behavior. Users who contribute helpful content and whose nodes receive positive votes will see their reputation increase. \nConversely, users who post unhelpful content or are inactive will see their reputation decrease. This system encourages the development of a high-quality knowledge graph that can benefit a large number of learners and researchers.`
  },
  {
    name: "Improving",
    artoboard: "artboard-6",
    getHeight: isMobile => (isMobile ? 900 : 600),
    color: "#62f336",
    description: `We work together to improve the knowledge presented by continually updating and refining concepts. For each node, there are multiple versions proposed by different people. \nThe community can then vote on each proposed version. Voting allows the community to disapprove of changes that are unhelpful or to approve of changes that would improve the existing version of the node. \nUsers can upvote or downvote the proposed version of a node, which is then compared to the votes received by the existing version of the node. If a proposal receives enough positive votes in comparison to the votes of the existing node, it will be accepted and the node will be updated. In this way, the community collaborates and perpetually improves the knowledge available.`
  },
  {
    name: "Magnitude",
    artoboard: "artboard-7",
    getHeight: isMobile => (isMobile ? 900 : 600),
    color: "#36f3c4",
    description: `Over the past two years, [1,529] students and researchers from [183] institutions have participated in a large-scale collaboration effort through 1Cademy. This collaboration has resulted in the creation of [44,665] nodes and [235,674] prerequisite links between them, which have been proposed through [88,167] proposals. \nAs a result of this collaboration, [49] research and learning communities have formed, covering a wide range of subjects such as psychology, machine learning, and virology. This collaborative effort has allowed for the sharing of knowledge and resources among students and researchers from different institutions, promoting the advancement of knowledge in various fields. \nFurthermore, it has facilitated the formation of communities of learners and researchers who can learn from each other, exchange ideas and support one another in their learning journey. This collaborative note-taking approach ensures that the notes are useful and usable for multiple students studying the same topics, and that they can improve semester by semester. Through this process, students can spend less time on note-taking and gain the most benefit from the notes.`,
    getDescription: ({ users, institutions, nodes, links, proposals, communities }) =>
      `Over the past two years, [${users}] students and researchers from [${institutions}] institutions have participated in a large-scale collaboration effort through 1Cademy. This collaboration has resulted in the creation of [${nodes}] nodes and [${links}] prerequisite links between them, which have been proposed through [${proposals}] proposals. \nAs a result of this collaboration, [${communities}] research and learning communities have formed, covering a wide range of subjects such as psychology, machine learning, and virology. This collaborative effort has allowed for the sharing of knowledge and resources among students and researchers from different institutions, promoting the advancement of knowledge in various fields. \nFurthermore, it has facilitated the formation of communities of learners and researchers who can learn from each other, exchange ideas and support one another in their learning journey. This collaborative note-taking approach ensures that the notes are useful and usable for multiple students studying the same topics, and that they can improve semester by semester. Through this process, students can spend less time on note-taking and gain the most benefit from the notes.`
  }
];

export const SECTION_WITH_ANIMATION = 1;
export const HEADER_HEIGHT = 80;
export const HEADER_HEIGHT_MOBILE = 72;

const sectionsTmp = [
  { id: "LandingSection", title: "Home", simpleTitle: "Home", children: [] },
  {
    id: "HowItWorksSection",
    title: "How We Work?",
    simpleTitle: "How?",
    children: [
      { id: "animation1", title: "Summarizing", simpleTitle: "Summarizing" },
      { id: "animation2", title: "Linking", simpleTitle: "Linking" },
      { id: "animation3", title: "Voting", simpleTitle: "Voting" },
      { id: "animation4", title: "Improving", simpleTitle: "Improving" },
      { id: "animation5", title: "Magnitude", simpleTitle: "Magnitude" }
    ]
  },
  { id: "ValuesSection", title: "Why 1Cademy?", simpleTitle: "Why?", children: [] },
  { id: "CommunitiesSection", title: "What we study?", simpleTitle: "What?", children: [] },
  { id: "WhichSection", title: "Which systems?", simpleTitle: "Which?", children: [] },
  { id: "SchoolsSection", title: "Where Are We?", simpleTitle: "Where?", children: [] },
  { id: "WhoWeAreSection", title: "Who Is Behind 1Cademy?", simpleTitle: "Who?", children: [] },
  { id: "JoinUsSection", title: "Apply to Join Us!", simpleTitle: "Apply", children: [] }
];
function Index() {
  const firebase = useRecoilValue(firebaseState);
  const [sectionSelected, setSelectedSection] = useState(0);
  const [notSectionSwitching, setNotSectionSwitching] = useState(true);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const showSignInorUp = useRecoilValue(showSignInorUpState);
  const [email, setEmail] = useRecoilState(emailState);
  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [notAResearcher /* setNotAResearcher */] = useRecoilState(notAResearcherState);
  const navigateTo = useNavigate();
  const isLargeDesktop = useMediaQuery("(min-width:1350px)");
  const isDesktop = useMediaQuery("(min-width:1200px)");
  const isMovil = useMediaQuery("(max-width:600px)");
  const [animationSelected, setSelectedAnimation] = useState(0);

  const { entry: homeEntry, inView: homeInView, ref: HomeSectionRef } = useInView();
  const { entry: whyEntry, inViewOnce: whyInViewOnce, ref: whySectionRef } = useInView({});
  const { entry: whatEntry, inViewOnce: whatInViewOnce, ref: whatSectionRef } = useInView({});
  const { entry: whereEntry, inViewOnce: whereInViewOnce, ref: whereSectionRef } = useInView({});
  const { entry: whoEntry, inViewOnce: whoInViewOnce, ref: whoSectionRef } = useInView({});
  const { entry: whichEntry, inViewOnce: whichInViewOnce, ref: whichSectionRef } = useInView({});
  const { entry: joinEntry, inViewOnce: joinInViewOnce, ref: JoinSectionRef } = useInView({});
  const { inViewOnce: tableOfContentInViewOnce, ref: TableOfContentRef } = useInView();

  const animationRefs = useRef(null);
  const { height, width } = useWindowSize();
  const howSectionRef = useRef(null);

  const scrollToSection = ({ height, sectionSelected }) => {
    window.document.getElementById("ScrollableContainer").scroll({ top: height, left: 0, behavior: "smooth" });

    window.history.replaceState(null, sectionSelected.title, "#" + sectionSelected.id);
  };

  const getSectionHeights = useCallback(() => {
    if (!homeEntry) return null;
    if (!howSectionRef?.current) return null;
    if (!whyEntry) return null;
    if (!whatEntry) return null;
    if (!whereEntry) return null;
    if (!whichEntry) return null;
    if (!whoEntry) return null;
    if (!joinEntry) return null;

    return [
      { id: homeEntry.target.id, height: 0 },
      { id: howSectionRef.current.id, height: homeEntry.target.clientHeight },
      { id: whyEntry.target.id, height: howSectionRef.current.clientHeight },
      { id: whatEntry.target.id, height: whyEntry.target.clientHeight },
      { id: whichEntry.target.id, height: whatEntry.target.clientHeight },
      { id: whereEntry.target.id, height: whichEntry.target.clientHeight },
      { id: whoEntry.target.id, height: whereEntry.target.clientHeight },
      { id: joinEntry.target.id, height: whoEntry.target.clientHeight }
    ];
  }, [homeEntry, joinEntry, whatEntry, whereEntry, whichEntry, whoEntry, whyEntry]);

  const getSectionPositions = useCallback(() => {
    if (!homeEntry?.current) return null;
    if (!howSectionRef?.current) return null;
    if (!whyEntry) return null;
    if (!whatEntry) return null;
    if (!whichEntry) return null;
    if (!whereEntry) return null;
    if (!whoEntry) return null;
    if (!joinEntry) return null;

    return [
      { id: homeEntry.target.id, height: homeEntry.target.clientHeight },
      { id: howSectionRef.current.id, height: howSectionRef.current.clientHeight },
      { id: whyEntry.target.id, height: whyEntry.target.clientHeight },
      { id: whatEntry.target.id, height: whatEntry.target.clientHeight },
      { id: whichEntry.target.id, height: whichEntry.target.clientHeight },
      { id: whereEntry.target.id, height: whereEntry.target.clientHeight },
      { id: whoEntry.target.id, height: whoEntry.target.clientHeight },
      { id: joinEntry.target.id, height: joinEntry.target.clientHeight }
    ];
  }, [homeEntry, joinEntry, whatEntry, whereEntry, whichEntry, whoEntry, whyEntry]);

  const getAnimationsHeight = useCallback(() => {
    const res = artboards.map(artboard => artboard.getHeight(height));
    return [0, ...res.splice(0, res.length - 1)];
  }, [height]);

  const getAnimationsPositions = useCallback(() => {
    return artboards.map(artboard => artboard.getHeight(height));
  }, [height]);

  const detectScrollPosition = useCallback(
    event => {
      if (!animationRefs.current) return;
      if (notSectionSwitching) {
        const currentScrollPosition = event.target.scrollTop;
        const sectionsHeight = getSectionPositions();
        if (!sectionsHeight) return;

        const { min, idx: idxSection } = sectionsHeight.reduce(
          (acu, cur, idx) => {
            if (acu.max > currentScrollPosition) return acu;
            return { max: acu.max + cur.height, min: acu.max, idx };
          },
          { max: 0, min: 0, idx: -1 }
        );

        if (idxSection < 0) return;

        let animationsHeight = [];
        if (idxSection === 0) {
          animationsHeight = [section1ArtBoards[0].getHeight(height)];
        } else {
          const animationsHeightsArray = [
            animationRefs.current.getHeight1(),
            animationRefs.current.getHeight2(),
            animationRefs.current.getHeight3(),
            animationRefs.current.getHeight4(),
            animationRefs.current.getHeight5()
          ];
          animationsHeight = getAnimationsPositions(animationsHeightsArray);
        }

        const { /* maxAnimation, minAnimation, */ idxAnimation } = animationsHeight.reduce(
          (acu, cur, idx) => {
            if (acu.maxAnimation > currentScrollPosition) return acu;
            return { maxAnimation: acu.maxAnimation + cur, minAnimation: acu.maxAnimation, idxAnimation: idx };
          },
          { maxAnimation: min, minAnimation: min, idxAnimation: -1 }
        );

        const sectionSelected = sectionsTmp[idxSection];

        if (window.location.hash !== `#${sectionSelected.id}`) {
          window.history.replaceState(null, sectionSelected.title, "#" + sectionSelected.id);
        }
        setSelectedSection(idxSection);
        setSelectedAnimation(idxAnimation);
      }
    },
    [getAnimationsPositions, getSectionPositions, height, notSectionSwitching]
  );

  const switchSection = useCallback(
    (sectionIdx, animationIndex = -1) => {
      if (!animationRefs.current) return;

      setNotSectionSwitching(false);
      const sectionsHeight = getSectionHeights();
      if (!sectionsHeight) return;

      const previousSections = sectionsHeight.slice(0, sectionIdx + 1);
      const sectionResult = previousSections.reduce((a, c) => ({ id: c.id, height: a.height + c.height }));

      let cumulativeAnimationHeight = 0;

      const animationsHeights = [
        animationRefs.current.getHeight1(),
        animationRefs.current.getHeight2(),
        animationRefs.current.getHeight3(),
        animationRefs.current.getHeight4(),
        animationRefs.current.getHeight5()
      ];
      const animationsHeight = getAnimationsHeight(animationsHeights);

      if (animationsHeight) {
        if (animationIndex >= 0) {
          const animationSectionTitleHeight = 121;
          const previousAnimationHeight = animationsHeight.slice(0, animationIndex + 1);
          cumulativeAnimationHeight = previousAnimationHeight.reduce((a, c) => a + c, animationSectionTitleHeight);
        }
      }
      const cumulativeHeight = sectionResult.height + cumulativeAnimationHeight;
      scrollToSection({ height: cumulativeHeight, sectionSelected: sectionsOrder[sectionIdx] });

      setSelectedSection(sectionIdx);
      setSelectedAnimation(animationIndex);

      setTimeout(() => {
        setNotSectionSwitching(true);
      }, 1000);
    },
    [getAnimationsHeight, getSectionHeights]
  );

  const joinUsClick = event => {
    event.preventDefault();
    switchSection(sectionsOrder.length - 1);
  };

  const handleProfileMenuOpen = event => {
    setProfileMenuOpen(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(null);
  };

  const navigateToExperiment = () => {
    if (!notAResearcher) {
      navigateTo("/Activities/");
    } else {
      navigateTo("/Activities/experiment");
    }
  };

  const signOut = async event => {
    // console.log("Signing out!");
    setEmail("");
    setFullname("");
    await firebase.logout();
    navigateTo("/");
  };

  const renderProfileMenu = (
    <Menu id="ProfileMenu" anchorEl={profileMenuOpen} open={isProfileMenuOpen} onClose={handleProfileMenuClose}>
      {fullname && email && (
        <MenuItem disabled sx={{ flexGrow: 3, color: "black", opacity: "1 !important" }}>
          {fullname}
        </MenuItem>
      )}
      {fullname && email && (
        <MenuItem sx={{ flexGrow: 3 }} onClick={navigateToExperiment}>
          <BiotechIcon /> <span id="ExperimentActivities">Experiment Activities</span>
        </MenuItem>
      )}
      {fullname && email && (
        <MenuItem sx={{ flexGrow: 3 }} onClick={signOut}>
          <LogoutIcon /> <span id="LogoutText">Logout</span>
        </MenuItem>
      )}
    </Menu>
  );

  const signUpHandler = () => {
    navigateTo("/auth");
  };

  return (
    <Box
      id="ScrollableContainer"
      onScroll={e => detectScrollPosition(e)}
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
        position: "relative",
        backgroundColor: darkblue
        // zIndex: -3
      }}
    >
      <Box
        component={"header"}
        sx={{ position: "sticky", width: "100%", top: "0px", zIndex: 12, display: "flex", justifyContent: "center" }}
      >
        <Box
          sx={{
            height: HEADER_HEIGTH,
            width: "100%",
            background: "rgba(0,0,0,.72)",
            backdropFilter: "saturate(180%) blur(20px)"

            // filter: "blur(1px)"
          }}
          // style={{willChange:"filter"}}
        />
        <Box
          sx={{
            width: "100%",
            maxWidth: "980px",
            height: HEADER_HEIGTH,
            px: isDesktop ? "0px" : "10px",
            position: "absolute",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Stack
            spacing={"20px"}
            alignItems={"center"}
            justifyContent={"space-between"}
            direction={"row"}
            sx={{ color: "#f8f8f8" }}
          >
            <img src={LogoDarkMode} alt="logo" width="52px" height={"59px"} />

            {!isMovil && (
              <>
                <Tooltip title={sectionsOrder[1].title}>
                  <Typography
                    sx={{ cursor: "pointer", borderBottom: sectionSelected === 1 ? "solid 2px orange" : undefined }}
                    onClick={() => switchSection(1)}
                  >
                    {sectionsOrder[1].label}
                  </Typography>
                </Tooltip>
                <Tooltip title={sectionsOrder[2].title}>
                  <Typography
                    sx={{ cursor: "pointer", borderBottom: sectionSelected === 2 ? "solid 2px orange" : undefined }}
                    onClick={() => switchSection(2)}
                  >
                    {sectionsOrder[2].label}
                  </Typography>
                </Tooltip>
                <Tooltip title={sectionsOrder[3].title}>
                  <Typography
                    sx={{ cursor: "pointer", borderBottom: sectionSelected === 3 ? "solid 2px orange" : undefined }}
                    onClick={() => switchSection(3)}
                  >
                    {sectionsOrder[3].label}
                  </Typography>
                </Tooltip>
                <Tooltip title={sectionsOrder[4].title}>
                  <Typography
                    sx={{ cursor: "pointer", borderBottom: sectionSelected === 4 ? "solid 2px orange" : undefined }}
                    onClick={() => switchSection(4)}
                  >
                    {sectionsOrder[4].label}
                  </Typography>
                </Tooltip>
                <Tooltip title={sectionsOrder[5].title}>
                  <Typography
                    sx={{ cursor: "pointer", borderBottom: sectionSelected === 5 ? "solid 2px orange" : undefined }}
                    onClick={() => switchSection(5)}
                  >
                    {sectionsOrder[5].label}
                  </Typography>
                </Tooltip>
              </>
            )}
          </Stack>
          <Box>
            {
              <Tooltip title="Apply to join 1Cademy">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={joinUsClick}
                  size={isMovil ? "small" : "medium"}
                  sx={{
                    fontSize: 16,
                    color: "common.white",
                    ml: 2.5,
                    borderRadius: 40
                  }}
                >
                  Apply!
                </Button>
              </Tooltip>
            }
            {fullname ? (
              <Tooltip title="Account">
                <IconButton
                  size="large"
                  // edge="end"
                  aria-haspopup="true"
                  aria-controls="lock-menu"
                  aria-label={`${fullname}'s Account`}
                  aria-expanded={isProfileMenuOpen ? "true" : undefined}
                  onClick={handleProfileMenuOpen}
                  sx={{
                    color: "common.white"
                  }}
                >
                  <AccountCircle color="inherit" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="SIGN IN/UP">
                <Button
                  variant="contained"
                  onClick={signUpHandler}
                  size={isMovil ? "small" : "medium"}
                  sx={{
                    display: showSignInorUp ? "inline-flex" : "none",
                    fontSize: 16,
                    color: "common.white",
                    ml: 2.5,
                    borderRadius: 40
                  }}
                >
                  SIGN IN/UP
                </Button>
              </Tooltip>
            )}
            {fullname && renderProfileMenu}
          </Box>
        </Box>
      </Box>

      {/* <Box id={sectionsOrder[0].id} ref={section1Ref}>
        <Landing />
      </Box> */}

      <Box sx={{ position: "relative" }}>
        <Box ref={HomeSectionRef} component="section">
          <HeroMemoized headerHeight={HEADER_HEIGHT} headerHeightMobile={HEADER_HEIGHT_MOBILE} />
        </Box>

        <Box
          sx={{
            width: "100%",
            maxWidth: "1280px",
            px: isDesktop ? "0px" : "10px",
            margin: "auto",
            position: "relative",
            pt: "32px"
          }}
        >
          <Box id={sectionsOrder[1].id} ref={howSectionRef} sx={{ pb: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{ pb: 10, color: "#f8f8f8" }}>
              {sectionsOrder[1].title}
            </CustomTypography>
            <Mechanism mechanisms={MECHANISM_ITEMS} />
          </Box>
          <Box i sx={{ pb: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{ pb: 10, color: "#f8f8f8" }}>
              Magnitude
            </CustomTypography>
            <Magnitude />
            {/* <UniversitiesMap theme={"Dark"} /> */}
          </Box>
          <Box i sx={{ pb: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{ pb: 10, color: "#f8f8f8" }}>
              Benefits
            </CustomTypography>
            <Benefits />
          </Box>
          <Box i sx={{ pb: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{ pb: 10, color: "#f8f8f8" }}>
              Topics
            </CustomTypography>
            <Topics />
          </Box>
          <Box i sx={{ pb: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{ pb: 10, color: "#f8f8f8" }}>
              Systems
            </CustomTypography>
            <Systems />
          </Box>
          <Box i sx={{ pb: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{ pb: 10, color: "#f8f8f8" }}>
              About
            </CustomTypography>
            <About />
          </Box>
          <Box id={sectionsOrder[2].id} ref={whySectionRef} sx={{ pb: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{ pb: 10, color: "#f8f8f8" }}>
              {sectionsOrder[2].title}
            </CustomTypography>
            {!whyInViewOnce && <div style={{ height: 2 * height /* background: "red" */ }}></div>}
            {whyInViewOnce && (
              <Suspense
                fallback={
                  <Grid container spacing={2.5} align="center">
                    {new Array(8).fill(0).map((a, i) => (
                      <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
                        <Skeleton
                          variant="rounded"
                          height={210}
                          animation="wave"
                          sx={{ background: "#72727263", maxWidth: 340 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                }
              >
                <Values />
              </Suspense>
            )}
          </Box>
          <Box id={sectionsOrder[3].id} ref={whatSectionRef} sx={{ pb: 10 }}>
            <CustomTypography
              variant="h4"
              marked="center"
              align="center"
              sx={{ pb: 10, color: "#f8f8f8", fontWeight: 700 }}
            >
              {sectionsOrder[3].title}
            </CustomTypography>
            {!whatInViewOnce ? (
              <div style={{ height: 2 * height /*  background: "yellow" */ }}></div>
            ) : (
              <Suspense
                fallback={
                  <Grid container spacing={1} align="center">
                    {new Array(8).fill(0).map((a, i) => (
                      <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
                        <Skeleton
                          variant="rounded"
                          height={210}
                          animation="wave"
                          sx={{ background: "#72727263", maxWidth: 340 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                }
              >
                <What />
              </Suspense>
            )}
          </Box>
          <Box id={sectionsOrder[4].id} ref={whichSectionRef} sx={{ pb: 10 }}>
            <CustomTypography
              variant="h4"
              marked="center"
              align="center"
              sx={{ pb: 10, color: "#f8f8f8", fontWeight: 700 }}
            >
              {sectionsOrder[4].title}
            </CustomTypography>
            {!whichInViewOnce ? (
              <div style={{ height: 2 * height /* background: "pink" */ }}></div>
            ) : (
              <Suspense
                fallback={
                  <Box
                    sx={{
                      pt: 7,
                      pb: 10,
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center"
                    }}
                  >
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Skeleton variant="rectangular" height={800} animation="wave" sx={{ background: gray02 }} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Skeleton variant="rectangular" height={800} animation="wave" sx={{ background: gray02 }} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Skeleton variant="rectangular" height={800} animation="wave" sx={{ background: gray02 }} />
                      </Grid>
                    </Grid>
                  </Box>
                }
              >
                <Which />
              </Suspense>
            )}
          </Box>
          <Box id={sectionsOrder[5].id} ref={whereSectionRef} sx={{ pb: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{ pb: 10, color: "#f8f8f8" }}>
              {sectionsOrder[5].title}
            </CustomTypography>
            {!whereInViewOnce ? (
              <div style={{ height: 2 * height /* background: "green" */ }}></div>
            ) : (
              <Suspense
                fallback={<Skeleton variant="rounded" height={490} animation="wave" sx={{ background: gray02 }} />}
              >
                <UniversitiesMap theme={"Dark"} />
              </Suspense>
            )}
          </Box>
          <Box id={sectionsOrder[6].id} ref={whoSectionRef} sx={{ pb: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{ pb: 10, color: "#f8f8f8" }}>
              {sectionsOrder[6].title}
            </CustomTypography>
            {!whoInViewOnce ? (
              <div style={{ height: 2 * height /* background: "pink" */ }}></div>
            ) : (
              <Suspense
                fallback={
                  <Box
                    sx={{
                      pt: 7,
                      pb: 10,
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center"
                    }}
                  >
                    <Grid container spacing={2.5} align="center">
                      <Grid item xs={12} sm={6} md={4}>
                        <Skeleton variant="rounded" height={800} animation="wave" sx={{ background: gray02 }} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Skeleton variant="rounded" height={800} animation="wave" sx={{ background: gray02 }} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Skeleton variant="rounded" height={800} animation="wave" sx={{ background: gray02 }} />
                      </Grid>
                    </Grid>
                  </Box>
                }
              >
                <WhoWeAre />
              </Suspense>
            )}
          </Box>
          <Box id={sectionsOrder[7].id} ref={JoinSectionRef} sx={{ pb: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{ pb: 10, color: "#f8f8f8" }}>
              {sectionsOrder[7].title}
            </CustomTypography>
            {!joinInViewOnce ? (
              <div style={{ height: 2 * height /* background: "#b4f5ea" */ }}></div>
            ) : (
              <Suspense
                fallback={<Skeleton variant="rounded" height={490} animation="wave" sx={{ background: gray02 }} />}
              >
                <JoinUs themeName={"dark"} />
              </Suspense>
            )}
          </Box>
        </Box>
      </Box>
      <AppFooter />
      <link rel="preload" href="artboard-1.riv" as="fetch" crossOrigin="anonymous" />
    </Box>
  );
}

export default withRoot(Index);

// const advanceAnimationTo = (rive, timeInSeconds) => {
//   if (!rive?.animator?.animations[0]) return;

//   const Animator = rive.animator.animations[0];
//   Animator.instance.time = 0;
//   Animator.instance.advance(timeInSeconds);
//   Animator.instance.apply(1);
//   rive.startRendering();
// };
