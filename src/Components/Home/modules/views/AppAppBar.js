import React, { useState } from "react";
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

const LinkTab = (props) => {
  return (
    <Tooltip title={props.titl}>
      <Tab component="a" color="inherit" {...props} />
    </Tooltip>
  );
};

const AppAppBar = () => {
  const [section, setSection] = useState(0);

  const [colorMode, setColorMode] = useRecoilState(colorModeState);

  const toggleColorMode = (event) => {
    setColorMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const switchSection = (event, newValue) => {
    setSection(newValue);
  };

  return (
    <div>
      <AppBar>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Tooltip title="1Cademy's Landing Page">
            <Link
              variant="h6"
              underline="none"
              color="inherit"
              href="#LandingSection"
              sx={{ fontSize: 24, margin: "7px 19px 0px -10px" }}
            >
              <img src={LogoDarkMode} alt="logo" width="52px" />
            </Link>
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
              label="How"
              href="#ValuesSection"
              titl="How does 1Cademy work?"
            />
            <LinkTab
              label="What"
              href="#CommunitiesSection"
              titl="What communities do exist in 1Cademy?"
            />
            <LinkTab
              label="Why"
              href="#ValuesSection"
              titl="Why does 1Cademy work?"
            />
            <LinkTab
              label="Where"
              href="#ValuesSection"
              titl="Where are 1Cademy members from?"
            />
            <LinkTab
              label="Who"
              href="#ValuesSection"
              titl="Who is behind 1Cademy?"
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
