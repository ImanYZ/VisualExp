import React, { useEffect, useState } from "react";
import { useRecoilStateLoadable, useRecoilValue } from "recoil";
import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";
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
import CircularProgress from "@mui/material/CircularProgress";

import "./SchemaGeneration.css";

import QueryBuilder from "./QueryBuilder";

const temp_schema = {
  id: new Date(),
  combinator: "AND",
  rules: []
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
  const [recallResponses, setRecallResponses] = useState([]);
  const [searchResules, setSearchResules] = useState([]);
  const [searching, setSearching] = useState(false);
  const project = useRecoilValue(projectState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    const usersDoc = await firebase.db.collection("users").get();
    const recallTexts = [];
    for (let userDoc of usersDoc.docs) {
      const userData = userDoc.data();
      if (userData.pConditions) {
        for (let pCon of userData.pConditions) {
          for (let recall of ["recallreText", "recall3DaysreText", "recall1WeekreText"]) {
            if (pCon[recall] && pCon[recall] !== "" && !recallTexts.includes(pCon[recall])) {
              recallTexts.push(pCon[recall]);
            }
          }
        }
      }
    }
    setRecallResponses(recallTexts);

    return () => {};
  }, [firebase]);

  const checkResponse = (sentence, schema) => {
    let canShow = true;
    if (schema.combinator === "AND") {
      for (let key of schema.rules) {
        if (key.rules) {
          canShow = checkResponse(sentence, key);
        } else {
          if (!sentence.includes(key.value) && !key.not) {
            canShow = false;
          }
        }
      }
    } else {
      let canShow2 = false;
      for (let key of schema.rules) {
        if (key.rules) {
          canShow = checkResponse(sentence, key);
        } else {
          if (sentence.includes(key.value) && !key.not) {
            canShow2 = true;
          }
        }
      }
      canShow = canShow2;
    }
    return canShow;
  };
  const QuerySearching = schemaEp => {
    setSearching(true);
    setSearchResules([]);

    const searchRes = [];
    for (let text of recallResponses) {
      const filtered = (text || "").split(".").filter(w => w.trim());
      for (let sentence of filtered) {
        if (checkResponse(sentence, schemaEp)) {
          const oldResponse = searchRes.find(elm => elm.text === text);
          if (!oldResponse) {
            searchRes.push({ text, sentences: [sentence] });
          } else {
            searchRes[searchRes.indexOf(oldResponse)].sentences.push(sentence);
          }
        }
      }
    }

    setSearchResules(searchRes);
    setSearching(false);
  };

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
    setPassages(passages);
    const booleanLogsDoc = await firebase.db.collection("booleanScratchLogs").doc(fullname).get();
    if (booleanLogsDoc.exists) {
      const booleanLogsData = booleanLogsDoc.data();
      const passage = passages.find(elem => elem.title === booleanLogsData.passage);
      setSelectedPassage(passage);
      const phrases = passage.phrases;
      setSelectedPhrases(phrases);
      setSelectedPhrase(booleanLogsData.selectedPhrase);
    } else {
      setSelectedPassage(passages[0]);
      const phrases = passages[0].phrases;
      setSelectedPhrases([...phrases]);
      setSelectedPhrase(phrases[0]);
    }
  }, [firebase.db, fullname]);

  const handlePassageChange = async event => {
    try {
      const title = event.target.value;
      const allPassages = [...passages];
      const fIndex = allPassages.findIndex(i => i.title === title);
      const passage = allPassages[fIndex];
      setSelectedPassage(passage);
      setSelectedPhrases(passage.phrases);
      setSelectedPhrase(passage.phrases[0]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedPhrase && selectedPassage) {
      const logsRef = firebase.db.collection("booleanScratchLogs").doc(fullname);
      const logsData = {
        passage: selectedPassage.title,
        selectedPhrase: selectedPhrase,
        email
      };
      logsRef.set(logsData);
    }

    return () => {};
  }, [selectedPhrase, selectedPassage]);

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

      if (change.type === "added") {
        schemas.push({ id: change.doc.id, ...shemaData });
      } else if (change.type === "modified") {
        const index = schemas.indexOf(elm => elm.id === change.doc.id);
        schemas[index] = { id: change.doc.id, ...shemaData };
      }
    }
    setSchemasBoolean(schemas);
    setSchmaLoadedUse(false);
    setSelectedPhrase1(selectedPhrase);
  }, [firebase, schmaLoadedUse]);

  const handleSubmit = () => {
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
      .then(() => {})
      .catch(error => {
        console.error("Error writing document: ", error);
      });
    setSchema({
      id: new Date(),
      combinator: "AND",
      rules: []
    });
  };
  const upVote = async schema => {
    try {
      const schemaGenerationRef = firebase.db.collection("booleanScratch").doc(schema.id);
      const schemaGenerationDoc = await schemaGenerationRef.get();
      const schemaGenerationData = schemaGenerationDoc.data();
      const researcherRef = firebase.db.collection("researchers").doc(schemaGenerationData.fullname);
      const researcherDoc = await researcherRef.get();
      const researcherData = researcherDoc.data();
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
      let calulatedProject = project;
      if (!(project in researcherData.projects)) {
        calulatedProject = Object.keys(researcherData.projects)[0];
      }
      const researcherUpdate = {
        projects: {
          ...researcherData.projects,
          [calulatedProject]: {
            ...researcherData.projects[calulatedProject],
            positiveBooleanExpPionts: _upVotes - _downVotes,
            negativeBooleanExpPionts: _downVotes
          }
        }
      };
      await researcherRef.update(researcherUpdate);
      researcherData.projects[project][""] = setSchemasBoolean(_schemasBoolean);
    } catch (error) {}
  };
  const downVote = async schema => {
    try {
      const schemaGenerationRef = firebase.db.collection("booleanScratch").doc(schema.id);
      const schemaGenerationDoc = await schemaGenerationRef.get();
      const schemaGenerationData = schemaGenerationDoc.data();
      const researcherRef = firebase.db.collection("researchers").doc(schemaGenerationData.fullname);
      const researcherDoc = await researcherRef.get();
      const researcherData = researcherDoc.data();
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
      let calulatedProject = project;
      if (!(project in researcherData.projects)) {
        calulatedProject = Object.keys(researcherData.projects)[0];
      }
      const researcherUpdate = {
        projects: {
          ...researcherData.projects,
          [calulatedProject]: {
            ...researcherData.projects[calulatedProject],
            positiveBooleanExpPionts: _upVotes - _downVotes,
            negativeBooleanExpPionts: _downVotes
          }
        }
      };
      await researcherRef.update(researcherUpdate);
      setSchemasBoolean(_schemasBoolean);
    } catch (error) {}
  };

  const previousPhrase = () => {
    const indexPhrase = phrases.indexOf(selectedPhrase);
    setSelectedPhrase(phrases[indexPhrase - 1]);
  };

  const nextPhrase = () => {
    const indexPhrase = phrases.indexOf(selectedPhrase);
    setSelectedPhrase(phrases[indexPhrase + 1]);
  };
  return (
    <Grid container spacing={2} sx={{ background: "#e2e2e2" }}>
      <Grid sx={{ height: "100%" }} item xs={6}>
        <Item>
          <Box sx={{ display: "flex", flexDirection: "column", marginRight: "20px" }}>
            <Typography variant="h6" component="div" align="left">
              Passage
            </Typography>
            <Select
              id="demo-simple-select-helper"
              value={selectedPassage?.title || passages[0]?.title || ""}
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
          <div
            style={{
              display: "flex",
              width: "95%",
              paddingTop: "10px",
              paddingBottom: "20px",
              justifyContent: "space-between"
            }}
          >
            <Button variant="contained" disabled={phrases.indexOf(selectedPhrase) === 0} onClick={previousPhrase}>
              Previous Phrase
            </Button>
            <Button
              variant="contained"
              disabled={phrases.indexOf(selectedPhrase) === phrases.length - 1}
              onClick={nextPhrase}
            >{`NEXT Phrase`}</Button>
          </div>

          <QueryBuilder query={schema} onQueryChange={q => setSchema(q)} />

          <div
            style={{
              display: "flex",
              width: "95%",
              paddingTop: "10px",
              paddingBottom: "20px",
              justifyContent: "space-between"
            }}
          >
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                QuerySearching(schema);
              }}
            >{`Search >>`}</Button>
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
                  <div>
                    <QueryBuilder query={schemaE.schema} noEdit={true} />
                    <div style={{ display: "flex", width: "95%", justifyContent: "space-between" }}>
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
                        >
                          {schemaE.downVotes}👎
                        </IconButton>
                      </div>
                      <div
                        style={{
                          paddingTop: "10px",
                          paddingBottom: "20px"
                        }}
                      >
                        <Button
                          variant="contained"
                          onClick={() => {
                            QuerySearching(schemaE.schema);
                          }}
                        >{`Search >>`}</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </Paper>
        </Item>
      </Grid>
      <Grid sx={{ height: "100%" }} item xs={6}>
        <Item>
          {searchResules.length > 0 && (
            <Typography variant="h6" component="div" align="center">
              We found that schema in the followings:
            </Typography>
          )}

          <Box sx={{ height: "110vh", overflow: "scroll" }}>
            {searchResules.length > 0 ? (
              searchResules.map(respon => {
                return (
                  <Paper elevation={3} sx={{ marginBottom: "10px", padding: "10px", textAlign: "left" }}>
                    {(respon.text || "")
                      .split(".")
                      .filter(w => w.trim())
                      .map(sentence =>
                        respon.sentences.includes(sentence) ? (
                          <mark>{sentence + "."}</mark>
                        ) : (
                          <span>{sentence + "."}</span>
                        )
                      )}
                  </Paper>
                );
              })
            ) : searching ? (
              <CircularProgress color="warning" sx={{ margin: "350px 650px 500px 580px" }} size="100px" />
            ) : (
              <Typography variant="h6" component="div" align="center">
                Click search to search for your schema
              </Typography>
            )}
          </Box>
        </Item>
      </Grid>
    </Grid>
  );
};

export default SchemaGeneration;
