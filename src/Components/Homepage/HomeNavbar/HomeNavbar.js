import React, { useState, useEffect, Suspense } from "react";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";

import MenuIcon from "@mui/icons-material/Menu";

import LogoDarkMode from "../../../assets/DarkModeLogo.svg";

import "./HomeNavbar.css";

const ThemeSwitcher = React.lazy(() =>
  import("../ThemeSwitcher/ThemeSwitcher")
);

const HomeNavbar = (props) => {
  const buttonLabels = props.navLabels;

  const [state, setState] = useState({
    mobileView: false,
    drawerOpen: false,
  });

  const { mobileView, drawerOpen } = state;

  useEffect(() => {
    const setResponsiveness = () => {
      return window.innerWidth < 900
        ? setState((prevState) => ({ ...prevState, mobileView: true }))
        : setState((prevState) => ({ ...prevState, mobileView: false }));
    };

    setResponsiveness();

    window.addEventListener("resize", () => setResponsiveness());
  }, []);

  const handleClickItem = (index) => {
    props.setCurrentPage(index - 1);
    setState((prevState) => ({ ...prevState, drawerOpen: false }));
  };

  const displayMobile = () => {
    const handleDrawerOpen = () =>
      setState((prevState) => ({ ...prevState, drawerOpen: true }));
    const handleDrawerClose = () =>
      setState((prevState) => ({ ...prevState, drawerOpen: false }));

    return (
      <Toolbar>
        <IconButton
          {...{
            edge: "start",
            "aria-label": "menu",
            "aria-haspopup": "true",
            onClick: handleDrawerOpen,
          }}
          style={{ color: props.theme === "Light" ? "black" : "white" }}
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          className={
            props.theme === "Light" ? "DrawerPaperLight" : "DrawerPaperDark"
          }
          {...{
            anchor: "left",
            open: drawerOpen,
            onClose: handleDrawerClose,
          }}
        >
          {getDrawerChoices()}
          <div style={{ width: "60%" }}>
            <Suspense fallback={<div></div>}>
              <ThemeSwitcher
                handleThemeSwitch={props.handleThemeSwitchCallback}
                theme={props.theme}
              />
            </Suspense>
          </div>
        </Drawer>
      </Toolbar>
    );
  };

  const getDrawerChoices = () => {
    return ["1Cademy", ...buttonLabels].map((label, index) => {
      return (
        <div key={`item${index}`}>
          <MenuItem>
            <Button
              className="DrawerButton"
              style={{
                color: props.theme === "Light" ? "black" : "white",
                borderBottom:
                  props.currentPage === index ? "2px solid #F59C12" : "",
              }}
              onClick={() => {
                handleClickItem(index);
              }}
            >
              {" "}
              {label}
            </Button>
          </MenuItem>
        </div>
      );
    });
  };

  const displayDesktop = () => {
    return (
      <Toolbar style={{ height: "105px" }}>
        <Box>
          <img
            id="LogoButton"
            src={LogoDarkMode}
            onClick={() => props.setCurrentPage(0)}
            alt="logo"
          />
        </Box>
        <div className="RightNavBarContentDiv">
          <div className="ThemeSwitcherDiv">
            <ThemeSwitcher
              handleThemeSwitch={props.handleThemeSwitchCallback}
              theme={props.theme}
            />
          </div>
          {buttonLabels.map((label, index) => (
            <Button
              style={{
                borderBottom:
                  props.currentPage === index + 1 ? "2px solid #F59C12" : "",
              }}
              key={`btn${index + 1}`}
              className={
                props.theme === "Light"
                  ? "AppBarButton LightModeAppBarButton"
                  : "AppBarButton"
              }
              onClick={() => props.setCurrentPage(index + 1)}
            >
              {" "}
              {label}
            </Button>
          ))}
        </div>
      </Toolbar>
    );
  };

  return (
    <AppBar
      position={mobileView ? "fixed" : "sticky"}
      style={{
        background:
          props.theme === "Light" && !mobileView ? "#F3F1EF" : "transparent",
        boxShadow: "none",
        height: "100px",
      }}
    >
      <Suspense fallback={<div></div>}>
        {mobileView ? displayMobile() : displayDesktop()}
      </Suspense>
    </AppBar>
  );
};

export default React.memo(HomeNavbar);
