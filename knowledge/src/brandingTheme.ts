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

const systemFont = ["Roboto", "sans-serif"];

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
    typography: {
      fontFamily: [...systemFont].join(","),
      fontFamilySystem: systemFont.join(","),
      h3: {},
      button: {
        textTransform: "initial"
      }
    }
  } as ThemeOptions);

export function getThemedComponents(): {
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
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            "&": {
              paddingTop: "0px",
              paddingBottom: "0px"
            },
            "&:last-child": {
              paddingTop: "0px",
              paddingBottom: "0px"
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            "&:hover": {
              boxShadow: "2px 2px 15px rgba(0, 0, 0, 0.2)"
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          icon: {
            color: common.orange
          }
        }
      }
    }
  };
}
