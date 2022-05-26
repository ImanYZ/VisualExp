import Box from "@mui/material/Box";
import { grey } from "@mui/material/colors";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Image from "next/image";
import React from "react";

import YouTubeLogo from "../public/YouTube_Logo_2017.svg";

export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        borderTopStyle: "solid",
        borderTopColor: grey[400],
        borderTopWidth: "1px",
        height: "var(--footer-height)",
      }}
    >
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid container>
          <Grid item xs={6} sm={3} display="flex" alignItems="center">
            {`©  1Cademy ${new Date().getFullYear()}`}
          </Grid>
          <Grid item xs={6} sm={2} display="flex" alignItems="center">
            <Link target="_blank" href="/terms">
              Terms
            </Link>
          </Grid>
          <Grid item xs={6} sm={2} display="flex" alignItems="center">
            <Link target="_blank" href="/privacy">
              Privacy
            </Link>
          </Grid>
          <Grid item xs={6} sm={2} display="flex" alignItems="center">
            <Link target="_blank" href="/cookie">
              Cookie
            </Link>
          </Grid>
          <Grid item xs={6} sm={3} display="flex" alignItems="center">
            <Box
              sx={{ display: "flex" }}
              component="a"
              target="_blank"
              href="https://www.youtube.com/channel/UCKBqMjvnUrxOhfbH1F1VIdQ/"
            >
              <Image
                src={YouTubeLogo}
                alt="1Cademy YouTube Channel"
                layout="intrinsic"
                width="100px"
                height="40px"
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
