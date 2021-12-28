import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";

import theme from "./ui/Theme";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import LandingPage from "./LandingPage";
import Services from "./Services";
import CustomSoftware from "./CustomSoftware";
import MobileApps from "./MobileApps";
import Websites from "./Websites";
import Revolution from "./Revolution";
import About from "./About";
import Contact from "./Contact";
import Estimate from "./Estimate";

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [value, setValue] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <Header
        value={value}
        setValue={setValue}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
      <Routes>
        <Route
          path="*/Home/services"
          element={
            <Services setValue={setValue} setSelectedIndex={setSelectedIndex} />
          }
        />
        <Route
          path="*/Home/customsoftware"
          element={
            <CustomSoftware
              setValue={setValue}
              setSelectedIndex={setSelectedIndex}
            />
          }
        />
        <Route
          path="*/Home/mobileapps"
          element={
            <MobileApps
              setValue={setValue}
              setSelectedIndex={setSelectedIndex}
            />
          }
        />
        <Route
          path="*/Home/websites"
          element={
            <Websites setValue={setValue} setSelectedIndex={setSelectedIndex} />
          }
        />
        <Route
          path="*/Home/revolution"
          element={
            <Revolution
              setValue={setValue}
              setSelectedIndex={setSelectedIndex}
            />
          }
        />
        <Route
          path="*/Home/about"
          element={
            <About setValue={setValue} setSelectedIndex={setSelectedIndex} />
          }
        />
        <Route
          path="*/Home/contact"
          element={
            <Contact setValue={setValue} setSelectedIndex={setSelectedIndex} />
          }
        />
        <Route
          path="*/Home/estimate"
          element={
            <Estimate setValue={setValue} setSelectedIndex={setSelectedIndex} />
          }
        />
        <Route
          path="*"
          element={
            <LandingPage
              setValue={setValue}
              setSelectedIndex={setSelectedIndex}
            />
          }
        />
      </Routes>
      <Footer setValue={setValue} setSelectedIndex={setSelectedIndex} />
    </ThemeProvider>
  );
}

export default App;
