import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";

// mui imports
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import "./SchemaGeneration.css";

import QueryBuilder from "./QueryBuilder";
import QuerySearch from "./QuerySearch";

const temp_schema = {
  id: "g-0.6224544849727727",
  combinator: "AND",
  rules: [
    {
      id: "g-0.3939927960314584",
      combinator: "OR",
      rules: [
        {
          id: "r-0.569942811653946",
          combinator: "AND",
          rules: [
            {
              id: "r-0.8457265715736604",
              not: false,
              key: "prey"
            }
          ]
        }
      ]
    },
    {
      id: "r-0.84572657157304",
      not: true,
      key: "fac"
    },
    {
      id: "r-0.8457265715736604",
      not: false,
      key: "prey"
    },
    {
      id: "r-0.84572655736604",
      not: false,
      key: "mouse"
    }
  ]
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
  const [selectedPhrase1, setSelectedPhrase1] = useState(null);
  const [schema, setSchema] = useState(temp_schema);
  const email = useRecoilValue(emailState);
  const [schemasBoolean, setSchemasBoolean] = useState([]);
  const [schmaChanges, setSchmaChanges] = useState([]);
  const [schmaLoadedUse, setSchmaLoadedUse] = useState(false);

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
    console.log(passages);
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

  useEffect(() => {
    if (firebase && selectedPhrase) {
      const schmaQuery = firebase.db.collection("booleanScratch").where("phrase", "==", selectedPhrase);
      const schmaSnapshot = schmaQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setSchmaChanges(oldSchmasChanges => {
          return [...oldSchmasChanges, ...docChanges];
        });
        setSchmaLoadedUse(true);
      });
      return () => {
        setSchmaChanges([]);
        schmaSnapshot();
      };
    }
  }, [firebase, selectedPhrase]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    let schemas = [...schemasBoolean];
    if (!(selectedPhrase === selectedPhrase1)) {
      schemas = [];
    }

    const tempSchemaChanges = [...schmaChanges];
    setSchmaChanges([]);

    for (let change of tempSchemaChanges) {
      const shemaData = change.doc.data();
      console.log(change.type);

      if (change.type === "added") {
        schemas.push({ id: change.doc.id, ...shemaData });
        console.log(shemaData);
      } else if (change.type === "modified") {
        const index = schemas.indexOf(elm => elm.id === change.doc.id);
        schemas[index] = { id: change.doc.id, ...shemaData };
      }
    }
    console.log("schemas", schemas);
    setSchemasBoolean(schemas);
    setSchmaLoadedUse(false);
    setSelectedPhrase1(selectedPhrase);
  }, [firebase, schmaLoadedUse]);

  const handleSubmit = () => {
    console.log({ schema });
    const newbooleanScratch = {
      email,
      fullname,
      schema: schema,
      createdAt: new Date(),
      phrase: selectedPhrase,
      passage: selectedPassage.title,
      upVotes: 0,
      downVotes: 0,
      upVoters: [],
      downVoters: []
    };
    const schemaGenerationRef = firebase.db.collection("booleanScratch").doc();
    schemaGenerationRef
      .set(newbooleanScratch)
      .then(() => {
        console.log("Document successfully written!");
      })
      .catch(error => {
        console.error("Error writing document: ", error);
      });
  };
  const upVote = async schema => {
    try {
      const schemaGenerationRef = firebase.db.collection("booleanScratch").doc(schema.id);
      const _upVoters = [...schema.upVoters];
      const _downVoters = [...schema.downVoters];

      let _upVotes = schema.upVotes;
      let _downVotes = schema.downVotes;
      if (_upVoters.includes(fullname)) {
        _upVoters.splice(_upVoters.indexOf(fullname), 1);
        _upVotes = _upVotes - 1;
      } else {
        _upVoters.push(fullname);
        _upVotes = _upVotes + 1;
        if (_downVoters.includes(fullname)) {
          _downVoters.splice(_downVoters.indexOf(fullname), 1);
          _downVotes = _downVotes - 1;
        }
      }
      const schemaGenerationUpdate = {
        upVotes: _upVotes,
        upVoters: _upVoters,
        downVotes: _downVotes,
        downVoters: _downVoters
      };
      await schemaGenerationRef.update(schemaGenerationUpdate);
      const index = schemasBoolean.findIndex(elt => elt.id === schema.id);
      const _schemasBoolean = [...schemasBoolean];
      _schemasBoolean[index] = {
        ..._schemasBoolean[index],
        upVotes: _upVotes,
        upVoters: _upVoters,
        downVotes: _downVotes,
        downVoters: _downVoters
      };
      setSchemasBoolean(_schemasBoolean);
    } catch (error) {
      console.log(error);
    }
  };
  const downVote = async schema => {
    try {
      const schemaGenerationRef = firebase.db.collection("booleanScratch").doc(schema.id);
      const _downVoters = [...schema.downVoters];
      let _downVotes = schema.downVotes;
      const _upVoters = [...schema.upVoters];
      let _upVotes = schema.upVotes;
      if (_downVoters.includes(fullname)) {
        _downVoters.splice(_downVoters.indexOf(fullname), 1);
        _downVotes = _downVotes - 1;
      } else {
        _downVoters.push(fullname);
        _downVotes = _downVotes + 1;
        if (_upVoters.includes(fullname)) {
          _upVoters.splice(_upVoters.indexOf(fullname), 1);
          _upVotes = _upVotes - 1;
        }
      }
      const schemaGenerationUpdate = {
        upVotes: _upVotes,
        upVoters: _upVoters,
        downVotes: _downVotes,
        downVoters: _downVoters
      };
      await schemaGenerationRef.update(schemaGenerationUpdate);
      const index = schemasBoolean.findIndex(elt => elt.id === schema.id);
      const _schemasBoolean = [...schemasBoolean];
      _schemasBoolean[index] = {
        ..._schemasBoolean[index],
        upVotes: _upVotes,
        upVoters: _upVoters,
        downVotes: _downVotes,
        downVoters: _downVoters
      };
      setSchemasBoolean(_schemasBoolean);
    } catch (error) {
      console.log(error);
    }
  };
  console.log(schemasBoolean);
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
          <QueryBuilder query={schema} onQueryChange={q => setSchema(q)} />

          <div
            style={{
              display: "flex",
              width: "80%",
              paddingTop: "10px",
              paddingBottom: "20px",
              justifyContent: "space-between"
            }}
          >
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
            <Button variant="contained" onClick={handleSubmit}>{`Search >>`}</Button>
          </div>
          {schemasBoolean?.length > 0 && (
            <Typography variant="h6" component="div" align="left">
              Previous Proposals:
            </Typography>
          )}

          <Paper sx={{ height: "700px", overflow: "scroll" }}>
            {schemasBoolean?.length > 0 &&
              schemasBoolean.map(schemaE => {
                return (
                  <div style={{ height: "95%" }}>
                    <QueryBuilder query={schemaE.schema} />
                    <div style={{ display: "flex", width: "80%", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <IconButton
                          onClick={() => {
                            upVote(schemaE);
                          }}
                          size="small"
                        >
                          {schemaE.upVotes}👍
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            downVote(schemaE);
                          }}
                          size="small"
                          style={{ color: "green" }}
                        >
                          {schemaE.downVotes}👎
                        </IconButton>
                      </div>

                      <Button onClick={handleSubmit}>{`Search >>`}</Button>
                    </div>
                  </div>
                );
              })}
          </Paper>
        </Item>
      </Grid>
      <Grid item xs={6}>
        <Item>We found that schema in the followings:</Item>
        {/* <QuerySearch /> */}
      </Grid>
    </Grid>
  );
};

export default SchemaGeneration;
