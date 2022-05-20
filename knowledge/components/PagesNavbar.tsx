import React, { FC, ReactNode } from "react";
import Box from "@mui/material/Box";
import AppHeaderNavbar from "./AppHeaderNavbar";
import AppFooter from "./AppFooter";
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
          padding: { xs: 0, sm: 1, md: 2 },
        }}
      >
        {children}
      </Box>
      <AppFooter />
    </>
  );
};

export default PagesNavbar;
