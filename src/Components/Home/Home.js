import React from "react";

import Box from "@mui/material/Box";
import Communities from "./modules/views/Communities";
import ProductSmokingHero from "./modules/views/ProductSmokingHero";
import AppFooter from "./modules/views/AppFooter";
import Landing from "./modules/views/Landing";
import ProductValues from "./modules/views/ProductValues";
import HowItWorks from "./modules/views/HowItWorks";
import ProductCTA from "./modules/views/ProductCTA";
import AppAppBar from "./modules/views/AppAppBar";
import withRoot from "./modules/withRoot";

function Index() {
  return (
    <Box sx={{ height: "100vh", overflowY: "auto", overflowX: "auto" }}>
      <AppAppBar />
      <Landing />
      <HowItWorks />
      <ProductValues />
      <Communities />
      <ProductCTA />
      <ProductSmokingHero />
      <AppFooter />
    </Box>
  );
}

export default withRoot(Index);
