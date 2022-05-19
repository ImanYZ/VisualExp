import "../styles/global.css";
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

const emotionCache = createEmotionCache();

function MyApp({ Component, pageProps }: AppProps) {
  const theme = useMemo(() => {
    const brandingDesignTokens = getDesignTokens("light");
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
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
}

export default MyApp;
