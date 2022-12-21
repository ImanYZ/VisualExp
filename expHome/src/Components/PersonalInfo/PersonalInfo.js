import React, { useState, useEffect, useCallback } from "react";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import List from '@mui/material/List';

import Done from "@mui/icons-material/Done";

import DateAndGenderPickers from "./DateAndGenderPickers";

import ValidatedInput from "../ValidatedInput/ValidatedInput";

import { ETHNICITY_VALUES, EDUCATION_VALUES } from "./DemographicConstants";

import "./PersonalInfo.css";
import { useRecoilState } from "recoil";
import { personalInfoProcessChoicesState } from "../../store/ExperimentAtoms";

const sameThing = value => value;
const arrayToString = value => value.join(", ");
const getMajor = option => option.Major;
const getMajorCategory = option => option.Major_Category;

const renderMajor = params => <ValidatedInput {...params} label="Major" variant="outlined" />;

const MUISelectMenuItem = item => option => {
  return (
    <MenuItem key={option} className={item === option ? "" : "selectOption"} value={option}>
      {item === option ? <Done /> : ""}
      {option}
    </MenuItem>
  );
};

const PersonalInfo = props => {
  const [sortedLanguages, setSortedLanguages] = useState(["English"]);
  const [majors, setMajors] = useState([]);

  const [personalInfoChoices, setPersonalInfoChoices] = useState({});
  const [personalInfoProcessChoices, setPersonalInfoProcessChoices] = useRecoilState(personalInfoProcessChoicesState);

  const populateLanguages = useCallback(async () => {
    if (sortedLanguages.length >= 1) {
      const ISO6391Obj = await import("iso-639-1");
      const ISO6391 = [...ISO6391Obj.default.getAllNames().sort((l1, l2) => (l1 < l2 ? -1 : 1)), "Prefer not to say"];
      setSortedLanguages(ISO6391);
    }
  }, [sortedLanguages]);

  const populateMajors = useCallback(async () => {
    if (majors.length === 0) {
      const majorsObj = await import("../../assets/edited_majors.json");
      const majorsList = [...majorsObj.default, { Major: "Prefer not to say", Major_Category: "Prefer not to say" }]
        .sort((l1, l2) => (l1.Major < l2.Major ? -1 : 1))
        .sort((l1, l2) => (l1.Major_Category < l2.Major_Category ? -1 : 1));
      setMajors(majorsList);
    }
  }, [majors]);

  useEffect(() => {
    populateMajors();
    populateLanguages();
  }, []);

  const languageItems = useCallback(MUISelectMenuItem(props.language), [props.language]);

  const educationItems = useCallback(MUISelectMenuItem(props.education), [props.education]);

  const changeMajor = useCallback((event, value, reason) => props.setMajor(value), [props.setMajor]);

  const listOfItems0 = [
    "Is talkative",
    "Tends to find fault with others",
    "Does a thorough job",
    " Is depressed, blue",
    "Is original, comes up with new ideas",
    " Is reserved",
    "Is helpful and unselfish with others",
    "Can be somewhat careless",

    "Is relaxed, handles stress well",
    "Is curious about many different things",
    "Is full of energy	",
    "Starts quarrels with others",
    "Is a reliable worker	",
    "Can be tense",
    "Is ingenious, a deep thinker",
    "Generates a lot of enthusiasm"
  ];
  const listOfItems1 = [
    "Has a forgiving nature",
    "Tends to be disorganized",
    "Worries a lot",
    "Has an active imagination",
    "Tends to be quiet",
    "Is generally trusting",
    "Tends to be lazy",
    "Is emotionally stable, not easily upset",

    "Is inventive	",
    "Has an assertive personality",
    "Can be cold and aloof",
    "Perseveres until the task is finished	",
    "Can be moody",
    "Values artistic, aesthetic experiences",
    "Is sometimes shy, inhibited",
    "Is considerate and kind to almost everyone"
  ];
  const listOfItems2 = [
    "Does things efficiently	",
    "Remains calm in tense situations",
    "Prefers work that is routine",
    "Is outgoing, sociable	",
    "Is sometimes rude to others	",
    "Makes plans and follows through with them	",
    "Gets nervous easily	",
    "Likes to reflect, play with ideas",

    "Has few artistic interests",
    "Likes to cooperate with others",
    "Is easily distracted",
    "Is sophisticated in art, music, or literature"
  ];
  const listOfItems = listOfItems0.concat(listOfItems1, listOfItems2);
  const ethnicityItems = useCallback(
    option => {
      return (
        <MenuItem key={option} value={option}>
          <Checkbox className="checkbox" checked={props.ethnicity.includes(option)} />
          <ListItemText primary={option} />
        </MenuItem>
      );
    },
    [props.ethnicity]
  );
  const reversedScore = (answer) => {
    let _answer = answer;
    if (answer === "1") {
      _answer = "5";
    } else if (answer === "2") {
      _answer = "4";
    } else if (answer === "5") {
      _answer = "1";
    } else if (answer === "4") {
      _answer = "2";
    }
    return _answer;
  };
  const handleNext = () => {
    const reversedQuestions = [
      5, 20, 30,
      1, 11, 26, 36,
      7, 17, 22, 42,
      8, 23, 33,
      34, 40
    ];

    const _personalInfoChoices = {...personalInfoChoices};
    for(const listItemIdx of reversedQuestions) {
      _personalInfoChoices[listOfItems[listItemIdx]] = reversedScore(_personalInfoChoices[listOfItems[listItemIdx]]);
    }

    const extraVersionQuestionIndexes = [0, 5, 10, 15, 20, 24, 30, 35];
    const agreeablenessQuestionIndexes = [1, 6, 11, 16, 21, 26, 31, 36, 41];
    const conscientiousnessQuestionIndexes = [2, 7, 12, 17, 21, 26, 32, 37, 42];
    const emotionalStabilityQuestionIndexes = [3, 8, 13, 18, 23, 28, 33, 38];
    const opennessQuestionIndexes = [4, 9, 14, 19, 24, 29, 34, 39, 40, 43];

    let extraversion = extraVersionQuestionIndexes.reduce((c, qIdx) => c + Number(_personalInfoChoices[listOfItems[qIdx]]), 0);
    let agreeableness = agreeablenessQuestionIndexes.reduce((c, qIdx) => c + Number(_personalInfoChoices[listOfItems[qIdx]]), 0);
    let conscientiousness = conscientiousnessQuestionIndexes.reduce((c, qIdx) => c + Number(_personalInfoChoices[listOfItems[qIdx]]), 0);
    let EmotionalStability = emotionalStabilityQuestionIndexes.reduce((c, qIdx) => c + Number(_personalInfoChoices[listOfItems[qIdx]]), 0);
    let openness = opennessQuestionIndexes.reduce((c, qIdx) => c + Number(_personalInfoChoices[listOfItems[qIdx]]), 0);

    props.setAnsweredPersonalTrait(true);
    props.setPersonalityTraits({
      extraversion,
      agreeableness,
      conscientiousness,
      EmotionalStability,
      openness
    });
  };

  useEffect(() => {
    setPersonalInfoProcessChoices({
      ...personalInfoProcessChoices,
      submitEnabled: Object.keys(personalInfoChoices).length === 44
    })
  }, [personalInfoChoices])

  useEffect(() => {
    if(personalInfoProcessChoices?.submit) {
      setPersonalInfoProcessChoices({
        ...personalInfoProcessChoices,
        submit: false
      })
      handleNext();
    }
  }, [personalInfoProcessChoices])

  return (
    <div>        
      <Box style={{margin:"10px 10px 10px 10px", overflow: "auto" }}>  
      {!props.answeredPersonalTrait && (
        <>
              <Box style={{margin:"10px 0px 10px"}}>
              <h4  >I am someone who:</h4>
                
              </Box>
        <Box sx={{
          width: "100%", height: "calc(100vh - 80px)", overflow: "auto",
          ["@media (max-width: 1120px)"]: {
            "& .answer-radiogroup": {
              width: "calc(100% - 250px)",
              ".MuiRadio-root": {
                margin: "0px 20px"
              }
            },
            "& .answer-label-group": {
              width: "100% !important",
              margin: "10px 0px 10px 200px !important",
              ".MuiFormControlLabel-root": {
                marginInline: "12px !important",
                width: "60px"
              },
              ".MuiFormControlLabel-label": {
                fontSize: "15px"
              }
            }
          },
          ["@media (max-width: 810px)"]: {
            "& .answer-radiogroup": {
              width: "calc(100% - 250px)",
              ".MuiRadio-root": {
                margin: "0px 10px"
              }
            },
            "& .answer-label-group": {
              width: "100% !important",
              margin: "10px 0px 10px 180px !important",
              ".MuiFormControlLabel-root": {
                marginInline: "15px !important",
                width: "40px"
              },
              ".MuiFormControlLabel-label": {
                fontSize: "15px"
              }
            }
          }
        }}>
          <FormControl sx={{
            width: "100%"
          }} >
            <RadioGroup row >
              <Box className="answer-label-group" style={{
                width: "calc(100% - 220px)",
                margin: "0px 0px 0px 220px",
                display: "flex",
                justifyContent: "center"
              }}>
                <FormControlLabel
                  style={{ marginInline: "40px" }}
                  value=""
                  control={<></>}
                  label={
                    <div >
                      Disagree <br />
                      Strongly
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "40px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Disagree <br />a little
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "22px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Neither agree <br />
                      anor disagree
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "45px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Agree <br />a little
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "39px" }}
                  value=""
                  control={<></>}
                  label={
                    <div style={{ fontSize: 15 }}>
                      Agree <br />
                      strongly
                    </div>
                  }
                />
              </Box>
            </RadioGroup>
          </FormControl>
          <FormControl sx={{ width: "100%", m: "0px 0px 0px 0px" }}>
            {listOfItems0.map((name, idx) => (
              <>
             <hr />
              <List key={idx} style={{backgroundColor:"azure"}}>
                 
                {
                  <RadioGroup
                    row
                    onChange={e => {
                      personalInfoChoices[name] = e.target.value;
                      setPersonalInfoChoices({...personalInfoChoices});
                    }}
                    aria-labelledby="demo-row-radio-buttons-group-label1"
                    name="row-radio-buttons-group1"
                  >
                    <Box style={{ marginLeft:"15px"  ,marginRight: "0px",marginTop:"2px" ,width:"200px",display: 'inline'}}>
                      <div>{name}</div>
                    </Box>
                    <Box className="answer-radiogroup" sx={{
                      width: "calc(100% - 220px)",
                      display: "flex",
                      justifyContent: "center"
                    }}>
                      <Radio sx={{ marginInline: "50px" }} value="1" label="Disagree Strongly" />
                      <Radio sx={{ marginInline: "50px" }} value="2" label="Disagree a little" />
                      <Radio sx={{ marginInline: "52px" }} value="3" label="Neither agree nor disagree" />
                      <Radio sx={{ marginInline: "50px" }} value="4" label="Agree a little" />
                      <Radio sx={{ marginInline: "50px" }} value="5" label="Agree strongly" />
                    </Box>
                   
                  </RadioGroup>
                  
                }
              
              </List>
              </>
            ))}
          </FormControl>
          <FormControl sx={{
            width: "100%"
          }} >
            <RadioGroup row >
              <Box className="answer-label-group" style={{
                width: "calc(100% - 220px)",
                margin: "20px 0px 0px 220px",
                display: "flex",
                justifyContent: "center"
              }}>
                <FormControlLabel
                  style={{ marginInline: "40px" }}
                  value=""
                  control={<></>}
                  label={
                    <div >
                      Disagree <br />
                      Strongly
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "40px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Disagree <br />a little
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "22px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Neither agree <br />
                      anor disagree
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "45px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Agree <br />a little
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "39px" }}
                  value=""
                  control={<></>}
                  label={
                    <div style={{ fontSize: 15 }}>
                      Agree <br />
                      strongly
                    </div>
                  }
                />
              </Box>
            </RadioGroup>
          </FormControl>
          <FormControl sx={{ width: "100%", m: "0px 0px 20px 5px" }}>
            {listOfItems1.map((name,idx) => (
               <>
               <hr />
                <List key={idx} style={{backgroundColor:"azure"}}>
                   
                  {
                    <RadioGroup
                      row
                      onChange={e => {
                        personalInfoChoices[name] = e.target.value;
                        setPersonalInfoChoices({...personalInfoChoices});
                      }}
                      aria-labelledby="demo-row-radio-buttons-group-label1"
                      name="row-radio-buttons-group1"
                    >
                       <Box style={{ marginLeft:"15px"  ,marginRight: "0px",marginTop:"2px" ,width:"200px",display: 'inline'}}>
                        <div>{name}</div>
                      </Box>

                      <Box className="answer-radiogroup" sx={{
                        width: "calc(100% - 240px)",
                        display: "flex",
                        justifyContent: "center"
                      }}>
                        <Radio sx={{ marginInline: "50px" }} value="1" label="Disagree Strongly" />
                        <Radio sx={{ marginInline: "50px" }} value="2" label="Disagree a little" />
                        <Radio sx={{ marginInline: "52px" }} value="3" label="Neither agree nor disagree" />
                        <Radio sx={{ marginInline: "50px" }} value="4" label="Agree a little" />
                        <Radio sx={{ marginInline: "50px" }} value="5" label="Agree strongly" />
                      </Box>
                     
                    </RadioGroup>
                    
                  }
                
                </List>
                </>
            ))}
          </FormControl>
          <FormControl sx={{
            width: "100%"
          }} >
            <RadioGroup row >
              <Box className="answer-label-group" style={{
                width: "calc(100% - 220px)",
                margin: "20px 0px 0px 220px",
                display: "flex",
                justifyContent: "center"
              }}>
                <FormControlLabel
                  style={{ marginInline: "40px" }}
                  value=""
                  control={<></>}
                  label={
                    <div >
                      Disagree <br />
                      Strongly
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "40px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Disagree <br />a little
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "22px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Neither agree <br />
                      anor disagree
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "45px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Agree <br />a little
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "39px" }}
                  value=""
                  control={<></>}
                  label={
                    <div style={{ fontSize: 15 }}>
                      Agree <br />
                      strongly
                    </div>
                  }
                />
              </Box>
            </RadioGroup>
          </FormControl>
          <FormControl sx={{ width: "100%", m: "0px 0px 52px 5px" }}>
            {listOfItems2.map((name,idx) => (
                <>
             <hr />
              <List key={idx} style={{backgroundColor:"azure"}}>
                 
                {
                  <RadioGroup
                    row
                    onChange={e => {
                      personalInfoChoices[name] = e.target.value;
                      setPersonalInfoChoices({...personalInfoChoices});
                    }}
                    aria-labelledby="demo-row-radio-buttons-group-label1"
                    name="row-radio-buttons-group1"
                  >
                     <Box style={{ marginLeft:"15px"  ,marginRight: "0px",marginTop:"2px" ,width:"200px",display: 'inline'}}>
                      <div>{name}</div>
                    </Box>

                    <Box className="answer-radiogroup" sx={{
                      width: "calc(100% - 240px)",
                      display: "flex",
                      justifyContent: "center"
                    }}>
                      <Radio sx={{ marginInline: "50px" }} value="1" label="Disagree Strongly" />
                      <Radio sx={{ marginInline: "50px" }} value="2" label="Disagree a little" />
                      <Radio sx={{ marginInline: "52px" }} value="3" label="Neither agree nor disagree" />
                      <Radio sx={{ marginInline: "50px" }} value="4" label="Agree a little" />
                      <Radio sx={{ marginInline: "50px" }} value="5" label="Agree strongly" />
                    </Box>
                  </RadioGroup>
                  
                }
              
              </List>
              </>
            ))}
          </FormControl>
          <h3  style={{margin:"100px 10px 10px 10px"}}></h3>
        </Box>
        </>
      )}</Box> 

      {props.answeredPersonalTrait && (
        <form noValidate autoComplete="off">
          <div id="PersonalInfoContainer">
            <DateAndGenderPickers
              birthDate={props.birthDate}
              setBirthDate={props.setBirthDate}
              gender={props.gender}
              genderChange={props.genderChange}
              onGenderOtherValueChange={props.onGenderOtherValueChange}
              genderOtherValue={props.genderOtherValue}
              MUISelectMenuItem={MUISelectMenuItem}
            />
            <div></div>
            <FormControl className="select" variant="outlined">
              <InputLabel>The Language You Use the Most</InputLabel>
              <Select
                label="Language"
                name="language"
                onChange={props.languageChange}
                value={props.language}
                renderValue={sameThing}
              >
                {sortedLanguages.map(languageItems)}
              </Select>
            </FormControl>
            <div></div>
            <FormControl className="select" variant="outlined">
              <InputLabel>Ethnicity</InputLabel>
              <Select
                multiple
                onChange={props.ethnicityChange}
                name="ethnicity"
                label="Ethnicity"
                value={props.ethnicity}
                renderValue={arrayToString}
              >
                {
                  // structure based from https://blog.hubspot.com/service/survey-demographic-questions
                  ETHNICITY_VALUES.map(ethnicityItems)
                }
              </Select>
              {props.ethnicity &&
                props.ethnicity.length > 0 &&
                props.ethnicity.includes("Not listed (Please specify)") && (
                  <ValidatedInput
                    className="PleaseSpecify"
                    label="Please specify your ethnicity."
                    onChange={props.onEthnicityOtherValueChange}
                    name="ethnicity"
                    value={props.ethnicityOtherValue}
                  />
                )}
            </FormControl>
            <div></div>
            <FormControl className="select" variant="outlined">
              <InputLabel>Education Level</InputLabel>
              <Select
                value={props.education}
                renderValue={sameThing}
                onChange={props.educationChange}
                name="education"
                label="Education Level"
              >
                {EDUCATION_VALUES.map(educationItems)}
              </Select>
            </FormControl>
            <div></div>
            <Autocomplete
              className="MajorAutocomplete"
              options={majors}
              groupBy={getMajorCategory}
              getOptionLabel={getMajor}
              renderInput={renderMajor}
              onChange={changeMajor}
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default React.memo(PersonalInfo);
