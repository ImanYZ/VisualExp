import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputBase, Paper, styled, Toolbar } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { FC } from "react";

import LogoDarkMode from "../public/DarkModeLogo.svg";
import SECTIONS from "../src/navbarSections";
import ROUTES from "../src/routes";

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
                <NextLink color="inherit" href={page.route}>
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
          <Paper
            component="form"
            sx={{
              p: "0px 4px",
              display: "flex",
              alignItems: "center",
              width: "250px",
              background: theme => theme.palette.grey[600],
              borderRadius: "3px"
            }}
          >
            <StyledInputBase
              placeholder="Search on 1Cademy "
              inputProps={{ "aria-label": "search node" }}
              sx={{ ml: 1, flex: 1 }}
            />
            <IconButton type="submit" sx={{ p: "5px", color: theme => theme.palette.common.white }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
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

const StyledInputBase = styled(InputBase)(() => ({
  "& .MuiInputBase-input": {
    padding: 0,
    width: "100%",
    color: "#fff"
  }
}));

export default AppAppBar;
