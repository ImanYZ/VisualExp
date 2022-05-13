import React, { useMemo } from "react";

import useMediaQuery from "@mui/material/useMediaQuery";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "./theme";

export default function withRoot(Component) {
  function WithRoot(props) {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

    // useEffect(() => {
    //   if (!colorMode) {
    // setColorMode(prefersDarkMode ? "dark" : "light");
    //   }
    // }, [colorMode, prefersDarkMode]);

    const memoizedTheme = useMemo(
      // () => theme(prefersDarkMode ? "dark" : "light"),
      () => theme("light"),
      [prefersDarkMode]
    );

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
