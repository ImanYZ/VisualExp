import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  IconButton,
  Stack,
  styled,
  Tooltip,
  tooltipClasses,
  Typography,
  useMediaQuery
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoDarkMode from "../../../../assets/DarkModeLogoMini.png";
export const HEADER_HEIGTH = 70;

const AppHeader = ({
  sections,
  switchSection,
  onClickSearcher,
  sectionSelected,
  rightOptions = null,
  enableApply = true,
  // enableSearcher = true,
  enableSignInUp = true,
  enableMenu = false
}) => {
  const isDesktop = useMediaQuery("(min-width:1200px)");
  const isTablet = useMediaQuery("(min-width:900px)");
  const isMobile = useMediaQuery("(max-width:600px)");
  const navigateTo = useNavigate();

  const [showMenu, setShowMenu] = useState(false);

  const signUpHandler = () => {
    navigateTo("/auth");
  };

  const showRigthOptionInMobile = isMobile && !enableMenu;
  const showRigthOptionsByDesktop = !isMobile;
  return (
    <Box
      component={"header"}
      sx={{
        position: "sticky",
        width: "100%",
        top: "0px",
        zIndex: 20,
        display: "flex",
        justifyContent: "center"
      }}
    >
      <Box
        sx={{
          height: HEADER_HEIGTH,
          width: "100%",
          background: theme => (theme.palette.mode === "dark" ? "rgba(0,0,0,.72)" : "#f8f8f894"),
          backdropFilter: "saturate(180%) blur(20px)"
        }}
      />
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        spacing={isDesktop ? "30px" : "8px"}
        sx={{
          width: "100%",
          maxWidth: "1200px",
          height: HEADER_HEIGTH,
          px: isDesktop ? "0px" : "10px",
          position: "absolute"
        }}
      >
        <Stack
          spacing={isDesktop ? "30px" : "8px"}
          alignItems={"center"}
          justifyContent={"space-between"}
          direction={"row"}
          sx={{ color: "#f8f8f8" }}
        >
          <Tooltip title={sections[0].title}>
            <img
              onClick={() => (switchSection ? switchSection(0) : () => {})}
              src={LogoDarkMode.src}
              alt="logo"
              width="45px"
              height={"45px"}
            />
          </Tooltip>

          {isTablet && (
            <>
              {sections.slice(1).map((cur, idx) => (
                <Tooltip key={`${cur.id}-${idx}`} title={cur.title}>
                  <Typography
                    sx={{
                      cursor: "pointer",
                      borderBottom: theme =>
                        sectionSelected === idx + 1 ? `solid 2px ${theme.palette.common.orange}` : undefined
                    }}
                    onClick={() => (switchSection ? switchSection(idx + 1) : () => {})}
                  >
                    {sections[idx + 1].label}
                  </Typography>
                </Tooltip>
              ))}
            </>
          )}
        </Stack>
        {/* {((!isMobile && enableSearcher) || enableMenu) && ( */}

        <Stack direction={"row"} alignItems="center" spacing={isDesktop ? "20px" : "8px"}>
          {/* isMobile && enableSearcher && !enableMenu */}
          {onClickSearcher && isMobile && (
            // {onClickSearcher && showRigthOptionInMobile && (
            <Tooltip title="Open Searcher">
              <IconButton onClick={onClickSearcher}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}

          {enableApply && (showRigthOptionsByDesktop || showRigthOptionInMobile) && (
            <Tooltip title="Apply to join 1Cademy">
              <Button
                variant="contained"
                color="primary"
                target="_blank"
                href="https://1cademy.us/#JoinUsSection"
                size={isMobile ? "small" : "medium"}
                sx={{
                  fontSize: 16,
                  ml: 2.5,
                  borderRadius: 40,
                  textTransform: "uppercase"
                }}
              >
                Apply!
              </Button>
            </Tooltip>
          )}
          {/* enableSignInUp && (!isMobile || (isMobile && !enableMenu))  */}
          {enableSignInUp && (showRigthOptionsByDesktop || showRigthOptionInMobile) && (
            <Tooltip title="SIGN IN/UP">
              <Button
                variant="outlined"
                color="secondary"
                onClick={signUpHandler}
                size={isMobile ? "small" : "medium"}
                sx={{
                  fontSize: 16,
                  ml: 2.5,
                  borderRadius: 40,
                  wordBreak: "normal",
                  whiteSpace: "nowrap"
                }}
              >
                SIGN IN/UP
              </Button>
            </Tooltip>
          )}
          {isMobile && enableMenu && showMenu && (
            <LightTooltip title="Account">
              <IconButton
                size="large"
                edge="end"
                onClick={() => setShowMenu(true)}
                color="inherit"
                sx={{
                  display: { xs: "flex", md: "none" }
                }}
              >
                <CloseIcon sx={{ color: theme => theme.palette.common.white, m: "auto" }} fontSize="large" />
              </IconButton>
            </LightTooltip>
          )}

          {isMobile && enableMenu && !showMenu && (
            <LightTooltip title="Account">
              <IconButton
                size="large"
                edge="end"
                onClick={() => setShowMenu(false)}
                color="inherit"
                sx={{
                  display: { xs: "flex", md: "none" }
                }}
              >
                <MenuIcon sx={{ color: theme => theme.palette.common.white }} fontSize="large" />
              </IconButton>
            </LightTooltip>
          )}
          {rightOptions}
        </Stack>
      </Stack>
    </Box>
  );
};
const LightTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)(
  ({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: "rgba(0, 0, 0, 0.87)",
      boxShadow: "0px 10px 30px 5px rgba(0,0,0,0.5)",
      fontSize: 12
    }
  })
);
export default AppHeader;
