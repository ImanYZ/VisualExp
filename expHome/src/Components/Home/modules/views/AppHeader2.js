import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
  ClickAwayListener,
  Collapse,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { emailState, firebaseState, fullnameState } from "../../../../store/AuthAtoms";
import { capitalizeString } from "../../../../utils/stringFunctions";
import { gray200, gray25, gray300, gray600, gray700, gray900, orangeDark, orangeLight } from "../../Communities";
import oneCademyLogo from "../../../../assets/DarkmodeLogo.png";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
// import oneCademyLogo from "../../public/DarkmodeLogo.png";
export const HEADER_HEIGHT = 80;
export const HEADER_HEIGHT_MOBILE = 72;

const MenuBar = ({ items, onCloseMenu, selectedSectionId }) => {
  const [idxOptionVisible, setIdxOptionVisible] = useState(-1);

  return (
    <Stack
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      sx={{ height: { xs: `calc(100vh - ${HEADER_HEIGHT_MOBILE}px)`, md: `calc(100vh - ${HEADER_HEIGHT}px)` } }}
    >
      <Stack
        flex={1}
        direction={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        spacing="32px"
        padding={"32px"}
        sx={{
          "& a,svg": { color: theme => (theme.palette.mode === "light" ? gray200 : gray600), fontWeight: 600 }
        }}
      >
        {items.map((cur, idx) => {
          return cur.options ? (
            <Box key={cur.id}>
              <Box sx={{ display: "flex" }}>
                <Link
                  href={`#${cur.id}`}
                  onClick={() => onCloseMenu(cur.id)}
                  sx={{
                    color: theme => (theme.palette.mode === "light" ? gray200 : gray600),
                    cursor: "pointer",
                    textDecoration: "none",
                    borderBottom: selectedSectionId === cur.id ? `solid 2px ${orangeDark}` : undefined
                  }}
                >
                  {cur.label}
                </Link>
                <IconButton
                  onClick={() => setIdxOptionVisible(prev => (prev === idx ? -1 : idx))}
                  size="small"
                  sx={{ p: "0px", ml: { xs: "4px", lg: "13px" } }}
                >
                  {idxOptionVisible === idx ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </Box>
              <SubMenu
                onCloseSubMenu={() => setIdxOptionVisible(-1)}
                sectionVisible={items[idxOptionVisible]}
                sx={{
                  border: theme => `solid 1px ${theme.palette.mode === "dark" ? "#FFFFFF4D" : gray200}`,
                  borderRadius: "12px"
                }}
              />
            </Box>
          ) : (
            <Tooltip key={cur.id} title={cur.title} placement={"right"}>
              <Link
                href={`#${cur.id}`}
                onClick={() => onCloseMenu(cur.id)}
                sx={{
                  color: theme => (theme.palette.mode === "light" ? gray200 : gray600),
                  cursor: "pointer",
                  textDecoration: "none",
                  borderBottom: selectedSectionId === cur.id ? `solid 2px ${orangeDark}` : undefined
                }}
              >
                {cur.label}
              </Link>
            </Tooltip>
          );
        })}
      </Stack>
      {/* TODO: add footer */}
      {/* <AppFooter /> */}
    </Stack>
  );
};

const AppHeader = ({ page, sections, selectedSectionId, onPreventSwitch }) => {
  const theme = useTheme();
  const navigateTo = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const [email, setEmail] = useRecoilState(emailState);
  const firebase = useRecoilValue(firebaseState);
  const isProfileMenuOpen = Boolean(profileMenuOpen);
  const [idxOptionVisible, setIdxOptionVisible] = useState(-1);

  const handleProfileMenuOpen = event => {
    setProfileMenuOpen(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(null);
  };

  const onCloseMenu = id => {
    setOpenMenu(false);
    onPreventSwitch(id);
  };

  const signOut = async event => {
    // console.log("Signing out!");
    setEmail("");
    setFullname("");
    await firebase.logout();
    navigateTo("/");
  };

  const renderProfileMenu = (
    <Menu id="ProfileMenu" anchorEl={profileMenuOpen} open={isProfileMenuOpen} onClose={handleProfileMenuClose}>
      {fullname && email && <Typography sx={{ p: "6px 16px", textTransform: "capitalize" }}>{fullname}</Typography>}
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
                src={oneCademyLogo}
                alt="logo"
                width="60px"
                height="64px"
                style={{ cursor: "pointer" }}
                // onClick={() => router.push("/")}
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
                  <Box key={cur.id}>
                    <Box
                      sx={{
                        display: "flex"
                      }}
                    >
                      <Link
                        href={`#${cur.id}`}
                        onClick={() => onCloseMenu(cur.id)}
                        sx={{
                          color: "inherit",
                          cursor: "pointer",
                          textDecoration: "none",
                          borderBottom: selectedSectionId === cur.id ? `solid 2px ${orangeDark}` : undefined
                        }}
                      >
                        {cur.label}
                      </Link>
                      <IconButton
                        onClick={() => setIdxOptionVisible(prev => (prev === idx ? -1 : idx))}
                        size="small"
                        sx={{ color: "inherit", p: "0px", ml: { xs: "4px", lg: "13px" } }}
                      >
                        {idxOptionVisible === idx ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Tooltip key={cur.id} title={cur.title} placement={"right"}>
                    <Link
                      href={`#${cur.id}`}
                      onClick={() => onCloseMenu(cur.id)}
                      sx={{
                        color: theme => (theme.palette.mode === "light" ? gray200 : gray600),
                        cursor: "pointer",
                        textDecoration: "none",
                        borderBottom: selectedSectionId === cur.id ? `solid 2px ${orangeDark}` : undefined
                      }}
                    >
                      {cur.label}
                    </Link>
                  </Tooltip>
                );
              })}
            </Stack>
          </Stack>

          <Stack direction={"row"} justifyContent="flex-end" alignItems="center" spacing={"8px"}>
            <Stack
              display={page === "ONE_CADEMY" ? "flex" : "none"}
              direction={"row"}
              justifyContent="flex-end"
              alignItems="center"
              spacing={"8px"}
            >
              {!fullname && (
                <Tooltip title="Apply to join 1Cademy">
                  <Button
                    variant="contained"
                    // onClick={() => window?.open(ROUTES.apply, "_blank")}
                    sx={{
                      background: orangeDark,
                      fontSize: 16,
                      borderRadius: 40,
                      height: "25px",
                      width: "60px",
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
                      minWidth: "120px",
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

            {/* BUTTONS FOR 1ASSISTANT HOMEPAGE */}

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

        {openMenu && (
          <MenuBar items={sections.slice(1)} onCloseMenu={onCloseMenu} selectedSectionId={selectedSectionId} />
        )}
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
              p: { xs: "16px", sm: "32px" },
              maxWidth: "1280px",
              margin: "auto"
              // background: theme => (theme.palette.mode === "dark" ? "#16161aff" : "#f8f8f8ff"),
            }}
          >
            <Typography sx={{ mb: "12px", color: orangeLight }}>{sectionVisible.title}</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
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
                      background: theme => (theme.palette.mode === "light" ? gray25 : "black"),
                      // color: theme => (theme.palette.mode === "dark" ? "black" : gray200),
                      ".link-option-title": {
                        color: theme => (theme.palette.mode === "light" ? gray900 : gray200)
                      }
                    }
                  }}
                >
                  <Typography
                    className="link-option-title"
                    sx={{
                      mb: "4px",
                      color: theme => (theme.palette.mode === "light" ? gray200 : gray900),
                      fontSize: "16px",
                      fontWeight: 600
                    }}
                  >
                    {cur.title}
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
