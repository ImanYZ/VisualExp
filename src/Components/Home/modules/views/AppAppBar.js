import React, { useState } from "react";
import { useRecoilState } from "recoil";

// import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// import Brightness4Icon from "@mui/icons-material/Brightness4";
// import Brightness7Icon from "@mui/icons-material/Brightness7";

import { colorModeState } from "../../../../store/GlobalAtoms";

import AppBar from "../components/AppBar";
import Toolbar from "../components/Toolbar";

import LogoDarkMode from "../../../../assets/DarkModeLogo.svg";

const rightLink = {
  fontSize: 16,
  color: "common.white",
  ml: 3,
};

const LinkTab = (props) => {
  return <Tab component="a" color="inherit" {...props} />;
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
      <AppBar position="fixed">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Link
            variant="h6"
            underline="none"
            color="inherit"
            href="#ProductHeroSection"
            sx={{ fontSize: 24, marginTop: "7px" }}
          >
            <img src={LogoDarkMode} alt="logo" width="52px" />
          </Link>
          <Tabs
            value={section}
            onChange={switchSection}
            aria-label="nav tabs example"
            sx={{
              marginLeft: "auto",
              "& .MuiTab-root": {
                color: "#AAAAAA",
              },
              "& .MuiTab-root.Mui-selected": {
                color: "common.white",
              },
            }}
          >
            <LinkTab label="Values" href="#ProductValuesSection" />
            <LinkTab label="Communities" href="#CommunitiesSection" />
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
            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: "40px", color: "white" }}
            >
              Join Us!
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
};

export default AppAppBar;
