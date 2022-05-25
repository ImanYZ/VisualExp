import { grey } from "@mui/material/colors";
import { ThemeOptions, Theme } from "@mui/material/styles";

declare module "@mui/material/styles/createPalette" {
  interface CommonColors {
    black: string;
    white: string;
    orange: string;
    orangeDark: string;
    darkGrayBackground: string;
  }
}

const common = {
  black: "#1a1a1a",
  white: "#ffffff",
  orange: "#ff8a33",
  orangeDark: "#ff6d00",
  darkGrayBackground: "#28282A",
};

const systemFont = [
  "Work Sans",
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  '"Helvetica Neue"',
  "Arial",
  "sans-serif",
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
];

export const getMetaThemeColor = (mode: "light" | "dark") => {
  const themeColor = {
    light: common.orange,
    dark: common.orangeDark,
  };
  return themeColor[mode];
};

export const getDesignTokens = (mode: "light" | "dark") =>
  ({
    palette: {
      primary: {
        main: common.orange,
        ...(mode === "dark" && {
          main: grey[500],
        }),
      },
      warning: {
        main: "#ffc071",
        dark: "#ffb25e",
      },
      divider: mode === "dark" ? grey[400] : grey[400],
      mode,
      background: {
        default: "#f2f2f2",
        paper: common.white,
      },
      ...(mode === "dark" && {
        background: {
          default: grey[600],
          paper: grey[700],
        },
      }),
      common,
      ...(mode === "light" && {
        text: {
          primary: common.black,
          secondary: grey[700],
        },
      }),
      ...(mode === "dark" && {
        text: {
          primary: common.white,
          secondary: grey[300],
        },
      }),
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: [...systemFont].join(","),
      fontFamilySystem: systemFont.join(","),
      button: {
        textTransform: "initial",
      },
    },
  } as ThemeOptions);

export function getThemedComponents(theme: Theme): {
  components: Theme["components"];
} {
  return {
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableTouchRipple: true,
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          // variant: "contained",
        },
        styleOverrides: {
          containedPrimary: {
            backgroundColor: common.orange,
            color: common.white,
          },
        },
        variants: [
          {
            props: { variant: "contained" },
            style: {
              "&:hover, &.Mui-focusVisible": {
                backgroundColor: common.orangeDark,
              },
            },
          },
        ],
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: common.darkGrayBackground,
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
      },
    },
  };
}
