import Box from "@mui/material/Box";

import withRoot from "./modules/withRoot";

import { HeroMemoized } from "./modules/views/Hero";
import Mechanism, { MECHANISM_ITEMS } from "./modules/views/Mechanism";
import Magnitude from "./modules/views/Magnitude";

import UniversitiesMap from "./modules/views/UniversitiesMap/UniversitiesMap";
import Benefits from "./modules/views/Benefits";
import Topics from "./modules/views/Topics";
import Systems from "./modules/views/Systems";
import About from "./modules/views/About";
import Papers from "./modules/views/Papers";

import AppFooter from "./modules/views/AppFooter2";
import JoinUs from "./modules/views/JoinUs";

import { darkBase, darkblue, gray200 } from "../../utils/colors";
import HomeWrapper from "./HomeWrapper";
import Team from "./modules/views/Team";
import { Stack } from "@mui/material";
import Typography from "./modules/components/Typography";

// const Values = React.lazy(() => import("./modules/views/Values"));
// const What = React.lazy(() => import("./modules/views/What"));
// const UniversitiesMap = React.lazy(() => import("./modules/views/UniversitiesMap/UniversitiesMap"));
// const WhoWeAre = React.lazy(() => import("./modules/views/WhoWeAreWrapper"));
// const JoinUs = React.lazy(() => import("./modules/views/JoinUsWrapper"));

export const SECTION_WITH_ANIMATION = 1;
export const HEADER_HEIGHT = 80;
export const HEADER_HEIGHT_MOBILE = 72;

function Index() {
  return (
    <Box
      id="ScrollableContainer"
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "auto",
        position: "relative",
        backgroundColor: darkBase,
        scrollBehavior: "smooth"
      }}
    >
      <HomeWrapper
        heroSectionChild={<HeroMemoized headerHeight={HEADER_HEIGHT} headerHeightMobile={HEADER_HEIGHT_MOBILE} />}
        mechanismSectionChild={<Mechanism mechanisms={MECHANISM_ITEMS} />}
        magnitudeSectionChild={
          <>
            <Magnitude />
            <UniversitiesMap theme={"Dark"} />
          </>
        }
        benefitSectionChild={<Benefits />}
        topicsSectionChild={<Topics />}
        systemSectionChild={<Systems />}
        aboutSectionChild={
          <Stack spacing={"32px"}>
            <Box>
              <Typography
                component={"h4"}
                variant={"h4"}
                sx={{
                  fontSize: "30px",
                  fontWeight: 600,
                  my: "32px",
                  cursor: "pointer",
                  textTransform: "none",
                  color: gray200
                }}
              >
                Sponsors
              </Typography>
              <Typography>Sponsors</Typography>
              <About />
            </Box>
            <Box>
              <Typography
                component={"h4"}
                variant={"h4"}
                sx={{
                  fontSize: "30px",
                  fontWeight: 600,
                  my: "32px",
                  cursor: "pointer",
                  textTransform: "none",
                  color: gray200
                }}
              >
                Our Team
              </Typography>
              <Team />
            </Box>
            <Box>
              <Typography
                component={"h4"}
                variant={"h4"}
                sx={{
                  fontSize: "30px",
                  fontWeight: 600,
                  my: "32px",
                  cursor: "pointer",
                  textTransform: "none",
                  color: gray200
                }}
              >
                Related Research
              </Typography>
              <Papers />
            </Box>
          </Stack>
        }
      />

      <Box
        id="join-us"
        sx={{
          py: { xs: "64px", sm: "96px" },
          maxWidth: "1216px",
          m: "auto",
          scrollMarginTop: "16px"
        }}
      >
       
        <JoinUs />
      </Box>

      <AppFooter />
      <link rel="preload" href="artboard-1.riv" as="fetch" crossOrigin="anonymous" />
    </Box>
  );
}

export default withRoot(Index);
