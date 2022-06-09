import { Container, Divider, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Image from "next/image";
import React from "react";

import YouTubeLogo from "../public/YouTube_Logo_2017.svg";

export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        height: "var(--footer-height)"
      }}
    >
      <Divider />
      <Container
        sx={{
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          flex: 1,
          mt: { xs: 5, sm: 0 }
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 2, md: 4 }}
          justifyContent="space-between"
          sx={{ position: "absolute", top: "0", bottom: "0", left: "0", right: "0", margin: "auto" }}
          alignItems="center"
        >
          <Box p={2}>{`©  1Cademy ${new Date().getFullYear()}`}</Box>
          <Box p={2}>
            <Link
              target="_blank"
              href="https://1cademy.us/terms"
              underline="none"
              sx={{ color: theme => theme.palette.common.black }}
            >
              Terms
            </Link>
          </Box>
          <Box p={2}>
            <Link
              target="_blank"
              href="https://1cademy.us/privacy"
              underline="none"
              sx={{ color: theme => theme.palette.common.black }}
            >
              Privacy
            </Link>
          </Box>
          <Box p={2}>
            <Link
              target="_blank"
              href="https://1cademy.us/cookie"
              underline="none"
              sx={{ color: theme => theme.palette.common.black }}
            >
              Cookie
            </Link>
          </Box>
          <Box
            sx={{ display: "flex" }}
            p={2}
            component="a"
            target="_blank"
            href="https://www.youtube.com/channel/UCKBqMjvnUrxOhfbH1F1VIdQ/"
          >
            <Image src={YouTubeLogo} alt="1Cademy YouTube Channel" layout="intrinsic" width="100px" height="40px" />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
