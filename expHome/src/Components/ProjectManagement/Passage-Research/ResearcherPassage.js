/* eslint-disable jsx-a11y/iframe-has-title */
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState, fullnameState } from "../../../store/AuthAtoms";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const ResearcherPassage = () => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [passages, setPassages] = useState([]);
  const [pConURL, setPConURL] = useState("");
  const [pConURL2, setPConURL2] = useState("");
  const [userCondition, setUserCondition] = React.useState({});
  const [userCondition2, setUserCondition2] = React.useState({});
  const [passage2, setPassage2] = useState({});
  const [passage1, setPassage1] = useState({});
  const [passageCondition, setPassageCondition] = React.useState(0);
  const [passageCondition2, setPassageCondition2] = React.useState(0);
  const optionsConditions = ["H1", "H2", "K1", "K2", "L1", "L2"];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    let passags = [];
    let titles = [];
    const userDoc = await firebase.db.collection("researchers").doc(fullname).get();
    const userData = userDoc.data();
    let userProjects = Object.keys(userData.projects);
    const passageDocs = await firebase.db.collection("passages").get();

    for (let passageDoc of passageDocs.docs) {
      const data = passageDoc.data();
      let passageProjects = Object.keys(data.projects);
      if (passageProjects.length !== 0) {
        if (passageProjects.find(element => userProjects.includes(element))) {
          passags.push({
            ...data
          });
          titles.push(data.title);
        }
      }
    }

    setPassages(passags);
    setUserCondition(titles[0]);
    setPassageCondition("H1");
    setPConURL(passags[0]["linkH1"]);
    setUserCondition2(titles[0]);
    setPassageCondition2("H1");
    setPConURL2(passags[0]["linkH1"]);
    setPassage2(passags[0]);
    setPassage1(passags[0]);
  }, [firebase, fullname]);

  const handlePassageChange = event => {
    const userCondition = event.target.value;
    const allPassages = [...passages];
    const fIndex = allPassages.findIndex(i => i.title === userCondition);
    const passage = allPassages[fIndex];
    setPConURL(passage["linkH1"]);
    setUserCondition(userCondition);
    setPassageCondition("H1");
    setPassage1(passage);
  };

  const handlePassageConditionChange = event => {
    const pCondition = event.target.value;
    setPConURL(passage1[`link${pCondition}`]);
    setPassageCondition(pCondition);
  };

  const handlePassageChange2 = event => {
    const userCondition = event.target.value;
    const allPassages = [...passages];
    const fIndex = allPassages.findIndex(i => i.title === userCondition);
    const passage = allPassages[fIndex];
    setPConURL2(passage["linkH1"]);
    setUserCondition2(userCondition);
    setPassageCondition2("H1");
    setPassage2(passage);
  };

  const handlePassageConditionChange2 = event => {
    const pCondition = event.target.value;
    setPConURL2(passage2[`link${pCondition}`]);
    setPassageCondition2(pCondition);
  };

  return (
    <div style={{ userSelect: "none", background: "#e2e2e2" }}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ width: "70%", margin: "15px 0px 0px 20px", overflow: "scroll", height: "90vh" }}>
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", flexDirection: "column", marginRight: "20px" }}>
              <Typography variant="h6" component="div">
                Passage
              </Typography>
              <Select id="demo-simple-select-helper" value={userCondition} onChange={handlePassageChange}>
                {passages &&
                  passages?.length > 0 &&
                  passages.map(doc => <MenuItem value={doc.title}>{doc.title}</MenuItem>)}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" component="div">
                Passage Condition
              </Typography>
              <Select id="demo-simple-select-helper" value={passageCondition} onChange={handlePassageConditionChange}>
                {optionsConditions.map(option => {
                  return (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  );
                })}
              </Select>
            </div>
          </div>
          <iframe id="PassageFrame" frameBorder="0" src={pConURL}></iframe>
          <Typography variant="h5" gutterBottom component="div">
            Questions and Answers
          </Typography>
          {passage1 &&
            passage1?.questions?.length > 0 &&
            passage1.questions.map((question, index) => {
              return (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                    <Typography variant="h6" component="div">
                      {`${index + 1}. ${question.stem}`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ul>
                      <li>
                        <Typography variant="h6" component="div">
                          {question.a}
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="h6" component="div">
                          {question.b}
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="h6" component="div">
                          {question.c}
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="h6" component="div">
                          {question.d}
                        </Typography>
                      </li>
                    </ul>
                    <Typography variant="h6" gutterBottom component="div" mb={2}>
                      Answer: <mark>{question[question.answer]}</mark>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          {passage1?.phrases?.length > 0 && (
            <Typography variant="h5" gutterBottom component="div">
              Phrases
            </Typography>
          )}

          <div>
            {passage1 &&
              passage1?.phrases?.length > 0 &&
              passage1.phrases.map((phrase, index) => (
                <ul key={index}>
                  <li>
                    <Typography variant="h6" component="div">
                      {phrase}
                    </Typography>
                  </li>
                </ul>
              ))}
          </div>
        </div>
        <div style={{ width: "70%", margin: "15px 0px 0px 20px", overflow: "scroll", height: "90vh" }}>
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", flexDirection: "column", marginRight: "20px" }}>
              <Typography variant="h6" component="div">
                Passage
              </Typography>
              <Select id="demo-simple-select-helper" value={userCondition2} onChange={handlePassageChange2}>
                {passages &&
                  passages?.length > 0 &&
                  passages?.map(doc => <MenuItem value={doc.title}>{doc.title}</MenuItem>)}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" component="div">
                Passage Condition
              </Typography>
              <Select id="demo-simple-select-helper" value={passageCondition2} onChange={handlePassageConditionChange2}>
                {optionsConditions.map(option => {
                  return <MenuItem value={option}>{option}</MenuItem>;
                })}
              </Select>
            </div>
          </div>
          <iframe id="PassageFrame" frameBorder="0" src={pConURL2}></iframe>
          <Typography variant="h5" gutterBottom component="div">
            Questions and Answers
          </Typography>
          {passage2 &&
            passage2?.questions?.length > 0 &&
            passage2?.questions.map((question, index) => {
              return (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                    <Typography variant="h6" component="div">
                      {`${index + 1}. ${question.stem}`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ul>
                      <li>
                        <Typography variant="h6" component="div">
                          {question.a}
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="h6" component="div">
                          {question.b}
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="h6" component="div">
                          {question.c}
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="h6" component="div">
                          {question.d}
                        </Typography>
                      </li>
                    </ul>
                    <Typography variant="h6" gutterBottom component="div" mb={2}>
                      Answer: <mark>{question[question.answer]}</mark>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          {passage2?.phrases?.length > 0 && (
            <Typography variant="h5" gutterBottom component="div">
              Phrases
            </Typography>
          )}

          <div>
            {passage2 &&
              passage2?.phrases?.length > 0 &&
              passage2.phrases.map((phrase, index) => (
                <ul key={index}>
                  <li>
                    <Typography variant="h6" component="div">
                      {phrase}
                    </Typography>
                  </li>
                </ul>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearcherPassage;
