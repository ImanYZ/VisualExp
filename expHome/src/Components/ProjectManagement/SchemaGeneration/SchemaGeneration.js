import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";
// mui imports
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";

import QueryBuilder from "./components/QueryBuilder";
import { uuidv4 } from "../../../utils";
import './SchemaGeneration.css';

const temp_schema = [
  { id: uuidv4(), not: false, keyword: "", alternatives: [] },
  { id: uuidv4(), not: true, keyword: "", alternatives: [] }
];

const useStyles = makeStyles(() => ({
  passageBox: {
    display: "flex",
    height: "100px",
    backgroundColor: "#212121",
    justifyContent: 'space-evenly',
    alignItems: 'center',
    '& .MuiButtonBase-root.Mui-disabled': {
      color: '#696565',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#fff !important',
    },
    '& .MuiSvgIcon-root': {
      color: '#fff',
    }
  },
}));

// eslint-disable-next-line no-empty-pattern
export const SchemaGeneration = ({ }) => {
  const classes = useStyles();
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
  const [searchKeyWords, setSearcKeyWords] = useState([]);
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
            if (
              pCon[recall] &&
              pCon[recall] !== "" &&
              !recallTexts.includes(pCon[recall]) &&
              selectedPassage?.id === pCon?.passage
            ) {
              recallTexts.push(pCon[recall]);
            }
          }
        }
      }
    }
    setRecallResponses(recallTexts);
  }, [firebase]);

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

    return () => { };
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

  useEffect(() => {
    // if (schema.keyword !== "" || schema.keyword !== null) {
    console.log('SCHEMA', schema);
    QuerySearching(schema);
    // }
  }, [schema, selectedPhrase, selectedPassage]);

  useEffect(() => {
    console.log({ searchResules });
    if (searchResules?.length > 0) {
      const keyWords = schema.filter(elem => !elem.not).map(x => x.keyword);
      console.log('keyWordskeyWordskeyWords', keyWords, schema.filter(elem => !elem.not).map(x => x.keyword))
      setSearcKeyWords(keyWords);
    }
    if (searchResules?.length <= 0) {
      setSearcKeyWords([]);
    }
  }, [searchResules])

  const checkResponse = (text, schema) => {
    for (let schemaE of schema) {
      if (schemaE.keyword !== "") {
        const keywords = [...schemaE.alternatives];
        keywords.push(schemaE.keyword);
        if (schemaE.not) {
          for (let key of keywords) {
            if (text.includes(key)) {
              return false;
            }
          }
          return true;
        } else {
          for (let key of keywords) {
            if (text.includes(key)) {
              return true;
            }
          }
          return false;
        }
      }
    }
  };

  const checkSentences = (sentence, schema) => {
    console.log({ sentence, schema });
    let canShow = true;

    for (let schemaE of schema) {
      if (schemaE.keyword !== "") {
        const keywords = [...schemaE.alternatives];
        keywords.push(schemaE.keyword);
        if (schemaE.not) {
          for (let key of keywords) {
            if (sentence.includes(key)) {
              return false;
            }
          }
        } else {
          let _canShow = false;
          for (let key of keywords) {
            if (sentence.includes(key)) {
              _canShow = true;
            }
          }
          if (!_canShow) {
            return false;
          }
        }
      }
    }
    return canShow;
  };

  const QuerySearching = schemaEp => {
    setSearching(true);
    setSearchResules([]);
    const searchRes = [];

    //   split.map((x) => { 
    //     if (x.includes('barn')) 
    //     { 
    //         return `<mark>{x}</mark>`
    //     } 
    //     return x;
    // })

    for (let text of recallResponses) {
      const filtered = (text || "").split(".").filter(w => w.trim());
      console.log({ text, filtered });
      if (checkResponse(text, schemaEp)) {
        const sentences = [];
        for (let sentence of filtered) {
          if (checkSentences(sentence, schema)) {
            sentences.push(sentence);
          }
        }
        searchRes.push({ text, sentences });
      }
    }
    // console.log('searchRes', { searchRes });
    setSearchResules(searchRes);
    setSearching(false);
  };

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
      .then(() => { })
      .catch(error => {
        console.error("Error writing document: ", error);
      });
    setSchema([{ id: uuidv4(), keyword: "", alternatives: ["", ""] }]);
  };

  const upVote = async schema => {
    try {
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
      const schemaGenerationUpdate = {
        upVotes: _upVotes,
        upVoters: _upVoters,
        downVotes: _downVotes,
        downVoters: _downVoters
      };
      const schemaGenerationRef = firebase.db.collection("booleanScratch").doc(schema.id);
      const schemaGenerationDoc = await schemaGenerationRef.get();
      const schemaGenerationData = schemaGenerationDoc.data();
      await schemaGenerationRef.update(schemaGenerationUpdate);
      let calulatedProject = project;
      const researcherRef = firebase.db.collection("researchers").doc(schemaGenerationData.fullname);
      const researcherDoc = await researcherRef.get();
      const researcherData = researcherDoc.data();
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
    } catch (error) { }
  };

  const downVote = async schema => {
    try {
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
      const schemaGenerationUpdate = {
        upVotes: _upVotes,
        upVoters: _upVoters,
        downVotes: _downVotes,
        downVoters: _downVoters
      };
      const schemaGenerationRef = firebase.db.collection("booleanScratch").doc(schema.id);
      const schemaGenerationDoc = await schemaGenerationRef.get();
      const schemaGenerationData = schemaGenerationDoc.data();
      const researcherRef = firebase.db.collection("researchers").doc(schemaGenerationData.fullname);
      const researcherDoc = await researcherRef.get();
      const researcherData = researcherDoc.data();
      await schemaGenerationRef.update(schemaGenerationUpdate);

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
    } catch (error) { }
  };

  const previousPhrase = () => {
    const indexPhrase = phrases.indexOf(selectedPhrase);
    setSelectedPhrase(phrases[indexPhrase - 1]);
  };

  const nextPhrase = () => {
    const indexPhrase = phrases.indexOf(selectedPhrase);
    setSelectedPhrase(phrases[indexPhrase + 1]);
  };

  const previousPassage = () => {
    const indexPassage = passages.findIndex(i => i.title === selectedPassage.title);
    const passage = passages[indexPassage - 1];
    setSelectedPassage(passage);
    setSelectedPhrases(passage.phrases);
    setSelectedPhrase(passage.phrases[0]);
  };

  const nextPassage = () => {
    const indexPassage = passages.findIndex(i => i.title === selectedPassage.title);
    const passage = passages[indexPassage + 1];
    setSelectedPassage(passage);
    setSelectedPhrases(passage.phrases);
    setSelectedPhrase(passage.phrases[0]);
  };

  console.log({ schema, searchKeyWords })

  return (
    <div className="schema-generation">
      <div>
        <div className={classes.passageBox}>
          <div>
            <Button
              variant="text"
              disabled={selectedPassage === passages[0]}
              sx={{ color: "white" }}
              onClick={previousPassage}
            >
              {`< Previous Passage`}
            </Button>
          </div>
          <Box sx={{ width: '55%' }}>
            <Select
              id="demo-simple-select-helper"
              value={selectedPassage?.title || passages[0]?.title || ""}
              onChange={handlePassageChange}
              sx={{ width: '100%', color: "white", border: "1px", borderColor: "white" }}
            >
              {passages &&
                passages?.length > 0 &&
                passages?.map(doc => (
                  <MenuItem key={doc?.id} value={doc?.title} sx={{ display: "center" }}>
                    {doc?.title}
                  </MenuItem>
                ))}
            </Select>
          </Box>
          <div>
            <Button
              variant="text"
              disabled={selectedPassage === passages[passages.length - 1]}
              sx={{ color: "white" }}
              onClick={nextPassage}
            >
              {` Next Passage >`}
            </Button>
          </div>
        </div>
      </div>
      <div className="section">
        <div className="blocks search-box">
          <div className="phrases-box">
            {/* <div> */}
            <Button
              sx={{ color: "black", alignItems: 'center' }}
              variant="text"
              disabled={phrases.indexOf(selectedPhrase) === 0}
              onClick={previousPhrase}
            >
              {`< Prev `}
            </Button>
            {/* </div> */}
            <Box
              sx={{
                display: "flex",
                // width: "700px",
                flexDirection: "column",
                marginTop: "10px",
                paddingRight: "20px",
                paddingLeft: "10px"
              }}
            >
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
            <div style={{ display: "center", marginTop: "20px", marginRight: "100px" }}>
              <Button
                sx={{ color: "black", border: "none" }}
                variant="text"
                disabled={phrases.indexOf(selectedPhrase) === phrases.length - 1}
                onClick={nextPhrase}
              >{`NEXT >`}</Button>
            </div>
          </div>
          <div className="query-block">
            <QueryBuilder
              query={schema}
              onQueryChange={q => setSchema(q)}
              handleSubmit={handleSubmit}
              readOnly={false}
            />

            {schemasBoolean?.length > 0 && (
              <Typography variant="h6" component="div" align="left">
                Previous Proposals:
              </Typography>
            )}

            {schemasBoolean?.length > 0 &&
              schemasBoolean.map((schemaE, index) => {
                return (
                  <div key={index}>
                    <QueryBuilder
                      query={schemaE.schema}
                      selectedPhrase={selectedPhrase}
                      readOnly={true}
                    />
                    <div style={{ display: "flex", width: "95%", marginTop: "10px", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", width: "100px", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", width: "45px", justifyContent: "space-between" }}>
                          <div>
                            <IconButton
                              sx={{ color: "#00bcd4" }}
                              component="label"
                              onClick={() => {
                                upVote(schemaE);
                              }}
                              size="small"
                            >
                              {schemaE.upVoters.includes(fullname) ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
                            </IconButton>
                          </div>
                          <div style={{ marginTop: "7px" }}>{schemaE.upVotes}</div>
                        </div>
                        <div style={{ display: "flex", width: "45px", justifyContent: "space-between" }}>
                          <div>
                            <IconButton
                              sx={{ color: "red" }}
                              onClick={() => {
                                downVote(schemaE);
                              }}
                              size="small"
                            >
                              {schemaE.downVoters.includes(fullname) ? <ThumbDownAltIcon /> : <ThumbDownOffAltIcon />}{" "}
                            </IconButton>
                          </div>
                          <div style={{ marginTop: "5px" }}>{schemaE.downVotes}</div>
                        </div>
                      </div>
                      <div
                        style={{
                          paddingTop: "10px",
                          paddingBottom: "20px"
                        }}
                      >
                        <Button
                          variant="outlined"
                          onClick={() => {
                            QuerySearching(schemaE.schema);
                          }}
                        >{`Try it out `}</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="blocks result-box">
          <Box sx={{ padding: '15px' }}>
            <span className="header">
              All Responses
            </span>
            <br />
            <span className="subtitle">
              The highlighted sentences satisfy your keyword rules and the bold words are the keywords you
              entered
            </span>
          </Box>
          <div
            style={{
              overflow: "auto",
              marginBottom: "200px",
              paddingLeft: '15px',
              paddingRight: '15px',
              paddingTop: '15px',
              background: '#F8F8F8',
              borderRadius: '10px',
            }}
          >
            <Box>
              {searchResules.length > 0 ? (
                searchResules.map((respon, index) => {
                  return (
                    <Paper key={index} elevation={3} sx={{ marginBottom: "10px", padding: "10px", textAlign: "left" }}>
                      {(respon.text || "")
                        .split(".")
                        .filter(w => w.trim())
                        .map((sentence, index) => {
                          const splitSentence = sentence.toString().trim().split(" ");
                          let passage;
                          searchKeyWords.map((x) => {
                            passage = splitSentence.map((y) => {
                              if (y.includes(x)) {
                                return `${<mark>{y}</mark>}`;
                              } else {
                                return y;
                              }
                            });
                          });
                          // return passage.map(x => {
                          //   console.log(typeof x);
                          //   if (typeof x === 'object') {
                          //     return <span>{x}</span>
                          //   } else {
                          //     return x
                          //   }
                          // })
                          // const temp = passage.join(" ");
                          console.log({ sentences: respon.sentences, sentence, splitSentence, passage });
                          if (respon.sentences.includes(sentence)) {
                            return <mark key={index}>{`${sentence}.`}</mark>;
                          } else {
                            return <span key={index}>{`${sentence}.`}</span>
                          }
                        })}
                    </Paper>
                  );
                })
              ) : searching ? (
                <CircularProgress color="warning" sx={{ margin: "350px 650px 500px 580px" }} size="100px" />
              ) : (
                <Typography variant="h6" component="div" align="center">
                  No data Found!
                </Typography>
              )}
            </Box>
          </div>
        </div>
      </div>
    </div >
  );
};

export default SchemaGeneration;
