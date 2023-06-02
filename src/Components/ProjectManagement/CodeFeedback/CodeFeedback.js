import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRecoilValue } from "recoil";
import { DataGrid } from "@mui/x-data-grid";

import axios from "axios";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Sheet from "@mui/joy/Sheet";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

import BookmarkIcon from "@mui/icons-material/Bookmark";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import LoadingButton from "@mui/lab/LoadingButton";
import orderBy from "lodash.orderby";
import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";
import SnackbarComp from "../../SnackbarComp";

import arrayToChunks from "../../../utils/arrayToChunks";
import { fetchRecentParticipants } from "../../../utils/researcher";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import { Card, CardHeader, CardContent } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { _codesColumn, feedBackCodesColumns } from "./Columns";

const CodeFeedback = props => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  const email = useRecoilValue(emailState);
  const project = useRecoilValue(projectState);
  const [newCode, setNewCode] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [retrieveNext, setRetrieveNext] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sentences, setSentences] = useState([]);

  const [quotesSelectedForCodes, setQuotesSelectedForCodes] = useState({});
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [docId, setDocId] = useState("");
  const [codeBooksChanges, setCodeBooksChanges] = useState([]);
  const [feedbackCodeChanges, setFeedbackCodeChanges] = useState([]);
  const [codeBooksLoaded, setCodeBooksLoaded] = useState(false);
  const [enableSaveQuote, setEnableSaveQuote] = useState(new Array(100).fill(true));
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);
  const [allResponsesGraded, setAllResponsesGraded] = useState(false);
  // const isAdmin = useRecoilValue(isAdminState);
  const [allExperimentCodes, setAllExperimentCodes] = useState([]);
  const [allFeedbackCodeCodes, setAllFeedbackCodeCodes] = useState([]);
  const [approvedNewCodes, setApprovedNewCodes] = useState([]);
  const [code, setCode] = useState("");
  const [conditionsOrder, setConditionsOrder] = useState([]);
  const [chosenCondition, setChosenCondition] = useState("");
  const [feedbackCodeTitle, setFeedbackCodeTitle] = useState("");
  const [adminCodeData, setAdminCodeData] = useState({});
  // modal options

  const [openDeleteModalAdmin, setOpenDeleteModalAdmin] = useState(false);
  const [fromTheCell, setFromTheCell] = useState(false);

  const [openAdminEditModal, setOpenEditAdminModal] = useState(false);
  const [openAdminAddModal, setOpenAddAdminModal] = useState(false);

  const [recentParticipants, setRecentParticipants] = useState([]);
  const [feedbackCode, setFeedbackCode] = useState({});

  const [choiceConditions, setChoiceConditions] = useState({});

  const [explanationIdsList, setExplanationIdsList] = useState({});

  const handleOpenAdminEditModal = () => setOpenEditAdminModal(true);
  const handleCloseAdminEditModal = () => setOpenEditAdminModal(false);
  const handleOpenAdminAddModal = () => setOpenAddAdminModal(true);
  const handleCloseAdminAddModal = () => setOpenAddAdminModal(false);
  const handleOpenDeleteModalAdmin = () => setOpenDeleteModalAdmin(true);
  const handleCloseDeleteModalAdmin = () => setOpenDeleteModalAdmin(false);
  const [doneLoding, setDoneLoading] = useState(false);
  const [category, setCategory] = useState("");
  const online = project === "OnlineCommunities";
  const projectRef = useRef(project);

  const codesColumn = [
    ..._codesColumn,
    {
      field: "action",
      headerName: "Action",
      renderCell: cellValues => {
        return (
          <>
            <IconButton
              sx={{ mR: "10px" }}
              edge="end"
              aria-label="edit"
              onClick={() => {
                console.log("first");
                setCode(cellValues.row.code);
                setCategory(cellValues.row.category || "");
                setAdminCodeData(cellValues.row);
                handleOpenAdminEditModal();
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => {
                console.log("first");
                setAdminCodeData(cellValues.row);
                handleOpenDeleteModalAdmin();
              }}
            >
              <DeleteIcon />
            </IconButton>
          </>
        );
      }
    }
  ];
  useEffect(() => {
    if (firebase) {
      const feedbackCodeQuery = firebase.db.collection("feedbackCode").where("coders", "array-contains", fullname);

      const feedbackCodeSnapshot = feedbackCodeQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setFeedbackCodeChanges([...docChanges]);
      });
      return () => {
        setFeedbackCodeChanges([]);
        feedbackCodeSnapshot();
      };
    }
  }, [firebase]);

  useEffect(() => {
    projectRef.current = project;
    setExplanationIdsList({});
    const func = async () => {
      try {
        setDoneLoading(false);
        setAllResponsesGraded(true);
        let response = { data: { message: "success" } };
        response = await axios.post("/retreiveFeedbackcodes", {
          fullname
        });
        if (response.data.message === "success") {
          setExplanationIdsList(response.data.codeIds);
          setDoneLoading(true);
        }
      } catch (e) {}
    };
    func();
  }, []);

  useEffect(() => {
    const func = async () => {
      const allCodes = [...allFeedbackCodeCodes];

      for (let change of feedbackCodeChanges) {
        const data = change.doc.data();
        const id = change.doc.id;

        if (change.type === "added") {
          const obj = { id, ...data };
          const existingIndex = allCodes.findIndex(c => {
            return c.id === id;
          });
          if (existingIndex === -1) {
            allCodes.push(obj);
          } else {
            allCodes[existingIndex] = { ...allCodes[existingIndex], ...data };
          }
        } else if (change.type === "modified") {
          const existingIndex = allCodes.findIndex(c => {
            return c.id === id;
          });
          if (existingIndex !== -1) {
            allCodes[existingIndex] = { ...allCodes[existingIndex], ...data };
          }
        } else if (change.type === "removed") {
          const existingIndex = allCodes.findIndex(c => {
            return c.id === id;
          });
          if (existingIndex !== -1) {
            allCodes.splice(existingIndex, 1);
          }
        }
      }
      setAllFeedbackCodeCodes(allCodes);
    };

    if (codeBooksChanges.length > 0) {
      func();
    }
  }, [codeBooksChanges]);
  const feedBackCodesChoices = useMemo(() => {
    return allFeedbackCodeCodes
      .map(c => {
        return {
          id: c.id,
          explanation: c.explanation,
          choice: c.choice,
          date: new Date(c.createdAt.toDate()),
          project: c.project
        };
      })
      .filter(c => c.project === project);
  }, [allFeedbackCodeCodes, project]);

  useEffect(() => {
    setSentences([]);
    setChosenCondition("");
  }, [project]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (firebase) {
      let CodeBooksQuery = firebase.db.collection("feedbackCodeBooks");
      const passagesSnapshot = CodeBooksQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setCodeBooksChanges([...docChanges]);
        setCodeBooksLoaded(true);
      });
      return () => {
        setCodeBooksChanges([]);
        passagesSnapshot();
      };
    }
  }, [firebase, project]);

  useEffect(() => {
    if (firebase && fullname) {
      (async () => {
        const recentParticipants = await fetchRecentParticipants(fullname, project);
        setRecentParticipants(recentParticipants);
      })();
    }
  }, [firebase, fullname]);

  useEffect(() => {
    const func = async () => {
      const allCodes = [...allExperimentCodes];
      for (let change of codeBooksChanges) {
        const data = change.doc.data();
        const id = change.doc.id;

        if (change.type === "added") {
          const obj = { id, ...data };
          const existingIndex = allCodes.findIndex(c => {
            return c.id === id;
          });
          if (existingIndex === -1) {
            allCodes.push(obj);
          } else {
            allCodes[existingIndex] = { ...allCodes[existingIndex], ...data };
          }
        } else if (change.type === "modified") {
          const existingIndex = allCodes.findIndex(c => {
            return c.id === id;
          });
          if (existingIndex !== -1) {
            allCodes[existingIndex] = { ...allCodes[existingIndex], ...data };
          }
        } else if (change.type === "removed") {
          const existingIndex = allCodes.findIndex(c => {
            return c.id === id;
          });
          if (existingIndex !== -1) {
            allCodes.splice(existingIndex, 1);
          }
        }
      }
      setAllExperimentCodes(allCodes);
    };

    if (codeBooksChanges.length > 0) {
      func();
    }
  }, [codeBooksChanges]);

  const approvedCodes = useMemo(() => {
    const codeMap = {};
    const filtered = allExperimentCodes.filter(c => {
      let exist = codeMap[c.code] || false;
      codeMap[c.code] = true;
      if (online) {
        return c.approved && !exist && c.hasOwnProperty("category") && c.project === "OnlineCommunities";
      } else {
        return c.approved && !exist && c.hasOwnProperty("category") && c.project !== "OnlineCommunities";
      }
    });

    return filtered.sort((a, b) => a.code - b.code);
  }, [allExperimentCodes, project]);

  const categories = useMemo(() => {
    const _categories = [];
    for (let code of approvedCodes) {
      if (!_categories.includes(code.category)) {
        _categories.push(code.category);
      }
    }
    return _categories;
  }, [approvedCodes]);

  useEffect(() => {
    if (!sentences.length) return;
    let _choiceConditions = {};
    for (let sentence of sentences) {
      for (let codeData of approvedCodes) {
        if (_choiceConditions.hasOwnProperty(sentence)) {
          if (_choiceConditions[sentence].hasOwnProperty(codeData.code)) {
            _choiceConditions[sentence][codeData.code] = project === "H2K2" ? "H2" : "H1";
          } else {
            _choiceConditions[sentence] = {
              ..._choiceConditions[sentence],
              [codeData.code]: project === "H2K2" ? "H2" : "H1"
            };
          }
        } else {
          _choiceConditions = {
            ..._choiceConditions,
            [sentence]: {
              [codeData.code]: project === "H2K2" ? "H2" : "H1"
            }
          };
        }
      }
    }
    setChoiceConditions(_choiceConditions);
  }, [sentences]);

  const adminCodes = useMemo(() => {
    const mapped = allExperimentCodes.map(c => {
      if (online) {
        if (c.project === "OnlineCommunities") {
          return {
            id: c.id,
            code: c.code,
            coder: c.coder,
            addedBy: c.addedBy,
            category: c.category,
            title: c?.title || "",
            question: c.question,
            approved: c.approved ? "✅" : "◻",
            rejected: c.rejected ? "❌" : "◻"
          };
        }
      } else {
        if (c.project !== "OnlineCommunities") {
          return {
            id: c.id,
            code: c.code,
            coder: c.coder,
            addedBy: c.addedBy,
            category: c.category,
            title: c?.title || "",
            question: c.question,
            approved: c.approved ? "✅" : "◻",
            rejected: c.rejected ? "❌" : "◻"
          };
        }
      }
      return {};
    });

    return orderBy(
      mapped.filter(row => row.id),
      ["coder", "code"],
      ["asc", "asc"]
    );
  }, [allExperimentCodes, project]);

  useEffect(() => {
    const retriveNextResponse = async () => {
      setFromTheCell(false);
      const explanationsDocs = explanationIdsList[project];
      if (!explanationsDocs || explanationsDocs.length === 0) {
        setAllResponsesGraded(true);
        return;
      } else {
        setAllResponsesGraded(false);
      }

      let feedbackData = explanationsDocs[0];
      if (!feedbackData) {
        setAllResponsesGraded(true);
        return;
      }
      const userDoc = await firebase.db.collection("users").doc(feedbackData.fullname).get();
      const userData = userDoc.data();
      const firstPassageDoc = await firebase.db.collection("passages").doc(userData.pConditions[0].passage).get();
      const response = (feedbackData.explanation || "").match(/[^\.(]+([\(][^)]+[\)])?[^)\.]?/gm).filter(s => s.trim());
      setSentences(response.map(s => s.trim()));
      setSelectedSentence(response[0].trim());
      const cOrders = ["1st: " + userData.pConditions[0].condition + " - " + firstPassageDoc.data().title];
      if (userData.pConditions.length > 1) {
        const secondPassageDoc = await firebase.db.collection("passages").doc(userData.pConditions[1].passage).get();
        cOrders.push("2nd: " + userData.pConditions[1].condition + " - " + secondPassageDoc.data().title);
      }
      let quotesSelectedForCode = {};
      for (let sentence of response) {
        quotesSelectedForCode[sentence] = [];
      }
      setQuotesSelectedForCodes(quotesSelectedForCode);
      setFeedbackCode(feedbackData);
      setChosenCondition(feedbackData.choice);
      setDocId(feedbackData.docId);
      setChosenCondition(feedbackData.choice);
      setConditionsOrder(cOrders);

      setSubmitting(false);
    };
    retriveNextResponse();
    return () => {
      return;
    };
  }, [retrieveNext, project, explanationIdsList]);

  // add new code to the database
  const handleAddNewCode = async () => {
    setCreating(true);

    const researcherRef = firebase.db.collection("researchers").doc(fullname);
    const researcherGet = await researcherRef.get();
    const researcherData = researcherGet.data();

    const researcherUpdates = {
      projects: {
        ...researcherData.projects,
        [project]: {
          ...researcherData.projects[project]
        }
      }
    };
    const codesRef = firebase.db.collection("feedbackCodeBooks").doc();
    const findCode = approvedCodes.find(codeData => codeData.code === newCode);
    if (!approvedCodes.includes(findCode) && newCode !== "") {
      codesRef.set({
        project,
        addedBy: "Researcher",
        code: newCode,
        coder: fullname,
        checked: false,
        approved: false,
        rejected: false,
        title: "Researcher",
        createdAt: firebase.firestore.Timestamp.fromDate(new Date())
      });

      if ("codesGenerated" in researcherUpdates.projects[project]) {
        researcherUpdates.projects[project].codesGenerated += 1;
      } else {
        researcherUpdates.projects[project].codesGenerated = 1;
      }
      setSnackbarMessage("You successfully submitted your code!");
    } else {
      setSnackbarMessage("this code already exist try to add new code! ");
    }
    if ("codesNum" in researcherUpdates.projects[project]) {
      researcherUpdates.projects[project].codesNum += 1;
    } else {
      researcherUpdates.projects[project].codesNum = 1;
    }

    await researcherRef.update(researcherUpdates);

    setNewCode("");
    setCreating(false);
  };

  const handleSelectedSentence = async sentence => {
    setSelectedSentence(sentence.trim());
  };
  const handleCodesSelected = value => () => {
    quotesSelectedForCodes[selectedSentence] = quotesSelectedForCodes[selectedSentence] || [];

    const currentIndex = quotesSelectedForCodes[selectedSentence].indexOf(value);
    const newChecked = quotesSelectedForCodes[selectedSentence];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    let quotesSelectedForCode = { ...quotesSelectedForCodes };
    quotesSelectedForCode[selectedSentence] = newChecked;
    setQuotesSelectedForCodes(quotesSelectedForCode);
  };

  // here we go through all the codes and check the ones
  // that the voter have chosen and append them to his name in the feedbackCode collection
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const _quotesSelectedForCodes = {};
      for (let codeQuote in quotesSelectedForCodes) {
        for (let code of quotesSelectedForCodes[codeQuote]) {
          if (_quotesSelectedForCodes[code]) {
            _quotesSelectedForCodes[code] = [..._quotesSelectedForCodes[code], codeQuote];
          } else {
            _quotesSelectedForCodes[code] = [codeQuote];
          }
        }
      }
      await firebase.idToken();
      await axios.post("/researchers/codeFeedback", {
        fullname,
        docId,
        quotesSelectedForCodes: _quotesSelectedForCodes,
        choiceConditions,
        approvedCodes,
        project
      });

      const _explanationIdsList = { ...explanationIdsList };
      const idx = (_explanationIdsList[project] || []).findIndex(f => f.docId === docId);
      if (idx !== -1) {
        _explanationIdsList[project].splice(idx, 1);
      }
      setExplanationIdsList(_explanationIdsList);
      setRetrieveNext(oldValue => oldValue + 1);
      setSentences([]);
      setChosenCondition("");
      setSnackbarMessage("Your evaluation was submitted successfully.");
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      console.error({ err });
      setSnackbarMessage("Your evaluation is NOT submitted! Please try again. If the issue persists, contact Iman!");
    }
  };

  const handleCellClick = async clickedCell => {
    if (clickedCell.field === "approved") {
      let codesApp = [...adminCodes];
      const appIdx = codesApp.findIndex(acti => acti.id === clickedCell.id);
      const isApproved = codesApp[appIdx][clickedCell.field] === "✅";

      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;
        let codeUpdate;

        codeUpdate = {
          approved: !isApproved
        };
        codeUpdate["rejected"] = false;

        const codeRef = firebase.db.collection("feedbackCodeBooks").doc(id);
        await codeRef.update(codeUpdate);

        const msg = !isApproved ? "Code approved" : "Code rejected";
        setSnackbarMessage(msg);
      }
    }
    if (clickedCell.field === "rejected") {
      let codesApp = [...adminCodes];
      const appIdx = codesApp.findIndex(acti => acti.id === clickedCell.id);
      const isRejected = codesApp[appIdx][clickedCell.field] === "❌";
      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;
        let codeUpdate;
        codeUpdate = {
          rejected: !isRejected
        };
        codeUpdate["approved"] = false;
        const codeRef = firebase.db.collection("feedbackCodeBooks").doc(id);
        await codeRef.update(codeUpdate);

        const msg = !isRejected ? "Code rejected" : "Code approved";
        setSnackbarMessage(msg);
      }
    }
  };

  const handleAdminDelete = async () => {
    try {
      setSubmittingDelete(true);
      // update the document based on selected code
      const feedbackCodeDocs = await firebase.db.collection("feedbackCode").get();
      const updatefeedbackCodeBooksDoc = await firebase.db
        .collection("feedbackCodeBooks")
        .where("code", "==", adminCodeData.code)
        .get();
      const tWriteOperations = [];

      for (let feedbackCodebookDoc of updatefeedbackCodeBooksDoc.docs) {
        tWriteOperations.push({
          docRef: feedbackCodebookDoc.ref,
          operation: "delete"
        });
      }

      // update the codeVots
      for (let feedbackCodeDoc of feedbackCodeDocs.docs) {
        const data = feedbackCodeDoc.data();
        let updateCheck = false;

        for (let codeKey in data?.codesVotes) {
          if (codeKey === adminCodeData.code) {
            updateCheck = true;
            delete data.codesVotes[codeKey];
          }
        }

        //update the codersChoices
        for (let researcherKey in data?.codersChoices) {
          for (let codeKey in data?.codersChoices[researcherKey]) {
            if (codeKey === adminCodeData.code) {
              updateCheck = true;
              delete data?.codersChoices[researcherKey][codeKey];
            }
          }
        }

        if (updateCheck) {
          tWriteOperations.push({
            docRef: feedbackCodeDoc.ref,
            data: data,
            operation: "update"
          });
        }
      }

      const chunked = arrayToChunks(tWriteOperations);

      for (let chunk of chunked) {
        await firebase.db.runTransaction(async t => {
          for (let op of chunk) {
            // eslint-disable-next-line default-case
            switch (op.operation) {
              case "update":
                t.update(op.docRef, op.data);
                break;

              case "delete":
                t.delete(op.docRef);
                break;
            }
          }
        });
      }

      setSnackbarMessage("code successfully deleted!");
      setCode("");
      setAdminCodeData({});
      handleCloseDeleteModalAdmin();
    } catch (err) {
      console.error(err);
      setSnackbarMessage("There is some error while deleting your code, please try after some time!");
    } finally {
      setSubmittingDelete(false);
    }
  };

  const handleAdminEdit = async () => {
    try {
      setSubmittingUpdate(true);
      if (adminCodeData?.code && adminCodeData?.title) {
        const experimentCodes = [...allExperimentCodes];
        const updatefeedbackCodeBooksDoc = await firebase.db
          .collection("feedbackCodeBooks")
          .where("code", "==", adminCodeData.code)
          .get();
        // check if the code already exists in approvedCode or unapprovedCode
        const codes = experimentCodes.filter(elem => elem.code === code);
        if (codes.length >= 1) {
          const codeUpdate = {
            category
          };
          const ref = updatefeedbackCodeBooksDoc.docs[0].ref;
          await ref.update(codeUpdate);
          setSnackbarMessage("Uptaded successful!");
          setCode("");
          setCategory("");
          setAdminCodeData({});
          handleCloseAdminEditModal();
          setOpenEditAdminModal(false);
          setSubmittingUpdate(false);
          return;
        }
        // update the document based on selected code
        const feedbackCodeDocs = await firebase.db.collection("feedbackCode").get();

        const tWriteOperations = [];
        for (let feedbackCodeDoc of updatefeedbackCodeBooksDoc.docs) {
          const codeData = feedbackCodeDoc.data();
          const codeUpdate = {
            ...codeData,
            code: code,
            category
          };

          tWriteOperations.push({
            docRef: feedbackCodeDoc.ref,
            data: codeUpdate
          });
        }

        // update the codeVots
        for (let feedbackCodeDoc of feedbackCodeDocs.docs) {
          const data = feedbackCodeDoc.data();
          let updateCheck = false;

          for (let codeKey in data?.codesVotes) {
            if (codeKey === adminCodeData.code) {
              updateCheck = true;
              data.codesVotes[code] = data.codesVotes[codeKey];
              delete data.codesVotes[codeKey];
            }
          }

          //update the codersChoices
          for (let researcherKey in data?.codersChoices) {
            for (let codeKey in data?.codersChoices[researcherKey]) {
              if (codeKey === adminCodeData.code) {
                updateCheck = true;
                data.codersChoices[researcherKey][code] = data?.codersChoices[researcherKey][codeKey];
                delete data?.codersChoices[researcherKey][codeKey];
              }
            }
          }

          if (updateCheck) {
            tWriteOperations.push({
              docRef: feedbackCodeDoc.ref,
              data
            });
          }
        }

        const chunked = arrayToChunks(tWriteOperations);

        for (let chunk of chunked) {
          await firebase.db.runTransaction(async t => {
            for (let operation of chunk) {
              t.update(operation.docRef, operation.data);
            }
          });
        }
        setSnackbarMessage(`Code updated !`);
        setCode("");
        setAdminCodeData({});
        handleCloseAdminEditModal();
        setOpenEditAdminModal(false);
        setSubmittingUpdate(false);
      }
    } catch (err) {
      setSnackbarMessage("There is some error while updating your code, please try after some time!");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleAdminAddNewCode = async () => {
    const experimentCodes = [...allExperimentCodes];
    const feedbackCodeBooksRef = firebase.db.collection("feedbackCodeBooks");
    const docRef = await feedbackCodeBooksRef.add({
      project,
      approved: true,
      addedBy: "Admin",
      code: code,
      coder: fullname,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date())
    });
    if (docRef.id) {
      const experimentCode = {
        id: docRef.id,
        code: code,
        addedBy: "Admin",
        coder: fullname,
        checked: "✅",
        project: project
      };
      experimentCodes.push(experimentCode);
    }
    setCode("");
    setFeedbackCodeTitle("");
    setAdminCodeData({});
    handleCloseAdminAddModal();
    const msg = `Code Added successfully!`;
    setSnackbarMessage(msg);
  };

  const saveQuote = quote => async event => {
    try {
      const _enableSaveQuote = [...enableSaveQuote];
      _enableSaveQuote[sentences.indexOf(quote)] = false;
      setEnableSaveQuote(_enableSaveQuote);
      const quoteDocs = await firebase.db
        .collection("quotes")
        .where("quote", "==", quote)
        .where("project", "==", project)
        .get();
      if (quoteDocs.docs.length > 0) {
        let quoteData = quoteDocs.docs[0].data();
        if (!quoteData.researchers.includes(fullname)) {
          await firebase.db.runTransaction(async t => {
            const quoteRef = firebase.db.collection("quotes").doc(quoteDocs.docs[0].id);
            const quoteDoc = await t.get(quoteRef);
            quoteData = quoteDoc.data();
            if (!quoteData.researchers.includes(fullname)) {
              t.update(quoteRef, { researchers: [...quoteData.researchers, fullname], updatedAt: new Date() });
            }
          });
        }
      } else {
        const quoteRef = firebase.db.collection("quotes").doc();
        await quoteRef.set({
          researchers: [fullname],
          project,
          quote,
          createdAt: new Date()
        });
      }

      setSnackbarMessage(`Quote "${quote}" has been Saved successfully !`);
    } catch (error) {
      setSnackbarMessage("There is some error while saving the Quote ,please try after some time!");
    } finally {
      const _enableSaveQuote = [...enableSaveQuote];
      _enableSaveQuote[sentences.indexOf(quote)] = true;
      setEnableSaveQuote(_enableSaveQuote);
    }
  };

  const changeChoices = (event, codeChoice) => {
    const _choiceConditions = { ...choiceConditions };
    if (_choiceConditions[selectedSentence].hasOwnProperty(codeChoice)) {
      _choiceConditions[selectedSentence][codeChoice] = event.target.checked
        ? project === "H2K2"
          ? "K2"
          : "L2"
        : project === "H2K2"
        ? "H2"
        : "H1";
    } else {
      _choiceConditions[selectedSentence] = {
        [codeChoice]: event.target.checked ? (project === "H2K2" ? "K2" : "L2") : project === "H2K2" ? "H2" : "H1"
      };
    }
    setChoiceConditions(_choiceConditions);
  };

  const handleCellClickFeedBackCode = async clickedCell => {
    setFromTheCell(true);
    let docID = clickedCell.id;
    const feedbackCodesDoc = await firebase.db.collection("feedbackCode").doc(docID).get();
    const feedbackData = feedbackCodesDoc.data();
    const userDoc = await firebase.db.collection("users").doc(feedbackData.fullname).get();
    const userData = userDoc.data();
    const firstPassageDoc = await firebase.db.collection("passages").doc(userData.pConditions[0].passage).get();
    const response = (feedbackData.explanation || "").match(/[^\.(]+([\(][^)]+[\)])?[^)\.]?/gm).filter(s => s.trim());
    const cOrders = ["1st: " + userData.pConditions[0].condition + " - " + firstPassageDoc.data().title];
    if (userData.pConditions.length > 1) {
      const secondPassageDoc = await firebase.db.collection("passages").doc(userData.pConditions[1].passage).get();
      cOrders.push("2nd: " + userData.pConditions[1].condition + " - " + secondPassageDoc.data().title);
    }
    const myCodes = Object.keys(feedbackData.codersChoices[fullname]).sort();
    const newCodes = approvedCodes.filter(codeData => !myCodes.includes(codeData.code));
    const __quotesSelectedForCode = {};
    for (let code of myCodes) {
      __quotesSelectedForCode[code] = feedbackData.codersChoices[fullname][code];
    }
    for (let code of newCodes) {
      __quotesSelectedForCode[code] = [];
    }
    const _quotesSelectedForCodes = {};
    for (let codeQuote in __quotesSelectedForCode) {
      for (let sentence of __quotesSelectedForCode[codeQuote]) {
        if (_quotesSelectedForCodes[sentence]) {
          _quotesSelectedForCodes[sentence] = [..._quotesSelectedForCodes[sentence], codeQuote];
        } else {
          _quotesSelectedForCodes[sentence] = [codeQuote];
        }
      }
    }
    for (let sentence in _quotesSelectedForCodes) {
      _quotesSelectedForCodes[sentence.trim()] = _quotesSelectedForCodes[sentence];
    }
    const _choiceConditions = feedbackData.codersChoiceConditions[fullname];
    for (let sentence in _choiceConditions) {
      _choiceConditions[sentence?.trim()] = _choiceConditions[sentence];
    }
    setChoiceConditions(_choiceConditions);
    setFeedbackCode(feedbackData);
    setApprovedNewCodes(newCodes);
    setConditionsOrder(cOrders);
    setDocId(docID);
    setChosenCondition(feedbackData.choice);
    setSentences(response.map(s => s.trim()));
    setSelectedSentence(response[0].trim() || "");
    setQuotesSelectedForCodes(_quotesSelectedForCodes);
    setSubmitting(false);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 1000);
  };

  if ((!choiceConditions[selectedSentence?.trim()] || !sentences.length) && !doneLoding)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        <CircularProgress color="warning" sx={{ margin: "0" }} size="50px" />
      </div>
    );

  function CodeList({ codes }) {
    // group the codes by category
    const codesByCategory = {};
    for (const code of codes) {
      if (!codesByCategory[code.category]) {
        codesByCategory[code.category] = [];
      }
      codesByCategory[code.category].push(code);
    }

    // create a card for each category
    const cards = Object.entries(codesByCategory).map(([category, codes]) => (
      <Card key={category} sx={{ mb: 1 }}>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              {category}
            </Typography>
          }
          sx={{ bgcolor: "grey.300" }}
        />
        <CardContent sx={{ p: 0 }}>
          {codes.map(codeData => (
            <ListItem key={codeData.id} disablePadding>
              <ListItemButton value={codeData.code} onClick={handleCodesSelected(codeData.code)} sx={{ p: 0 }}>
                {choiceConditions.hasOwnProperty(selectedSentence) &&
                quotesSelectedForCodes[selectedSentence] &&
                quotesSelectedForCodes[selectedSentence].includes(codeData.code) ? (
                  <Checkbox checked={true} color="success" />
                ) : (
                  <Checkbox checked={false} />
                )}

                <Box sx={{ display: "inline" }}>{codeData.code}</Box>
              </ListItemButton>
              <Box sx={{ display: "flex", alignItems: "center", marginLeft: "auto", mr: "4px" }}>
                {" "}
                {project === "H2K2" ? "H2" : "H1"}
                {choiceConditions.hasOwnProperty(selectedSentence) &&
                ["K2", "L2"].includes(choiceConditions[selectedSentence][codeData.code]) ? (
                  <Switch checked={true} onChange={event => changeChoices(event, codeData.code)} color="warning" />
                ) : (
                  <Switch checked={false} onChange={event => changeChoices(event, codeData.code)} color="warning" />
                )}
                {project === "H2K2" ? "K2" : "L2"}
              </Box>
            </ListItem>
          ))}
        </CardContent>
      </Card>
    ));

    return <div>{cards}</div>;
  }
  const handlChange = event => {
    setCategory(event.target.value);
  };

  return (
    <Box id="get-this">
      {sentences.length ? (
        <>
          <Alert severity="warning" sx={{ mt: "15px", mb: "15px" }}>
            <h2>
              <ul>
                {conditionsOrder.map((cOrder, idx) => {
                  return <li key={"cOrder" + idx}>{cOrder}</li>;
                })}
              </ul>
            </h2>

            <h2>The participant chose {chosenCondition}.</h2>
            <ol>
              <li>
                Read the participant's qualitative response that we've divided into sentences and listed in the right
                box below.
              </li>
              <li>Click and read every single sentence from the codebook listed in the right box below.</li>
              <li>
                If you see any code in the left box that indicates the clicked sentence in the right box, check-mark
                that sentence in the right box.
              </li>
              <li>
                For every sentence, if you check any of the codes, it also check-marks the sentence indicating that the
                code was mentioned by the participant due to the code that you checked.
              </li>
              <li>Select all the codes that apply to the sentence you have selected.</li>
              <li>
                After going through all the codes, if you found an important point in the participant's feedback that is
                not mentioned in any of the codes in the codebook, then you can manually add a new concise code that
                summarizes the important point in the box on the bottom left. Clicking the add button will add this new
                code to the codebook.
              </li>
              <li>
                In the final paper, we need to quote some of the sentences from the users' feedback. If you find any
                sentence that seems very supportive of each of the codes that you select and you think it's valuable
                enough to be quoted in the final paper, please click the "Save as Quote" button next it.
              </li>
            </ol>
            <h2>
              For every code that you select, please click the switch next to it, to specify which condition the
              participant favors based on this specific code.
            </h2>
          </Alert>
          {Object.keys(recentParticipants).includes(feedbackCode?.fullname) &&
          recentParticipants[feedbackCode?.fullname].includes(feedbackCode?.session) ? (
            <Alert
              severity="error"
              sx={{
                color: "rgb(95, 33, 32)",
                background: "rgb(253, 237, 237)",
                marginTop: "10px"
              }}
            >
              <ul>
                <li>
                  <b>{feedbackCode?.fullname}</b> is the last participant in one of your experiement sessions.
                </li>
                <li>
                  you will not receive points for running that session until you code this participant's feedback.
                </li>
              </ul>
            </Alert>
          ) : (
            <span />
          )}
          <Paper elevation={3} sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 0
              }}
            >
              <Box>
                <h2 style={{ alignSelf: "center" }}>Participant's response in sentences</h2>
                <Sheet variant="outlined" sx={{ overflow: "auto", width: "100%" }}>
                  <List
                    sx={{
                      height: 600,
                      p: 0
                    }}
                  >
                    {sentences.map((sentence, index) => (
                      <ListItem
                        key={index}
                        disablePadding
                        sx={{
                          mb: "5px",
                          "&$selected": {
                            backgroundColor: "orange",
                            zIndex: 100
                          }
                        }}
                      >
                        <ListItemButton
                          role={undefined}
                          style={{ width: 500 }}
                          onClick={() => {
                            handleSelectedSentence(sentence);
                          }}
                          sx={{
                            mb: "5px",
                            backgroundColor: selectedSentence?.trim() === sentence?.trim() ? "#e0f7fa" : "transparent",
                            zIndex: selectedSentence?.trim() === sentence?.trim() ? 100 : "auto",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingRight: "10px"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                            <ListItemIcon>
                              {quotesSelectedForCodes[sentence] && quotesSelectedForCodes[sentence].length !== 0 ? (
                                <Checkbox checked={true} />
                              ) : (
                                <></>
                              )}
                            </ListItemIcon>
                            <ListItemText id={sentence} primary={`${sentence}`} />
                          </div>
                        </ListItemButton>

                        <Paper sx={{ backgroundColor: "#2196f3", ml: "5px", mr: "5px" }}>
                          <ListItemButton
                            disabled={!enableSaveQuote[sentences.indexOf(sentence)]}
                            onClick={saveQuote(sentence)}
                            variant="outlined"
                            sx={{ mr: "5px" }}
                          >
                            <Tooltip title="Save as a quote">
                              <BookmarkIcon />
                            </Tooltip>
                          </ListItemButton>
                        </Paper>
                      </ListItem>
                    ))}
                  </List>
                </Sheet>
              </Box>
              <Box>
                <h2 style={{ display: "flex", alignItems: "center" }}>The Codebook</h2>
                <Sheet variant="outlined" sx={{ overflow: "auto", width: "100%" }}>
                  <List
                    sx={{
                      height: 600,
                      p: 0
                    }}
                  >
                    <CodeList codes={approvedCodes} />
                  </List>
                </Sheet>

                <Alert severity="success" className="VoteActivityAlert" sx={{ ml: "0px" }}>
                  If the code you're looking for does not exist in the list above, add it below:
                  <br />
                </Alert>
                <TextField
                  label="Add your code here."
                  variant="outlined"
                  value={newCode}
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ width: "95%", m: 0.5 }}
                  onChange={event => setNewCode(event.currentTarget.value)}
                />
                <Box>
                  <Button
                    variant="contained"
                    style={{ margin: "5px 5px 5px 5ox" }}
                    onClick={handleAddNewCode}
                    disabled={(!newCode || newCode === "") && !creating}
                  >
                    {creating ? <CircularProgress color="warning" size="16px" /> : "Create"}
                  </Button>
                </Box>
              </Box>

              <Box>
                <Button
                  variant="contained"
                  style={{ margin: "19px 500px 10px 580px" }}
                  onClick={handleSubmit}
                  color="success"
                  size="large"
                  disabled={submitting}
                  className={!submitting ? "Button SubmitButton" : "Button SubmitButton Disabled"}
                >
                  {submitting ? <CircularProgress color="warning" size="16px" /> : "Submit"}
                </Button>
              </Box>
            </Box>
            <Box style={{ width: 600, margin: "60px 50px 100px 500px" }}></Box>
          </Paper>
        </>
      ) : allResponsesGraded ? (
        <Alert severity="info" variant="outlined" className="VoteActivityAlert">
          unfortunately there is no new responses for you to Code{" "}
        </Alert>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh" // to cover the entire viewport height
          }}
        >
          {/* <CircularProgress color="warning" sx={{ margin: "0" }} size="50px" /> */}
        </div>
      )}
      <Alert severity="warning" className="VoteActivityAlert">
        Click any of the feedback that you previously coded. It'll populate your codes on top. Then, you can revise
        them.
      </Alert>
      <Box sx={{ mb: "50px" }}>
        <Paper>
          <DataGrid
            rows={feedBackCodesChoices}
            columns={feedBackCodesColumns}
            pageSize={15}
            rowsPerPageOptions={[10]}
            autoPageSize
            autoHeight
            hideFooterSelectedRowCount
            loading={false}
            onCellClick={handleCellClickFeedBackCode}
          />
        </Paper>
      </Box>

      {email === "ouhrac@gmail.com" && (
        <Box sx={{ mb: "50px" }}>
          <Paper>
            <Button className="Button" variant="contained" onClick={handleOpenAdminAddModal}>
              Add New Code
            </Button>
            <DataGrid
              rows={adminCodes}
              columns={codesColumn}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoPageSize
              autoHeight
              hideFooterSelectedRowCount
              loading={false}
              onCellClick={handleCellClick}
            />
          </Paper>
        </Box>
      )}

      <SnackbarComp newMessage={snackbarMessage} setNewMessage={setSnackbarMessage} />

      <>
        {/* Edit Code Admin Modal */}
        <Dialog open={openAdminEditModal} onClose={handleCloseAdminEditModal}>
          <DialogTitle sx={{ fontsize: "10px" }}>Update the code</DialogTitle>
          <DialogContent sx={{ width: "500px" }}>
            <TextField
              autoFocus
              margin="dense"
              id="code"
              label="Update the code here."
              fullWidth
              variant="standard"
              value={code}
              width="100%"
              onChange={event => setCode(event.target.value)}
            />
            <>Category : </>
            <Select value={category} onChange={handlChange} label="category" id="category">
              {categories.map(researcher => {
                return <MenuItem value={researcher}>{researcher}</MenuItem>;
              })}
            </Select>
          </DialogContent>
          <DialogActions>
            <LoadingButton
              loading={submittingUpdate}
              disabled={submittingUpdate}
              onClick={handleAdminEdit}
              loadingPosition="start"
              variant="outlined"
            >
              {submittingUpdate ? `Updating...` : `Update`}
            </LoadingButton>
            <Button
              onClick={() => {
                setCode("");
                handleCloseAdminEditModal();
              }}
            >
              cancel
            </Button>
          </DialogActions>
        </Dialog>
        {/* Add Code Admin Modal */}

        <Dialog open={openAdminAddModal} onClose={handleCloseAdminAddModal}>
          <DialogContent>
            <Typography variant="h9">
              {feedbackCodeTitle === "Participant"
                ? "Your Code will be added for both questions"
                : "Add your Code below"}
            </Typography>

            <TextField
              autoFocus
              margin="dense"
              id="code"
              label="Code"
              type="email"
              fullWidth
              variant="standard"
              value={code}
              onChange={event => setCode(event.currentTarget.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAdminAddNewCode}>Add</Button>
            <Button
              onClick={() => {
                setCode("");
                setFeedbackCodeTitle("");
                handleCloseAdminAddModal();
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Code Confirmation Modal for the Admin*/}
        <Dialog open={openDeleteModalAdmin} onClose={handleCloseDeleteModalAdmin}>
          <DialogTitle sx={{ fontSize: "15px" }}>Are you sure, you want to delete?</DialogTitle>
          <DialogContent>
            <Typography variant="h7" margin-bottom="20px">
              {adminCodeData.code}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAdminDelete}>Delete</Button>
            <Button
              onClick={() => {
                setAdminCodeData({});
                handleCloseDeleteModalAdmin();
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </Box>
  );
};
export default CodeFeedback;
