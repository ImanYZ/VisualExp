import Image from "next/image";
import NextLink from "next/link";
import ROUTES from "../src/routes";
import React, { FC } from "react";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Tabs from "@mui/material/Tabs";
import LogoDarkMode from "../public/DarkModeLogo.svg";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import SECTIONS from "../src/navbarSections";
import Tooltip from "@mui/material/Tooltip";
import Tab from "@mui/material/Tab";

type Props = {
  showApply?: boolean;
};
const AppAppBar: FC<Props> = ({ showApply = true }) => {
  return (
    <AppBar sx={{ maxHeight: "var(--navbar-height)" }}>
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
        <Tabs
          value={false}
          sx={{
            marginLeft: 2,
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
          {SECTIONS.map((page, idx) => {
            return (
              <Tooltip key={idx} title={page.title}>
                <Tab color="inherit" label={page.label.toUpperCase()} />
              </Tooltip>
            );
          })}
        </Tabs>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          {showApply && (
            <Tooltip title="Apply to join 1Cademy">
              <Button
                size="large"
                variant="contained"
                sx={{
                  fontSize: (theme) => theme.typography.body1,
                  fontWeight: "bold",
                  borderRadius: 40,
                }}
              >
                APPLY!
              </Button>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppAppBar;
