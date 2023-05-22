import React, { useEffect, useState, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";
// mui imports
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import QueryBuilder from "./components/QueryBuilder";
import { uuidv4 } from "../../../utils";
import "./SchemaGeneration.css";

const temp_schema = [
  { id: uuidv4(), not: false, keyword: "", alternatives: [] },
  { id: uuidv4(), not: true, keyword: "", alternatives: [] }
];

// eslint-disable-next-line no-empty-pattern
export const SchemaGenRecalls = props => {
  const { notSatisfiedPhrases, recallGrade, gradeIt, selectedPassageId, projectParticipant } = props;

  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const [schema, setSchema] = useState(temp_schema);
  const email = useRecoilValue(emailState);
  const [schemasBoolean, setSchemasBoolean] = useState([]);
  const [schmaChanges, setSchmaChanges] = useState([]);
  const [recallResponses, setRecallResponses] = useState([]);
  const [searchResules, setSearchResules] = useState([]);
  const [searching, setSearching] = useState(false);
  const [wrongRecallVotes, setWrongRecallVotes] = useState([]);
  const [selectedRecall, setSelectedRecall] = useState();

  const [satisfiedRecalls, setSatisfiedRecalls] = useState([]);
  const [schmaLoaded, setSchmaLoaded] = useState(false);
  const [submitButtonLoader, setSubmitButtonLoader] = useState(false);
  const [highlightedWords, setHighlightedWords] = useState([]);
  const [notSatisfiedResponses, setNotSatisfiedResponses] = useState([]);

  const project = useRecoilValue(projectState);

  useEffect(() => {
    const retrieveResponses = async () => {
      setSearching(true);
      const recallGradesDocs = await firebase.db
        .collection("recallGradesV2")
        .where("passages", "array-contains", selectedPassageId)
        .get();
      const recallTexts = [];
      for (let recallDoc of recallGradesDocs.docs) {
        const recallData = recallDoc.data();
        if (recallData.project !== projectParticipant) continue;
        const updateSessions = recallData.sessions;
        for (let session in updateSessions) {
          for (let conditionItem of updateSessions[session]) {
            if (conditionItem.passage === selectedPassageId) {
              recallTexts.push(conditionItem.response);
            }
          }
        }
      }
      setSearchResules(recallTexts);
      setRecallResponses(recallTexts);
      setSearching(false);
    };
    if (firebase && selectedPassageId) {
      retrieveResponses();
    }
  }, [firebase, selectedPassageId, selectedRecall]);



  useEffect(() => {
    setHighlightedWords([]);
    setNotSatisfiedResponses([]);
    setSchemasBoolean([]);
    if (firebase && selectedRecall) {
      const schmaQuery = firebase.db.collection("booleanScratch").where("phrase", "==", selectedRecall.phrase);
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
  }, [firebase, selectedRecall]);

  useEffect(() => {
    if (!schmaLoaded) return;
    let schemas = [...schemasBoolean];
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
    schemas.sort((a, b) => (a.upVotes - a.downVotes > b.upVotes - b.downVotes ? -1 : 1));
    setSchemasBoolean(schemas);
    setSchmaLoaded(false);
    setHighlightedWords([]);
  }, [firebase, schmaLoaded]);



  const handleSubmit = () => {
    const newbooleanScratch = {
      email,
      fullname,
      schema: schema,
      createdAt: new Date(),
      phrase: selectedRecall.phrase,
      passage: selectedPassageId,
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
    const responses = [...recallResponses];
    const reponsefilteres = filterParagraphs(responses, schemaEp);
    const notSatisfied = responses.filter(r => !reponsefilteres.includes(r));
    setNotSatisfiedResponses(notSatisfied);
    setSearchResules(reponsefilteres);
    setSearching(false);
    setHighlightedWords(keywords);
  };

  useEffect(() => {
    if (!notSatisfiedPhrases.length) return;
    if (!recallGrade) return;
    const notSatisfiedRecalls = [];
    const satisfiedRecalls = [];
    const seenPhrases = [];
    const phrases = recallGrade?.phrases || [];
    for (const phrase of phrases) {
      if (seenPhrases.includes(phrase.phrase)) {
        continue;
      }

      if (notSatisfiedPhrases.includes(phrase.phrase)) {
        notSatisfiedRecalls.push(phrase);
      } else {
        satisfiedRecalls.push(phrase);
      }

      seenPhrases.push(phrase.phrase);
    }
    if (notSatisfiedRecalls.length) {
      setSatisfiedRecalls(satisfiedRecalls);
      setWrongRecallVotes(notSatisfiedRecalls);
      setSelectedRecall(notSatisfiedRecalls[0]);
    }
  }, [recallGrade, notSatisfiedPhrases]);

  const changeTheVote = () => {
    const _wrongRecallVotes = wrongRecallVotes.slice();
    const _index = wrongRecallVotes.findIndex(object => {
      return selectedRecall.phrase === object.phrase;
    });
    const _checked = _wrongRecallVotes[_index].grade;
    if (_index !== -1) {
      const researchers = [...(_wrongRecallVotes[_index].researchers || [])];
      const researcherIdx = researchers.indexOf(fullname);
      if (researcherIdx !== -1) {
        _wrongRecallVotes[_index].grades[researcherIdx] = !_checked;
      }
      _wrongRecallVotes[_index].grade = !_checked;
      setWrongRecallVotes(_wrongRecallVotes);
      setSelectedRecall(_wrongRecallVotes[_index]);
    }
  };

  const handleNext = () => {
    setHighlightedWords([]);
    setSearchResules(recallResponses);
    const indexOFthis = wrongRecallVotes.findIndex(object => {
      return selectedRecall.phrase === object.phrase;
    });
    if (indexOFthis + 1 === wrongRecallVotes.length) {
      setSubmitButtonLoader(true);
      const requestAnswers = satisfiedRecalls.concat(wrongRecallVotes);
      gradeIt(requestAnswers);
      setSubmitButtonLoader(true);
    } else {
      setSelectedRecall(wrongRecallVotes[indexOFthis + 1]);
    }
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
  if (!selectedRecall) return <></>;

  return (
    <Box className="schema-generation">
      <Box className="section">
        <Box
          sx={{
            width: "50%",
            height: "100%",
            overflow: "auto"
          }}
        >
          <Box className="query-block">
            <Alert severity="warning">
              For every upvote you receives from others on your proposed Boolean expressions, you should receive a
              point. For every downvote, you will lose a point towards free-recall grading activity points.
            </Alert>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "10px",
                  paddingRight: "20px",
                  paddingLeft: "10px"
                }}
              >
                <Paper sx={{ p: "4px 19px 4px 19px", m: "4px 19px 6px 19px" }}>{recallGrade.response}</Paper>
                <Alert severity="warning">
                  You checked this phrase as "YES" and that belongs to the participant response above ; but according to
                  the Boolean schema the phrase does not satify the response . Do you want to change your vote or
                  propose a new schema that satifys the Response ?
                </Alert>
                <Box>
                  <Paper sx={{ p: "4px 19px 4px 19px", m: "4px 19px 6px 19px" }}>
                    <Box sx={{ display: "inline", mr: "19px" }}>
                      NO
                      <Switch checked={selectedRecall.grade} onChange={changeTheVote} color="secondary" />
                      YES
                    </Box>
                    <Box sx={{ display: "inline" }}>{selectedRecall.phrase}</Box>
                  </Paper>
                </Box>
              </Box>
            </Box>
            <Box sx={{}}>
              <Button
                onClick={handleNext}
                className="Button"
                variant="contained"
                color="success"
                disabled={false}
                id="schema-recall-submit"
              >
                {submitButtonLoader ? (
                  <CircularProgress color="warning" size="15px" />
                ) : wrongRecallVotes.findIndex(object => {
                    return selectedRecall.phrase === object.phrase;
                  }) +
                    1 ===
                  wrongRecallVotes.length ? (
                  "Submit"
                ) : (
                  "Next"
                )}
              </Button>
              {wrongRecallVotes.findIndex(object => {
                return selectedRecall.phrase === object.phrase;
              }) + 1}{" "}
              / {wrongRecallVotes.length}
            </Box>
            {schemasBoolean?.length > 0 && (
              <Typography variant="h6" component="Box" align="left">
                Previous Proposals:
              </Typography>
            )}

            {schemasBoolean?.length > 0 &&
              schemasBoolean.map((schemaE, index) => {
                return (
                  <Box key={index} className="query-container" style={{ marginBottom: "30px" }}>
                    <QueryBuilder query={schemaE.schema} selectedPhrase={selectedRecall.phrase} readOnly={true} />
                    <Box style={{ display: "flex", width: "95%", marginTop: "10px", justifyContent: "space-between" }}>
                      <Box style={{ display: "flex", width: "100px", justifyContent: "space-between" }}>
                        <Box style={{ display: "flex", width: "45px", justifyContent: "space-between" }}>
                          <Box>
                            <IconButton component="label" onClick={() => upVote(schemaE)} size="small" color="success">
                              {schemaE.upVoters.includes(fullname) ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
                            </IconButton>
                          </Box>
                          <Box style={{ marginTop: "7px" }}>{schemaE.upVotes}</Box>
                        </Box>
                        <Box style={{ display: "flex", width: "45px", justifyContent: "space-between" }}>
                          <Box>
                            <IconButton color="secondary" onClick={() => downVote(schemaE)} size="small">
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
                        <Button
                          variant="outlined"
                          onClick={() => QuerySearching(schemaE.schema)}
                        >{`Try it out `}</Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
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
                marginBottom: "15px",
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

export default SchemaGenRecalls;
