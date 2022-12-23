import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import AnimatediconLoop from "../../assets/AnimatediconLoop.gif";
import backgroundImage from "../../assets/darkModeLibraryBackground.jpg";
import LogoutIcon from "@mui/icons-material/Logout";
import BiotechIcon from "@mui/icons-material/Biotech";
import AccountCircle from "@mui/icons-material/AccountCircle";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import LogoDarkMode from "../../assets/DarkModeLogoMini.png";
import Box from "@mui/material/Box";

import What from "./modules/views/What";
import AppFooter from "./modules/views/AppFooter";
import Landing from "./modules/views/Landing";
import Values from "./modules/views/Values";
import HowItWorks from "./modules/views/HowItWorks";
import WhoWeAre from "./modules/views/WhoWeAre";

import JoinUs from "./modules/views/JoinUs";
import withRoot from "./modules/withRoot";

import sectionsOrder from "./modules/views/sectionsOrder";
import UniversitiesMap from "./modules/views/UniversitiesMap/UniversitiesMap";
import { Button, IconButton, Menu, MenuItem, Stack, Tab, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { useRecoilState, useRecoilValue } from "recoil";
import { emailState, firebaseState, fullnameState } from "../../store/AuthAtoms";
import { useNavigate } from "react-router-dom";
import { notAResearcherState } from "../../store/ProjectAtoms";
import { TableOfContent } from "./modules/components/TableOfContent";
import { useRive } from "rive-react/dist";
import { useWindowSize } from "./hooks/useWindowSize";

const HEADER_HEIGTH = 70;

const section1ArtBoards = [{ name: "artboard-1", durationMs: 2000, getHeight: vh => vh - HEADER_HEIGTH, color: "#ff28c9" }]
const artboards = [
  // { name: "artboard-1", durationMs: 2000, getHeight: vh => vh - HEADER_HEIGTH, color: "#ff28c9" },
  { name: "artboard-2", durationMs: 7000, getHeight: vh => 6 * vh, color: "#f33636" },
  { name: "artboard-3", durationMs: 22000, getHeight: vh => 8 * vh, color: "#f38b36" },
  { name: "artboard-4", durationMs: 5000, getHeight: vh => 5 * vh, color: "#e6f336" },
  { name: "artboard-5", durationMs: 8300, getHeight: vh => 8 * vh, color: "#62f336" },
  { name: "artboard-6", durationMs: 2000, getHeight: vh => 2 * vh, color: "#36f3ca" },

  // { name: "animation1", durationMs: 8000 },
  // { name: "animation2", durationMs: 22000 },
  // { name: "animation3", durationMs: 5000 },
  // { name: "animation4", durationMs: 8500 },
  // { name: "animation5", durationMs: 2000 },
  // { name: "animation6", durationMs: 3000 }
];

const SECTION_WITH_ANIMATION = 1;

const sectionsTmp = [
  { id: "LandingSection", active: true, title: "Home", simpleTitle: "Home", children: [] },
  {
    id: "HowItWorksSection",
    active: false,
    title: "How We Work?",
    simpleTitle: "How?",
    children: [
      // { id: "animation1", title: "Problem", simpleTitle: "Problem", },
      // { id: "animation2", title: "Searching", simpleTitle: "Searching", },
      { id: "animation1", title: "Summarizing", simpleTitle: "Summarizing" },
      { id: "animation2", title: "Linking", simpleTitle: "Linking" },
      { id: "animation3", title: "Evaluating", simpleTitle: "Evaluating" },
      { id: "animation4", title: "Improving", simpleTitle: "Improving" },
      { id: "animation5", title: "Join us", simpleTitle: "Join us" }
    ]
  },
  { id: "ValuesSection", active: false, title: "Why 1Cademy?", simpleTitle: "Why?", children: [] },
  { id: "CommunitiesSection", active: false, title: "What we study?", simpleTitle: "What?", children: [] },
  { id: "SchoolsSection", active: false, title: "Where Are We?", simpleTitle: "Where?", children: [] },
  { id: "WhoWeAreSection", active: false, title: "Who Is Behind 1Cademy?", simpleTitle: "Who?", children: [] },
  { id: "JoinUsSection", active: false, title: "Apply to Join Us!", simpleTitle: "Apply", children: [] }
];
function Index() {
  const firebase = useRecoilValue(firebaseState);
  const [section, setSection] = useState(0);
  const [animation, setAnimation] = useState(0);
  const [notSectionSwitching, setNotSectionSwitching] = useState(true);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const [email, setEmail] = useRecoilState(emailState);
  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [notAResearcher, setNotAResearcher] = useRecoilState(notAResearcherState);
  const [sections, setSections] = useState(sectionsTmp);
  const navigateTo = useNavigate();
  const [ap, setAP] = useState(0);
  const [idxRiveComponent, setIdxRiveComponent] = useState(0);
  const isLargeDesktop = useMediaQuery("(min-width:1350px)");
  const isDesktop = useMediaQuery("(min-width:1200px)");
  const isMovil = useMediaQuery("(max-width:600px)");
  const previousScrubValue = useRef(0)

  const { height, width } = useWindowSize();

  const { rive: rive1, RiveComponent: RiveComponent1 } = useRive({
    src: "artboard-1.riv",
    artboard: "artboard-1",
    autoplay: false,
    onLoad: () => console.log("load-finish")
  });

  const { rive: rive2, RiveComponent: RiveComponent2 } = useRive({
    src: "artboard-2.riv",
    artboard: "artboard-2",
    autoplay: false,
    onLoad: () => console.log("load-finish")
  });
  const { rive: rive3, RiveComponent: RiveComponent3 } = useRive({
    src: "artboard-3.riv",
    artboard: "artboard-3",
    autoplay: false,
    onLoad: () => console.log("load-finish")
  });
  const { rive: rive4, RiveComponent: RiveComponent4 } = useRive({
    src: "artboard-4.riv",
    artboard: "artboard-4",
    autoplay: false,
    onLoad: () => console.log("load-finish")
  });
  const { rive: rive5, RiveComponent: RiveComponent5 } = useRive({
    src: "artboard-5.riv",
    artboard: "artboard-5",
    autoplay: false,
    onLoad: () => console.log("load-finish")
  });
  const { rive: rive6, RiveComponent: RiveComponent6 } = useRive({
    src: "artboard-6.riv",
    artboard: "artboard-6",
    autoplay: false,
    onLoad: () => console.log("load-finish")
  });
  const { rive: rive7, RiveComponent: RiveComponent7 } = useRive({
    src: "artboard-7.riv",
    artboard: "artboard-7",
    autoplay: false,
    onLoad: () => console.log("load-finish")
  });

  useEffect(() => {
    if (!rive1) return;
    rive1.reset({ artboard: "artboard-1" });
    rive1.scrub("Timeline 1", 0);
    rive1.play();
  }, [rive1]);

  // const step0Ref = useRef(null);
  const sectionAnimationControllerRef = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);
  const section5Ref = useRef(null);
  const section6Ref = useRef(null);
  const section7Ref = useRef(null);

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

  const RiveComponentMemo = useMemo(() => {
    if (idxRiveComponent === 0) {
      return <RiveComponent1 className="rive-canvas" />;
    }
    if (idxRiveComponent === 1) {
      return <RiveComponent2 className="rive-canvas" />;
    }
    if (idxRiveComponent === 2) {
      return <RiveComponent3 className="rive-canvas" />;
    }
    if (idxRiveComponent === 3) {
      return <RiveComponent4 className="rive-canvas" />;
    }
    if (idxRiveComponent === 4) {
      return <RiveComponent5 className="rive-canvas" />;
    }
    if (idxRiveComponent === 5) {
      return <RiveComponent6 className="rive-canvas" />;
    }
    if (idxRiveComponent === 6) {
      return <RiveComponent7 className="rive-canvas" />;
    }

    return null;
  }, [idxRiveComponent]);



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

  const advanceAnimationTo=(rive,timeInSeconds)=>{    
    if(!rive?.animator?.animations[0]) return

    const Animator = rive.animator.animations[0];
    Animator.instance.time = 0
    Animator.instance.advance(timeInSeconds)
    Animator.instance.apply(1)
    rive.startRendering()
  }

  const detectScrollPosition = event => {
    console.log('detectScrollPosition')
    // console.log({ rive1 });
    if (!rive1 || !rive2 || !rive3 || !rive4 || !rive5 || !rive6 || !rive7) return;
    // if (!sectionAnimationControllerRef?.current) return
    if (notSectionSwitching) {
      
      const currentScrollPosition = event.target.scrollTop;
      console.log("currentScrollPosition",currentScrollPosition)
      const sectionsHeight = getSectionPositions();
      // console.log("sectionsHeight", sectionsHeight);
      const { min, idx: idxSection } = sectionsHeight.reduce(
        (acu, cur, idx) => {
          if (acu.max > currentScrollPosition) return acu;
          return { max: acu.max + cur.height, min: acu.max, idx };
        },
        { max: 0, min: 0, idx: -1 }
      );

      if (idxSection < 0) return;

      let animationsHeight = []
      if (idxSection === 0) {
        animationsHeight = [section1ArtBoards[0].getHeight(height)];
      } else {
        animationsHeight = getAnimationsPositions();
      }


      // const sectionHeight = sectionAnimationControllerRef.current.getSectionHeaderHeight()

      const { maxAnimation, minAnimation, idxAnimation } = animationsHeight.reduce(
        (acu, cur, idx) => {
          // console.log({ ...acu, cur, currentScrollPosition })
          if (acu.maxAnimation > currentScrollPosition) return acu;
          return { maxAnimation: acu.maxAnimation + cur, minAnimation: acu.maxAnimation, idxAnimation: idx };
        },
        { maxAnimation: min, minAnimation: min, idxAnimation: -1 }
      );

      console.log({ animationsHeight, maxAnimation, minAnimation, idxAnimation })

      const sectionSelected = sections[idxSection];
      window.history.replaceState(null, sectionSelected.title, "#" + sectionSelected.id);
      setSection(idxSection);
      setAnimation(idxAnimation);

      setSections(prev =>
        prev.map((cur, idx) => {
          if (idxSection !== idx)
            return { ...cur, children: cur.children.map(c => ({ ...c, active: false })), active: false };
          const childrenFixed = cur.children.map((c, i) => {
            if (idxAnimation !== i) return { ...c, active: false };
            return { ...c, active: true };
          });
          return { ...cur, active: true, children: childrenFixed };
        })
      );
      // console.log({ idxSection, idxAnimation });

      if (idxAnimation < 0) return;

      if (idxSection === 0) {
        const lowerAnimationLimit = minAnimation;
        const upperAnimationLimit = maxAnimation;
        const rangeFrames = upperAnimationLimit - lowerAnimationLimit;
        const positionFrame = currentScrollPosition - lowerAnimationLimit;
        const percentageFrame = (positionFrame * 100) / rangeFrames;
        // console.log({ percentageFrame });
        if (percentageFrame < 50) {
          // show loop logo
          // console.log("<");
          // rive1.scrub("Timeline 1", 0);
          // rive1.play();
          setIdxRiveComponent(0);
        } else {
          const newLowerAnimationLimit = lowerAnimationLimit + rangeFrames / 2;
          const newPositionFrame = currentScrollPosition - newLowerAnimationLimit;
          const newPercentageFrame = (newPositionFrame * 100) / (rangeFrames);
          const timeInSeconds = ((1000 / 1000)  * newPercentageFrame) / 100;
          advanceAnimationTo(rive2,timeInSeconds)
          
          setIdxRiveComponent(1);
        }
      }

      if (idxSection === SECTION_WITH_ANIMATION) {
        // replace canvas
        setIdxRiveComponent(idxAnimation + 2);
        // check local percentage
        const lowerAnimationLimit = minAnimation
        const upperAnimationLimit = maxAnimation
        const rangeFrames = upperAnimationLimit - lowerAnimationLimit
        const positionFrame = currentScrollPosition - lowerAnimationLimit
        const percentageFrame = positionFrame * 100 / rangeFrames
        // console.log("minAnimation", { minAnimation, maxAnimation, percentageFrame })
        setAP(percentageFrame)
        // console.log({ idxAnimation })
        const timeInSeconds = artboards[idxAnimation].durationMs*percentageFrame / (1000*100)

        console.log({ timeInSeconds, idxAnimation })

        if (idxAnimation === 0) {
          advanceAnimationTo(rive3,timeInSeconds)
        }
        if (idxAnimation === 1) {
          advanceAnimationTo(rive4,timeInSeconds)
        }
        if (idxAnimation === 2) {
          advanceAnimationTo(rive5,timeInSeconds)
        }
        if (idxAnimation === 3) {
          advanceAnimationTo(rive6,timeInSeconds)
        }
        if (idxAnimation === 4) {
          advanceAnimationTo(rive7,timeInSeconds)
        }
      }




      // if (idxSection < SECTION_WITH_ANIMATION) {
      //   // show first artboard and first frame
      //   rive.reset({ artboard: artboards[0].name })
      //   rive.scrub("Timeline 1", 0)
      // }
      // if (idxSection > SECTION_WITH_ANIMATION) {
      //   // show last artboard and last frame
      //   rive.reset({ artboard: artboards[artboards.length - 1].name })
      //   rive.scrub("Timeline 1", artboards[artboards.length - 1].durationMs / 1000)
      // }
      // if (idxSection === SECTION_WITH_ANIMATION) {
      //   // check local percentage
      //   const lowerAnimationLimit = minAnimation
      //   const upperAnimationLimit = maxAnimation
      //   const rangeFrames = upperAnimationLimit - lowerAnimationLimit
      //   const positionFrame = currentScrollPosition - lowerAnimationLimit
      //   const percentageFrame = positionFrame * 100 / rangeFrames
      //   setAP(percentageFrame)
      //   // console.log('xx:--->', { percentageFrame })

      //   rive.reset({ artboard: artboards[idxAnimation].name })
      //   const timeInSeconds = artboards[idxAnimation].durationMs / 1000 * percentageFrame / 100
      //   rive.scrub("Timeline 1", timeInSeconds)
      // }
    }
  };

  const scrollToSection = ({ height, sectionSelected }) => {
    window.document.getElementById("ScrollableContainer").scroll({ top: height, left: 0, behavior: "smooth" });

    window.history.replaceState(null, sectionSelected.title, "#" + sectionSelected.id);
  };

  const getSectionHeights = useCallback(() => {
    if (!section1Ref?.current) return null;
    if (!section2Ref?.current) return null;
    if (!section3Ref?.current) return null;
    if (!section4Ref?.current) return null;
    if (!section5Ref?.current) return null;
    if (!section6Ref?.current) return null;
    if (!section7Ref?.current) return null;

    return [
      { id: section1Ref.current.id, height: 0 },
      { id: section2Ref.current.id, height: section1Ref.current.clientHeight },
      { id: section3Ref.current.id, height: section2Ref.current.clientHeight - section1Ref.current.clientHeight },
      { id: section4Ref.current.id, height: section3Ref.current.clientHeight },
      { id: section5Ref.current.id, height: section4Ref.current.clientHeight },
      { id: section6Ref.current.id, height: section5Ref.current.clientHeight },
      { id: section7Ref.current.id, height: section6Ref.current.clientHeight }
    ];
  }, []);

  const getSectionPositions = useCallback(() => {
    if (!section1Ref?.current) return null;
    if (!section2Ref?.current) return null;
    if (!section3Ref?.current) return null;
    if (!section4Ref?.current) return null;
    if (!section5Ref?.current) return null;
    if (!section6Ref?.current) return null;
    if (!section7Ref?.current) return null;

    return [
      { id: section1Ref.current.id, height: section1Ref.current.clientHeight },
      { id: section2Ref.current.id, height: section2Ref.current.clientHeight - section1Ref.current.clientHeight },
      { id: section3Ref.current.id, height: section3Ref.current.clientHeight },
      { id: section4Ref.current.id, height: section4Ref.current.clientHeight },
      { id: section5Ref.current.id, height: section5Ref.current.clientHeight },
      { id: section6Ref.current.id, height: section6Ref.current.clientHeight },
      { id: section7Ref.current.id, height: section7Ref.current.clientHeight }
    ];
  }, []);

  const getAnimationsHeight = useCallback(() => {
    const res = artboards.map(artboard => artboard.getHeight(height))
    return [0, ...res.splice(0, res.length - 1)]
  }, [height]);

  const getAnimationsPositions = useCallback(() => {
    return artboards.map(artboard => artboard.getHeight(height));
  }, [height]);

  const switchSection = (sectionIdx, animationIndex = 0) => {
    // console.log({ sectionIdx, animationIndex })
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
    // console.log({ cumulativeHeight, sectionIdx, animationIndex, sectionsHeight, animationsHeight })
    scrollToSection({ height: cumulativeHeight, sectionSelected: sectionsOrder[sectionIdx] });

    setSection(sectionIdx);
    // set animation and  frame
    // if (newValue < SECTION_WITH_ANIMATION) {
    //   rive.reset({ artboard: artboards[0].name })
    //   rive.scrub("Timeline 1", 0)
    // }
    if (sectionIdx === 0) {
      // rive1.reset({ artboard: artboards[0].name });
      // rive7.scrub("Timeline 1", artboards[artboards.length - 1].durationMs / 1000);
      setIdxRiveComponent(animationIndex);
    }
    // if (sectionIdx > SECTION_WITH_ANIMATION) {
    //   rive7.reset({ artboard: artboards[artboards.length - 1].name });
    //   rive7.scrub("Timeline 1", artboards[artboards.length - 1].durationMs / 1000);
    // }
    if (sectionIdx === SECTION_WITH_ANIMATION) {
      setIdxRiveComponent(animationIndex + 2);
      // rive3.reset({ artboard: artboards[animationIndex].name });
      // rive3.scrub("Timeline 1", 0);
    }

    // change selected item in TOC
    setSections(prev =>
      prev.map((cur, idx) => {
        if (sectionIdx !== idx)
          return { ...cur, children: cur.children.map(c => ({ ...c, active: false })), active: false };
        const childrenFixed = cur.children.map((c, i) => {
          if (animationIndex !== i) return { ...c, active: false };
          return { ...c, active: true };
        });
        return { ...cur, active: true, children: childrenFixed };
      })
    );

    setTimeout(() => {
      setNotSectionSwitching(true);
    }, 1000);
  };

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
        <>
          {
            <MenuItem sx={{ flexGrow: 3 }} onClick={navigateToExperiment}>
              <BiotechIcon /> <span id="ExperimentActivities">Experiment Activities</span>
            </MenuItem>
          }
          <MenuItem sx={{ flexGrow: 3 }} onClick={signOut}>
            <LogoutIcon /> <span id="LogoutText">Logout</span>
          </MenuItem>
        </>
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
    return section === sectionsOrder.length - 2 ? "Apply!" : undefined;
  }, [section]);

  return (
    <Box
      id="ScrollableContainer"
      onScroll={detectScrollPosition}
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
            backdropFilter: "saturate(180%) blur(20px)",
            // filter: "blur(1px)"
          }}
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
            <img src={LogoDarkMode} alt="logo" width="52px" />

            {!isMovil && (
              <>
                <Tooltip title={sectionsOrder[1].title}>
                  <Typography
                    sx={{ cursor: "pointer", borderBottom: section === 1 ? "solid 2px orange" : undefined }}
                    onClick={() => switchSection(1)}
                  >
                    {sectionsOrder[1].label}
                  </Typography>
                </Tooltip>
                <Tooltip title={sectionsOrder[2].title}>
                  <Typography
                    sx={{ cursor: "pointer", borderBottom: section === 2 ? "solid 2px orange" : undefined }}
                    onClick={() => switchSection(2)}
                  >
                    {sectionsOrder[2].label}
                  </Typography>
                </Tooltip>
                <Tooltip title={sectionsOrder[3].title}>
                  <Typography
                    sx={{ cursor: "pointer", borderBottom: section === 3 ? "solid 2px orange" : undefined }}
                    onClick={() => switchSection(3)}
                  >
                    {sectionsOrder[3].label}
                  </Typography>
                </Tooltip>
                <Tooltip title={sectionsOrder[4].title}>
                  <Typography
                    sx={{ cursor: "pointer", borderBottom: section === 4 ? "solid 2px orange" : undefined }}
                    onClick={() => switchSection(4)}
                  >
                    {sectionsOrder[4].label}
                  </Typography>
                </Tooltip>
                <Tooltip title={sectionsOrder[5].title}>
                  <Typography
                    sx={{ cursor: "pointer", borderBottom: section === 5 ? "solid 2px orange" : undefined }}
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
                  edge="end"
                  aria-haspopup="true"
                  aria-controls="lock-menu"
                  aria-label={`${fullname}'s Account`}
                  aria-expanded={isProfileMenuOpen ? "true" : undefined}
                  onClick={handleProfileMenuOpen}
                  color="common.white"
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="SIGN IN/UP">
                <Button
                  variant="contained"
                  onClick={signUpHandler}
                  size={isMovil ? "small" : "medium"}
                  sx={{
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
        <Box sx={{ position: "absolute", top: height, bottom: "0px", left: "0px", minWidth: "10px", maxWidth: "180px" }}>
          <Box sx={{ position: "sticky", top: "100px", zIndex: 11 }}>
            {/* <h2 style={{ color: "white" }}>{idxRiveComponent}</h2>
            <h2 style={{ color: "white" }}>{ap.toFixed(1)}%</h2> */}

            <TableOfContent
              menuItems={sections}
              viewType={isLargeDesktop ? "COMPLETE" : isDesktop ? "NORMAL" : "SIMPLE"}
              onChangeContent={(idx, idxAnimation) => {
                // console.log("called switchSection", idx, idxAnimation);
                switchSection(idx, idxAnimation);
              }}
              customSx={{}}
            />
          </Box>
        </Box>

        <Stack
          ref={section1Ref}
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
            backgroundRepeat: "no-repeat",

          }}
        >
          {/* Increase the network loading priority of the background image. */}
          {/* <img
            style={{ display: "none" }}
            src={backgroundImage}
            alt="increase priority"
          />
          <img src={AnimatediconLoop} alt="Animated Logo" width="190px" /> */}
          <Typography color="white" variant="h5" sx={{ textAlign: "center" }} className="show-blurred-text">
            WHERE WE TAKE NOTES <b>TOGETHER</b>.
          </Typography>
          <Button
            color="secondary"
            variant="contained"
            size={width < 900 ? "small" : "large"}
            component="a"
            href="#JoinUsSection"
            sx={{ minWidth: 200, color: "common.white" }}
          >
            Apply to Join Us!
          </Button>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", color: "common.white" }}>
            {height > 500 && "Scroll"}
            <KeyboardDoubleArrowDownIcon fontSize={width < 900 ? "small" : "medium"} />
          </Box>
        </Stack>

        <Box sx={{ width: "100%", maxWidth: "980px", px: isDesktop ? "0px" : "10px", margin: "auto" }}>
          <Box id={sectionsOrder[1].id} ref={section2Ref}>
            <HowItWorks section={section} ref={sectionAnimationControllerRef} artboards={[...section1ArtBoards, ...artboards]}>
              <Box sx={{ position: "relative", width: "inherit", height: "inherit" }}>
                <RiveComponent1 className={`rive-canvas ${idxRiveComponent !== 0 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent2 className={`rive-canvas ${idxRiveComponent !== 1 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent3 className={`rive-canvas ${idxRiveComponent !== 2 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent4 className={`rive-canvas ${idxRiveComponent !== 3 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent5 className={`rive-canvas ${idxRiveComponent !== 4 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent6 className={`rive-canvas ${idxRiveComponent !== 5 ? "rive-canvas-hidden" : ""}`} />
                <RiveComponent7 className={`rive-canvas ${idxRiveComponent !== 6 ? "rive-canvas-hidden" : ""}`} />
              </Box>
            </HowItWorks>
          </Box>
          <Box id={sectionsOrder[2].id} ref={section3Ref} className={section === 2 ? "slide-left-to-right" : ""}>
            <Values /> {/* why */}
          </Box>
          <Box id={sectionsOrder[3].id} ref={section4Ref} >
            <What />
          </Box>
          <Box id={sectionsOrder[4].id} ref={section5Ref}>
            {/* <UniversitiesMap theme={"Dark"} />
             */}
             as'dkajs;dlas;ldkjas;lkdj

          </Box>
          <Box id={sectionsOrder[5].id} ref={section6Ref}>
            <WhoWeAre />
          </Box>
          <Box id={sectionsOrder[6].id} ref={section7Ref}>
            <JoinUs />
          </Box>
        </Box>
      </Box>
      <AppFooter />
      <link rel="preload" href="artboard-1.riv" as="fetch" crossOrigin="anonymous" />
    </Box >
  );
}

export default withRoot(Index);
