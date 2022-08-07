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
import FormLabel from "@mui/material/FormLabel";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import List from '@mui/material/List';

import Done from "@mui/icons-material/Done";

import DateAndGenderPickers from "./DateAndGenderPickers";

import ValidatedInput from "../ValidatedInput/ValidatedInput";

import { ETHNICITY_VALUES, EDUCATION_VALUES } from "./DemographicConstants";

import "./PersonalInfo.css";
import { Paper } from "@mui/material";

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
 

  const [category, setCategory] = useState({});

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
  const reversedScore = questionNumber => {
    if (category[listOfItems[questionNumber]] === "1") {
      category[listOfItems[questionNumber]] = "5";
    } else if (category[listOfItems[questionNumber]] === "2") {
      category[listOfItems[questionNumber]] = "4";
    } else if (category[listOfItems[questionNumber]] === "5") {
      category[listOfItems[questionNumber]] = "1";
    } else if (category[listOfItems[questionNumber]] === "4") {
      category[listOfItems[questionNumber]] = "2";
    }
    setCategory(category);
  };
  const handleNext = () => {
    reversedScore(5);
    reversedScore(20);
    reversedScore(30);

    reversedScore(1);
    reversedScore(11);
    reversedScore(26);
    reversedScore(36);

    reversedScore(7);
    reversedScore(17);
    reversedScore(22);
    reversedScore(42);

    reversedScore(8);
    reversedScore(23);
    reversedScore(33);

    reversedScore(34);
    reversedScore(40);

    let extraversion =
      Number(category[listOfItems[0]]) +
      Number(category[listOfItems[5]]) +
      Number(category[listOfItems[10]]) +
      Number(category[listOfItems[15]]) +
      Number(category[listOfItems[20]]) +
      Number(category[listOfItems[24]]) +
      Number(category[listOfItems[30]]) +
      Number(category[listOfItems[35]]);
    let agreeableness =
      Number(category[listOfItems[1]]) +
      Number(category[listOfItems[6]]) +
      Number(category[listOfItems[11]]) +
      Number(category[listOfItems[16]]) +
      Number(category[listOfItems[21]]) +
      Number(category[listOfItems[26]]) +
      Number(category[listOfItems[31]]) +
      Number(category[listOfItems[36]]) +
      Number(category[listOfItems[41]]);
    let conscientiousness =
      Number(category[listOfItems[2]]) +
      Number(category[listOfItems[7]]) +
      Number(category[listOfItems[12]]) +
      Number(category[listOfItems[17]]) +
      Number(category[listOfItems[21]]) +
      Number(category[listOfItems[26]]) +
      Number(category[listOfItems[32]]) +
      Number(category[listOfItems[37]]) +
      Number(category[listOfItems[42]]);
    let EmotionalStability =
      Number(category[listOfItems[3]]) +
      Number(category[listOfItems[8]]) +
      Number(category[listOfItems[13]]) +
      Number(category[listOfItems[18]]) +
      Number(category[listOfItems[23]]) +
      Number(category[listOfItems[28]]) +
      Number(category[listOfItems[33]]) +
      Number(category[listOfItems[38]]);
    let openness =
      Number(category[listOfItems[4]]) +
      Number(category[listOfItems[9]]) +
      Number(category[listOfItems[14]]) +
      Number(category[listOfItems[19]]) +
      Number(category[listOfItems[24]]) +
      Number(category[listOfItems[29]]) +
      Number(category[listOfItems[34]]) +
      Number(category[listOfItems[39]]) +
      Number(category[listOfItems[40]]) +
      Number(category[listOfItems[43]]);
    props.setAnsweredPersonalTrait(true);
    props.setPersonalityTraits({"extraversion":extraversion,"agreeableness":agreeableness,"conscientiousness": conscientiousness,"EmotionalStability": EmotionalStability,"openness": openness});
  };

  return (
    <div>        
      <Box style={{margin:"10px 10px 10px 10px",width:"900", overflow: "auto" }}>  
      {!props.answeredPersonalTrait && (
        <>
              <Box style={{margin:"10px 0px 100px 0px"}}>
              <Button
                   
                   id="QuestionNextBtn"
                   onClick={handleNext}
                   disabled={Object.keys(category).length !== 44}
                   className={(Object.keys(category).length !== 44) ? "Button Disabled" : "Button"}
                   variant="contained"
                 >
                   NEXT!
                 </Button> 
              <h4  >I am someone who:</h4>
                
              </Box>
        <Box sx={{ height: "600px",width:"1000px", overflow: "auto" }}>
          <FormControl >
            <RadioGroup row >
              <Box style={{ margin: "0px 0px 0px 220px" }}>
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
          <FormControl sx={{ m: "0px 0px 0px 0px" }}>
            {listOfItems0.map((name, idx) => (
              <>
             <hr />
              <List key={idx} style={{backgroundColor:"azure"}}>
                 
                {
                  <RadioGroup
                    row
                    onChange={e => {
                      category[name] = e.target.value;
                      setCategory(category);
                    }}
                    aria-labelledby="demo-row-radio-buttons-group-label1"
                    name="row-radio-buttons-group1"
                  >
                     <Box style={{ marginLeft:"15px"  ,marginRight: "0px",marginTop:"2px" ,width:"200px",display: 'inline'}}>
                      <div>{name}</div>
                    </Box>
                
                      <Radio sx={{ marginInline: "50px" }} value="1" label="Disagree Strongly" />
                      <Radio sx={{ marginInline: "50px" }} value="2" label="Disagree a little" />
                      <Radio sx={{ marginInline: "52px" }} value="3" label="Neither agree nor disagree" />
                      <Radio sx={{ marginInline: "50px" }} value="4" label="Agree a little" />
                      <Radio sx={{ marginInline: "50px" }} value="5" label="Agree strongly" />
                   
                  </RadioGroup>
                  
                }
              
              </List>
              </>
            ))}
          </FormControl>
          <FormControl sx={{ m: "0px 0px 0px 0px" }}>
            <RadioGroup row aria-labelledby="demo-row-radio-buttons-group-label" name="row-radio-buttons-group">
              <Box style={{ margin: "10px 10px 10px 200px" }}>
                <FormControlLabel
                  style={{ marginInline: "40px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
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
                  style={{ marginInline: "40px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Agree <br />a little
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "60px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Agree <br />
                      strongly
                    </div>
                  }
                />
              </Box>
            </RadioGroup>
          </FormControl>
          <FormControl sx={{ m: "0px 0px 20px 5px" }}>
            {listOfItems1.map((name,idx) => (
               <>
               <hr />
                <List key={idx} style={{backgroundColor:"azure"}}>
                   
                  {
                    <RadioGroup
                      row
                      onChange={e => {
                        category[name] = e.target.value;
                        setCategory(category);
                      }}
                      aria-labelledby="demo-row-radio-buttons-group-label1"
                      name="row-radio-buttons-group1"
                    >
                       <Box style={{ marginLeft:"15px"  ,marginRight: "0px",marginTop:"2px" ,width:"200px",display: 'inline'}}>
                        <div>{name}</div>
                      </Box>
                  
                        <Radio sx={{ marginInline: "50px" }} value="1" label="Disagree Strongly" />
                        <Radio sx={{ marginInline: "50px" }} value="2" label="Disagree a little" />
                        <Radio sx={{ marginInline: "52px" }} value="3" label="Neither agree nor disagree" />
                        <Radio sx={{ marginInline: "50px" }} value="4" label="Agree a little" />
                        <Radio sx={{ marginInline: "50px" }} value="5" label="Agree strongly" />
                     
                    </RadioGroup>
                    
                  }
                
                </List>
                </>
            ))}
          </FormControl>
          <FormControl sx={{ m: "20px 20px 20px 20px" }}>
            <RadioGroup row aria-labelledby="demo-row-radio-buttons-group-label" name="row-radio-buttons-group">
              <Box style={{ margin: "10px 10px 10px 200px" }}>
                <FormControlLabel
                  style={{ marginInline: "40px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
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
                  style={{ marginInline: "40px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Agree <br />a little
                    </div>
                  }
                />
                <FormControlLabel
                  style={{ marginInline: "40px" }}
                  value=""
                  control={<></>}
                  label={
                    <div>
                      Agree <br />
                      strongly
                    </div>
                  }
                />
              </Box>
            </RadioGroup>
          </FormControl>
          <FormControl sx={{ m: "0px 0px 200px 5px" }}>
            {listOfItems2.map((name,idx) => (
                <>
             <hr />
              <List key={idx} style={{backgroundColor:"azure"}}>
                 
                {
                  <RadioGroup
                    row
                    onChange={e => {
                      category[name] = e.target.value;
                      setCategory(category);
                    }}
                    aria-labelledby="demo-row-radio-buttons-group-label1"
                    name="row-radio-buttons-group1"
                  >
                     <Box style={{ marginLeft:"15px"  ,marginRight: "0px",marginTop:"2px" ,width:"200px",display: 'inline'}}>
                      <div>{name}</div>
                    </Box>
                
                      <Radio sx={{ marginInline: "50px" }} value="1" label="Disagree Strongly" />
                      <Radio sx={{ marginInline: "50px" }} value="2" label="Disagree a little" />
                      <Radio sx={{ marginInline: "52px" }} value="3" label="Neither agree nor disagree" />
                      <Radio sx={{ marginInline: "50px" }} value="4" label="Agree a little" />
                      <Radio sx={{ marginInline: "50px" }} value="5" label="Agree strongly" />
                   
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
