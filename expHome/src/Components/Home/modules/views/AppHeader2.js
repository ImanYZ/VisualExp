import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import BiotechIcon from "@mui/icons-material/Biotech";
import {
  Box,
  Button,
  ClickAwayListener,
  Collapse,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Modal,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { emailState, firebaseState, fullnameState } from "../../../../store/AuthAtoms";
import { capitalizeString } from "../../../../utils/stringFunctions";

import oneCademyLogo from "../../../../assets/DarkmodeLogo.png";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import oneCademyLogoExtended from "../../../../assets/logo-extended.png";
import { notAResearcherState } from "../../../../store/ProjectAtoms";
import {
  gray200,
  gray300,
  gray50,
  gray600,
  gray700,
  gray850,
  gray900,
  orangeDark,
  orangeLight
} from "../../../../utils/colors";

export const HEADER_HEIGHT = 80;
export const HEADER_HEIGHT_MOBILE = 72;

const ActiveLink = ({ cur, selectedSectionId, onSwitchSection }) => {
  return (
    <Link
      onClick={() => onSwitchSection(cur.id)}
      sx={{
        whiteSpace: "nowrap",
        color: theme => (theme.palette.mode === "dark" ? gray200 : gray600),
        cursor: "pointer",
        textDecoration: "none",
        fontWeight: 600,
        // preUrl ? `${preUrl}#${cur.id}` : `#${cur.id}`
        borderBottom: selectedSectionId === `#${cur.id}` ? `solid 2px ${orangeDark}` : undefined,
        transitions: "all .5s",
        ":hover": {
          color: theme => (theme.palette.mode === "light" ? gray300 : gray700)
        }
      }}
    >
      {cur.label}
    </Link>
  );
};

const MenuBar = ({ items, onCloseMenu, selectedSectionId, onSwitchSection, preUrl }) => {
  const [idxOptionVisible, setIdxOptionVisible] = useState(-1);
  const fullname = useRecoilValue(fullnameState);
  const email = useRecoilValue(emailState);
  const navigate = useNavigate();

  const signUpHandler = () => {
    navigate("/auth");
  };

  return (
    <Stack
      direction={"column"}
      alignItems={"self-start"}
      sx={{
        height: {
          xs: `calc(100vh)`,
          md: `calc(100vh)`,
          overflowY: "auto"
        },
        background: theme => (theme.palette.mode === "light" ? "#000000" : "#ffffff")
      }}
    >
      <Stack
        direction={"row"}
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: { xs: "16px", sm: "32px" },
          width: "100%",
          height: { xs: `${HEADER_HEIGHT_MOBILE}px`, md: `${HEADER_HEIGHT}px` }
        }}
      >
        <img
          src={oneCademyLogoExtended}
          alt="logo"
          width={"149px"}
          height={"40px"}
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        />
        <IconButton
          onClick={() => onCloseMenu("")}
          sx={{ display: { xs: "flex", md: "none" }, alignSelf: "center", color: gray200 }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Stack>

      <Stack
        width={"100%"}
        direction={"column"}
        spacing={{ xs: "4px" }}
        sx={{ padding: { xs: "0px" }, "& a,svg": { color: gray200, fontWeight: 600 } }}
      >
        {items.map((cur, idx) => {
          return cur.options?.length ? (
            <Box key={cur.id}>
              <Box sx={{ p: { xs: "12px 16px" }, display: "flex", justifyContent: "space-between" }}>
                <ActiveLink
                  cur={cur}
                  selectedSectionId={selectedSectionId}
                  preUrl={preUrl}
                  onSwitchSection={onSwitchSection}
                />
                <IconButton
                  onClick={() => setIdxOptionVisible(prev => (prev === idx ? -1 : idx))}
                  size="small"
                  sx={{ p: "0px", ml: { xs: "4px", lg: "13px" } }}
                >
                  {idxOptionVisible === idx ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </Box>
              {idxOptionVisible === idx && (
                <Box sx={{ p: { xs: "12px 16px" } }}>
                  <SubMenu
                    onCloseSubMenu={() => setIdxOptionVisible(-1)}
                    sectionVisible={items[idxOptionVisible]}
                    sx={{
                      border: theme => `solid 1px ${theme.palette.mode === "light" ? "#FFFFFF4D" : gray200}`,
                      borderRadius: "12px"
                    }}
                  />
                </Box>
              )}
            </Box>
          ) : (
            <Box key={cur.id} sx={{ p: { xs: "12px 16px" }, display: "flex", justifyContent: "space-between" }}>
              <ActiveLink
                cur={cur}
                selectedSectionId={selectedSectionId}
                preUrl={preUrl}
                onSwitchSection={onSwitchSection}
              />
            </Box>
          );
        })}

        {!fullname && !email && (
          <Button
            variant="contained"
            onClick={() => {
              window.location.hash = "";
              window.location.hash = "JoinUsSection";
              onCloseMenu("");
            }}
            sx={{
              display: { xs: "flex", sm: "none" },
              background: orangeDark,
              fontSize: 16,
              borderRadius: 40,
              textTransform: "capitalize",
              ":hover": {
                background: orangeLight
              }
            }}
          >
            Apply
          </Button>
        )}
        {!fullname && !email && (
          <Button
            variant="contained"
            color="secondary"
            onClick={signUpHandler}
            sx={{
              display: { xs: "flex", sm: "none" },
              fontSize: 16,
              backgroundColor: theme => (theme.palette.mode === "light" ? "#303030" : "#e4e4e4"),
              color: theme =>
                theme.palette.mode === "light" ? theme.palette.common.white : theme.palette.common.black,
              borderRadius: 40,
              // height: "25px",
              textTransform: "capitalize",
              ":hover": {
                backgroundColor: theme => (theme.palette.mode === "light" ? "#444444" : "#cacaca")
              }
            }}
          >
            Sign In/Up
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

const AppHeader = ({ sections, selectedSectionId, onSwitchSection, preUrl = "" }) => {
  const theme = useTheme();
  const navigateTo = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const [email, setEmail] = useRecoilState(emailState);
  const notAResearcher = useRecoilValue(notAResearcherState);
  const firebase = useRecoilValue(firebaseState);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [idxOptionVisible, setIdxOptionVisible] = useState(-1);

  const isMobile = useMediaQuery("(max-width:599px)");

  const handleProfileMenuOpen = event => {
    setProfileMenuOpen(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(null);
  };

  const onCloseMenu = id => {
    setOpenMenu(false);
    onSwitchSection(id);
  };

  const signOut = async event => {
    setEmail("");
    setFullname("");
    await firebase.logout();
    navigateTo("/");
  };

  const navigateToExperiment = () => {
    if (!notAResearcher) {
      navigateTo("/Activities/");
    } else {
      navigateTo("/Activities/experiment");
    }
  };

  const renderProfileMenu = (
    <Menu id="ProfileMenu" anchorEl={profileMenuOpen} open={isProfileMenuOpen} onClose={handleProfileMenuClose}>
      {fullname && email && <Typography sx={{ p: "6px 16px", textTransform: "capitalize" }}>{fullname}</Typography>}
      {fullname && email && (
        <MenuItem sx={{ flexGrow: 3 }} onClick={navigateToExperiment}>
          <BiotechIcon /> <span id="ExperimentActivities">Experiment Activities</span>
        </MenuItem>
      )}
      {fullname && email && (
        <MenuItem sx={{ flexGrow: 3 }} onClick={signOut}>
          <LogoutIcon /> <span id="LogoutText">Logout</span>
        </MenuItem>
      )}
    </Menu>
  );

  const signUpHandler = () => {
    navigateTo("/auth");
  };

  const onSwitchSectionByMenu = id => {
    onSwitchSection(id);
    setOpenMenu(false);
  };

  return (
    <>
      <Box
        sx={{
          background: theme => (theme.palette.mode === "light" ? "rgba(0,0,0,.72)" : "#f8f8f894"),
          backdropFilter: "saturate(180%) blur(20px)",
          position: "sticky",
          top: "0",
          zIndex: "22"
        }}
      >
        <Stack
          direction={"row"}
          justifyContent="space-between"
          alignItems="center"
          spacing={"16px"}
          sx={{
            px: { xs: "16px", sm: "32px" },
            maxWidth: "1280px",
            margin: "auto",
            height: { xs: `${HEADER_HEIGHT_MOBILE}px`, md: `${HEADER_HEIGHT}px` }
          }}
        >
          <Stack direction={"row"} alignItems="center" spacing={"16px"}>
            <Tooltip title="1Cademy's Landing Page">
              <img
                src={isMobile ? oneCademyLogoExtended : oneCademyLogo}
                alt="logo"
                width={isMobile ? "149px" : "60px"}
                height={isMobile ? "40px" : "64px"}
                style={{ cursor: "pointer" }}
                onClick={() => navigateTo("/")}
              />
            </Tooltip>
            <Stack
              direction={"row"}
              aria-label="navigation bar"
              spacing={{ xs: "16px", lg: "24px" }}
              alignItems={"center"}
              justifyContent={"space-between"}
              sx={{
                display: {
                  xs: "none",
                  md: "flex"
                },
                "& a,svg": { color: theme => (theme.palette.mode === "light" ? gray200 : gray600), fontWeight: 600 }
              }}
            >
              {sections.slice(1).map((cur, idx) => {
                return cur.options ? (
                  <Box key={cur.id} sx={{ display: "flex" }}>
                    <Box onMouseEnter={() => setIdxOptionVisible(prev => (prev === idx ? -1 : idx))}>
                      <ActiveLink
                        cur={cur}
                        selectedSectionId={selectedSectionId}
                        preUrl={preUrl}
                        onSwitchSection={onSwitchSection}
                      />
                    </Box>
                    <IconButton
                      onClick={() => setIdxOptionVisible(prev => (prev === idx ? -1 : idx))}
                      size="small"
                      sx={{ p: "0px", ml: { xs: "4px", lg: "13px" } }}
                    >
                      {idxOptionVisible === idx ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </Box>
                ) : (
                  <ActiveLink
                    key={cur.id}
                    cur={cur}
                    selectedSectionId={selectedSectionId}
                    preUrl={preUrl}
                    onSwitchSection={onSwitchSection}
                  />
                );
              })}
            </Stack>
          </Stack>

          <Stack direction={"row"} justifyContent="flex-end" alignItems="center" spacing={"8px"}>
            <Stack display={"flex"} direction={"row"} justifyContent="flex-end" alignItems="center" spacing={"8px"}>
              {!fullname && (
                <Tooltip title="Apply to join 1Cademy">
                  <Button
                    variant="contained"
                    onClick={() => {
                      window.location.hash = "";
                      window.location.hash = "JoinUsSection";
                    }}
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      p: { xs: "6px 10px", lg: undefined },
                      minWidth: "54px",
                      background: orangeDark,
                      fontSize: 16,
                      borderRadius: 40,
                      height: "25px",
                      // width: "60px",
                      textTransform: "capitalize",
                      ":hover": {
                        background: orangeLight
                      }
                    }}
                  >
                    Apply
                  </Button>
                </Tooltip>
              )}

              {fullname && email ? (
                <Tooltip title={capitalizeString(fullname)}>
                  <IconButton onClick={handleProfileMenuOpen}>
                    <Box
                      sx={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "30px",
                        color: gray300
                      }}
                      aria-haspopup="true"
                      aria-controls="lock-menu"
                      aria-label={`${fullname}'s Account`}
                      aria-expanded={isProfileMenuOpen ? "true" : undefined}
                    >
                      <AccountCircleIcon sx={{ fontSize: "28px" }} />
                    </Box>
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="SIGN IN/UP">
                  <Button
                    variant="contained"
                    onClick={signUpHandler}
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      p: { xs: "6px 10px", lg: undefined },
                      minWidth: "95px",
                      fontSize: 16,
                      backgroundColor: theme.palette.mode === "light" ? "#303030" : "#e4e4e4",
                      color: theme.palette.mode === "light" ? theme.palette.common.white : theme.palette.common.black,
                      borderRadius: 40,
                      height: "25px",
                      textTransform: "capitalize",
                      ":hover": {
                        backgroundColor: theme.palette.mode === "light" ? "#444444" : "#cacaca"
                      }
                    }}
                  >
                    Sign In/Up
                  </Button>
                </Tooltip>
              )}
            </Stack>

            <IconButton
              onClick={() => setOpenMenu(prev => !prev)}
              sx={{ display: { xs: "flex", md: "none" }, alignSelf: "center", color: gray200 }}
              size="small"
            >
              {openMenu ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Stack>
        </Stack>
        {fullname && email && renderProfileMenu}

        <Modal
          open={openMenu}
          onClose={() => setOpenMenu(false)}
          aria-labelledby="Menu"
          aria-describedby="Navigate through sections"
          sx={{ display: { md: "none" } }}
        >
          <Box>
            <MenuBar
              items={sections.slice(1)}
              onCloseMenu={onCloseMenu}
              selectedSectionId={selectedSectionId}
              onSwitchSection={onSwitchSectionByMenu}
              preUrl={preUrl}
            />
          </Box>
        </Modal>
        <Box
          sx={{
            position: "absolute",
            top: "80px",
            left: "0px",
            right: "0px",
            background: theme => (theme.palette.mode === "light" ? "#000000ff" : "#f8f8f8ff")
          }}
        >
          <SubMenu
            onCloseSubMenu={() => setIdxOptionVisible(-1)}
            sectionVisible={sections.slice(1)[idxOptionVisible]}
          />
        </Box>
      </Box>
    </>
  );
};

const SubMenu = ({ onCloseSubMenu, sectionVisible, sx }) => {
  return (
    <Collapse in={Boolean(sectionVisible)} timeout="auto" unmountOnExit sx={{ ...sx }}>
      {sectionVisible && (
        <ClickAwayListener onClickAway={onCloseSubMenu}>
          <Box
            sx={{
              p: { xs: "36px 12px", md: "32px" },
              maxWidth: "1280px",
              margin: "auto"
            }}
          >
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" } }}>
              {sectionVisible.options.map(cur => (
                <Link
                  key={cur.title}
                  href={cur.link}
                  rel="noopener"
                  target="_blank"
                  sx={{
                    textDecoration: "none",
                    p: "12px",
                    cursor: "pointer",
                    borderRadius: "16px",
                    color: theme => (theme.palette.mode === "light" ? gray200 : "black"),
                    ":hover": {
                      background: theme => (theme.palette.mode === "light" ? gray850 : gray50)
                    }
                  }}
                >
                  <Typography
                    sx={{
                      mb: "4px",
                      color: theme => (theme.palette.mode === "light" ? gray200 : gray900),
                      fontSize: "16px",
                      fontWeight: 600
                    }}
                  >
                    {cur.title}
                  </Typography>
                  <Typography
                    sx={{
                      display: { xs: "none", md: "block" },
                      color: theme => (theme.palette.mode === "light" ? gray300 : gray600),
                      fontSize: "14px"
                    }}
                  >
                    {cur.description.split(" ").slice(0, 13).join(" ") + "..."}
                  </Typography>
                </Link>
              ))}
            </Box>
          </Box>
        </ClickAwayListener>
      )}
    </Collapse>
  );
};

export const AppHeaderMemoized = React.memo(AppHeader);

export default AppHeaderMemoized;
