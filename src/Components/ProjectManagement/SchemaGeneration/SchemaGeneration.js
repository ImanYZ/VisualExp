import React, { useEffect, useState, useMemo } from "react";
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
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";

import QueryBuilder from "./components/QueryBuilder";
import { uuidv4 } from "../../../utils";
import "./SchemaGeneration.css";

const temp_schema = [
  { id: uuidv4(), not: false, keyword: "", alternatives: [] },
  { id: uuidv4(), not: true, keyword: "", alternatives: [] }
];

const useStyles = makeStyles(() => ({
  passageBox: {
    display: "flex",
    height: "100px",
    backgroundColor: "#212121",
    justifyContent: "space-evenly",
    alignItems: "center",
    "& .MuiButtonBase-root.Mui-disabled": {
      color: "#696565"
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#fff !important"
    },
    "& .MuiSvgIcon-root": {
      color: "#fff"
    }
  }
}));

export const SchemaGeneration = () => {
  const classes = useStyles();
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [passages, setPassages] = useState([]);
  const [phrases, setSelectedPhrases] = useState([]);
  const [selectedPassage, setSelectedPassage] = useState({});
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  const [schema, setSchema] = useState(temp_schema);
  const email = useRecoilValue(emailState);
  const [schemasBoolean, setSchemasBoolean] = useState([]);
  const [schmaChanges, setSchmaChanges] = useState([]);
  const [schmaLoaded, setSchmaLoaded] = useState(false);
  const [recallResponses, setRecallResponses] = useState([]);
  const [searchResules, setSearchResules] = useState([]);
  const [searching, setSearching] = useState(false);
  const project = useRecoilValue(projectState);
  const [selectedPassageTitle, setSelectedPassageTitle] = useState("");
  const [allTheResponses, setAllTheResponses] = useState({});
  const [highlightedWords, setHighlightedWords] = useState([]);
  const [notSatisfiedResponses, setNotSatisfiedResponses] = useState([]);

  useEffect(() => {
    const retrieveResponses = async () => {
      setSearching(true);
      const _all = {};
      const recallGradesDocs = await firebase.db.collection("recallGradesV2").get();
      for (let recallDoc of recallGradesDocs.docs) {
        const recallData = recallDoc.data();
        const updateSessions = recallData.sessions;
        for (let session in updateSessions) {
          for (let conditionItem of updateSessions[session]) {
            if (conditionItem.response !== "") {
              if (_all.hasOwnProperty(conditionItem.passage)) {
                _all[conditionItem.passage].push(conditionItem.response);
              } else {
                _all[conditionItem.passage] = [conditionItem.response];
              }
            }
          }
        }
      }
      setAllTheResponses(_all);
    };
    if (firebase) {
      retrieveResponses();
    }
  }, [firebase]);

  useEffect(() => {
    if (Object.keys(allTheResponses).length === 0) return;
    if (selectedPassage.id === undefined) return;
    setSearching(true);
    const recallTexts = allTheResponses[selectedPassage.id];
    setRecallResponses(recallTexts);
    setSearching(false);
    setSearchResules(recallTexts);
  }, [firebase, allTheResponses, selectedPassage, selectedPhrase]);

  useEffect(() => {
    const retrievePassages = async () => {
      const passagesDocs = await firebase.db.collection("passages").get();
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
        setSelectedPassageTitle(passage.title);
        setSelectedPassage(passage);
        const phrases = passage.phrases;
        setSelectedPhrases(phrases);
        setSelectedPhrase(booleanLogsData.selectedPhrase);
        setSchema(booleanLogsData.schema);
      } else {
        setSelectedPassage(passages[0]);
        const phrases = passages[0].phrases;
        setSelectedPhrases([...phrases]);
        setSelectedPhrase(phrases[0]);
      }
      setHighlightedWords([]);
      setSchemasBoolean([]);
      setNotSatisfiedResponses([]);
    };
    if (firebase && fullname) {
      retrievePassages();
    }
  }, [firebase, fullname]);

  useEffect(() => {
    if (selectedPhrase && selectedPassage) {
      const logsRef = firebase.db.collection("booleanScratchLogs").doc(fullname);
      const logsData = {
        passageId: selectedPassage.id,
        passage: selectedPassage.title,
        selectedPhrase: selectedPhrase,
        email,
        schema
      };
      logsRef.set(logsData);
    }
    return () => {};
  }, [firebase, selectedPhrase, selectedPassage, schema]);

  useEffect(() => {
    setHighlightedWords([]);
    setNotSatisfiedResponses([]);
    setSchemasBoolean([]);
    if (firebase && selectedPhrase) {
      const schmaQuery = firebase.db.collection("booleanScratch").where("phrase", "==", selectedPhrase);
      const schmaSnapshot = schmaQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setSchmaChanges(oldSchmasChanges => {
          return [...oldSchmasChanges, ...docChanges];
        });
        setSchmaLoaded(true);
      });
      return () => {
        setSchmaLoaded(false);
        setSchmaChanges([]);
        schmaSnapshot();
      };
    }
  }, [firebase, selectedPhrase, selectedPassage]);

  useEffect(() => {
    if (!schmaLoaded) return;
    let schemas = [...schemasBoolean];
    const tempSchemaChanges = [...schmaChanges];
    setSchmaChanges([]);
    for (let change of tempSchemaChanges) {
      const shemaData = change.doc.data();
      if (change.type === "added") {
        if (!shemaData.deleted) {
          schemas.push({ id: change.doc.id, ...shemaData });
        }
      } else if (change.type === "modified") {
        const index = schemas.indexOf(elm => elm.id === change.doc.id);
        if (shemaData.deleted) {
          schemas.splice(index, 1);
        } else {
          schemas[index] = { id: change.doc.id, ...shemaData };
        }
      }
    }
    schemas.sort((a, b) => (a.upVotes - a.downVotes > b.upVotes - b.downVotes ? -1 : 1));
    setSchemasBoolean(schemas);
    setSchmaLoaded(false);
    setHighlightedWords([]);
  }, [firebase, schmaLoaded]);

  useEffect(() => {
    if (selectedPassageTitle !== "" && !passages.length) return;
    const passageIdx = passages.findIndex(i => i.title === selectedPassageTitle);
    if (passageIdx === -1) return;
    const passage = passages[passageIdx];
    setSelectedPassage(passage);
    setSelectedPhrases(passage.phrases);
    setSelectedPhrase(passage.phrases[0]);
    setHighlightedWords([]);
    setNotSatisfiedResponses([]);
  }, [selectedPassageTitle]);

  const handleSubmit = () => {
    const _schema = [];
    for (let sc of schema) {
      if (sc.keyword !== "") {
        _schema.push(sc);
      }
    }
    const newbooleanScratch = {
      email,
      fullname,
      schema: _schema,
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
        setSchema([
          { id: uuidv4(), not: false, keyword: "", alternatives: [] },
          { id: uuidv4(), not: true, keyword: "", alternatives: [] }
        ]);
      })
      .catch(error => {
        console.error("Error writing document: ", error);
      });
  };

  const upVote = async schema => {
    try {
      const schemaGenerationRef = firebase.db.collection("booleanScratch").doc(schema.id);
      const schemaGenerationDoc = await schemaGenerationRef.get();
      const schemaGenerationData = schemaGenerationDoc.data();
      let calulatedProject = project;
      const researcherRef = firebase.db.collection("researchers").doc(schemaGenerationData.fullname);
      const researcherDoc = await researcherRef.get();
      const researcherData = researcherDoc.data();
      if (!(project in researcherData.projects)) {
        calulatedProject = Object.keys(researcherData.projects)[0];
      }

      let _newGradingPoints = 0;
      const _upVoters = [...schema.upVoters];
      const _downVoters = [...schema.downVoters];
      let _upVotes = schema.upVotes;
      let _downVotes = schema.downVotes;
      if (_upVoters.includes(fullname)) {
        _upVoters.splice(_upVoters.indexOf(fullname), 1);
        _upVotes = _upVotes - 1;
        _newGradingPoints = (researcherData.projects[calulatedProject].gradingPoints || 0) - 1;
      } else {
        _upVoters.push(fullname);
        _upVotes = _upVotes + 1;
        if (_downVoters.includes(fullname)) {
          _downVoters.splice(_downVoters.indexOf(fullname), 1);
          _downVotes = _downVotes - 1;
        }
        _newGradingPoints = (researcherData.projects[calulatedProject].gradingPoints || 0) + 1;
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
      _schemasBoolean.sort((a, b) => (a.upVotes - a.downVotes > b.upVotes - b.downVotes ? -1 : 1));
      setSchemasBoolean(_schemasBoolean);
      const schemaGenerationUpdate = {
        upVotes: _upVotes,
        upVoters: _upVoters,
        downVotes: _downVotes,
        downVoters: _downVoters
      };

      await schemaGenerationRef.update(schemaGenerationUpdate);
      const researcherUpdate = {
        projects: {
          ...researcherData.projects,
          [calulatedProject]: {
            ...researcherData.projects[calulatedProject],
            gradingPoints: _newGradingPoints
          }
        }
      };

      await researcherRef.update(researcherUpdate);
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

      let calulatedProject = project;
      if (!(project in researcherData.projects)) {
        calulatedProject = Object.keys(researcherData.projects)[0];
      }
      let _newGradingPoints = 0;
      let _newNegativeGradingPoints = 0;

      const _downVoters = [...schema.downVoters];
      let _downVotes = schema.downVotes;
      const _upVoters = [...schema.upVoters];
      let _upVotes = schema.upVotes;
      if (_downVoters.includes(fullname)) {
        _downVoters.splice(_downVoters.indexOf(fullname), 1);
        _downVotes = _downVotes - 1;
        _newNegativeGradingPoints = (researcherData.projects[calulatedProject].negativeGradingPoints || 0) + 1;
        _newGradingPoints = (researcherData.projects[calulatedProject].gradingPoints || 0) - 1;
      } else {
        _downVoters.push(fullname);
        _downVotes = _downVotes + 1;
        if (_upVoters.includes(fullname)) {
          _upVoters.splice(_upVoters.indexOf(fullname), 1);
          _upVotes = _upVotes - 1;
        }
        _newNegativeGradingPoints = (researcherData.projects[calulatedProject].negativeGradingPoints || 0) - 1;
        _newGradingPoints = (researcherData.projects[calulatedProject].gradingPoints || 0) + 1;
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
      _schemasBoolean.sort((a, b) => (a.upVotes - a.downVotes > b.upVotes - b.downVotes ? -1 : 1));
      setSchemasBoolean(_schemasBoolean);
      const schemaGenerationUpdate = {
        upVotes: _upVotes,
        upVoters: _upVoters,
        downVotes: _downVotes,
        downVoters: _downVoters
      };

      await schemaGenerationRef.update(schemaGenerationUpdate);

      const researcherUpdate = {
        projects: {
          ...researcherData.projects,
          [calulatedProject]: {
            ...researcherData.projects[calulatedProject],
            gradingPoints: _newGradingPoints,
            negativeGradingPoints: _newNegativeGradingPoints
          }
        }
      };
      await researcherRef.update(researcherUpdate);
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

  const previousPassage = () => {
    const indexPassage = passages.findIndex(i => i.title === selectedPassageTitle);
    const passage = passages[indexPassage - 1];
    setSelectedPassage(passage);
    setSelectedPhrases(passage.phrases);
    setSelectedPhrase(passage.phrases[0]);
    setSelectedPassageTitle(passage.title);
  };

  const nextPassage = () => {
    const indexPassage = passages.findIndex(i => i.title === selectedPassageTitle);
    const passage = passages[indexPassage + 1];
    setSelectedPassage(passage);
    setSelectedPhrases(passage.phrases);
    setSelectedPhrase(passage.phrases[0]);
    setSelectedPassageTitle(passage.title);
  };

  const filterParagraphs = (paragraphs, rules) => {
    return paragraphs.filter(paragraph => {
      return rules.every(rule => {
        const { keyword, alternatives, not } = rule;
        const keywords = [keyword, ...alternatives].filter(kw => kw !== "");
        const match = keywords.some(kw => paragraph.toLowerCase().includes(kw.toLowerCase()));
        return (match && !not) || (!match && not);
      });
    });
  };

  const QuerySearching = schemaEp => {
    let keywords = [];
    schemaEp.forEach(rule => {
      const { keyword, alternatives, not } = rule;
      if (!not) {
        keywords = [...keywords, keyword, ...alternatives];
      }
    });
    setSearching(true);
    setSearchResules([]);
    const responses = [...recallResponses];
    const reponsefilteres = filterParagraphs(responses, schemaEp);
    const notSatisfied = responses.filter(r => !reponsefilteres.includes(r));
    setNotSatisfiedResponses(notSatisfied);
    setSearchResules(reponsefilteres);
    setSearching(false);
    setHighlightedWords(keywords);
  };

  const renderResponses = paragraph => {
    if (!paragraph) return null;
    const pattern = new RegExp(`(${highlightedWords.join("|")})`, "gi");
    return paragraph.replace(pattern, '<span style="background-color: yellow;">$1</span>');
  };

  const searchResultsRD = useMemo(() => {
    return (searchResules || []).map((respon, index) => {
      return (
        <Paper
          key={index}
          elevation={3}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            mb: "20px",
            p: "10px"
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: renderResponses(respon) }} />
        </Paper>
      );
    });
  }, [searchResules]);

  const deleteSchema = async id => {
    try {
      window.confirm("Are you sure you want to delete this schema?");
      const booleanRef = firebase.db.collection("booleanScratch").doc(id);
      booleanRef.update({
        deleted: true
      });
    } catch (error) {
    }
  };

  const handleCopy = schema => {
    setSchema(schema);
  };

  return (
    <Box className="schema-generation">
      <Box>
        <Box className={classes.passageBox}>
          <Box>
            <Button
              variant="text"
              disabled={selectedPassage === passages[0]}
              sx={{ color: "white" }}
              onClick={previousPassage}
            >
              {`< Previous Passage`}
            </Button>
          </Box>
          <Box sx={{ width: "55%" }}>
            <Select
              id="demo-simple-select-helper"
              value={selectedPassageTitle}
              onChange={(_, value) => {
                setSelectedPassageTitle(value.props.value);
              }}
              sx={{ width: "100%", color: "white", border: "1px", borderColor: "white" }}
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
          <Box>
            <Button
              variant="text"
              disabled={selectedPassage === passages[passages.length - 1]}
              sx={{ color: "white" }}
              onClick={nextPassage}
            >
              {` Next Passage >`}
            </Button>
          </Box>
        </Box>
      </Box>
      <Box className="section">
        <Box className="blocks search-box">
          <Box className="phrases-box">
            <Button
              sx={{ color: "black", alignItems: "center" }}
              variant="text"
              disabled={phrases.indexOf(selectedPhrase) === 0}
              onClick={previousPhrase}
            >
              {`< Prev `}
            </Button>
            <Box
              sx={{
                display: "flex",
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
            <Box style={{ display: "center", marginTop: "20px", marginRight: "100px" }}>
              <Button
                sx={{ color: "black", border: "none" }}
                variant="text"
                disabled={phrases.indexOf(selectedPhrase) === phrases.length - 1}
                onClick={nextPhrase}
              >{`NEXT >`}</Button>
            </Box>
          </Box>
          <Box className="query-block">
            {schemasBoolean?.length > 0 && (
              <Typography variant="h6" component="Box" align="left">
                Previous Proposals:
              </Typography>
            )}

            {schemasBoolean?.length > 0 &&
              schemasBoolean.map((schemaE, index) => {
                return (
                  <Box key={index} className="query-container" style={{ marginBottom: "30px" }}>
                    <QueryBuilder query={schemaE.schema} selectedPhrase={selectedPhrase} readOnly={true} />
                    <Box style={{ display: "flex", width: "95%", marginTop: "10px", justifyContent: "space-between" }}>
                      <Box style={{ display: "flex", width: "100px", justifyContent: "space-between" }}>
                        <Box style={{ display: "flex", width: "45px", justifyContent: "space-between" }}>
                          <Box>
                            <IconButton
                              sx={{ color: "#00bcd4" }}
                              component="label"
                              onClick={() => upVote(schemaE)}
                              size="small"
                            >
                              {schemaE.upVoters.includes(fullname) ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
                            </IconButton>
                          </Box>
                          <Box style={{ marginTop: "7px" }}>{schemaE.upVotes}</Box>
                        </Box>
                        <Box style={{ display: "flex", width: "45px", justifyContent: "space-between" }}>
                          <Box>
                            <IconButton sx={{ color: "red" }} onClick={() => downVote(schemaE)} size="small">
                              {schemaE.downVoters.includes(fullname) ? <ThumbDownAltIcon /> : <ThumbDownOffAltIcon />}{" "}
                            </IconButton>
                          </Box>
                          <Box style={{ marginTop: "5px" }}>{schemaE.downVotes}</Box>
                        </Box>
                      </Box>
                      <Box
                        style={{
                          paddingTop: "10px",
                          paddingBottom: "20px"
                        }}
                      >
                        {fullname === schemaE.fullname && (
                          <Tooltip title="Delete this boolean expression">
                            <IconButton
                              sx={{ color: "red", mr: "25px" }}
                              onClick={() => deleteSchema(schemaE.id)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="This will popolate the new schema at the bottom">
                          <Button
                            variant="outlined"
                            onClick={() => handleCopy(schemaE.schema)}
                            sx={{ mr: "15px" }}
                          >{`Copy`}</Button>
                        </Tooltip>

                        <Button
                          variant="outlined"
                          onClick={() => QuerySearching(schemaE.schema)}
                        >{`Try it out `}</Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            <Typography variant="h6" component="Box" align="left" sx={{ color: "#4dabf5" }}>
              Propose a new boolean expression:
            </Typography>
            <QueryBuilder
              query={schema}
              onQueryChange={q => {
                setSchema(q);
              }}
              handleSubmit={handleSubmit}
              QuerySearching={QuerySearching}
              readOnly={false}
            />
          </Box>
        </Box>
        <Box className="blocks result-box">
          <Box sx={{ padding: "15px" }}>
            {notSatisfiedResponses.length > 0 ? (
              <span className="header">Response that satify the Boolean expression </span>
            ) : (
              <span className="header">All Responses</span>
            )}
            <br />
            <span className="subtitle">The highlighted sentences satisfy your keyword rules</span>
          </Box>
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "0px"
            }}
          >
            <Box
              style={{
                flex: "1",
                background: "#F8F8F8",
                borderRadius: "10px",
                overflow: "auto",
                padding: "15px",
                height: "50%"
              }}
            >
              {searchResules.length > 0 ? (
                searchResultsRD
              ) : searching ? (
                <CircularProgress color="warning" size="50px" />
              ) : (
                <Typography variant="h6" component="Box" align="center">
                  No data Found!
                </Typography>
              )}
            </Box>
            {notSatisfiedResponses.length > 0 ? (
              <Box sx={{ padding: "15px" }}>
                <span className="header">Responses that do not satisfy the Boolean expression </span>
                <br />
              </Box>
            ) : null}
            {notSatisfiedResponses.length > 0 ? (
              <Box
                style={{
                  background: "#F8F8F8",
                  borderRadius: "10px",
                  overflow: "auto",
                  padding: "15px",
                  height: "50%"
                }}
              >
                {notSatisfiedResponses.map((response, index) => {
                  const isLastElement = index === notSatisfiedResponses.length - 1;
                  return (
                    <Paper
                      key={index}
                      elevation={3}
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        p: "10px",
                        mb: isLastElement ? "200px" : "10px"
                      }}
                    >
                      {response}
                    </Paper>
                  );
                })}
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SchemaGeneration;
