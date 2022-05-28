import { grey } from "@mui/material/colors";
import { Theme, ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles/createPalette" {
  interface CommonColors {
    black: string;
    white: string;
    orange: string;
    orangeLight: string;
    orangeDark: string;
    darkGrayBackground: string;
    gray: string;
  }
}

const common = {
  black: "#1a1a1a",
  white: "#ffffff",
  orange: "#ff8a33",
  orangeLight: "#f9e2d1",
  orangeDark: "#ff6d00",
  darkGrayBackground: "#28282A",
  gray: "#D3D3D3"
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
  '"Segoe UI Symbol"'
];

export const getMetaThemeColor = (mode: "light" | "dark") => {
  const themeColor = {
    light: common.orange,
    dark: common.orangeDark
  };
  return themeColor[mode];
};

export const getDesignTokens = (mode: "light" | "dark") =>
  ({
    palette: {
      primary: {
        main: common.orange,
        ...(mode === "dark" && {
          main: grey[500]
        })
      },
      warning: {
        main: "#ffc071",
        dark: "#ffb25e"
      },
      divider: mode === "dark" ? grey[400] : grey[400],
      mode,
      background: {
        default: "#F8F8F8",
        paper: common.white
      },
      ...(mode === "dark" && {
        background: {
          default: grey[600],
          paper: grey[700]
        }
      }),
      common,
      ...(mode === "light" && {
        text: {
          primary: common.black,
          secondary: grey[700]
        }
      }),
      ...(mode === "dark" && {
        text: {
          primary: common.white,
          secondary: grey[300]
        }
      })
    },
    shape: {
      borderRadius: 10
    },
    typography: {
      fontFamily: [...systemFont].join(","),
      fontFamilySystem: systemFont.join(","),
      h3: {},
      button: {
        textTransform: "initial"
      }
    }
  } as ThemeOptions);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getThemedComponents(theme: Theme): {
  components: Theme["components"];
} {
  return {
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableTouchRipple: true
        }
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true
          // variant: "contained",
        },
        styleOverrides: {
          containedPrimary: {
            backgroundColor: "common.orange",
            color: common.white
          }
        },
        variants: [
          {
            props: { variant: "contained" },
            style: {
              "&:hover, &.Mui-focusVisible": {
                backgroundColor: common.orangeDark
              }
            }
          },
          {
            props: { variant: "contained" },
            style: {
              "&:hover, &.Mui-focusVisible": {
                backgroundColor: common.orangeDark
              }
            }
          }
        ]
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            "&": {
              color: common.black,
              borderRadius: "40px",
              border: "solid 2px",
              borderColor: common.gray,
              background: common.white
            },
            "&:hover": {
              color: common.black,
              background: common.orangeLight,
              borderColor: common.orangeLight
            },
            "&.Mui-selected": {
              color: common.white,
              background: common.orange,
              borderColor: common.orange
            },
            "&.Mui-selected:hover": {
              color: common.black,
              background: common.orangeLight,
              borderColor: common.orangeLight
            }
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: common.darkGrayBackground
          }
        }
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true
        }
      }
    }
  };
}
