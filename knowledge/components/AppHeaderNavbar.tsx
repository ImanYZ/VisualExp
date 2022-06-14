import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
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
  onCloseMenu: () => void;
  onShowMenu: () => void;
};
const AppAppBar: FC<Props> = ({ showApply = true, showMenu = false, onCloseMenu, onShowMenu }) => {
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
              <Tooltip key={idx} title={page.title}>
                <NextLink passHref color="inherit" href={page.route}>
                  <Link
                    padding="20px 20px"
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
                </NextLink>
              </Tooltip>
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
          {router.route !== "/" && <AppHeaderSearchBar />}
          {showApply && (
            <Tooltip title="Apply to join 1Cademy">
              <Button
                size="medium"
                variant="contained"
                sx={{
                  width: "100px",
                  p: "6px 16px",
                  fontSize: "16px",
                  fontWeight: "600",
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

export default AppAppBar;
