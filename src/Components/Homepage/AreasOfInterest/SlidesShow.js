import React, { useState, useEffect } from "react";

import { config } from "react-spring";
import Carousel from "react-spring-3d-carousel";

import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  requirePropFactory,
  Typography,
} from "@material-ui/core";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import DataScience from "../../../assets/DataScience.jpg";
import MachineLearning from "../../../assets/MachineLearning.jpg";
import NetworkAnalysis from "../../../assets/NetworkAnalysis.jpg";
import StatisticalAnalysis from "../../../assets/StatisticalAnalysis.jpg";
import CausalInference from "../../../assets/CausalInference.jpg";
import Education from "../../../assets/Education.jpg";
import EducationPolicy from "../../../assets/EducationPolicy.jpg";
import LearningTechnology from "../../../assets/LearningTechnology.jpg";
import EquityAndInclusionInEducation from "../../../assets/EquityAndInclusionInEducation.jpg";
import LearningScience from "../../../assets/LearningScience.jpg";
import Information from "../../../assets/Information.jpg";
import LibrarianshipAndArchival from "../../../assets/LibrarianshipAndArchival.jpg";
import ComputerSupportedCooperativeWork from "../../../assets/ComputerSupportedCooperativeWork.jpg";
import UserExperienceResearchAndDesign from "../../../assets/UserExperienceResearchAndDesign.jpg";
import InformationVisualization from "../../../assets/InformationVisualization.jpg";
import Interdisciplinary from "../../../assets/Interdisciplinary.jpg";
import BiomedicalScience from "../../../assets/BiomedicalScience.jpg";
import SarsCov2 from "../../../assets/SarsCov2.jpg";
import Neuroscience from "../../../assets/Neuroscience.jpg";
import BehavioralEconomics from "../../../assets/BehavioralEconomics.jpg";
import Psychology from "../../../assets/Psychology.jpg";
import SocialPsychology from "../../../assets/SocialPsychology.jpg";
import CognitivePsychology from "../../../assets/CognitivePsychology.jpg";
import DevelopmentalPsychology from "../../../assets/DevelopmentalPsychology.jpg";
import Biopsychology from "../../../assets/Biopsychology.jpg";
import Programming from "../../../assets/Programming.jpg";
import FrontendDevelopment from "../../../assets/FrontendDevelopment.jpg";
import BackendDevelopment from "../../../assets/BackendDevelopment.jpg";
import Python from "../../../assets/Python.jpg";
import Databases from "../../../assets/Databases.jpg";

import "./AreasOfInterest.css";

import Line from "../../Map/Line/Line";

const SlidesShow = (props) => {
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
          <Card>
            <img
              src={fieldCard.img}
              alt={fieldCard.field}
              style={{ height: "200px" }}
            />
            <CardContent
              style={{
                background: props.theme === "Light" ? "#D1CECE" : "#444444",
              }}
            >
              <Typography
                variant="h5"
                style={{
                  color: props.theme === "Light" ? "#606161" : "#E4E4E4",
                  textAlign: "center",
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

  const subfields = [
    [
      {
        name: "Librarianship and Archival Practice",
        padding: 0,
        img: LibrarianshipAndArchival,
      },
      {
        name: "Computer Supported Cooperative Work",
        padding: 0,
        img: ComputerSupportedCooperativeWork,
      },
      {
        name: "User Experience Research and Design",
        padding: 0,
        img: UserExperienceResearchAndDesign,
      },
      {
        name: "Information Visualization",
        padding: 0,
        img: InformationVisualization,
      },
    ],
    [
      { name: "Machine Learning", padding: 10, img: MachineLearning },
      { name: "Network Analysis", padding: 10, img: NetworkAnalysis },
      { name: "Statistical Analysis", padding: 10, img: StatisticalAnalysis },
      { name: "Causal Inference", padding: 10, img: CausalInference },
    ],
    [
      { name: "Social Psychology", padding: 10, img: SocialPsychology },
      { name: "Cognitive Psychology", padding: 10, img: CognitivePsychology },
      {
        name: "Developmental Psychology",
        padding: 0,
        img: DevelopmentalPsychology,
      },
      { name: "Biopsychology", padding: 10, img: Biopsychology },
    ],
    [
      { name: "Education Policy", padding: 10, img: EducationPolicy },
      { name: "Learning Technology", padding: 10, img: LearningTechnology },
      {
        name: "Equity and Inclusion in Education",
        padding: 0,
        img: EquityAndInclusionInEducation,
      },
      { name: "Learning Science", padding: 10, img: LearningScience },
    ],
    [
      { name: "Biomedical Sciences", padding: 10, img: BiomedicalScience },
      { name: "SARS-CoV-2 (COVID-19)", padding: 0, img: SarsCov2 },
      { name: "Neuroscience", padding: 10, img: Neuroscience },
      { name: "Behavioral Economics", padding: 10, img: BehavioralEconomics },
    ],
    [
      { name: "Front-end Development", padding: 0, img: FrontendDevelopment },
      { name: "Back-end Development", padding: 0, img: BackendDevelopment },
      { name: "Python", padding: 10, img: Python },
      { name: "Databases", padding: 10, img: Databases },
    ],
  ];
  const currentFieldIndex =
    ((index % subfields.length) + subfields.length) % subfields.length;

  const subCategories = subfields[currentFieldIndex].map((field, i) => {
    return (
      <div className="subfieldContent" key={i}>
        <div
          id="subAlbum"
          style={{
            background: props.theme === "Light" ? "#D1CECE" : "#444444",
          }}
        >
          <img src={field.img} alt={field.field} className="SubFiledImage" />
          <div
            className="subFieldTextDiv"
            style={{ color: props.theme === "Light" ? "#606161" : "#E4E4E4" }}
          >
            {field.name}
          </div>
        </div>
      </div>
    );
  });

  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const updateWindowDimensions = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", updateWindowDimensions);
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);

  const responsiveLines = (
    <div id="AreasOfInterestArrows">
      <Line
        identifier="Line1"
        label=""
        selected={false}
        from={{ x: 0.15 * width, y: 47.5 }}
        to={{ x: width / 2, y: -65 }}
        leftDirection={true}
        borderBottomStyle="2.5px solid"
        color="#01d36a"
      />
      <Line
        identifier="Line2"
        label=""
        selected={false}
        from={{ x: 0.4 * width, y: 47.5 }}
        to={{ x: width / 2, y: -65 }}
        leftDirection={true}
        borderBottomStyle="2.5px solid"
        color="#01d36a"
      />
      <Line
        identifier="Line3"
        label=""
        selected={false}
        from={{ x: 0.6 * width, y: 47.5 }}
        to={{ x: width / 2, y: -65 }}
        leftDirection={false}
        borderBottomStyle="2.5px solid"
        color="#01d36a"
      />
      <Line
        identifier="Line4"
        label=""
        selected={false}
        from={{ x: 0.85 * width, y: 47.5 }}
        to={{ x: width / 2, y: -65 }}
        leftDirection={false}
        borderBottomStyle="2.5px solid"
        color="#01d36a"
      />
    </div>
  );

  return (
    <>
      <div id="albumDiv">
        <Grid
          className="carousel"
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
              offsetRadius={5}
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

      {responsiveLines}
      <div>
        <Grid
          container
          direction="row"
          justify="space-evenly"
          alignItems="center"
          style={{ paddingTop: 50 }}
          wrap="nowrap"
        >
          {subCategories}
        </Grid>
      </div>
    </>
  );
};

export default React.memo(SlidesShow);
