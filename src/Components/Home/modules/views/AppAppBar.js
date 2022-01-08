import React, { useState, useEffect } from "react";
import { useRecoilState } from "recoil";

// import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";

// import Brightness4Icon from "@mui/icons-material/Brightness4";
// import Brightness7Icon from "@mui/icons-material/Brightness7";

import { colorModeState } from "../../../../store/GlobalAtoms";

import AppBar from "../components/AppBar";
import Toolbar from "../components/Toolbar";

import LogoDarkMode from "../../../../assets/DarkModeLogo.svg";

const sectionsOrder = [
  { id: "LandingSection", label: "Landing", title: "1Cademy's Landing Page" },
  { id: "HowItWorksSection", label: "How", title: "How does 1Cademy work?" },
  {
    id: "CommunitiesSection",
    label: "What",
    title: "What communities do exist in 1Cademy?",
  },
  { id: "ValuesSection", label: "Why", title: "Why does 1Cademy work?" },
  {
    id: "ValuesSection",
    label: "Where",
    title: "Where are 1Cademy members from?",
  },
  { id: "ValuesSection", label: "Who", title: "Who is behind 1Cademy?" },
];

const LinkTab = (props) => {
  return (
    <Tooltip title={props.titl}>
      <Tab
        onClick={(event) => {
          event.preventDefault();
          document
            .getElementById(props.href)
            .scrollIntoView({ behavior: "smooth" });
        }}
        color="inherit"
        {...props}
      />
    </Tooltip>
  );
};

const AppAppBar = () => {
  const [colorMode, setColorMode] = useRecoilState(colorModeState);

  const [section, setSection] = useState(-1);

  //   https://stackoverflow.com/questions/62497110/detect-scroll-direction-in-react-js
  useEffect(() => {
    const updatePosition = () => {
      console.log({ pageYOffset: window.pageYOffset });
      for (let sIdx = 0; sIdx < sectionsOrder.length; sIdx++) {
        const sectOffsetHeight = window.document.getElementById(
          sectionsOrder[sIdx].id
        ).offsetHeight;
        console.log({ pageYOffset: window.pageYOffset, sectOffsetHeight });
        if (window.pageYOffset < sectOffsetHeight) {
          setSection(sIdx - 1);
          break;
        }
      }
    };
    console.log({ window });
    window.addEventListener("scroll", updatePosition);
    updatePosition();
    return () => window.removeEventListener("scroll", updatePosition);
  }, []);

  const toggleColorMode = (event) => {
    setColorMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const switchSection = (event, newValue) => {
    setSection(newValue);
  };

  const homeClick = (href) => (event) => {
    event.preventDefault();
    setSection(-1);
    document.getElementById(href).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <AppBar>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Tooltip title="1Cademy's Landing Page">
            <Box
              variant="h6"
              underline="none"
              color="inherit"
              onClick={homeClick("LandingSection")}
              sx={{
                fontSize: 24,
                margin: "7px 19px 0px -10px",
                cursor: "pointer",
              }}
            >
              <img src={LogoDarkMode} alt="logo" width="52px" />
            </Box>
          </Tooltip>
          <Tabs
            value={section}
            onChange={switchSection}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="scrollable auto tabs navigation bar"
            sx={{
              marginLeft: "auto",
              fontWeight: 400,
              "& .MuiTab-root": {
                color: "#AAAAAA",
              },
              "& .MuiTab-root.Mui-selected": {
                color: "common.white",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "secondary.main",
              },
            }}
          >
            <LinkTab
              label={sectionsOrder[1].label}
              href={sectionsOrder[1].id}
              titl={sectionsOrder[1].title}
            />
            <LinkTab
              label={sectionsOrder[2].label}
              href={sectionsOrder[2].id}
              titl={sectionsOrder[2].title}
            />
            <LinkTab
              label={sectionsOrder[3].label}
              href={sectionsOrder[3].id}
              titl={sectionsOrder[3].title}
            />
            <LinkTab
              label={sectionsOrder[4].label}
              href={sectionsOrder[4].id}
              titl={sectionsOrder[4].title}
            />
            <LinkTab
              label={sectionsOrder[5].label}
              href={sectionsOrder[5].id}
              titl={sectionsOrder[5].title}
            />
          </Tabs>
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            {/* <Box
              sx={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                color: "text.primary",
                borderRadius: 1,
                p: 3,
              }}
            >
              {colorMode} mode
              <IconButton
                sx={{ ml: 1 }}
                onClick={toggleColorMode}
                color="inherit"
              >
                {colorMode === "dark" ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </Box> */}
            <Tooltip title="Apply to join 1Cademy">
              <Button
                variant="contained"
                color="secondary"
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
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
};

export default AppAppBar;
