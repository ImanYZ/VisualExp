import { useMemo } from "react";
import Head from "next/head";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "../src/createEmotionCache";
import { getDesignTokens, getThemedComponents } from "../src/brandingTheme";
import { createTheme } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import type { AppProps } from "next/app";

// Client-side cache shared for the whole session
// of the user in the browser.

const emotionCache = createEmotionCache();

function MyApp({ Component, pageProps }: AppProps) {
  const theme = useMemo(() => {
    const brandingDesignTokens = getDesignTokens("dark");
    let nextTheme = createTheme({
      ...brandingDesignTokens,
      palette: {
        ...brandingDesignTokens.palette,
        mode: "light",
      },
    });

    nextTheme = deepmerge(nextTheme, getThemedComponents(nextTheme));
    return nextTheme;
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, 
                consistent, and simple baseline to
                build upon. */}

        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
}

export default MyApp;
