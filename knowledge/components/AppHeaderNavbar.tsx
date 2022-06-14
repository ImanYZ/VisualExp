import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { FC } from "react";

import LogoDarkMode from "../public/DarkModeLogo.svg";
import SECTIONS from "../src/navbarSections";
import ROUTES from "../src/routes";
import AppHeaderSearchBar from "./AppHeaderSearchBar";

type Props = {
  showApply?: boolean;
  showMenu: boolean;
  showSearch: boolean;
  onCloseMenu: () => void;
  onShowMenu: () => void;
};
const AppAppBar: FC<Props> = ({ showApply = true, showMenu = false, showSearch, onCloseMenu, onShowMenu }) => {
  const router = useRouter();

  return (
    <AppBar sx={{ boxShadow: "none" }}>
      <Toolbar sx={{ height: "var(--navbar-height)", justifyContent: "space-between" }}>
        <Box sx={{ my: 1 }}>
          <NextLink href={ROUTES.home} passHref prefetch={false}>
            <Link sx={{ display: "flex" }}>
              <Image src={LogoDarkMode} alt="logo" width="40px" height="47px"></Image>
            </Link>
          </NextLink>
        </Box>
        <Box sx={{ paddingLeft: "30px" }} display={{ xs: "none", md: "block" }}>
          {SECTIONS.map((page, idx) => {
            return (
              <LightTooltip key={idx} title={page.title} arrow={false}>
                <Link
                  href={page.route}
                  padding="20px 20px"
                  target={page.label === "Node" ? "_self" : "_blank"}
                  rel="noreferrer"
                  sx={{
                    fontSize: "16px",
                    fontWeight: "500",
                    color: theme =>
                      router.route === page.route ? theme.palette.common.white : theme.palette.grey[500],
                    borderBottom: theme =>
                      router.route === page.route ? `solid 2px ${theme.palette.common.orange}` : "none"
                  }}
                  underline="none"
                >
                  {page.label.toUpperCase()}
                </Link>
              </LightTooltip>
            );
          })}
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "20px",
            marginLeft: "20px"
          }}
        >
          {(router.route !== "/" || (router.route === "/" && showSearch)) && <AppHeaderSearchBar />}
          {showApply && (
            <Tooltip title="Apply to join 1Cademy">
              <Button
                size="small"
                variant="contained"
                sx={{
                  fontWeight: "500",
                  borderRadius: 40,
                  display: { xs: "none", md: "block" }
                }}
              >
                APPLY!
              </Button>
            </Tooltip>
          )}
          {showMenu && (
            <IconButton
              edge="start"
              onClick={onCloseMenu}
              aria-label="close"
              sx={{
                padding: "0px",
                alignItems: "center",
                display: { xs: "flex", md: "none" }
              }}
            >
              <CloseIcon sx={{ color: theme => theme.palette.common.white, m: "auto" }} fontSize="large" />
            </IconButton>
          )}
          {!showMenu && (
            <IconButton
              edge="start"
              onClick={onShowMenu}
              aria-label="close"
              sx={{
                padding: "0px",
                alignItems: "center",
                display: { xs: "flex", md: "none" }
              }}
            >
              <MenuIcon sx={{ color: theme => theme.palette.common.white }} fontSize="large" />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 12
  }
}));

export default AppAppBar;
