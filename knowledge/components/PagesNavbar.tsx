import Box from "@mui/material/Box";
import React, { FC, ReactNode } from "react";

import AppFooter from "./AppFooter";
import AppHeaderNavbar from "./AppHeaderNavbar";
import Head from "./Head";

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
};

const PagesNavbar: FC<Props> = ({ children, title, description }) => {
  return (
    <>
      <Head title={title} description={description} />
      <AppHeaderNavbar />
      <Box
        component="main"
        sx={{
          mt: "var(--navbar-height)",
          minHeight:
            "calc(100vh - var(--navbar-height) - var(--footer-height) )",
          py: 4,
          px: { xs: 1, md: 2 },
        }}
      >
        {children}
      </Box>
      <AppFooter />
    </>
  );
};

export default PagesNavbar;
