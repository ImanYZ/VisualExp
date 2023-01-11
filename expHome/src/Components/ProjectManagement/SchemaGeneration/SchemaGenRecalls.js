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
import { Pagination } from "./components/Pagination";
import { uuidv4 } from "../../../utils";
import "./SchemaGeneration.css";

let PageSize = 10;

const temp_schema = [
  { id: uuidv4(), not: false, keyword: "", alternatives: [] },
  { id: uuidv4(), not: true, keyword: "", alternatives: [] }
];

// eslint-disable-next-line no-empty-pattern
export const SchemaGenRecalls = props => {

  const {notSatisfiedPhrases, recallGrade, gradeIt} = props;

  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [wrongRecallVotes, setWrongRecallVotes] = useState([]);
  const [selectedRecall, setSelectedRecall] = useState();

  const [selectedPassageId, setSelectedPassageId] = useState("");
  const [satisfiedRecalls, setSatisfiedRecalls] = useState([]);

  const [submitButtonLoader, setSubmitButtonLoader] = useState(false);
  const project = useRecoilValue(projectState);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (!selectedPhrase) return;
    const passageDoc = await firebase.db
      .collection("passages")
      .where("phrases", "array-contains", selectedPhrase)
      .get();
    if (!passageDoc.docs[0]) return;
    setSelectedPassageId(passageDoc.docs[0].id);
  }, [firebase, selectedPhrase]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (firebase && selectedPassageId) {
      setSearching(true);
      const usersDoc = await firebase.db.collection("users").get();
      const recallTexts = [];
      const temp_results = [];
      for (let userDoc of usersDoc.docs) {
        const userData = userDoc.data();
        if (userData.pConditions) {
          for (let pCon of userData.pConditions) {
            for (let recall of ["recallreText", "recall3DaysreText", "recall1WeekreText"]) {
              if (
                pCon[recall] &&
                pCon[recall] !== "" &&
                !recallTexts.includes(pCon[recall]) &&
                selectedPassageId === pCon?.passage
              ) {
                recallTexts.push(pCon[recall]);
                temp_results.push({ text: pCon[recall], sentences: [], highlightedWords: [] });
                setSearchResules(temp_results);
                setRecallResponses(recallTexts);
              }
            }
          }
        }
      }
      setSearching(false);
    }
  }, [firebase, selectedPassageId]);

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

  useEffect(() => {
    if (!recallGrade?.phrases?.length) return;
    setSelectedPhrase(recallGrade?.phrases?.[0]?.phrase);
  }, [recallGrade]);

  const renderResponses = response => {
    const highlightedWords = response.highlightedWords;

    const sentences = response.text.split(".");
    const sentenceArray = [];
    const margin = {
      marginRight: "3px"
    };

    sentences &&
      sentences.length > 0 &&
      sentences.map((sentence, index) =>
        sentence
          .toString()
          .trim()
          .split(" ")
          .forEach((word, wordIndex) => {
            const wordLowerCase = word.toString().toLowerCase();

            highlightedWords.length > 0 && highlightedWords.includes(wordLowerCase)
              ? sentenceArray.push({
                  highlighted: (
                    <span key={uuidv4()} style={margin}>
                      <mark>
                        <strong>{word}</strong>
                      </mark>
                    </span>
                  )
                })
              : sentenceArray.push({
                  normalWords: (
                    <span key={uuidv4()} style={margin}>
                      {word}
                    </span>
                  )
                });
          })
      );
    return sentenceArray.map(text => {
      if (text?.highlighted) {
        return text?.highlighted;
      } else {
        return text?.normalWords;
      }
    });
  };

  const QuerySearching = schemaEp => {
    setSearching(true);
    setSearchResules([]);
    const searchRes = [];
    let keys = [];
    let responses = [...recallResponses];

    const notKeywords = schema?.filter(x => x.not && x.keyword !== "").map(y => y.keyword);
    let updateResponses = [];
    if (notKeywords.length > 0) {
      updateResponses = responses.filter(str =>
        notKeywords?.some(element => {
          if (str.toLowerCase().includes(element?.toLowerCase())) return false;
          return true;
        })
      );
    } else {
      updateResponses = [...responses];
    }

    responses = [...updateResponses];

    for (let schemaE of schemaEp) {
      if (!schemaE.not) {
        const keywords = [...schemaE.alternatives];
        if (schemaE.keyword !== "") {
          keywords.push(schemaE.keyword);
        }
        keys = [...keys, ...keywords];
      }
    }

    keys = keys.filter(x => x && x !== "");
    const _tempSearchResult = responses.map(elm => {
      return { text: elm, sentences: [], highlightedWords: [] };
    });
    if (notKeywords.length === 0 && keys.length === 0) {
      setSearchResules(_tempSearchResult);
      setSearching(false);
      return;
    }
    for (let text of responses) {
      let highlightedWords = [];
      const filtered = text
        .split(".")
        .filter(w => w && w !== "")
        .map(x => x.trim());
      const containsWord = keys.some(element => text.toLowerCase().includes(element.toLowerCase()));
      if (containsWord) {
        const sentences = [];
        for (let sentence of filtered) {
          const sentenceContainsWord = keys.some(element => sentence.toLowerCase().includes(element.toLowerCase()));
          if (sentenceContainsWord) {
            sentences.push(sentence);
          }
        }
        if (keys.length > 0) {
          const textSplit = text.split(" ");
          textSplit.forEach(str => {
            const replacedString = str.replace("\n", " ");
            const strLowerCase = replacedString.toLowerCase();
            const ifExistingHighLighted = highlightedWords.indexOf(strLowerCase) >= 0;
            if (!ifExistingHighLighted) {
              keys.forEach(element => {
                if (strLowerCase.includes(element.toLowerCase())) {
                  const removeUnusedCharacters = strLowerCase.split(" ");
                  if (removeUnusedCharacters.length > 1) {
                    const fWord = removeUnusedCharacters.find(x => x.toLowerCase().includes(element.toLowerCase()));
                    const ifExist = highlightedWords.indexOf(fWord) >= 0;
                    if (!ifExist && fWord) {
                      const UWord = fWord?.includes(".") ? fWord?.replace(".", "") : fWord;
                      highlightedWords.push(UWord);
                    }
                  } else if (removeUnusedCharacters.length === 1) {
                    const UWord = strLowerCase?.includes(".") ? strLowerCase?.replace(".", "") : strLowerCase;
                    highlightedWords.push(UWord);
                  }
                }
              });
            }
          });
        }
        searchRes.push({ text, sentences, highlightedWords });
      }
      //else {
      //   const sentences = [];
      //   filtered.map(sentence => sentences.push(sentence));
      //   searchRes.push({ text, sentences, highlightedWords });
      // }
    }
    setSearchResules(searchRes);
    setSearching(false);
  };

  useEffect(() => {
    if (selectedPhrase && recallResponses.length > 0 && !searching) {
      QuerySearching(schema);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, selectedPhrase, recallResponses, searching]);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return searchResules.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, searchResules]);

  useEffect(() => {
    if (!notSatisfiedPhrases.length) return;
    if (!recallGrade) return;
    const notSatisfiedRecalls = [];
    const satisfiedRecalls = [];
    const phrases = recallGrade?.phrases || [];
    for (const phrase of phrases) {
      if (notSatisfiedPhrases.includes(phrase.phrase)) {
        notSatisfiedRecalls.push(phrase);
      } else {
        satisfiedRecalls.push(phrase);
      }
    }
    
    if (notSatisfiedRecalls.length) {
      // TODO: need to rewrite it according new structure
      const recallGradesLogsRef = firebase.db.collection("recallGradesLogs").doc(fullname);
      recallGradesLogsRef.set({
        wrongRecallGrades: notSatisfiedRecalls,
        recallGrade: recallGrade
      });

      setSatisfiedRecalls(satisfiedRecalls);
      setWrongRecallVotes(notSatisfiedRecalls);
      // setSelectedPhrase(notSatisfiedRecalls[0].data.phrase);
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
      if(researcherIdx !== -1) {
        _wrongRecallVotes[_index].grades[researcherIdx] = !_checked;
      }
      _wrongRecallVotes[_index].grade = !_checked;
      setWrongRecallVotes(_wrongRecallVotes);
      //setSelectedPhrase(wrongRecallVotes[_index].data.phrase);
      setSelectedRecall(_wrongRecallVotes[_index]);
    }
  };

  const handleNext = () => {
    const indexOFthis = wrongRecallVotes.findIndex(object => {
      return selectedRecall.phrase === object.phrase;
    });
    if (indexOFthis + 1 === wrongRecallVotes.length) {
      setSubmitButtonLoader(true);
      const requestAnswers = satisfiedRecalls.concat(wrongRecallVotes);
      gradeIt(requestAnswers);
      setSubmitButtonLoader(true);
    } else {
      // setSelectedPhrase(wrongRecallVotes[indexOFthis + 1].data.phrase);
      setSelectedRecall(wrongRecallVotes[indexOFthis + 1]);
    }
    const recallGradesLogsRef = firebase.db.collection("recallGradesLogs").doc(fullname);
    recallGradesLogsRef.set({
      wrongRecallGrades: wrongRecallVotes,
      recallGrade
    });
  };

  if (!selectedRecall) return <></>;
  return (
    <div className="schema-generation">
      <div className="section">
        <div className="blocks search-box">
          <Alert severity="warning">
            For every upvote you receives from others on your proposed Boolean expressions, you should receive a point.
            For every downvote, you will lose a point towards free-recall grading activity points.
          </Alert>
          <div>
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
                the Boolean schema the phrase does not satify the response . Do you want to change your vote or propose
                a new schema that satifys the Response ?
              </Alert>
              <div>
                <Paper sx={{ p: "4px 19px 4px 19px", m: "4px 19px 6px 19px" }}>
                  <Box sx={{ display: "inline", mr: "19px" }}>
                    NO
                    <Switch checked={selectedRecall.grade} onChange={changeTheVote} color="secondary" />
                    YES
                  </Box>
                  <Box sx={{ display: "inline" }}>{selectedPhrase}</Box>
                </Paper>
              </div>
            </Box>
          </div>
          <Box sx={{}}>
            <Button onClick={handleNext} className="Button" variant="contained" color="success" disabled={false}>
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

          <div className="query-block">
            {schemasBoolean?.length > 0 && (
              <Typography variant="h6" component="div" align="left">
                Previous Proposals:
              </Typography>
            )}

            {schemasBoolean?.length > 0 &&
              schemasBoolean.map((schemaE, index) => {
                return (
                  <div key={index} className="query-container" style={{ marginBottom: "30px" }}>
                    <QueryBuilder query={schemaE.schema} selectedPhrase={selectedPhrase} readOnly={true} />
                    <div style={{ display: "flex", width: "95%", marginTop: "10px", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", width: "100px", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", width: "45px", justifyContent: "space-between" }}>
                          <div>
                            <IconButton component="label" onClick={() => upVote(schemaE)} size="small" color="success">
                              {schemaE.upVoters.includes(fullname) ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
                            </IconButton>
                          </div>
                          <div style={{ marginTop: "7px" }}>{schemaE.upVotes}</div>
                        </div>
                        <div style={{ display: "flex", width: "45px", justifyContent: "space-between" }}>
                          <div>
                            <IconButton color="secondary" onClick={() => downVote(schemaE)} size="small">
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
                          onClick={() => QuerySearching(schemaE.schema)}
                        >{`Try it out `}</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            <QueryBuilder
              query={schema}
              onQueryChange={q => {
                setSchema(q);
              }}
              handleSubmit={handleSubmit}
              readOnly={false}
            />
          </div>
        </div>
        <div className="blocks result-box">
          <Box sx={{ padding: "15px" }}>
            <span className="header">All Responses</span>
            <br />
            <span className="subtitle">
              The highlighted sentences satisfy your keyword rules and the bold words are the keywords you entered
            </span>
          </Box>
          <div
            style={{
              overflow: "auto",
              paddingLeft: "15px",
              paddingRight: "15px",
              paddingTop: "15px",
              background: "#F8F8F8",
              borderRadius: "10px",
              display: "flex",
              flex: "1",
              minHeight: "0px"
            }}
          >
            <Box>
              {currentTableData.length > 0 ? (
                currentTableData.map((respon, index) => {
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
                      {renderResponses(respon)}
                    </Paper>
                  );
                })
              ) : searching ? (
                <CircularProgress color="warning" size="50px" />
              ) : (
                <Typography variant="h6" component="div" align="center">
                  No data Found!
                </Typography>
              )}
            </Box>
          </div>
          <Pagination
            className="pagination-bar"
            currentPage={currentPage}
            totalCount={searchResules.length}
            pageSize={PageSize}
            onPageChange={page => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default SchemaGenRecalls;
