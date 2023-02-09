import { Box, Link, Typography } from "@mui/material";
import React from "react";
import { gray200 } from "../../../../utils/colors";

const ABOUT_ITEMS = [
  {
    id: "item-3",
    title: "Supported by Honor Education",
    subtitle: "Honor Education",
    image: "/static/about/sponsor/logo-honor.jpg",
    description: "",
    link: "https://www.honor.education/"
  },
  {
    id: "item-4",
    title: "Supported by University of Michigan",
    subtitle: "School of Information",
    image: "/static/about/sponsor/logo-school-of-information.jpg",
    description: "",
    link: "https://www.si.umich.edu/"
  },
  {
    id: "item-5",
    title: "Supported by Google",
    subtitle: "Google Cloud",
    image: "/static/about/sponsor/logo-google-cloud.png",
    description: "awarded research credits to host 1Cademy on GCP services, under award number 205607640.",
    link: "https://cloud.google.com/edu/researchers"
  },
 
];

const About = () => {
  return (
    <Box
      sx={{
        // pb: { xs: "64px", sm: "96px" },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
        gap: "32px",
        placeItems: "center"
      }}
    >

      {ABOUT_ITEMS.map(cur => (
        <Link key={cur.id} href={cur.link} target="_blank" rel="noopener" sx={{ textDecoration: "none" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              color: gray200,
              ":hover": {
                "& .about-card-content": {
                  background: theme => (theme.palette.mode === "light" ? "#1d1d1d" : "#ebebeb")
                }
              }
            }}
          >
            <img
              src={cur.image}
              alt={cur.title}
              style={{
                width: "100%",
                maxWidth: "300px",
                height: "240px",
                borderRadius: "10px 10px 0px 0px",
                objectFit: "cover"
              }}
            />
            <Box
              className="about-card-content"
              sx={{
                width: "100%",
                maxWidth: "300px",
                minHeight: "150px",
                p: "20px 16px",
                background: theme => (theme.palette.mode === "light" ? "#000000" : "#F9FAFB")
              }}
            >
              <Typography component={"h3"} sx={{ fontSize: "20px", fontWeight: 700, pb: "12px" }}>
                {cur.title}
              </Typography>
              <Typography sx={{ fontSize: "16px", fontWeight: 600, pb: "8px" }}>{cur.subtitle}</Typography>
              {cur.description && <Typography sx={{ fontSize: "12px" }}>{cur.description}</Typography>}
            </Box>
          </Box>
        </Link>
      ))}
    </Box>
  );
};

export default About;
