import { Box, Button, Link, MenuItem, MenuList } from "@mui/material";
import NextLink from "next/link";
import React from "react";

import SECTIONS from "../src/navbarSections";

const AppMenuMovil = () => {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "calc(100vh - var(--navbar-height) )",
        display: { xs: "flex", md: "none" },
        alignItems: "center",
        justifyContent: "center",
        background: theme => theme.palette.common.darkGrayBackground,
        color: theme => theme.palette.common.white,
        position: "fixed",
        bottom: "0px",
        zIndex: "10"
      }}
    >
      <MenuList>
        {SECTIONS.map((page, idx) => (
          <MenuItem key={idx} sx={{ justifyContent: "center" }}>
            <NextLink key={idx} color="inherit" href={page.route}>
              <Link
                padding="13px 20px"
                sx={{
                  fontSize: "25px",
                  fontWeight: "400",
                  color: theme => theme.palette.common.white
                }}
                underline="none"
              >
                {page.label.toUpperCase()}
              </Link>
            </NextLink>
          </MenuItem>
        ))}
        <MenuItem>
          <Button
            size="large"
            variant="contained"
            sx={{
              px: "30px",
              fontSize: "30px",
              fontWeight: "500",
              borderRadius: 40
            }}
          >
            APPLY!
          </Button>
        </MenuItem>
      </MenuList>
    </Box>
  );
};

export default AppMenuMovil;
