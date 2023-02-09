import { Box } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./modules/hooks/useObserver";
import AppHeaderMemoized from "./modules/views/AppHeader2";

import { ONE_CADEMY_SECTIONS } from "./modules/views/sectionItems";
import { SectionWrapper } from "./modules/views/SectionWrapper";

const observerOption = { options: { root: null, rootMargin: "-480px 0px -380px 0px", threshold: 0 } };

const HomeWrapper = ({
  heroSectionChild,
  mechanismSectionChild,
  magnitudeSectionChild,
  benefitSectionChild,
  topicsSectionChild,
  systemSectionChild,
  aboutSectionChild,
}) => {
  const isScrolling = useRef(false);
  const timer = useRef(null);

  const [selectedSectionId, setSelectedSectionId] = useState("");
  const { inView: mechanismInView, ref: MechanismSectionRef } = useInView(observerOption);
  const { inView: magnitudeInView, ref: MagnitudeSectionRef } = useInView(observerOption);
  const { inView: benefitInView, ref: BenefitSectionRef } = useInView(observerOption);
  const { inView: topicsInView, ref: TopicsSectionRef } = useInView(observerOption);
  const { inView: systemsInView, ref: SystemSectionRef } = useInView(observerOption);
  const { inView: aboutInView, ref: AboutSectionRef } = useInView(observerOption);

  useEffect(() => {
    isScrolling.current = true;

    timer.current = setTimeout(() => {
      isScrolling.current = false;
    }, 1000);
  }, []);

  useEffect(() => {
    if (isScrolling.current) return;

    let newSelectedSectionId = "";
    if (mechanismInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[1].id;
    if (magnitudeInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[2].id;
    if (benefitInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[3].id;
    if (topicsInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[4].id;
    if (systemsInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[5].id;
    if (aboutInView) newSelectedSectionId = ONE_CADEMY_SECTIONS[6].id;

    const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "";
    if (window.location.hash === newHash) return;
    window.location.hash = newHash;

    setSelectedSectionId(newHash);
  }, [mechanismInView, magnitudeInView, benefitInView, topicsInView, systemsInView, aboutInView]);

  const onSwitchSection = (newSelectedSectionId, fromOtherPage = false) => {
    if (fromOtherPage) return (window.location.href = `/#${newSelectedSectionId}`);
    if (isScrolling.current) return;
    const newHash = newSelectedSectionId ? `#${newSelectedSectionId}` : "";
    if (window.location.hash === newHash) return;
    isScrolling.current = true;
    timer.current = setTimeout(() => {
      isScrolling.current = false;
    }, 1000);
    setSelectedSectionId(newHash);
    window.location.hash = newHash;
  };
  return (
    <Box>
      <AppHeaderMemoized
        page="ONE_CADEMY"
        sections={ONE_CADEMY_SECTIONS}
        selectedSectionId={selectedSectionId}
        onPreventSwitch={onSwitchSection}
      />

      {heroSectionChild}

      <SectionWrapper ref={MechanismSectionRef} section={ONE_CADEMY_SECTIONS[1]} textAlign="center">
        {mechanismSectionChild}x
      </SectionWrapper>

      <SectionWrapper ref={MagnitudeSectionRef} section={ONE_CADEMY_SECTIONS[2]} /* stats={stats} */>
        {magnitudeSectionChild}x
      </SectionWrapper>

      <SectionWrapper ref={BenefitSectionRef} section={ONE_CADEMY_SECTIONS[3]}>
        {benefitSectionChild}
      </SectionWrapper>

      <SectionWrapper ref={TopicsSectionRef} section={ONE_CADEMY_SECTIONS[4]}>
        {topicsSectionChild}
      </SectionWrapper>

      <SectionWrapper ref={SystemSectionRef} section={ONE_CADEMY_SECTIONS[5]}>
        {systemSectionChild}
      </SectionWrapper>

      <SectionWrapper ref={AboutSectionRef} section={ONE_CADEMY_SECTIONS[6]}>
        {aboutSectionChild}
      </SectionWrapper>
    </Box>
  );
};

export default HomeWrapper;
