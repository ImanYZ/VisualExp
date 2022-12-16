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
import AppAppBar from "./modules/views/AppAppBar";
import JoinUs from "./modules/views/JoinUs";
import withRoot from "./modules/withRoot";

import sectionsOrder from "./modules/views/sectionsOrder";
import UniversitiesMap from "./modules/views/UniversitiesMap/UniversitiesMap";
import { useRive } from "@rive-app/react-canvas";
import { Button, IconButton, Menu, MenuItem, Tooltip, useMediaQuery } from "@mui/material";
import { useRecoilState, useRecoilValue } from "recoil";
import { colorModeState, emailState, firebaseState, fullnameState } from "../../store/AuthAtoms";
import { useNavigate } from "react-router-dom";
import { notAResearcherState } from "../../store/ProjectAtoms";
import { TableOfContent } from "./modules/components/TableOfContent";
import { ThemeProvider } from "@mui/styles";
import theme from "./modules/theme";




const artboards = [
  { name: "animation1", durationMs: 5000 },
  { name: "animation2", durationMs: 22000 },
  { name: "animation3", durationMs: 8000 },
  { name: "animation4", durationMs: 22000 },
  { name: "animation5", durationMs: 13000 },
  { name: "animation6", durationMs: 3000 }
]

const SECTION_WITH_ANIMATION = 1

const sectionsTmp = [
  { id: "LandingSection", active: true, title: "1Cademy's Landing Page", children: [] },
  {
    id: "HowItWorksSection",
    active: false,
    title: "How We Work",
    children: [
      { id: "animation1", title: "Start" },
      { id: "animation2", title: "Searching" },
      { id: "animation3", title: "Summary" },
      { id: "animation4", title: "Pathway" },
      { id: "animation5", title: "Evaluate Nodes" },
      { id: "animation6", title: "End" },
    ]
  },
  { id: "CommunitiesSection", active: false, title: "Our Communities", children: [] },
  { id: "ValuesSection", active: false, title: "Why 1Cademy Helps", children: [] },
  { id: "SchoolsSection", active: false, title: "Where Are We From?", children: [] },
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

  // const matches = useMediaQuery(theme.breakpoints.up('lg'));
  const matches = useMediaQuery('(min-width:1200px)');

  // const [ap,setAP] =(0)

  const { rive, RiveComponent } = useRive({
    src: "gg.riv",
    stateMachines: artboards[0].name,
    autoplay: false,
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

  const onScrollAnimation = (target) => {

    if (!notSectionSwitching) return

    console.log('on-scroll')
    const scrollOffset = target.scrollTop

    const sectionsPositions = getSectionHeights()
    console.log({ sectionsHeight: sectionsPositions })
    if (!sectionsPositions) return

    // console.log({sectionsHeight})
    console.log('---------------->>', { sectionsPositions })
    const { startSection, idx: idxSectionSelected } = sectionsPositions.reduce((acu, cur, idx) => {
      const endSection = cur.height + acu.endSection
      if (scrollOffset > endSection) {// scrollPosition is not in cur section
        return { ...acu, endSection, startSection: acu.endSection }
      }
      return { endSection, startSection: acu.endSection, idx }
    }, { endSection: 0, startSection: 0, idx: -1 })
    // const { index: currentSectionIndex, min: cumulativeHeight } = sectionsPositions.reduce((acu, cur, idx) => {
    //   if (acu.index >= 0) return acu
    //   const max = acu.max + cur.height
    //   console.log({ scrollOffset, newCumulativeHeight: max })
    //   if (scrollOffset <= acu.min) return { max: max, index: idx, min: acu.min }//
    //   return { ...acu, max: max, min: acu.min }
    // }, { max: 0, min: 0, index: -1 })

    console.log({ startSection, idxSectionSelected, scrollOffset })

    console.log('<<----------------')
    // if (currentSectionIndex < 0) return Error('cant detect current` section')
    // const animationSectionIndex = 1

    // console.log({ currentSectionIndex, animationSectionIndex })
    // if (currentSectionIndex < animationSectionIndex) {
    //   // show first artboard and first frame
    //   rive.reset({ artboard: artboards[0].name })
    //   rive.scrub("Timeline 1", 0)
    // }
    // if (currentSectionIndex > animationSectionIndex) {
    //   // show last artboard and last frame
    //   rive.reset({ artboard: artboards[artboards.length - 1].name })
    //   rive.scrub("Timeline 1", artboards[artboards.length - 1].durationMs / 1000)
    // }

    // console.log('SECTION-ID', currentSectionIndex, animationSectionIndex)
    // if (currentSectionIndex === animationSectionIndex) {
    //   // check local percentage
    //   const lowerLimit = cumulativeHeight - sectionsPositions[animationSectionIndex]
    //   // const upperLimit = cumulativeHeight

    //   // const rangeAnimation = upperLimit - lowerLimit
    //   // const positionAnimation = scrollOffset - lowerLimit
    //   // const percentageAnimation = positionAnimation * 100 / rangeAnimation
    //   // console.log({ percentageAnimation })
    //   // setAnimationScrollPercentage(percentageAnimation)

    //   // get animation section selected
    //   // if (!sectionAnimationControllerRef.current) return

    //   // const animation1Height = sectionAnimationControllerRef.current.getAnimation1Height()
    //   // const animation2Height = sectionAnimationControllerRef.current.getAnimation2Height()
    //   // const animation3Height = sectionAnimationControllerRef.current.getAnimation3Height()
    //   // const animation4Height = sectionAnimationControllerRef.current.getAnimation4Height()
    //   // const animation5Height = sectionAnimationControllerRef.current.getAnimation5Height()
    //   // const animation6Height = sectionAnimationControllerRef.current.getAnimation6Height()

    //   // const animationsHeight = [animation1Height, animation2Height, animation3Height, animation4Height, animation5Height, animation6Height]

    //   const animationsHeight = getAnimationsPositions()
    //   // let cumulativeAnimationHeight = 0
    //   if (animationsHeight) {
    //     console.log({ animationsHeight })
    //     const { indexAnimation, cumulativeAnimationHeight } = animationsHeight.reduce((acu, cur, idx) => {
    //       if (acu.indexAnimation >= 0) return acu
    //       const cumulativeAnimationHeight = acu.cumulativeAnimationHeight + cur
    //       if (scrollOffset < cumulativeAnimationHeight) return { cumulativeAnimationHeight, indexAnimation: idx }
    //       return { ...acu, cumulativeAnimationHeight }
    //     }, { cumulativeAnimationHeight: lowerLimit, indexAnimation: -1 })
    //     console.log({ cumulativeAnimationHeight, indexAnimation })
    //     if (indexAnimation < 0) return Error('cant detect current animation')

    //     const lowerAnimationLimit = cumulativeAnimationHeight - animationsHeight[indexAnimation]
    //     const upperAnimationLimit = cumulativeAnimationHeight

    //     const rangeFrames = upperAnimationLimit - lowerAnimationLimit
    //     const positionFrame = scrollOffset - lowerAnimationLimit
    //     const percentageFrame = positionFrame * 100 / rangeFrames

    //     rive.reset({ artboard: artboards[indexAnimation].name })
    //     const timeInSeconds = artboards[indexAnimation].durationMs / 1000 * percentageFrame / 100
    //     rive.scrub("Timeline 1", timeInSeconds)
    //   }
    //   setSections(prev => {
    //     const tt = prev.map((cur, idx) => {
    //       if (idx === animationSectionIndex) {
    //         const animationSection = { ...cur, active: true }
    //         return animationSection
    //       }
    //       return { ...cur, active: false }
    //     })

    //     return tt
    //   })
    //   // setFramePercentage(percentageFrame)
    // }

  }

  // const onScrollAnimation = (target) => {
  //   console.log('on-scroll')
  //   const scrollOffset = target.scrollTop
  //   // const scrollTotal = target.scrollHeight - window.innerHeight
  //   // const percentage = 100 * scrollOffset / scrollTotal
  //   // setScrollPercentage(percentage)

  //   if (!section1Ref.current) return
  //   if (!section2Ref.current) return
  //   if (!section3Ref.current) return
  //   if (!section4Ref.current) return
  //   if (!section5Ref.current) return
  //   if (!section6Ref.current) return
  //   if (!section7Ref.current) return
  //   // const pageHeight = target.scrollHeight
  //   const section1Height = section1Ref.current.clientHeight
  //   const section2Height = section2Ref.current.clientHeight
  //   const section3Height = section3Ref.current.clientHeight
  //   const section4Height = section4Ref.current.clientHeight
  //   const section5Height = section5Ref.current.clientHeight
  //   const section6Height = section6Ref.current.clientHeight
  //   const section7Height = section7Ref.current.clientHeight

  //   const sectionsHeight = [section1Height, section2Height, section3Height, section4Height, section5Height, section6Height, section7Height]
  //   const animationSectionIndex = 1

  //   const { index, cumulativeHeight } = sectionsHeight.reduce((acu, cur, idx) => {
  //     if (acu.index >= 0) return acu
  //     const newCumulativeHeight = acu.cumulativeHeight + cur
  //     if (scrollOffset < newCumulativeHeight) return { cumulativeHeight: newCumulativeHeight, index: idx }
  //     return { ...acu, cumulativeHeight: newCumulativeHeight }
  //   }, { cumulativeHeight: 0, index: -1 })

  //   console.log('INDEX', index)
  //   if (index < 0) return Error('cant detect current` section')

  //   if (index < animationSectionIndex) {
  //     // show first artboard and first frame
  //     rive.reset({ artboard: artboards[0].name })
  //     rive.scrub("Timeline 1", 0)
  //   }
  //   if (index > animationSectionIndex) {
  //     // show last artboard and last frame
  //     rive.reset({ artboard: artboards[artboards.length - 1].name })
  //     rive.scrub("Timeline 1", artboards[artboards.length - 1].durationMs / 1000)
  //   }

  //   if (index === animationSectionIndex) {
  //     console.log('Scroll in animation section')
  //     // check local percentage
  //     const lowerLimit = cumulativeHeight - sectionsHeight[animationSectionIndex]
  //     const upperLimit = cumulativeHeight

  //     const rangeAnimation = upperLimit - lowerLimit
  //     const positionAnimation = scrollOffset - lowerLimit
  //     const percentageAnimation = positionAnimation * 100 / rangeAnimation
  //     console.log({ percentageAnimation })
  //     // setAnimationScrollPercentage(percentageAnimation)

  //     // get animation section selected
  //     if (!sectionAnimationControllerRef.current) return

  //     const animation1Height = sectionAnimationControllerRef.current.getAnimation1Height()
  //     const animation2Height = sectionAnimationControllerRef.current.getAnimation2Height()
  //     const animation3Height = sectionAnimationControllerRef.current.getAnimation3Height()
  //     const animation4Height = sectionAnimationControllerRef.current.getAnimation4Height()
  //     const animation5Height = sectionAnimationControllerRef.current.getAnimation5Height()
  //     const animation6Height = sectionAnimationControllerRef.current.getAnimation6Height()

  //     const animationsHeight = [animation1Height, animation2Height, animation3Height, animation4Height, animation5Height, animation6Height]

  //     console.log({ lowerLimit })

  //     const { indexAnimation, cumulativeAnimationHeight } = animationsHeight.reduce((acu, cur, idx) => {
  //       if (acu.indexAnimation >= 0) return acu
  //       const cumulativeAnimationHeight = acu.cumulativeAnimationHeight + cur
  //       // console.log(1, { acu })
  //       // console.log(2, '<', { scrollOffset, cumulativeAnimationHeight })
  //       if (scrollOffset < cumulativeAnimationHeight) return { cumulativeAnimationHeight, indexAnimation: idx }
  //       return { ...acu, cumulativeAnimationHeight }
  //     }, { cumulativeAnimationHeight: lowerLimit, indexAnimation: -1 })

  //     console.log('INDEX_ANIMATION', indexAnimation)

  //     if (indexAnimation < 0) return Error('cant detect current animation')

  //     console.log('--->', { indexAnimation, cumulativeAnimationHeight })

  //     const lowerAnimationLimit = cumulativeAnimationHeight - animationsHeight[indexAnimation]
  //     const upperAnimationLimit = cumulativeAnimationHeight

  //     const rangeFrames = upperAnimationLimit - lowerAnimationLimit
  //     const positionFrame = scrollOffset - lowerAnimationLimit
  //     const percentageFrame = positionFrame * 100 / rangeFrames
  //     console.log({ lowerAnimationLimit, upperAnimationLimit, rangeFrames, positionFrame })
  //     console.log('percentageFrame', percentageFrame.toFixed(1))

  //     rive.reset({ artboard: artboards[indexAnimation].name })
  //     const timeInSeconds = artboards[indexAnimation].durationMs / 1000 * percentageFrame / 100
  //     rive.scrub("Timeline 1", timeInSeconds)



  //     setSections(prev => {
  //       const tt = prev.map((cur, idx) => {
  //         if (idx === animationSectionIndex) {
  //           // console.log('cur-section', cur)
  //           // let childrenCopy = cur.children.map(c => ({ ...c, active: false }))
  //           // childrenCopy[indexAnimation].active = true
  //           // console.log('cur-section:childrenCopy', childrenCopy)
  //           // const animationSection = { ...cur, active: true, children: childrenCopy }
  //           const animationSection = { ...cur }
  //           return animationSection
  //         }
  //         return { ...cur, active: false }
  //       })

  //       console.log({ tt })
  //       return tt
  //     })
  //     // setFramePercentage(percentageFrame)
  //   }

  // }

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
    console.log('update_Position', event.target.scrollTop)
    // onScrollAnimation(event.currentTarget)



    if (notSectionSwitching) {
      const currentScrollPosition = event.target.scrollTop

      const sectionsHeight = getSectionPositions()
      const { max, min, idx: idxSection } = sectionsHeight.reduce((acu, cur, idx) => {
        if (acu.max > currentScrollPosition) return acu
        return { max: acu.max + cur.height, min: acu.max, idx }
      }, { max: 0, min: 0, idx: -1 })

      // console.log('xx:1>', { max, min, idx: idxSection })

      if (idxSection < 0) return

      const animationsHeight = getAnimationsPositions()


      const { maxAnimation, minAnimation, idxAnimation } = animationsHeight.reduce((acu, cur, idx) => {
        // console.log({ ...acu, cur, currentScrollPosition })
        if (acu.maxAnimation > currentScrollPosition) return acu
        return { maxAnimation: acu.maxAnimation + cur, minAnimation: acu.maxAnimation, idxAnimation: idx }
      }, { maxAnimation: min, minAnimation: min, idxAnimation: -1 })
      // console.log('xx:2>', { maxAnimation, minAnimation, idxAnimation, animationsHeight })
      // console.log('xx:--->', { idxSection, idxAnimation })

      // let childrenCopy = sections[idxSection].children.map((c, i) => {
      //   if(idxAnimation!==i) return {...c,active:false}
      //   return {...c,active:false}
      // }
      //   if (i !== idxAnimation) return { ...c }

      // })
      const sectionSelected = sections[idxSection]
      window.history.replaceState(null, sectionSelected.title, "#" + sectionSelected.id);

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

  // const updatePosition = (event) => {
  //   console.log('update_Position')
  //   // onScrollAnimation(event.currentTarget)



  //   if (notSectionSwitching) {
  //     const currentScrollPosition = event.target.scrollTop
  //     let cumulativeHeight = 0;
  //     for (let sIdx = 0; sIdx < sectionsOrder.length; sIdx++) {
  //       const sectOffsetHeight = window.document.getElementById(
  //         sectionsOrder[sIdx].id
  //       ).scrollHeight;
  //       cumulativeHeight += sectOffsetHeight;
  //       if (currentScrollPosition < cumulativeHeight) {
  //         // execute 1 time
  //         console.log('----->update_Position: sIndex', sIdx)
  //         const cumulativeHeightCopy = cumulativeHeight
  //         setSection(sIdx - 1);
  //         setSections(prev => prev.map((cur, idx) => {
  //           if (idx !== sIdx) return { ...cur, active: false }
  //           const animationPositions = getAnimationsHeight()
  //           if (!animationPositions) return { ...cur, active: true }

  //           console.log({ cumulativeHeightCopy, animationPositions, currentScrollPosition })
  //           const childrenIdxSelected = getChildrenIndexSelected(cumulativeHeightCopy, animationPositions, currentScrollPosition)
  //           console.log({ childrenIdxSelected })
  //           if (!childrenIdxSelected < 0) return { ...cur, active: true }

  //           console.log('----->update_Position: childrenIdxSelected', childrenIdxSelected)
  //           let childrenCopy = [...cur.children]
  //           childrenCopy[childrenIdxSelected] = true
  //           const sectionCopy = { ...cur, children: childrenCopy, active: true }
  //           console.log('----->update_Position: sectionCopy', sectionCopy)
  //           return sectionCopy

  //         }))

  //         window.history.replaceState(
  //           null,
  //           sectionsOrder[sIdx].title,
  //           "#" + sectionsOrder[sIdx].id
  //         );
  //         break;
  //       }
  //     }

  //   }
  // };

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

  // const scrollToSection = ({ height, sectionSelected }) => {
  //   window.document.getElementById("ScrollableContainer")
  //     .scroll({ top: height, left: 0, behavior: "smooth" });

  //   window.history.replaceState(null, sectionSelected.title, "#" + sectionSelected.id);
  // }

  // const switchSection = (newValue, animationIndex = -1) => {
  //   console.log(1)
  //   setNotSectionSwitching(false);
  //   setSection(newValue);
  //   let cumulativeHeight = 0;
  //   console.log(2)
  //   for (let sIdx = -1; sIdx < newValue; sIdx++) {
  //     const sectOffsetHeight = window.document.getElementById(
  //       sectionsOrder[sIdx + 1].id
  //     ).scrollHeight;
  //     cumulativeHeight += sectOffsetHeight;
  //   }

  //   console.log('move to an animation-prev', { newValue, animationIndex })
  //   // if (animationIndex >= 0) {
  //   if (!sectionAnimationControllerRef.current) return

  //   const animation1Height = sectionAnimationControllerRef.current.getAnimation1Height()
  //   const animation2Height = sectionAnimationControllerRef.current.getAnimation2Height()
  //   const animation3Height = sectionAnimationControllerRef.current.getAnimation3Height()
  //   const animation4Height = sectionAnimationControllerRef.current.getAnimation4Height()
  //   const animation5Height = sectionAnimationControllerRef.current.getAnimation5Height()
  //   const animation6Height = sectionAnimationControllerRef.current.getAnimation6Height()
  //   const animationsHeight = [animation1Height, animation2Height, animation3Height, animation4Height, animation5Height, animation6Height]

  //   const cumulativeAnimationHeight = animationsHeight.slice(0, animationIndex).reduce((a, c) => a + c)

  //   console.log({ hh: animationsHeight.slice(0, animationIndex), cumulativeAnimationHeight })
  //   // -1
  //   // const { cumulativeAnimationHeight } = animationsHeight.reduce((acu, cur, idx) => {
  //   //   if (idx <= animationIndex) return acu

  //   //   const cumulativeAnimationHeight = acu.cumulativeAnimationHeight + cur
  //   //   return { cumulativeAnimationHeight, indexAnimation: idx }
  //   // }, { cumulativeAnimationHeight: 0, indexAnimation: -1 })

  //   cumulativeHeight += cumulativeAnimationHeight
  //   console.log('move to an animation', { cumulativeHeight })
  //   // }
  //   scrollToSection({ height: cumulativeHeight, sectionSelected: sectionsOrder[newValue + 1] })
  //   // console.log(3)
  //   // window.document.getElementById("ScrollableContainer").scroll({
  //   //   top: cumulativeHeight,
  //   //   left: 0,
  //   //   behavior: "smooth",
  //   // });
  //   // console.log(5)
  //   // // document
  //   // //   .getElementById(sectionsOrder[newValue + 1].id)
  //   // //   .scrollIntoView({
  //   // //     block: "start",
  //   // //     inline: "nearest",
  //   // //     behavior: "smooth",
  //   // //   });
  //   // console.log(6)
  //   // window.history.replaceState(
  //   //   null,
  //   //   sectionsOrder[newValue + 1].title,
  //   //   "#" + sectionsOrder[newValue + 1].id
  //   // );
  //   setTimeout(() => {
  //     setNotSectionSwitching(true);
  //   }, 1000);
  // };

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

      <Box component={'header'} sx={{ position: "sticky", top: "0px", left: "0px", right: "0px", zIndex: 10 }}>
        <Box sx={{ height: "70px", width: "100%", position: "absolute", background: "#000000c2", filter: 'blur(1px)', }} />
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

      <Box id={sectionsOrder[0].id} ref={section1Ref}>
        <Landing />
      </Box>

      {/* <Box sx={{ position: "relative", display: "grid", gridTemplateColumns: "200px auto", gridTemplateRows: "1fr" }}> */}
      <Box sx={{ position: "relative", display: "flex" }}>
        {matches && <Box sx={{ minWidth: "200px", maxWidth: "300px" }}>
          {/* <h2 style={{ position: "sticky", bottom: "0px", mixBlendMode: "difference", zIndex: 20 }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente dignissimos cum repudiandae in debitis voluptatibus dolorem, alias maiores sed dolorum? Modi provident non commodi minus unde. Quia tempore nostrum sapiente!
          </h2> */}
          {/* <div style={{ position: "sticky", top: "100px", color: "pink" }}>FRAME:{ap}%</div> */}
          <TableOfContent menuItems={sections} onChangeContent={(idx, idxAnimation) => {
            console.log('called switchSection', idx, idxAnimation)
            switchSection(idx, idxAnimation)
          }} />
          {/* <h2 style={{ position: "sticky", bottom: "0px", mixBlendMode: "difference" }}>test</h2> */}
        </Box>}
        <Box>
          <Box id={sectionsOrder[1].id} ref={section2Ref} >
            <HowItWorks section={section} riveComponent={RiveComponentMemo} ref={sectionAnimationControllerRef} />
          </Box>
          <Box id={sectionsOrder[2].id} ref={section3Ref} >
            <What />
          </Box>
          <Box id={sectionsOrder[3].id} ref={section4Ref}>
            <Values />
          </Box>
          <Box id={sectionsOrder[4].id} ref={section5Ref}>
            <div id="SchoolsSection">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam aut eaque atque, doloribus ducimus perspiciatis quos fugit voluptate? Soluta modi labore nemo maiores, eligendi adipisci deserunt! Sunt deserunt aut magni.
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam aut eaque atque, doloribus ducimus perspiciatis quos fugit voluptate? Soluta modi labore nemo maiores, eligendi adipisci deserunt! Sunt deserunt aut magni.
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam aut eaque atque, doloribus ducimus perspiciatis quos fugit voluptate? Soluta modi labore nemo maiores, eligendi adipisci deserunt! Sunt deserunt aut magni.
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam aut eaque atque, doloribus ducimus perspiciatis quos fugit voluptate? Soluta modi labore nemo maiores, eligendi adipisci deserunt! Sunt deserunt aut magni.
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam aut eaque atque, doloribus ducimus perspiciatis quos fugit voluptate? Soluta modi labore nemo maiores, eligendi adipisci deserunt! Sunt deserunt aut magni.
            </div>

            {/* <UniversitiesMap theme={"Light"} /> */}
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
