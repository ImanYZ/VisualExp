import React, { useEffect } from "react";
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

import sectionsOrder from "./sectionsOrder";

import LogoDarkMode from "../../../../assets/DarkModeLogo.svg";

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

const AppAppBar = (props) => {
  const [colorMode, setColorMode] = useRecoilState(colorModeState);

  const toggleColorMode = (event) => {
    setColorMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const switchSection = (newValue) => (event) => {
    console.log({ newValue, section: sectionsOrder[newValue + 1] });
    props.setNotSectionSwitching(true);
    props.setSection(newValue);
    document
      .getElementById(sectionsOrder[newValue + 1].id)
      .scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(
      null,
      sectionsOrder[newValue + 1].title,
      "#" + sectionsOrder[newValue + 1].id
    );
    setTimeout(() => {
      props.setNotSectionSwitching(false);
    }, 1000);
  };

  const homeClick = (event) => {
    event.preventDefault();
    switchSection(-1)(event);
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
              onClick={homeClick}
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
            value={props.section}
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
              onClick={switchSection(0)}
              label={sectionsOrder[1].label}
              titl={sectionsOrder[1].title}
            />
            <LinkTab
              onClick={switchSection(1)}
              label={sectionsOrder[2].label}
              titl={sectionsOrder[2].title}
            />
            <LinkTab
              onClick={switchSection(2)}
              label={sectionsOrder[3].label}
              titl={sectionsOrder[3].title}
            />
            <LinkTab
              onClick={switchSection(3)}
              label={sectionsOrder[4].label}
              titl={sectionsOrder[4].title}
            />
            <LinkTab
              onClick={switchSection(4)}
              label={sectionsOrder[5].label}
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
