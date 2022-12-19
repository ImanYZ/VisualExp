import LogoutIcon from "@mui/icons-material/Logout";
import BiotechIcon from "@mui/icons-material/Biotech";
import AccountCircle from "@mui/icons-material/AccountCircle";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import LogoDarkMode from "../../assets/DarkModeLogo.svg";
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

const artboards = [
  { name: "animation1", durationMs: 5000 },
  { name: "animation2", durationMs: 22000 },
  { name: "animation3", durationMs: 8000 },
  { name: "animation4", durationMs: 22000 },
  { name: "animation5", durationMs: 14000 },
  { name: "animation6", durationMs: 3000 }
]

const SECTION_WITH_ANIMATION = 1

const sectionsTmp = [
  { id: "LandingSection", active: true, title: "Home", children: [] },
  {
    id: "HowItWorksSection",
    active: false,
    title: "How We Work?",
    children: [
      { id: "animation1", title: "Problem" },
      { id: "animation2", title: "Searching" },
      { id: "animation3", title: "Summarizing" },
      { id: "animation4", title: "Linking" },
      { id: "animation5", title: "Evaluating/Improving" },
      { id: "animation6", title: "Join us" },
    ]
  },
  { id: "ValuesSection", active: false, title: "Why 1Cademy?", children: [] },
  { id: "CommunitiesSection", active: false, title: "What we study?", children: [] },
  { id: "SchoolsSection", active: false, title: "Where Are We?", children: [] },
  { id: "WhoWeAreSection", active: false, title: "Who Is Behind 1Cademy?", children: [] },
  { id: "JoinUsSection", active: false, title: "Apply to Join Us!", children: [] },
]
function Index() {
  const firebase = useRecoilValue(firebaseState);
  const [section, setSection] = useState(0);
  const [notSectionSwitching, setNotSectionSwitching] = useState(true);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const [email, setEmail] = useRecoilState(emailState);
  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [notAResearcher, setNotAResearcher] = useRecoilState(notAResearcherState);
  const [sections, setSections] = useState(sectionsTmp)
  const navigateTo = useNavigate();
  const [ap, setAP] = useState(0)
  const matches = useMediaQuery('(min-width:1200px)');
  const isMovil = useMediaQuery('(max-width:600px)');

  const { rive, RiveComponent } = useRive({
    src: "gg.riv",
    stateMachines: artboards[0].name,
    autoplay: false,
    onLoad: () => console.log('load-finish')
  });

  useEffect(() => {
    if (!rive) return
    rive.reset({ artboard: artboards[0].name })
    rive.scrub("Timeline 1", 0)
  }, [rive])

  // const step0Ref = useRef(null);
  const sectionAnimationControllerRef = useRef(null)
  const section1Ref = useRef(null)
  const section2Ref = useRef(null)
  const section3Ref = useRef(null)
  const section4Ref = useRef(null)
  const section5Ref = useRef(null)
  const section6Ref = useRef(null)
  const section7Ref = useRef(null)

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
    return <RiveComponent
      // onMouseEnter={() => rive && rive.play()}
      // onMouseLeave={() => rive && rive.pause()}
      className="rive-canvas"
    />
  }, [])


  const getChildrenIndexSelected = (initialSectionHeight, childrenPosistions, scrollPosition) => {
    const res = childrenPosistions.reduce((acu, cur, idx) => {
      const initialAnimationHeight = acu.height + cur.height
      if (initialAnimationHeight > scrollPosition) return acu
      return { height: initialAnimationHeight, idx }
    }, { height: initialSectionHeight, idx: -1 })

    return res.idx
  }

  const detectScrollPosition = (event) => {
    if (!rive) return
    if (notSectionSwitching) {
      const currentScrollPosition = event.target.scrollTop

      const sectionsHeight = getSectionPositions()
      const { max, min, idx: idxSection } = sectionsHeight.reduce((acu, cur, idx) => {
        if (acu.max > currentScrollPosition) return acu
        return { max: acu.max + cur.height, min: acu.max, idx }
      }, { max: 0, min: 0, idx: -1 })

      if (idxSection < 0) return

      const animationsHeight = getAnimationsPositions()


      const { maxAnimation, minAnimation, idxAnimation } = animationsHeight.reduce((acu, cur, idx) => {
        // console.log({ ...acu, cur, currentScrollPosition })
        if (acu.maxAnimation > currentScrollPosition) return acu
        return { maxAnimation: acu.maxAnimation + cur, minAnimation: acu.maxAnimation, idxAnimation: idx }
      }, { maxAnimation: min, minAnimation: min, idxAnimation: -1 })

      const sectionSelected = sections[idxSection]
      window.history.replaceState(null, sectionSelected.title, "#" + sectionSelected.id);
      setSection(idxSection)

      setSections(prev => prev.map((cur, idx) => {
        if (idxSection !== idx) return { ...cur, children: cur.children.map(c => ({ ...c, active: false })), active: false }
        const childrenFixed = cur.children.map((c, i) => {
          if (idxAnimation !== i) return { ...c, active: false }
          return { ...c, active: true }
        })
        return { ...cur, active: true, children: childrenFixed }
      }))

      if (idxSection < SECTION_WITH_ANIMATION) {
        // show first artboard and first frame
        rive.reset({ artboard: artboards[0].name })
        rive.scrub("Timeline 1", 0)
      }
      if (idxSection > SECTION_WITH_ANIMATION) {
        // show last artboard and last frame
        rive.reset({ artboard: artboards[artboards.length - 1].name })
        rive.scrub("Timeline 1", artboards[artboards.length - 1].durationMs / 1000)
      }
      if (idxSection === SECTION_WITH_ANIMATION) {
        // check local percentage
        const lowerAnimationLimit = minAnimation
        const upperAnimationLimit = maxAnimation
        const rangeFrames = upperAnimationLimit - lowerAnimationLimit
        const positionFrame = currentScrollPosition - lowerAnimationLimit
        const percentageFrame = positionFrame * 100 / rangeFrames
        setAP(percentageFrame)
        // console.log('xx:--->', { percentageFrame })

        rive.reset({ artboard: artboards[idxAnimation].name })
        const timeInSeconds = artboards[idxAnimation].durationMs / 1000 * percentageFrame / 100
        rive.scrub("Timeline 1", timeInSeconds)
      }
    }
  };

  const scrollToSection = ({ height, sectionSelected }) => {
    window.document.getElementById("ScrollableContainer")
      .scroll({ top: height, left: 0, behavior: "smooth" });

    window.history.replaceState(null, sectionSelected.title, "#" + sectionSelected.id);
  }

  const getSectionHeights = useCallback(() => {
    if (!section1Ref?.current) return null
    if (!section2Ref?.current) return null
    if (!section3Ref?.current) return null
    if (!section4Ref?.current) return null
    if (!section5Ref?.current) return null
    if (!section6Ref?.current) return null
    if (!section7Ref?.current) return null

    return [
      { id: section1Ref.current.id, height: 0 },
      { id: section2Ref.current.id, height: section1Ref.current.clientHeight },
      { id: section3Ref.current.id, height: section2Ref.current.clientHeight },
      { id: section4Ref.current.id, height: section3Ref.current.clientHeight },
      { id: section5Ref.current.id, height: section4Ref.current.clientHeight },
      { id: section6Ref.current.id, height: section5Ref.current.clientHeight },
      { id: section7Ref.current.id, height: section6Ref.current.clientHeight },
    ]
  }, [])

  const getSectionPositions = useCallback(() => {
    if (!section1Ref?.current) return null
    if (!section2Ref?.current) return null
    if (!section3Ref?.current) return null
    if (!section4Ref?.current) return null
    if (!section5Ref?.current) return null
    if (!section6Ref?.current) return null
    if (!section7Ref?.current) return null

    return [
      { id: section1Ref.current.id, height: section1Ref.current.clientHeight },
      { id: section2Ref.current.id, height: section2Ref.current.clientHeight },
      { id: section3Ref.current.id, height: section3Ref.current.clientHeight },
      { id: section4Ref.current.id, height: section4Ref.current.clientHeight },
      { id: section5Ref.current.id, height: section5Ref.current.clientHeight },
      { id: section6Ref.current.id, height: section6Ref.current.clientHeight },
      { id: section7Ref.current.id, height: section7Ref.current.clientHeight },
    ]
  }, [])

  const getAnimationsHeight = useCallback(() => {
    if (!sectionAnimationControllerRef.current) return null

    const animation0Height = 0
    const animation1Height = sectionAnimationControllerRef.current.getAnimation0Height()
    const animation2Height = sectionAnimationControllerRef.current.getAnimation1Height()
    const animation3Height = sectionAnimationControllerRef.current.getAnimation2Height()
    const animation4Height = sectionAnimationControllerRef.current.getAnimation3Height()
    const animation5Height = sectionAnimationControllerRef.current.getAnimation4Height()
    const animation6Height = sectionAnimationControllerRef.current.getAnimation5Height()
    return [animation0Height, animation1Height, animation2Height, animation3Height, animation4Height, animation5Height, animation6Height]
  }, [])

  const getAnimationsPositions = useCallback(() => {
    if (!sectionAnimationControllerRef.current) return null

    const animation0Height = sectionAnimationControllerRef.current.getAnimation0Height()
    const animation1Height = sectionAnimationControllerRef.current.getAnimation1Height()
    const animation2Height = sectionAnimationControllerRef.current.getAnimation2Height()
    const animation3Height = sectionAnimationControllerRef.current.getAnimation3Height()
    const animation4Height = sectionAnimationControllerRef.current.getAnimation4Height()
    const animation5Height = sectionAnimationControllerRef.current.getAnimation5Height()
    const animation6Height = sectionAnimationControllerRef.current.getAnimation6Height()
    return [animation0Height, animation1Height, animation2Height, animation3Height, animation4Height, animation5Height, animation6Height]
  }, [])

  const switchSection = (newValue, animationIndex = 0) => {

    setNotSectionSwitching(false);
    const sectionsHeight = getSectionHeights()
    if (!sectionsHeight) return

    const previousSections = sectionsHeight.slice(0, newValue + 1)
    const sectionResult = previousSections.reduce((a, c) => ({ id: c.id, height: a.height + c.height }))

    let cumulativeAnimationHeight = 0

    const animationsHeight = getAnimationsHeight()
    if (animationsHeight) {

      const previousAnimationHeight = animationsHeight.slice(0, animationIndex + 1)
      cumulativeAnimationHeight = previousAnimationHeight.reduce((a, c) => a + c)
    }
    const cumulativeHeight = sectionResult.height + cumulativeAnimationHeight
    scrollToSection({ height: cumulativeHeight, sectionSelected: sectionsOrder[newValue] })

    setSection(newValue)
    // set animation and  frame
    if (newValue < SECTION_WITH_ANIMATION) {
      rive.reset({ artboard: artboards[0].name })
      rive.scrub("Timeline 1", 0)
    }
    if (newValue > SECTION_WITH_ANIMATION) {
      rive.reset({ artboard: artboards[artboards.length - 1].name })
      rive.scrub("Timeline 1", artboards[artboards.length - 1].durationMs / 1000)
    }
    if (newValue === SECTION_WITH_ANIMATION) {
      rive.reset({ artboard: artboards[animationIndex].name })
      rive.scrub("Timeline 1", 0)
    }

    // change selected item in TOC
    setSections(prev => prev.map((cur, idx) => {
      if (newValue !== idx) return { ...cur, children: cur.children.map(c => ({ ...c, active: false })), active: false }
      const childrenFixed = cur.children.map((c, i) => {
        if (animationIndex !== i) return { ...c, active: false }
        return { ...c, active: true }
      })
      return { ...cur, active: true, children: childrenFixed }
    }))

    setTimeout(() => {
      setNotSectionSwitching(true);
    }, 1000);
  };

  const homeClick = (event) => {
    event.preventDefault();
    switchSection(-1)
  };

  const joinUsClick = (event) => {
    event.preventDefault();
    switchSection(sectionsOrder.length - 1)
  };

  const handleProfileMenuOpen = (event) => {
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

  const signOut = async (event) => {
    console.log("Signing out!");
    setEmail("");
    setFullname("");
    await firebase.logout();
    navigateTo("/");
  };

  const renderProfileMenu = (
    <Menu
      id="ProfileMenu"
      anchorEl={profileMenuOpen}
      open={isProfileMenuOpen}
      onClose={handleProfileMenuClose}
    >
      {fullname && email && (
        <MenuItem
          disabled
          sx={{ flexGrow: 3, color: "black", opacity: "1 !important" }}
        >
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
  }

  const LinkTab = (props) => {
    return (
      <Tooltip title={props.titl}>
        <Tab
          onClick={(event) => {
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
    return section === sectionsOrder.length - 2 ? "Apply!" : undefined
  }, [section])

  return (
    // <ThemeProvider theme={theme("dark")}>
    <Box
      id="ScrollableContainer"
      onScroll={detectScrollPosition}
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
        position: "relative",
        backgroundColor: "#28282a",
        // zIndex: -3
      }}
    >
      {/* <AppAppBar
        section={section}
        joinNowSec={section === sectionsOrder.length - 2}
        switchSection={switchSection}
        homeClick={homeClick}
        joinUsClick={joinUsClick}
        thisPage={section === sectionsOrder.length - 2 ? "Apply!" : undefined}
      /> */}

      <Box component={'header'} sx={{ position: "sticky", width: "100%", top: "0px", zIndex: 12, display: "flex", justifyContent: "center" }}>
        <Box sx={{ height: "70px", width: "100%", background: "rgba(0,0,0,.72)", backdropFilter: "saturate(180%) blur(20px)", filter: 'blur(1px)', }} />
        <Box sx={{ width: "100%", maxWidth: "980px", height: "70px", px: matches ? "0px" : "10px", position: "absolute", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack spacing={"20px"} alignItems={"center"} justifyContent={"space-between"} direction={"row"} sx={{ color: "#f8f8f8" }}>
            <img src={LogoDarkMode} alt="logo" width="52px" />

            {!isMovil && <>
              <Tooltip title={sectionsOrder[1].title}>
                <Typography sx={{ cursor: "pointer", borderBottom: section === 1 ? "solid 2px orange" : undefined }} onClick={() => switchSection(1)}>{sectionsOrder[1].label}</Typography>
              </Tooltip>
              <Tooltip title={sectionsOrder[2].title}>
                <Typography sx={{ cursor: "pointer", borderBottom: section === 2 ? "solid 2px orange" : undefined }} onClick={() => switchSection(2)}>{sectionsOrder[2].label}</Typography>
              </Tooltip>
              <Tooltip title={sectionsOrder[3].title}>
                <Typography sx={{ cursor: "pointer", borderBottom: section === 3 ? "solid 2px orange" : undefined }} onClick={() => switchSection(3)}>{sectionsOrder[3].label}</Typography>
              </Tooltip>
              <Tooltip title={sectionsOrder[4].title}>
                <Typography sx={{ cursor: "pointer", borderBottom: section === 4 ? "solid 2px orange" : undefined }} onClick={() => switchSection(4)}>{sectionsOrder[4].label}</Typography>
              </Tooltip>
              <Tooltip title={sectionsOrder[5].title}>
                <Typography sx={{ cursor: "pointer", borderBottom: section === 5 ? "solid 2px orange" : undefined }} onClick={() => switchSection(5)}>{sectionsOrder[5].label}</Typography>
              </Tooltip>
            </>
            }
          </Stack>
          <Box>
            {(
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
                    borderRadius: 40,
                  }}
                >
                  Apply!
                </Button>
              </Tooltip>
            )}
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
                  color="inherit"
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

      <Box id={sectionsOrder[0].id} ref={section1Ref}>
        <Landing />
      </Box>

      <Box sx={{ position: "relative" }}>

        {matches && <Box sx={{ position: "absolute", top: "0px", bottom: "0px", left: "0px", minWidth: "100px", maxWidth: "180px", }}>
          <Box sx={{ position: "sticky", top: "100px", zIndex: 10 }}>
            <TableOfContent menuItems={sections} onChangeContent={(idx, idxAnimation) => {
              console.log('called switchSection', idx, idxAnimation)
              switchSection(idx, idxAnimation)
            }} />
          </Box>
        </Box>}

        <Box sx={{ width: "100%", maxWidth: "980px", px: matches ? "0px" : "10px", margin: "auto", }}>
          <Box id={sectionsOrder[1].id} ref={section2Ref} >
            <HowItWorks section={section} riveComponent={RiveComponentMemo} ref={sectionAnimationControllerRef} />
          </Box>
          <Box id={sectionsOrder[2].id} ref={section3Ref}>
            <Values /> {/* why */}
          </Box>
          <Box id={sectionsOrder[3].id} ref={section4Ref} >
            <What />
          </Box>
          <Box id={sectionsOrder[4].id} ref={section5Ref}>
            <UniversitiesMap theme={"Light"} />
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
    </Box >
    // </ThemeProvider>
  );
}

export default withRoot(Index);
