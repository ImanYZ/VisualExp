import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import backgroundImage from "../../assets/darkModeLibraryBackground.jpg";
import LogoutIcon from "@mui/icons-material/Logout";
import BiotechIcon from "@mui/icons-material/Biotech";
import AccountCircle from "@mui/icons-material/AccountCircle";
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  Tab,
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
import { useRive } from "rive-react/dist";
import { useWindowSize } from "./hooks/useWindowSize";
import { showSignInorUpState } from "../../store/GlobalAtoms";
import { gray02 } from "./modules/views/WhoWeAre";
import { useInView } from "./modules/hooks/useObserver";

const Values = React.lazy(() => import("./modules/views/Values"));
const What = React.lazy(() => import("./modules/views/What"));
const UniversitiesMap = React.lazy(() => import("./modules/views/UniversitiesMap/UniversitiesMap"));
const WhoWeAre = React.lazy(() => import("./modules/views/WhoWeAreWrapper"));
const JoinUs = React.lazy(() => import("./modules/views/JoinUsWrapper"));

const HEADER_HEIGTH = 70;

const section1ArtBoards = [
  { name: "artboard-1", durationMs: 1000, getHeight: vh => vh - HEADER_HEIGTH, color: "#ff28c9" }
];
const artboards = [
  { name: "Summarizing", durationMs: 7000, getHeight: vh => 6 * vh, color: "#f33636" },
  { name: "Linking", durationMs: 24000, getHeight: vh => 8 * vh, color: "#f38b36" },
  { name: "Evaluating", durationMs: 4000, getHeight: vh => 5 * vh, color: "#e6f336" },
  { name: "Improving", durationMs: 14000, getHeight: vh => 8 * vh, color: "#62f336" }
];

export const SECTION_WITH_ANIMATION = 1;

const sectionsTmp = [
  { id: "LandingSection", title: "Home", simpleTitle: "Home", children: [] },
  {
    id: "HowItWorksSection",
    title: "How We Work?",
    simpleTitle: "How?",
    children: [
      { id: "animation1", title: "Summarizing", simpleTitle: "Summarizing" },
      { id: "animation2", title: "Linking", simpleTitle: "Linking" },
      { id: "animation3", title: "Evaluating", simpleTitle: "Evaluating" },
      { id: "animation4", title: "Improving", simpleTitle: "Improving" }
    ]
  },
  { id: "ValuesSection", title: "Why 1Cademy?", simpleTitle: "Why?", children: [] },
  { id: "CommunitiesSection", title: "What we study?", simpleTitle: "What?", children: [] },
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
  const [notAResearcher, setNotAResearcher] = useRecoilState(notAResearcherState);
  const navigateTo = useNavigate();
  const [idxRiveComponent, setIdxRiveComponent] = useState(0);
  const isLargeDesktop = useMediaQuery("(min-width:1350px)");
  const isDesktop = useMediaQuery("(min-width:1200px)");
  const isMovil = useMediaQuery("(max-width:600px)");
  const [showLandingOptions, setShowLandingOptions] = useState(true);
  const [showAnimationOptions, setShowAnimationOptions] = useState(false);
  const [animationSelected, setSelectedAnimation] = useState(0);


  const { entry: whyEntry, inViewOnce: whyInViewOnce, ref: whySectionRef } = useInView({})
  const { entry: whatEntry, inViewOnce: whatInViewOnce, ref: whatSectionRef } = useInView({})
  const { entry: whereEntry, inViewOnce: whereInViewOnce, ref: whereSectionRef } = useInView({})
  const { entry: whoEntry, inViewOnce: whoInViewOnce, ref: whoSectionRef } = useInView({})
  const { entry: joinEntry, inViewOnce: joinInViewOnce, ref: JoinSectionRef } = useInView({})

  const { height, width } = useWindowSize();

  const { rive: rive1, RiveComponent: RiveComponent1 } = useRive({
    src: "artboard-1.riv",
    artboard: "artboard-1",
    animations: "Timeline 1",
    autoplay: false,
    // onLoad: () => console.log("load-finish")
  });

  const { rive: rive2, RiveComponent: RiveComponent2 } = useRive({
    src: "artboard-2.riv",
    artboard: "artboard-2",
    animations: "Timeline 1",
    autoplay: false,
    // onLoad: () => console.log("load-finish")
  });
  const { rive: rive3, RiveComponent: RiveComponent3 } = useRive({
    src: "artboard-3.riv",
    artboard: "artboard-3",
    animations: "Timeline 1",
    autoplay: false,
    // onLoad: () => console.log("load-finish")
  });
  const { rive: rive4, RiveComponent: RiveComponent4 } = useRive({
    src: "artboard-4.riv",
    artboard: "artboard-4",
    animations: "Timeline 1",
    autoplay: false,
    // onLoad: () => console.log("load-finish")
  });
  const { rive: rive5, RiveComponent: RiveComponent5 } = useRive({
    src: "artboard-5.riv",
    artboard: "artboard-5",
    animations: "Timeline 1",
    autoplay: false,
    // onLoad: () => console.log("load-finish")
  });
  const { rive: rive6, RiveComponent: RiveComponent6 } = useRive({
    src: "artboard-6.riv",
    artboard: "artboard-6",
    animations: "Timeline 1",
    autoplay: false,
    // onLoad: () => console.log("load-finish")
  });

  useEffect(() => {
    if (!rive1) return;
    rive1.reset({ artboard: "artboard-1" });
    rive1.scrub("Timeline 1", 0);
    rive1.play();
  }, [rive1]);
 
  // const sectionAnimationControllerRef = useRef(null);
  const HomeSectionRef = useRef(null);
  const howSectionRef = useRef(null);

  // useEffect(() => {
  //   if (!whyEntry) return
  //   if (!whatEntry) return
  //   if (!whereEntry) return
  //   if (!whoEntry) return
  //   if (!joinEntry) return

  //   console.log({
  //     whyEntry: whyEntry.target.clientHeight,
  //     whatEntry: whatEntry.target.clientHeight,
  //     whereEntry: whereEntry.target.clientHeight,
  //     whoEntry: whoEntry.target.clientHeight,
  //     joinEntry: joinEntry.target.clientHeight,
  //   })
  // }, [joinEntry, whatEntry, whereEntry, whoEntry, whyEntry])

  useEffect(() => {
    const checkResearcher = async () => {
      const researcherDoc = await firebase.db.collection("researchers").doc(fullname).get();
      if (researcherDoc.exists) {
        setNotAResearcher(false);
      }
    };
    if (firebase && fullname) {
      checkResearcher();
    }
  }, [firebase, fullname]);

  const getChildrenIndexSelected = (initialSectionHeight, childrenPosistions, scrollPosition) => {
    const res = childrenPosistions.reduce(
      (acu, cur, idx) => {
        const initialAnimationHeight = acu.height + cur.height;
        if (initialAnimationHeight > scrollPosition) return acu;
        return { height: initialAnimationHeight, idx };
      },
      { height: initialSectionHeight, idx: -1 }
    );

    return res.idx;
  };

  const scrollToSection = ({ height, sectionSelected }) => {
    window.document.getElementById("ScrollableContainer").scroll({ top: height, left: 0, behavior: "smooth" });

    window.history.replaceState(null, sectionSelected.title, "#" + sectionSelected.id);
  };

  const getSectionHeights = useCallback(() => {
    if (!HomeSectionRef?.current) return null;
    if (!howSectionRef?.current) return null;
    if (!whyEntry) return null;
    if (!whatEntry) return null;
    if (!whereEntry) return null;
    if (!whoEntry) return null;
    if (!joinEntry) return null;

    return [
      { id: HomeSectionRef.current.id, height: 0 },
      { id: howSectionRef.current.id, height: HomeSectionRef.current.clientHeight },
      { id: whyEntry.target.id, height: howSectionRef.current.clientHeight - HomeSectionRef.current.clientHeight },
      { id: whatEntry.target.id, height: whyEntry.target.clientHeight },
      { id: whereEntry.target.id, height: whatEntry.target.clientHeight },
      { id: whoEntry.target.id, height: whereEntry.target.clientHeight },
      { id: joinEntry.target.id, height: whoEntry.target.clientHeight }
    ];
  }, [joinEntry, whatEntry, whereEntry, whoEntry, whyEntry]);

  const getSectionPositions = useCallback(() => {
    if (!HomeSectionRef?.current) return null;
    if (!howSectionRef?.current) return null;
    if (!whyEntry) return null;
    if (!whatEntry) return null;
    if (!whereEntry) return null;
    if (!whoEntry) return null;
    if (!joinEntry) return null;

    return [
      { id: HomeSectionRef.current.id, height: HomeSectionRef.current.clientHeight },
      { id: howSectionRef.current.id, height: howSectionRef.current.clientHeight - HomeSectionRef.current.clientHeight },
      { id: whyEntry.target.id, height: whyEntry.target.clientHeight },
      { id: whatEntry.target.id, height: whatEntry.target.clientHeight },
      { id: whereEntry.target.id, height: whereEntry.target.clientHeight },
      { id: whoEntry.target.id, height: whoEntry.target.clientHeight },
      { id: joinEntry.target.id, height: joinEntry.target.clientHeight }
    ];
  }, [joinEntry, whatEntry, whereEntry, whoEntry, whyEntry]);

  const getAnimationsHeight = useCallback(() => {
    const res = artboards.map(artboard => artboard.getHeight(height));
    return [0, ...res.splice(0, res.length - 1)];
  }, [height]);

  const getAnimationsPositions = useCallback(() => {
    return artboards.map(artboard => artboard.getHeight(height));
  }, [height]);

  const detectScrollPosition = useCallback(
    (event, { rive1, rive2, rive3, rive4, rive5, rive6 }) => {
      if (!rive1 || !rive2 || !rive3 || !rive4 || !rive5 || !rive6) return;
      if (notSectionSwitching) {
        const currentScrollPosition = event.target.scrollTop;
        const sectionsHeight = getSectionPositions();
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
          animationsHeight = getAnimationsPositions();
        }

        const { maxAnimation, minAnimation, idxAnimation } = animationsHeight.reduce(
          (acu, cur, idx) => {
            if (acu.maxAnimation > currentScrollPosition) return acu;
            return { maxAnimation: acu.maxAnimation + cur, minAnimation: acu.maxAnimation, idxAnimation: idx };
          },
          { maxAnimation: min, minAnimation: min, idxAnimation: -1 }
        );

        const sectionSelected = sectionsTmp[idxSection];

        if (window.location.hash !== `#${sectionSelected.id}`) {
          console.log("repeeat")
          window.history.replaceState(null, sectionSelected.title, "#" + sectionSelected.id);
        }
        setSelectedSection(idxSection);
        setSelectedAnimation(idxAnimation);

        let showLandingOptions = false;
        let showEndAnimationOptions = false;

        if (idxAnimation < 0) return;

        if (idxSection === 0) {
          const lowerAnimationLimit = minAnimation;
          const upperAnimationLimit = maxAnimation;
          const rangeFrames = upperAnimationLimit - lowerAnimationLimit;
          const positionFrame = currentScrollPosition - lowerAnimationLimit;
          const percentageFrame = (positionFrame * 100) / rangeFrames;
          if (percentageFrame < 50) {
            setIdxRiveComponent(0);
          } else {
            const newLowerAnimationLimit = lowerAnimationLimit + rangeFrames / 2;
            const newPositionFrame = currentScrollPosition - newLowerAnimationLimit;
            const newPercentageFrame = (newPositionFrame * 100) / rangeFrames;
            const timeInSeconds = ((1000 / 1000) * newPercentageFrame) / 100;
            advanceAnimationTo(rive2, timeInSeconds);

            setIdxRiveComponent(1);
          }

          if (percentageFrame < 5) {
            showLandingOptions = true;
          }
        }

        if (idxSection === SECTION_WITH_ANIMATION) {
          setIdxRiveComponent(idxAnimation + 2);
          const lowerAnimationLimit = minAnimation;
          const upperAnimationLimit = maxAnimation;
          const rangeFrames = upperAnimationLimit - lowerAnimationLimit;
          const positionFrame = currentScrollPosition - lowerAnimationLimit;
          const percentageFrame = (positionFrame * 100) / rangeFrames;

          const timeInSeconds = (artboards[idxAnimation].durationMs * percentageFrame) / (1000 * 100);

          if (idxAnimation === 0) {
            advanceAnimationTo(rive3, timeInSeconds);
          }
          if (idxAnimation === 1) {
            advanceAnimationTo(rive4, timeInSeconds);
          }
          if (idxAnimation === 2) {
            advanceAnimationTo(rive5, timeInSeconds);
          }
          if (idxAnimation === 3) {
            advanceAnimationTo(rive6, timeInSeconds);
            if (percentageFrame > 50) {
              showEndAnimationOptions = true;
            }
          }
        }

        // update options display
        setShowLandingOptions(showLandingOptions);
        setShowAnimationOptions(showEndAnimationOptions);
      }
    },
    [getAnimationsPositions, getSectionPositions, height, setSelectedSection, notSectionSwitching]
  );

  const switchSection = useCallback(
    (sectionIdx, animationIndex = 0) => {
      if (!rive3 || !rive4 || !rive5 || !rive6) return;

      setNotSectionSwitching(false);
      const sectionsHeight = getSectionHeights();
      if (!sectionsHeight) return;

      const previousSections = sectionsHeight.slice(0, sectionIdx + 1);
      const sectionResult = previousSections.reduce((a, c) => ({ id: c.id, height: a.height + c.height }));

      let cumulativeAnimationHeight = 0;

      const animationsHeight = getAnimationsHeight();
      if (animationsHeight) {
        const previousAnimationHeight = animationsHeight.slice(0, animationIndex + 1);
        cumulativeAnimationHeight = previousAnimationHeight.reduce((a, c) => a + c);
      }
      const cumulativeHeight = sectionResult.height + cumulativeAnimationHeight;
      scrollToSection({ height: cumulativeHeight, sectionSelected: sectionsOrder[sectionIdx] });

      // setSelectedSection(sectionIdx);
      if (sectionIdx === 0) {
        setShowLandingOptions(true);
        setIdxRiveComponent(animationIndex);
      }
      if (sectionIdx === SECTION_WITH_ANIMATION) {
        setIdxRiveComponent(animationIndex + 2);
        // reset animation when jump through sections
        if (animationIndex === 0) {
          rive3.scrub("Timeline 1", 0);
        }
        if (animationIndex === 1) {
          rive4.scrub("Timeline 1", 0);
        }
        if (animationIndex === 2) {
          rive5.scrub("Timeline 1", 0);
        }
        if (animationIndex === 3) {
          rive6.scrub("Timeline 1", 0);
        }
      }

      setSelectedSection(sectionIdx);
      setSelectedAnimation(animationIndex);

      setTimeout(() => {
        setNotSectionSwitching(true);
      }, 1000);
    },
    [getAnimationsHeight, getSectionHeights, rive3, rive4, rive5, rive6]
  );


  const homeClick = event => {
    event.preventDefault();
    switchSection(-1);
  };

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

  const LinkTab = props => {
    return (
      <Tooltip title={props.titl}>
        <Tab
          onClick={event => {
            event.preventDefault();
            props.onClick(event);
          }}
          color="inherit"
          {...props}
        />
      </Tooltip>
    );
  };

  const thisPage = useMemo(() => {
    return sectionSelected === sectionsOrder.length - 2 ? "Apply!" : undefined;
  }, [sectionSelected]);

  return (
    <Box
      id="ScrollableContainer"
      onScroll={e => detectScrollPosition(e, { rive1, rive2, rive3, rive4, rive5, rive6 })}
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
        position: "relative",
        backgroundColor: "#28282a"
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
        <Box
          sx={{ position: "absolute", top: height, bottom: "0px", left: "0px", minWidth: "10px", maxWidth: "180px" }}
        >
          <Box sx={{ position: "sticky", top: "100px", zIndex: 11 }}>
            <MemoizedTableOfContent
              menuItems={sectionsTmp}
              viewType={isLargeDesktop ? "COMPLETE" : isDesktop ? "NORMAL" : "SIMPLE"}
              onChangeContent={switchSection}
              sectionSelected={sectionSelected}
              animationSelected={animationSelected}
            />
          </Box>
        </Box>

        <Stack
          ref={HomeSectionRef}
          spacing={width < 900 ? "10px" : "20px"}
          direction={"column"}
          alignItems={"center"}
          justifyContent="flex-end"
          sx={{
            height: "calc(100vh - 70px)",
            width: "100%",
            position: "absolute",
            top: 0,
            padding: width < 900 ? "10px" : "20px",
            backgroundColor: "#1d1102",
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        >
          <Typography
            color="white"
            variant="h5"
            sx={{ textAlign: "center" }}
            className={showLandingOptions ? "show-blurred-text" : "hide-content"}
          >
            WHERE WE TAKE NOTES <b>TOGETHER</b>.
          </Typography>
          <Button
            color="secondary"
            variant="contained"
            size={width < 900 ? "small" : "large"}
            component="a"
            href="#JoinUsSection"
            sx={{ minWidth: 200, color: "common.white" }}
            className={showLandingOptions ? "show-blurred-text" : "hide-content"}
          >
            Apply to Join Us!
          </Button>
          <Box
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", color: "common.white" }}
            className={showLandingOptions ? "show-blurred-text" : "hide-content"}
          >
            {height > 500 && "Scroll"}
            <KeyboardDoubleArrowDownIcon fontSize={width < 900 ? "small" : "medium"} />
          </Box>
        </Stack>

        <Box sx={{ width: "100%", maxWidth: "980px", px: isDesktop ? "0px" : "10px", margin: "auto" }}>
          <Box id={sectionsOrder[1].id} ref={howSectionRef}>
            <HowItWorks
              section={sectionSelected}
              // ref={sectionAnimationControllerRef}
              artboards={[...section1ArtBoards, ...artboards]}
              animationOptions={
                <Button
                  color="secondary"
                  variant="contained"
                  size={width < 900 ? "small" : "large"}
                  component="a"
                  href="#JoinUsSection"
                  sx={{ minWidth: 200, color: "common.white" }}
                  className={showAnimationOptions ? "show-blurred-text" : "hide-content"}
                >
                  Apply to Join Us!
                </Button>
              }
            >
              <Box sx={{ position: "relative", width: "inherit", height: "inherit" }}>
                <RiveComponent1 className={`rive-canvas ${idxRiveComponent !== 0 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent2 className={`rive-canvas ${idxRiveComponent !== 1 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent3 className={`rive-canvas ${idxRiveComponent !== 2 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent4 className={`rive-canvas ${idxRiveComponent !== 3 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent5 className={`rive-canvas ${idxRiveComponent !== 4 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent6 className={`rive-canvas ${idxRiveComponent !== 5 ? "rive-canvas-hidden" : ""}`} />
              </Box>
            </HowItWorks>
          </Box>
          <Box id={sectionsOrder[2].id} ref={whySectionRef }  sx={{ py: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{  pb: 10, color: "#f8f8f8" }}>
              {sectionsOrder[2].title}
            </CustomTypography>
            {!whyInViewOnce && <div style={{ height: 2 * height, /* background: "red" */ }}></div>}
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
          <Box id={sectionsOrder[3].id} ref={whatSectionRef}  sx={{ py: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{  pb: 10, color: "#f8f8f8" }}>
              {sectionsOrder[3].title}
            </CustomTypography>
            {!whatInViewOnce ? (
              <div style={{ height: 2 * height,/*  background: "yellow" */ }}></div>
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
          <Box id={sectionsOrder[4].id} ref={whereSectionRef}  sx={{ py: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{  pb: 10, color: "#f8f8f8" }}>
              {sectionsOrder[4].title}
            </CustomTypography>
            {!whereInViewOnce ? (
              <div style={{ height: 2 * height, /* background: "green" */ }}></div>
            ) : (
              <Suspense
                fallback={<Skeleton variant="rounded" height={490} animation="wave" sx={{ background: gray02 }} />}
              >
                <UniversitiesMap theme={"Dark"} />
              </Suspense>
            )}
          </Box>
          <Box id={sectionsOrder[5].id} ref={whoSectionRef}  sx={{ py: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{  pb: 10, color: "#f8f8f8" }}>
              {sectionsOrder[5].title}
            </CustomTypography>
            {!whoInViewOnce ? (
              <div style={{ height: 2 * height, /* background: "pink" */ }}></div>
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
          <Box id={sectionsOrder[6].id} ref={JoinSectionRef} sx={{ py: 10 }}>
            <CustomTypography variant="h4" marked="center" align="center" sx={{ pb: 10, color: "#f8f8f8" }}>
              {sectionsOrder[6].title}
            </CustomTypography>
            {!joinInViewOnce ? (
              <div style={{ height: 2 * height, /* background: "#b4f5ea" */ }}></div>
            ) : (
              <Suspense
                fallback={<Skeleton variant="rounded" height={490} animation="wave" sx={{ background: gray02 }} />}
              >
                <JoinUs />
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

const advanceAnimationTo = (rive, timeInSeconds) => {
  if (!rive?.animator?.animations[0]) return;

  const Animator = rive.animator.animations[0];
  Animator.instance.time = 0;
  Animator.instance.advance(timeInSeconds);
  Animator.instance.apply(1);
  rive.startRendering();
};
