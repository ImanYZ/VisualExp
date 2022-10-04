import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState, fullnameState } from "../../../store/AuthAtoms";

// mui imports
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import { alpha, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import TreeView from "@mui/lab/TreeView";
import TreeItem, { treeItemClasses } from "@mui/lab/TreeItem";
import PropTypes from "prop-types";
// import { useSpring, animated } from "react-spring/web.cjs";
import Collapse from "@mui/material/Collapse";
import SvgIcon from "@mui/material/SvgIcon";
import AddIcon from "@mui/icons-material/Add";
import "./SchemaGeneration.css";
import Checkbox from "@mui/material/Checkbox";

const temp_schema = {
  id:"1",
  combinator: "AND",
  negations: [true, false],
  keyWords: [
    {
      id:"2",
      combinator: "OR",
      negations: [true, false],
      keyWords: ["skull", "crani"]
    },
    {
      id:"3",
      combinator: "OR",
      negations: [true, false],
      keyWords: ["skull", "crani"]
    },
    "prey",
    "mouse"
  ],
};

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary
}));

// eslint-disable-next-line no-empty-pattern
export const SchemaGeneration = ({}) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [passages, setPassages] = useState([]);
  const [phrases, setSelectedPhrases] = useState([]);
  const [selectedPassage, setSelectedPassage] = useState({});
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  const [schema, setSchema] = useState(temp_schema);
  const [select, setSelect] = useState("AND");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    const passagesDocs = await firebase.db.collection("passages").get();
    // const passageData = passagesDoc.data();
    let passages = [];
    passages = passagesDocs.docs
      .map(x => {
        const data = x.data();
        if (data?.phrases?.length > 0) {
          return { ...data, id: x.id };
        }
        return null;
      })
      .filter(x => x !== null);
    // console.log({ passages });
    setPassages(passages);
    setSelectedPassage(passages[0]);
    const phrases = passages[0].phrases;
    setSelectedPhrases([...phrases]);
    setSelectedPhrase(phrases[0]);
  }, [firebase.db, fullname]);

  const handlePassageChange = event => {
    const title = event.target.value;
    const allPassages = [...passages];
    const fIndex = allPassages.findIndex(i => i.title === title);
    const passage = allPassages[fIndex];
    setSelectedPassage(passage);
    setSelectedPhrases(passage.phrases);
    setSelectedPhrase(passage.phrases[0]);
  };

  const handleChange = event => {
    setSelect(event.target.value);
  };

  const addRule = () => {
    const tmpSchma = { ...schema };
    tmpSchma.keyWords.push({
      combinator: "OR",
      negations: [true, false],
      keyWords: ["skull", "crani"]
    });
    setSchema(tmpSchma);
  };

  const addKeyword = () => {
    const tmpSchma = { ...schema };
    tmpSchma.keyWords.push("key");
    setSchema(tmpSchma);
    console.log(tmpSchma);
  };

  const renderSchema = (tempSchema) => {
    return (
      <Paper elevation={3} sx={{ minheight: "300px", width: "97%", padding: "10px" }}>
        <div style={{ flexDirection: "row", marginLeft: "500px", alignItems: "flex-start" }}>
          <Button onClick={addKeyword}>ADD A KEYWORD</Button>
          <Button onClick={addRule}>ADD A RULE</Button>
        </div>
        <div class="clt">
          <ul>
            <li>
              <Box sx={{ marginRight: "890px" }}>
                <div style={{ padding: "0px" }}>
                  <select value={select} onChange={handleChange}>
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                </div>
              </Box>
            </li>
            {tempSchema?.keyWords?.map(element => {
              return (
                <li>
                  {typeof element === "object" ? (
                    <>{renderSchema(element)}</>
                  ) : (
                    <Paper elevation={5} sx={{ height: "30px", width: "200px", padding: "10px" }}>
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
                        NOT
                        <input type="checkbox" /* defaultChecked={checked} onChange={() => setChecked(!checked)} */ />
                        <input style={{ fontSize: "19px", padding: "2px 5px", width: "140px" }} />
                      </div>
                    </Paper>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Paper>
    );
  };
  return (
    <Grid container spacing={2} sx={{ background: "#e2e2e2" }}>
      <Grid item xs={6}>
        <Item>
          <Box sx={{ display: "flex", flexDirection: "column", marginRight: "20px" }}>
            <Typography variant="h6" component="div" align="left">
              Passage
            </Typography>

            <Select
              id="demo-simple-select-helper"
              value={selectedPassage && selectedPassage?.title ? selectedPassage?.title : passages[0]?.title}
              onChange={handlePassageChange}
            >
              {passages &&
                passages?.length > 0 &&
                passages?.map(doc => (
                  <MenuItem key={doc?.id} value={doc?.title}>
                    {doc?.title}
                  </MenuItem>
                ))}
            </Select>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", marginRight: "20px" }}>
            <Typography variant="h6" component="div" align="left">
              Key Phrase
            </Typography>

            <Autocomplete
              id="key-phrase"
              value={selectedPhrase}
              options={phrases}
              onChange={(_, value) => setSelectedPhrase(value || null)}
              renderInput={params => <TextField {...params} value={selectedPhrase} />}
              getOptionLabel={phrase => (phrase ? phrase : "")}
              renderOption={(props, phrase) => (
                <li key={phrase} {...props}>
                  {phrase}
                </li>
              )}
              isOptionEqualToValue={(phrase, value) => phrase === value}
              fullWidth
              sx={{ mb: "16px" }}
            />
          </Box>
          <>{renderSchema(schema)}</>

          <Button>Submit</Button>
          <Button>Search</Button>
        </Item>
      </Grid>
      <Grid item xs={6}>
        <Item>xs=4</Item>
      </Grid>
    </Grid>
  );
};

export default SchemaGeneration;