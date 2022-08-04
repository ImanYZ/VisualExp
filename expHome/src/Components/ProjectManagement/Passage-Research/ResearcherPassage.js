/* eslint-disable jsx-a11y/iframe-has-title */
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState, fullnameState } from "../../../store/AuthAtoms";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const ResearcherPassage = () => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [passages, setPassages] = useState([]);
  const [pConURL, setPConURL] = useState("");
  const [userCondition, setUserCondition] = React.useState(0);
  const [passageCondition, setPassageCondition] = React.useState(0);


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    const userDoc = await firebase.db.collection("users").doc(fullname).get();
    const userData = userDoc.data();
    const pConditions = userData.pConditions;
    const passages = [];
    pConditions.forEach(async (doc, index) => {
      const passageDoc = await firebase.db.collection("passages").doc(doc.passage).get();
      const data = await passageDoc.data();
      passages.push({
        condition: doc.condition,
        ...data
      });
      if (pConditions.length === (index + 1)) {
        setPassages(passages);
      }
    });
  }, [])

  useEffect(() => {
    if (passages.length > 0) {
      const [firstPassage] = passages;
      setPConURL(firstPassage["linkH1"]);
      setUserCondition(firstPassage.title);
      setPassageCondition("H1");
    }
  }, [passages]);

  const handleUserConditionChange = (event) => {
    const userCondition = event.target.value;
    const allPassages = [...passages];
    const fIndex = allPassages.findIndex(i => i.title === userCondition);
    const passage = allPassages[fIndex];
    setPConURL(passage["linkH1"]);
    setUserCondition(userCondition);
    setPassageCondition("H1");
  }

  const handlePassageConditionChange = (event) => {
    const pCondition = event.target.value;
    const allPassages = [...passages];
    const fIndex = allPassages.findIndex(i => i.title === userCondition);
    const passage = allPassages[fIndex];
    setPConURL(passage[`link${pCondition}`]);
    setPassageCondition(pCondition);
  }

  return (
    <div style={{ userSelect: "none", background: '#e2e2e2' }}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ width: '70%', margin: "15px 0px 0px 20px", overflow: "scroll", height: "90vh" }}>
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", flexDirection: "column", marginRight: "20px" }}>
              <Typography variant="h6" component="div">
                User Condition
              </Typography>
              <Select
                id="demo-simple-select-helper"
                value={userCondition}
                onChange={handleUserConditionChange}
              >
                {passages && passages?.length > 0 && passages.map(doc => (
                  <MenuItem value={doc.title}>
                    {doc.title}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" component="div">
                Passage Condition
              </Typography>
              <Select
                id="demo-simple-select-helper"
                value={passageCondition}
                onChange={handlePassageConditionChange}
              >
                <MenuItem value={"H1"}>H1</MenuItem>
                <MenuItem value={"H2"}>H2</MenuItem>
                <MenuItem value={"K1"}>K1</MenuItem>
                <MenuItem value={"K2"}>K2</MenuItem>
                <MenuItem value={"L1"}>L1</MenuItem>
                <MenuItem value={"L2"}>L2</MenuItem>
              </Select>
            </div>
          </div>
          <iframe id="PassageFrame" frameBorder="0" src={pConURL}></iframe>
        </div>
        <div style={{ width: '30%', margin: "15px 10px 10px 10px", height: "90vh", overflowX: "auto", overflowYy: "auto" }}>
          <Typography variant="h4" gutterBottom component="div">
            All your Passages
          </Typography>
          {passages && passages?.length > 0 && passages?.map((doc, index) => {
            return (
              <Accordion square={false}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography variant="h6" gutterBottom component="div">
                    {doc.condition} - {doc.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Question and Answer Accordion */}
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography variant="h5" gutterBottom component="div">
                        Question and Answer
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {/* All Questions's Accordion */}
                      {doc.questions.map((question, index) => {
                        return (
                          <Accordion key={index}>
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                            >
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
                        )
                      })}
                    </AccordionDetails>
                  </Accordion>
                  {/* Phrases Accordion */}
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography variant="h5" gutterBottom component="div">
                        Phrases
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {doc.phrases.map((phrase, index) =>
                      (
                        <ul key={index}>
                          <li>
                            <Typography variant="h6" component="div">
                              {phrase}
                            </Typography>
                          </li>
                        </ul>
                      )
                      )}
                    </AccordionDetails>
                  </Accordion>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default ResearcherPassage;
