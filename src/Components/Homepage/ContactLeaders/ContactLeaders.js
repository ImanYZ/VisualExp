import React, { useEffect } from "react";

import { Grid } from "@mui/material";

import YueKuang from "../../../assets/Yue_Kuang.png";
import ShannonKenny from "../../../assets/Shannon_Kenny.png";
import SamuelWood from "../../../assets/Samuel_Wood.png";
import PrithaGangapur from "../../../assets/Pritha_Gangapur.png";
import KaeliFish from "../../../assets/Kaeli_Fish.png";
import ImanYeckehZaare from "../../../assets/Iman_YeckehZaare.png";
import GailGrot from "../../../assets/Gail_Grot.png";
import ElijahFox from "../../../assets/Elijah_Fox.png";
import CatherineKung from "../../../assets/Catherine_Kung.png";
import CatherineGrillo from "../../../assets/Catherine_Grillo.png";

import "./ContactLeaders.css";

const topPictures = [
  { img: CatherineKung, name: "Catherine Kung" },
  { img: GailGrot, name: "Gail Grot" },
  { img: YueKuang, name: "Yue Kuang" },
  { img: ShannonKenny, name: "Shannon Kenny" },
  { img: SamuelWood, name: "Samuel Wood" },
];
const bottomPictures = [
  { img: PrithaGangapur, name: "Pritha Gangapur" },
  { img: ElijahFox, name: "Elijah Fox" },
  { img: ImanYeckehZaare, name: "Iman YeckehZaare" },
  { img: KaeliFish, name: "Kaeli Fish" },
  { img: CatherineGrillo, name: "Catherine Grillo" },
];
const columnTitles = [
  "Interdisciplinary Research",
  "Educational Psychology",
  "Machine Learning & Deep Learning",
  "User Interface Design",
  "UX Research & Marketing",
];

const ContactLeaders = (props) => {
  const row = topPictures.map((leader, i) => {
    return (
      <div key={i}>
        <Grid container>
          <p className="LeaderColumnTitles"> {columnTitles[i]}</p>
        </Grid>
        <Grid container>
          <div className="LeaderInfoDiv">
            <div className="LeaderBox">
              <a href="mailto: onecademy@umich.edu" target="_blank">
                <img className="LeaderImage" src={leader.img} alt="leader" />
              </a>
              <p className="LeaderName"> {leader.name} </p>
            </div>
            <div className="LeaderBox">
              <a href="mailto: onecademy@umich.edu" target="_blank">
                <img
                  className="LeaderImage"
                  src={bottomPictures[i].img}
                  alt="leader"
                />{" "}
              </a>
              <p className="LeaderName">{bottomPictures[i].name}</p>
            </div>
          </div>
        </Grid>
      </div>
    );
  });

  return (
    <div className="ContactLeader">
      <p className="gradientTextLeader">1Cademy Community Leaders</p>
      <div className="ContactContainer">
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="flex-start"
        >
          {row}
        </Grid>
      </div>
    </div>
  );
};

export default React.memo(ContactLeaders);
