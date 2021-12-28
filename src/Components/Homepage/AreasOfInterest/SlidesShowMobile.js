import React, { useState, useEffect } from "react";

import { config } from "react-spring";
import Carousel from "react-spring-3d-carousel";

import {
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  CardMedia,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import DataScience from "../../../assets/DataScience.jpg";
import Education from "../../../assets/Education.jpg";
import Information from "../../../assets/Information.jpg";
import Interdisciplinary from "../../../assets/Interdisciplinary.jpg";
import BiomedicalScience from "../../../assets/BiomedicalScience.jpg";
import Psychology from "../../../assets/Psychology.jpg";
import Programming from "../../../assets/Programming.jpg";

import "./AreasOfInterest.css";

const SlideShowMobile = (props) => {
  const [index, setIndex] = useState(0);
  const fields = [
    { field: "Biomedical Science", img: BiomedicalScience },
    { field: "Information Science", img: Information },
    { field: "Data Science", img: DataScience },
    { field: "Psychology", img: Psychology },
    { field: "Education", img: Education },
    { field: "Interdisciplinary", img: Interdisciplinary },
    { field: "Programming", img: Programming },
  ];

  let slides = fields.map((fieldCard, i) => {
    return {
      key: i,
      content: (
        <div>
          <Card style={{ height: "40vh", width: "50vw" }}>
            <CardMedia
              className="ContentImage"
              image={fieldCard.img}
              title={fieldCard.field}
            />
            {/* <img src={fieldCard.img} alt={fieldCard.field} className="ContentImage" /> */}
            <CardContent
              style={{
                background: props.theme === "Light" ? "#D1CECE" : "#444444",
              }}
            >
              <Typography
                style={{
                  color: props.theme === "Light" ? "#606161" : "#E4E4E4",
                  textAlign: "center",
                  height: "10vh",
                }}
              >
                {fieldCard.field}
              </Typography>
            </CardContent>
          </Card>
        </div>
      ),
    };
  });

  slides = slides.map((slide, i) => {
    return { ...slide, onClick: () => setIndex(i) };
  });

  return (
    <>
      <div id="albumDiv">
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          wrap="nowrap"
        >
          <IconButton
            onClick={() => setIndex(index - 1)}
            className={
              props.theme === "Light" ? "LightModeChevronLeft" : "ChevronLeft"
            }
          >
            <ArrowBackIosIcon
              className="ArrowAlbum"
              style={{ paddingLeft: "5px" }}
            />
          </IconButton>
          <div className="CarouselDiv">
            <Carousel
              slides={slides}
              showNavigation={false}
              offsetRadius={1}
              goToSlide={index}
            />
          </div>
          <IconButton
            onClick={() => setIndex(index + 1)}
            className={
              props.theme === "Light" ? "LightModeChevronRight" : "ChevronRight"
            }
          >
            <ArrowForwardIosIcon className="ArrowAlbum" />
          </IconButton>
        </Grid>
      </div>
    </>
  );
};

export default React.memo(SlideShowMobile);
