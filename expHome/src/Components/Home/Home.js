import LogoutIcon from "@mui/icons-material/Logout";
import BiotechIcon from "@mui/icons-material/Biotech";
import AccountCircle from "@mui/icons-material/AccountCircle";
import React, { useEffect, useMemo, useRef, useState } from "react";

import LogoDarkMode from "../../assets/DarkModeLogo.svg";
import Box from "@mui/material/Box";

import What from "./modules/views/What";
import AppFooter from "./modules/views/AppFooter";
import Landing from "./modules/views/Landing";
import Values from "./modules/views/Values";
import HowItWorks from "./modules/views/HowItWorks";
import WhoWeAre from "./modules/views/WhoWeAre";
import AppAppBar from "./modules/views/AppAppBar";
import JoinUs from "./modules/views/JoinUs";
import withRoot from "./modules/withRoot";

import sectionsOrder from "./modules/views/sectionsOrder";
import UniversitiesMap from "./modules/views/UniversitiesMap/UniversitiesMap";
import { useRive } from "@rive-app/react-canvas";
import { Button, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { useRecoilState, useRecoilValue } from "recoil";
import { emailState, firebaseState, fullnameState } from "../../store/AuthAtoms";
import { useNavigate } from "react-router-dom";
import { notAResearcherState } from "../../store/ProjectAtoms";

const artboards = [
  { name: "animation1", durationMs: 5000 },
  { name: "animation2", durationMs: 30000 },
  { name: "animation3", durationMs: 8000 },
  { name: "animation4", durationMs: 22000 },
  { name: "animation5", durationMs: 13000 },
  { name: "animation6", durationMs: 3000 }
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
  const navigateTo = useNavigate();

  const { rive, RiveComponent } = useRive({
    src: "gg.riv",
    stateMachines: artboards[0].name,
    autoplay: false,
  });

  const step0Ref = useRef(null);
  const sectionAnimationControllerRef = useRef(null)
  const section1Ref = useRef(null)
  const section2Ref = useRef(null)
  const section3Ref = useRef(null)
  const section4Ref = useRef(null)
  const section5Ref = useRef(null)
  const section6Ref = useRef(null)

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

  const onScrollAnimation = (target) => {
    const scrollOffset = target.scrollTop
    const scrollTotal = target.scrollHeight - window.innerHeight
    const percentage = 100 * scrollOffset / scrollTotal
    // setScrollPercentage(percentage)

    if (!section1Ref.current) return
    if (!section2Ref.current) return
    if (!section3Ref.current) return
    if (!section4Ref.current) return
    if (!section5Ref.current) return
    if (!section6Ref.current) return
    // const pageHeight = target.scrollHeight
    const section1Height = section1Ref.current.clientHeight
    const section2Height = section2Ref.current.clientHeight
    const section3Height = section3Ref.current.clientHeight
    const section4Height = section4Ref.current.clientHeight
    const section5Height = section5Ref.current.clientHeight
    const section6Height = section6Ref.current.clientHeight

    const sectionsHeight = [section1Height, section2Height, section3Height, section4Height, section5Height, section6Height]
    const animationSectionIndex = 1

    const { index, cumulativeHeight } = sectionsHeight.reduce((acu, cur, idx) => {
      if (acu.index >= 0) return acu
      const newCumulativeHeight = acu.cumulativeHeight + cur
      if (scrollOffset < newCumulativeHeight) return { cumulativeHeight: newCumulativeHeight, index: idx }
      return { ...acu, cumulativeHeight: newCumulativeHeight }
    }, { cumulativeHeight: 0, index: -1 })

    if (index < 0) return Error('cant detect current` section')

    if (index < animationSectionIndex) {
      // show first artboard and first frame
      rive.reset({ artboard: artboards[0].name })
      rive.scrub("Timeline 1", 0)
    }
    if (index > animationSectionIndex) {
      // show last artboard and last frame
      rive.reset({ artboard: artboards[artboards.length - 1].name })
      rive.scrub("Timeline 1", artboards[artboards.length - 1].durationMs / 1000)
    }
    if (index === animationSectionIndex) {
      console.log('Scroll in animation section')
      // check local percentage
      const lowerLimit = cumulativeHeight - sectionsHeight[animationSectionIndex]
      const upperLimit = cumulativeHeight

      const rangeAnimation = upperLimit - lowerLimit
      const positionAnimation = scrollOffset - lowerLimit
      const percentageAnimation = positionAnimation * 100 / rangeAnimation
      console.log({ percentageAnimation })
      // setAnimationScrollPercentage(percentageAnimation)

      // get animation section selected
      if (!sectionAnimationControllerRef.current) return

      const animation1Height = sectionAnimationControllerRef.current.getAnimation1Height()
      const animation2Height = sectionAnimationControllerRef.current.getAnimation2Height()
      const animation3Height = sectionAnimationControllerRef.current.getAnimation3Height()
      const animation4Height = sectionAnimationControllerRef.current.getAnimation4Height()
      const animation5Height = sectionAnimationControllerRef.current.getAnimation5Height()
      const animation6Height = sectionAnimationControllerRef.current.getAnimation6Height()

      const animationsHeight = [animation1Height, animation2Height, animation3Height, animation4Height, animation5Height, animation6Height]

      console.log({ lowerLimit })

      const { indexAnimation, cumulativeAnimationHeight } = animationsHeight.reduce((acu, cur, idx) => {
        if (acu.indexAnimation >= 0) return acu
        const cumulativeAnimationHeight = acu.cumulativeAnimationHeight + cur
        // console.log(1, { acu })
        // console.log(2, '<', { scrollOffset, cumulativeAnimationHeight })
        if (scrollOffset < cumulativeAnimationHeight) return { cumulativeAnimationHeight, indexAnimation: idx }
        return { ...acu, cumulativeAnimationHeight }
      }, { cumulativeAnimationHeight: lowerLimit, indexAnimation: -1 })

      if (indexAnimation < 0) return Error('cant detect current animation')

      console.log('--->', { indexAnimation, cumulativeAnimationHeight })

      const lowerAnimationLimit = cumulativeAnimationHeight - animationsHeight[indexAnimation]
      const upperAnimationLimit = cumulativeAnimationHeight

      const rangeFrames = upperAnimationLimit - lowerAnimationLimit
      const positionFrame = scrollOffset - lowerAnimationLimit
      const percentageFrame = positionFrame * 100 / rangeFrames
      console.log({ lowerAnimationLimit, upperAnimationLimit, rangeFrames, positionFrame })
      console.log('percentageFrame', percentageFrame.toFixed(1))

      rive.reset({ artboard: artboards[indexAnimation].name })
      const timeInSeconds = artboards[indexAnimation].durationMs / 1000 * percentageFrame / 100
      rive.scrub("Timeline 1", timeInSeconds)
      // setFramePercentage(percentageFrame)
    }

  }

  const RiveComponentMemo = useMemo(() => {
    return <RiveComponent
      // onMouseEnter={() => rive && rive.play()}
      // onMouseLeave={() => rive && rive.pause()}
      className="rive-canvas"
    />
  }, [])

  const updatePosition = (event) => {
    console.log('updatePosition')
    onScrollAnimation(event.currentTarget)

    if (notSectionSwitching) {
      let cumulativeHeight = 0;
      for (let sIdx = 0; sIdx < sectionsOrder.length; sIdx++) {
        const sectOffsetHeight = window.document.getElementById(
          sectionsOrder[sIdx].id
        ).scrollHeight;
        cumulativeHeight += sectOffsetHeight;
        if (event.target.scrollTop < cumulativeHeight) {
          setSection(sIdx - 1);
          window.history.replaceState(
            null,
            sectionsOrder[sIdx].title,
            "#" + sectionsOrder[sIdx].id
          );
          break;
        }
      }
    }
  };

  const switchSection = (newValue) => (event) => {
    setNotSectionSwitching(false);
    setSection(newValue);
    let cumulativeHeight = 0;
    for (let sIdx = -1; sIdx < newValue; sIdx++) {
      const sectOffsetHeight = window.document.getElementById(
        sectionsOrder[sIdx + 1].id
      ).scrollHeight;
      cumulativeHeight += sectOffsetHeight;
    }
    window.document.getElementById("ScrollableContainer").scroll({
      top: cumulativeHeight,
      left: 0,
      behavior: "smooth",
    });
    // document
    //   .getElementById(sectionsOrder[newValue + 1].id)
    //   .scrollIntoView({
    //     block: "start",
    //     inline: "nearest",
    //     behavior: "smooth",
    //   });
    window.history.replaceState(
      null,
      sectionsOrder[newValue + 1].title,
      "#" + sectionsOrder[newValue + 1].id
    );
    setTimeout(() => {
      setNotSectionSwitching(true);
    }, 1000);
  };

  const homeClick = (event) => {
    event.preventDefault();
    switchSection(-1)(event);
  };

  const joinUsClick = (event) => {
    event.preventDefault();
    switchSection(sectionsOrder.length - 2)(event);
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

  return (
    <Box
      id="ScrollableContainer"
      onScroll={updatePosition}
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
        position: "relative"
        // background: "red"
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
      <Box component={'header'} sx={{ position: "sticky", top: "0px", left: "0px", right: "0px", zIndex: 10 }}>
        <Box sx={{ height: "70px", width: "100%", position: "absolute", background: "#0000008f", filter: 'blur(2px)', }} />
        <Box sx={{ height: "70px", width: "100%", position: "absolute", color: "#f8f8f8", display: "flex", justifyContent: "space-between", alignItems: "center", px: "10px" }} component={'nav'}>
          <Box>
            <img src={LogoDarkMode} alt="logo" width="52px" />
          </Box>
          <Box>
            {!(section === sectionsOrder.length - 2) && (
              <Tooltip title="Apply to join 1Cademy">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={joinUsClick}
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
          </Box>
          {fullname && renderProfileMenu}
        </Box>
      </Box>
      <Box id="step-0" ref={section1Ref}>
        <Landing />
      </Box>
      <Box ref={section2Ref} sx={{ background: "yellow" }}>
        <HowItWorks section={section} riveComponent={RiveComponentMemo} ref={sectionAnimationControllerRef} />
      </Box>
      <Box ref={section3Ref}>
        <What />
      </Box>
      <Box ref={section4Ref}>
        <Values />
      </Box>
      {/* <UniversitiesMap theme={"Light"} /> */}
      <Box ref={section5Ref}>
        <WhoWeAre />
      </Box>
      <Box ref={section6Ref}>
        <JoinUs />
      </Box>
      <AppFooter />
    </Box>
  );
}

export default withRoot(Index);
