import Image from "next/image";
import NextLink from "next/link";
import ROUTES from "../src/routes";
import React, { FC } from "react";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

import LogoDarkMode from "../public/DarkModeLogo.svg";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import SECTIONS from "../src/navbarSections";
import Tooltip from "@mui/material/Tooltip";

type Props = {
  showApply?: boolean;
};
const AppAppBar: FC<Props> = ({ showApply = true }) => {
  return (
    <AppBar>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ my: 1 }}>
          <NextLink href={ROUTES.home} passHref prefetch={false}>
            <Link sx={{ display: "flex" }}>
              <Image
                src={LogoDarkMode}
                alt="logo"
                width="60px"
                height="60px"
              ></Image>
            </Link>
          </NextLink>
        </Box>
        <Box sx={{ flexGrow: 1, ml: 2, display: { xs: "none", md: "flex" } }}>
          {SECTIONS.map((page, idx) => (
            <NextLink key={idx} href={page.route} passHref>
              <Tooltip title={page.title} arrow>
                <Button
                  size="large"
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {page.label}
                </Button>
              </Tooltip>
            </NextLink>
          ))}
        </Box>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          {showApply && (
            <Tooltip title="Apply to join 1Cademy">
              <Button size="large" variant="contained">
                Apply!
              </Button>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppAppBar;
