import Box from "@mui/material/Box";
import dynamic from "next/dynamic";
import React, { ComponentType,FC, ReactNode, useState } from "react";

import AppHeaderNavbar from "./AppHeaderNavbar";
import AppMenuMovil from "./AppMenuMovil";
import Head from "./Head";

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export const AppFooter: ComponentType<any> = dynamic(() => import("./AppFooter").then(m => m.default), {
  ssr: false
});

const PagesNavbar: FC<Props> = ({ children, title, description }) => {
  const [showMenu, setShowMenu] = useState(false);
  const onCloseMenu = () => setShowMenu(false);
  const onShowMenu = () => setShowMenu(true);

  return (
    <>
      <Head title={title} description={description} />
      <AppHeaderNavbar showMenu={showMenu} onCloseMenu={onCloseMenu} onShowMenu={onShowMenu} />
      {showMenu && <AppMenuMovil />}
      <Box
        component="main"
        sx={{
          mt: "var(--navbar-height)",
          minHeight: "calc(100vh - var(--navbar-height) - var(--footer-height) )"
        }}
      >
        {children}
      </Box>
      <AppFooter />
    </>
  );
};

export default PagesNavbar;
