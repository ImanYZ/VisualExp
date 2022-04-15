import React, { useEffect, useMemo } from "react";
import { useRecoilState } from "recoil";

import useMediaQuery from "@mui/material/useMediaQuery";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { colorModeState } from "../../../store/AuthAtoms";

import theme from "./theme";

export default function withRoot(Component) {
  function WithRoot(props) {
    const [colorMode, setColorMode] = useRecoilState(colorModeState);

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

    // useEffect(() => {
    //   if (!colorMode) {
    // setColorMode(prefersDarkMode ? "dark" : "light");
    //   }
    // }, [colorMode, prefersDarkMode]);

    const memoizedTheme = useMemo(() => theme(colorMode), [colorMode]);

    return (
      <ThemeProvider theme={memoizedTheme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...props} />
      </ThemeProvider>
    );
  }

  return WithRoot;
}
