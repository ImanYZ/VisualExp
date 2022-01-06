import React from "react";

import Box from "@mui/material/Box";
import Communities from "./modules/views/Communities";
import ProductSmokingHero from "./modules/views/ProductSmokingHero";
import AppFooter from "./modules/views/AppFooter";
import ProductHero from "./modules/views/ProductHero";
import ProductValues from "./modules/views/ProductValues";
import ProductHowItWorks from "./modules/views/ProductHowItWorks";
import ProductCTA from "./modules/views/ProductCTA";
import AppAppBar from "./modules/views/AppAppBar";
import withRoot from "./modules/withRoot";

function Index() {
  return (
    <Box sx={{ height: "100vh", overflowY: "auto", overflowX: "auto" }}>
      <AppAppBar />
      <ProductHero />
      <ProductValues />
      <Communities />
      <ProductHowItWorks />
      <ProductCTA />
      <ProductSmokingHero />
      <AppFooter />
    </Box>
  );
}

export default withRoot(Index);
