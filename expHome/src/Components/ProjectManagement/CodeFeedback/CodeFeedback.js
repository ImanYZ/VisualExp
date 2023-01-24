import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRecoilValue } from "recoil";
import { DataGrid } from "@mui/x-data-grid";
import GridCellToolTip from "../../GridCellToolTip";

import axios from "axios";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Sheet from "@mui/joy/Sheet";
import Select from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import BookmarkIcon from "@mui/icons-material/Bookmark";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import orderBy from "lodash.orderby";
import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";
import SnackbarComp from "../../SnackbarComp";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import arrayToChunks from "../../../utils/arrayToChunks";
import { fetchRecentParticipants } from "../../../utils/researcher";
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3
};

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
  const [selectedSentences, setSelectedSentences] = useState({});
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
  const [selectedCode, setSelectedCode] = useState({});
  const [allExperimentCodes, setAllExperimentCodes] = useState([]);
  const [allFeedbackCodeCodes, setAllFeedbackCodeCodes] = useState([]);
  const [approvedNewCodes, setApprovedNewCodes] = useState([]);
  const [code, setCode] = useState("");
  const [conditionsOrder, setConditionsOrder] = useState([]);
  const [chosenCondition, setChosenCondition] = useState("");
  const [feedbackCodeTitle, setFeedbackCodeTitle] = useState("");
  const [adminCodeData, setAdminCodeData] = useState({});
  // modal options
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDeleteModalAdmin, setOpenDeleteModalAdmin] = useState(false);
  const [fromTheCell, setFromTheCell] = useState(false);

  const [openAdminEditModal, setOpenEditAdminModal] = useState(false);
  const [openAdminAddModal, setOpenAddAdminModal] = useState(false);

  const [recentParticipants, setRecentParticipants] = useState([]);
  const [feedbackCode, setFeedbackCode] = useState({});

  const [choiceConditions, setChoiceConditions] = useState({});
  const handleOpenEditModal = () => setOpenEditModal(true);
  const handleCloseEditModal = () => setOpenEditModal(false);
  const handleOpenAdminEditModal = () => setOpenEditAdminModal(true);
  const handleCloseAdminEditModal = () => setOpenEditAdminModal(false);
  const handleOpenAdminAddModal = () => setOpenAddAdminModal(true);
  const handleCloseAdminAddModal = () => setOpenAddAdminModal(false);
  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);
  const handleOpenDeleteModalAdmin = () => setOpenDeleteModalAdmin(true);
  const handleCloseDeleteModalAdmin = () => setOpenDeleteModalAdmin(false);

  const codesColumn = [
    {
      field: "code",
      headerName: "Code",
      width: "500",
      renderCell: cellValues => {
        return <GridCellToolTip isLink={false} cellValues={cellValues} />;
      }
    },
    {
      field: "approved",
      headerName: "Approved/UnApproved",
      renderCell: cellValues => {
        return <div style={{ width: "100%", textAlign: "center", cursor: "pointer" }}>{cellValues.value}</div>;
      }
    },
    {
      field: "rejected",
      headerName: "Reject",
      renderCell: cellValues => {
        return <div style={{ width: "100%", textAlign: "center", cursor: "pointer" }}>{cellValues.value}</div>;
      }
    },
    {
      field: "coder",
      headerName: "Coder",
      renderCell: cellValues => {
        return <GridCellToolTip isLink={false} cellValues={cellValues} />;
      }
    },
    {
      field: "question",
      headerName: "Question",
      renderCell: cellValues => {
        return <GridCellToolTip isLink={false} cellValues={cellValues} />;
      }
    },
    {
      field: "title",
      headerName: "Added For",
      renderCell: cellValues => {
        return <GridCellToolTip isLink={false} cellValues={cellValues} />;
      }
    },
    {
      field: "addedBy",
      headerName: "Added By",
      renderCell: cellValues => {
        return <GridCellToolTip isLink={false} cellValues={cellValues} />;
      }
    },
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
                setCode(cellValues.row.code);
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

  const feedBackCodesColumns = [
    {
      field: "explanation",
      headerName: "Explanation",
      width: "900",
      renderCell: cellValues => {
        return <GridCellToolTip isLink={false} cellValues={cellValues} />;
      }
    },
    {
      field: "choice",
      headerName: "The participant choice",
      width: "500",
      renderCell: cellValues => {
        return <GridCellToolTip isLink={false} cellValues={cellValues} />;
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
    const func = async () => {
      const allCodes = [...allFeedbackCodeCodes];

      for (let change of feedbackCodeChanges) {
        const data = change.doc.data();
        const id = change.doc.id;

        if (change.type === "added") {
          const obj = { id, ...data };
          allCodes.push(obj);
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
    return allFeedbackCodeCodes.map(c => {
      return {
        id: c.id,
        explanation: c.explanation,
        choice: c.choice
      };
    });
  }, [allFeedbackCodeCodes]);

  useEffect(() => {
    setSentences("");
    setChosenCondition("");
  }, [project]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (firebase) {
      const CodeBooksQuery = firebase.db.collection("feedbackCodeBooks");

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
  }, [firebase]);

  useEffect(() => {
    if (firebase && fullname) {
      (async () => {
        const recentParticipants = await fetchRecentParticipants(fullname);
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
          allCodes.push(obj);
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
      return c.approved && !exist;
    });

    return filtered.sort((a, b) => a.code - b.code);
  }, [allExperimentCodes]);
  useEffect(() => {
    if (!approvedCodes.length) return;
    if (fromTheCell) return;
    if (approvedCodes.length > 0) {
      let quotesSelectedForCode = {};
      let sentencesSelecting = {};
      for (let sentence of sentences) {
        quotesSelectedForCode[sentence] = [];
        sentencesSelecting[sentence] = false;
      }
      sentencesSelecting[sentences[0]] = true;
      setSelectedSentence(sentences[0]);
      setQuotesSelectedForCodes(quotesSelectedForCode);
      setSelectedSentences(sentencesSelecting);
    }
  }, [approvedCodes, retrieveNext, project, sentences]);

  useEffect(() => {
    if (!sentences.length) return;
    let _choiceConditions = {};
    for (let sentence of sentences) {
      console.log(sentence);
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
      return {
        id: c.id,
        code: c.code,
        coder: c.coder,
        addedBy: c.addedBy,
        title: c?.title || "",
        question: c.question,
        approved: c.approved ? "✅" : "◻",
        rejected: c.rejected ? "❌" : "◻"
      };
    });

    return orderBy(mapped, ["coder", "code"], ["asc", "asc"]);
  }, [allExperimentCodes]);

  const unApprovedCodes = useMemo(() => {
    return allExperimentCodes.filter(c => {
      return c?.coder === fullname && !c.approved;
    });
  }, [allExperimentCodes]);

  useEffect(() => {
    const func = async () => {
      const feedbackCodesOrderDocs = await firebase.db.collection("feedbackCodeOrderV2").get();
      const orderData = feedbackCodesOrderDocs.docs[0].data();
      if (project && fullname && approvedCodes && (!orderData[fullname] || orderData[fullname].length <= 5)) {
        await axios.post("/createTemporaryFeedbacodeCollection", {
          fullname,
          project,
          approvedCodes
        });
      }
    };

    func();
  }, [retrieveNext, project]);

  useEffect(() => {
    const retriveNextResponse = async () => {
      setFromTheCell(false);
      let docID;
      const feedbackCodesOrderDocs = await firebase.db
        .collection("feedbackCodeOrderV2")
        .where("researcher", "==", fullname)
        .where("project", "==", project)
        .get();
      const orderData = feedbackCodesOrderDocs.docs.length ? feedbackCodesOrderDocs.docs[0].data() : {};
      if (orderData?.codeIds && orderData?.codeIds.length === 0) {
        setAllResponsesGraded(true);
      } else {
        setAllResponsesGraded(false);
      }
      docID = orderData.codeIds[0];
      if (docID) {
        const feedbackCodesDoc = await firebase.db.collection("feedbackCode").doc(docID).get();
        const feedbackData = feedbackCodesDoc.data();
        setFeedbackCode(feedbackData);

        setChosenCondition(feedbackData.choice);
        const userDoc = await firebase.db.collection("users").doc(feedbackData.fullname).get();
        const userData = userDoc.data();

        const firstPassageDoc = await firebase.db.collection("passages").doc(userData.pConditions[0].passage).get();

        const response = (feedbackData.explanation || "").split(".").filter(w => w.trim());
        setDocId(docID);
        setSentences(response);
        setChosenCondition(feedbackData.choice);
        const cOrders = ["1st: " + userData.pConditions[0].condition + " - " + firstPassageDoc.data().title];
        if (userData.pConditions.length > 1) {
          const secondPassageDoc = await firebase.db.collection("passages").doc(userData.pConditions[1].passage).get();
          cOrders.push("2nd: " + userData.pConditions[1].condition + " - " + secondPassageDoc.data().title);
        }
        setConditionsOrder(cOrders);

        //we check if the authenticated reserchers have aleardy casted his vote
        //if so we get all his recorded past choices
      }
      setSubmitting(false);
    };
    retriveNextResponse();
    return () => {
      return;
    };
  }, [retrieveNext, project]);

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
    sentences.forEach(sentenc => {
      selectedSentences[sentenc] = false;
    });
    selectedSentences[sentence] = true;
    setSelectedSentences(selectedSentences);
    setSelectedSentence(sentence);
  };
  const handleCodesSelected = value => () => {
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
      await axios.post("/handleSubmitFeebackCode", {
        fullname,
        docId,
        quotesSelectedForCodes: _quotesSelectedForCodes,
        choiceConditions,
        approvedCodes,
        project
      });
      setRetrieveNext(oldValue => oldValue + 1);
      setSentences("");
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
      let codesApp = [...allExperimentCodes];
      const appIdx = codesApp.findIndex(acti => acti.id === clickedCell.id);
      const isApproved = codesApp[appIdx][clickedCell.field] === "✅";

      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;
        const codesAppDoc = await firebase.db.collection("feedbackCodeBooks").doc(id).get();
        const codesAppData = codesAppDoc.data();
        let codeUpdate;
        if (!codesAppData.checked) {
          codeUpdate = {
            approved: !isApproved,
            checked: true
          };
        } else {
          codeUpdate = {
            approved: !isApproved,
            rejected: !codesAppData.rejected
          };
        }
        const codeRef = await firebase.db.collection("feedbackCodeBooks").doc(id);
        await codeRef.update(codeUpdate);

        const msg = !isApproved ? "Code approved" : "Code rejected";
        setSnackbarMessage(msg);
      }
    }
    if (clickedCell.field === "rejected") {
      let codesApp = [...allExperimentCodes];
      const appIdx = codesApp.findIndex(acti => acti.id === clickedCell.id);
      const isRejected = codesApp[appIdx][clickedCell.field] === "❌";

      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;

        const codesAppDoc = await firebase.db.collection("feedbackCodeBooks").doc(id).get();
        const codesAppData = codesAppDoc.data();
        let codeUpdate;
        if (!codesAppData.checked) {
          codeUpdate = {
            rejected: !isRejected,
            checked: true
          };
        } else {
          codeUpdate = {
            rejected: !isRejected,
            approved: !codesAppData.approved
          };
        }

        const codeRef = await firebase.db.collection("feedbackCodeBooks").doc(id);
        await codeRef.update(codeUpdate);

        const msg = !isRejected ? "Code rejected" : "Code approved";
        setSnackbarMessage(msg);
      }
    }
  };

  const handleDelete = async () => {
    try {
      const selectedCodeRef = await firebase.db.collection("feedbackCodeBooks").doc(selectedCode.id);
      await selectedCodeRef.delete();
      setSnackbarMessage("code successfully deleted!");
      setCode("");
      setSelectedCode({});
      handleCloseDeleteModal();
    } catch (err) {
      console.error(err);
      setSnackbarMessage("There is some error while deleting your code, please try after some time!");
    }
  };

  // function to edit selected codes from the list until
  // it gets approved by the admin
  // upon approval, the code will move from unapproved
  // to approved list.
  const handleEdit = async () => {
    const approvedCode = [...approvedCodes];
    const unApprovedCode = [...unApprovedCodes];

    // check if the code already exists in approvedCode or unapprovedCode
    const checkIfApprovedCodeExist = approvedCode.some(elem => elem.code === code);
    const checkIfUnApprovedCodeExist = unApprovedCode.some(elem => elem.code === code);
    if (checkIfApprovedCodeExist || checkIfUnApprovedCodeExist) {
      setSnackbarMessage("This code already exists, please try some other code");
      return;
    }

    if (unApprovedCode.includes(selectedCode)) {
      // update the document based on selected code
      const selectedCodeRef = firebase.db.collection("feedbackCodeBooks").doc(selectedCode.id);
      const codeUpdate = {
        code: code
      };
      selectedCodeRef.update(codeUpdate);
      setCode("");
      setSelectedCode({});
      handleCloseEditModal();
      setSnackbarMessage("Your code updated!");
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

        // check if the code already exists in approvedCode or unapprovedCode
        const codes = experimentCodes.filter(elem => elem.code === code);
        if (codes.length >= 2) {
          setSnackbarMessage("This code already exists 2 or more times, please try some other code");
          return;
        }

        // update the document based on selected code
        const feedbackCodeDocs = await firebase.db.collection("feedbackCode").get();
        const updatefeedbackCodeBooksDoc = await firebase.db
          .collection("feedbackCodeBooks")
          .where("code", "==", adminCodeData.code)
          .get();

        const tWriteOperations = [];

        for (let feedbackCodeDoc of updatefeedbackCodeBooksDoc.docs) {
          const codeData = feedbackCodeDoc.data();
          const codeUpdate = {
            ...codeData,
            code: code
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
              await t.update(operation.docRef, operation.data);
            }
          });
        }

        setSnackbarMessage(`Code updated !`);
        setCode("");
        setAdminCodeData({});
        handleCloseAdminEditModal();
      }
    } catch (err) {
      setSnackbarMessage("There is some error while deleting your code, please try after some time!");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleAdminAddNewCode = async () => {
    const experimentCodes = [...allExperimentCodes];
    const feedbackCodeBooksRef = firebase.db.collection("feedbackCodeBooks");

    if (feedbackCodeTitle === "Participant") {
      // iteration to add total number of questions for same code
      let questionArray = [1, 2];

      // check if the code already exists in approvedCode or unapprovedCode
      const checkIfItHasSameCode = experimentCodes.filter(elem => elem.code === code);
      if (checkIfItHasSameCode.length >= 4) {
        setSnackbarMessage("This code already exists 2 or more times, please try some other code");
        return;
      }
      if (checkIfItHasSameCode.length === 1) {
        //if it exists it will iterate only once
        questionArray = [1];
      }

      const getQuestionNo = index => {
        if (checkIfItHasSameCode.length === 1) {
          return checkIfItHasSameCode[0].question === 1 ? 2 : 1;
        }
        return index + 1;
      };
      try {
        questionArray.map(async (x, index) => {
          const docRef = await feedbackCodeBooksRef.add({
            project,
            approved: true,
            addedBy: "Researcher",
            code: code,
            coder: fullname,
            title: feedbackCodeTitle,
            question: getQuestionNo(index),
            createdAt: firebase.firestore.Timestamp.fromDate(new Date())
          });
          if (docRef.id) {
            const experimentCode = {
              id: docRef.id,
              code: code,
              addedBy: "Researcher",
              coder: fullname,
              title: feedbackCodeTitle,
              question: getQuestionNo(index),
              checked: "✅"
            };
            experimentCodes.push(experimentCode);
          }
          if (index + 1 === questionArray.length) {
            setCode("");
            setFeedbackCodeTitle("");
            setAdminCodeData({});
            handleCloseAdminAddModal();
            // setAllExperimentCodes(experimentCodes);
            const msg =
              checkIfItHasSameCode.length === 1
                ? `Code Added for Question ${getQuestionNo(index)}!`
                : `Code Add to both Questions!`;
            setSnackbarMessage(msg);
          }
        });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    } else {
      const docRef = await feedbackCodeBooksRef.add({
        project,
        approved: true,
        addedBy: "Researcher",
        code: code,
        coder: fullname,
        title: feedbackCodeTitle,
        createdAt: firebase.firestore.Timestamp.fromDate(new Date())
      });
      if (docRef.id) {
        const experimentCode = {
          id: docRef.id,
          code: code,
          addedBy: "Researcher",
          coder: fullname,
          title: feedbackCodeTitle,
          checked: "✅"
        };
        experimentCodes.push(experimentCode);
      }
      setCode("");
      setFeedbackCodeTitle("");
      setAdminCodeData({});
      handleCloseAdminAddModal();
      // setAllExperimentCodes(experimentCodes);
      const msg = `Code Add to both Questions!`;
      setSnackbarMessage(msg);
    }
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

      setSnackbarMessage(`Quote Saved successfully !`);
    } catch (error) {
      console.log(error);

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
    setFeedbackCode(feedbackData);
    const userDoc = await firebase.db.collection("users").doc(feedbackData.fullname).get();
    const userData = userDoc.data();
    const firstPassageDoc = await firebase.db.collection("passages").doc(userData.pConditions[0].passage).get();
    const response = (feedbackData.explanation || "").split(".").filter(w => w.trim());
    setDocId(docID);
    setSentences(response);
    setChosenCondition(feedbackData.choice);
    const cOrders = ["1st: " + userData.pConditions[0].condition + " - " + firstPassageDoc.data().title];
    if (userData.pConditions.length > 1) {
      const secondPassageDoc = await firebase.db.collection("passages").doc(userData.pConditions[1].passage).get();
      cOrders.push("2nd: " + userData.pConditions[1].condition + " - " + secondPassageDoc.data().title);
    }
    setConditionsOrder(cOrders);
    const myCodes = Object.keys(feedbackData.codersChoices[fullname]).sort();
    const newCodes = approvedCodes.filter(codeData => !myCodes.includes(codeData.code));
    setApprovedNewCodes(newCodes);
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

    let sentencesSelecting = {};
    for (let sentence in _quotesSelectedForCodes) {
      if (Object.keys(sentencesSelecting).length === 0) {
        sentencesSelecting[sentence.trim()] = true;
      } else {
        sentencesSelecting[sentence.trim()] = false;
      }
    }
    setSelectedSentences(sentencesSelecting);
    setSelectedSentence(sentences[0]);
    setSelectedSentence(Object.keys(_quotesSelectedForCodes)[0]);
    setQuotesSelectedForCodes(_quotesSelectedForCodes);
    setChoiceConditions(feedbackData.codersChoiceConditions[fullname]);
    setSubmitting(false);
  };
  if (!choiceConditions[selectedSentence?.trim()]) return null;
  return (
    <>
      {unApprovedCodes.length > 0 && (
        <div>
          <Alert severity="success" className="VoteActivityAlert">
            <strong>You've suggesed this codes ,you can update or delete the codes :</strong>
            <br />
            The admin is the only one who can Approve your code
            <List
              sx={{
                paddingBlock: 1,
                width: "auto"
              }}
            >
              {unApprovedCodes.map(codeData => (
                <ListItem key={codeData.id}>
                  <Box sx={{ display: "inline", mr: "19px" }}>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => {
                        setCode(codeData.code);
                        setSelectedCode(codeData);
                        handleOpenEditModal();
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => {
                        setSelectedCode(codeData);
                        handleOpenDeleteModal();
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: "inline" }}>
                    <strong>{codeData.code}</strong>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Alert>
        </div>
      )}
      {/* {approvedNewCodes.length > 0 && (
        <div>
          <Alert severity="error" className="VoteActivityAlert">
            You have submitted your vote(s) before for this response, but for the past peroid, new codes have been
            <br />
            added, please add your choice(s) for these codes and feel free to change your votes:
            <List>
              {approvedNewCodes.map(codeData => (
                <div key={codeData.id} selected={selected[codeData.code]}>
                  <strong>{codeData.code}</strong>
                </div>
              ))}
            </List>
          </Alert>
        </div>
      )} */}
      {sentences.length !== 0 ? (
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

          {recentParticipants.includes(feedbackCode?.fullname) ? (
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

          <Paper elevation={3} sx={{ width: "100%", ml: "5px" }}>
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
                <Sheet variant="outlined" sx={{ overflow: "auto" }}>
                  <List
                    sx={{
                      paddingBlock: 1,
                      width: 800,
                      height: 500
                    }}
                  >
                    {sentences.map((sentence, index) => (
                      <ListItem
                        key={index}
                        disablePadding
                        selected={selectedSentences[sentence]}
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
                        >
                          <ListItemIcon>
                            {quotesSelectedForCodes[sentence] && quotesSelectedForCodes[sentence].length !== 0 ? (
                              <Checkbox checked={true} />
                            ) : (
                              <></>
                            )}
                          </ListItemIcon>
                          <ListItemText id={sentence} primary={`${sentence}`} />
                        </ListItemButton>

                        <Button
                          mode="outlined"
                          disabled={!enableSaveQuote[sentences.indexOf(sentence)]}
                          onClick={saveQuote(sentence)}
                          variant="contained"
                          sx={{ mr: "5px" }}
                        >
                          <BookmarkIcon />
                          Save As A Quote
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Sheet>
              </Box>
              <Box>
                <h2 style={{ display: "flex", alignItems: "center" }}>The Codebook</h2>
                <Sheet variant="outlined" sx={{ overflow: "auto" }}>
                  <List
                    sx={{
                      paddingBlock: 1,
                      maxWidth: 500,
                      height: 500,
                      "--List-decorator-width": "48px",
                      "--List-item-paddingLeft": "1.5rem"
                    }}
                  >
                    {approvedCodes.map(codeData => (
                      <ListItem key={codeData.id} disablePadding>
                        <ListItemButton value={codeData.code} onClick={handleCodesSelected(codeData.code)}>
                          {quotesSelectedForCodes[selectedSentence] &&
                          quotesSelectedForCodes[selectedSentence].includes(codeData.code) ? (
                            <Checkbox checked={true} color="success" />
                          ) : (
                            <Checkbox checked={false} />
                          )}

                          <Box sx={{ display: "inline" }}>{codeData.code}</Box>
                        </ListItemButton>

                        {project === "H2K2" ? "H2" : "H1"}
                        {["K2" ,"L2"].includes(choiceConditions[selectedSentence][codeData.code])? (
                          <Switch
                            checked={true}
                            onChange={event => changeChoices(event, codeData.code)}
                            color="warning"
                          />
                        ) : (
                          <Switch
                            checked={false}
                            onChange={event => changeChoices(event, codeData.code)}
                            color="warning"
                          />
                        )}
                        {project === "H2K2" ? "K2" : "L2"}
                      </ListItem>
                    ))}
                  </List>
                </Sheet>

                <Alert severity="success" className="VoteActivityAlert" sx={{ ml: "0px" }}>
                  If the code you're looking for does not exist in the list above, add it below:
                  <br />
                </Alert>

                <TextareaAutosize
                  style={{ width: "80%", alignItems: "center" }}
                  minRows={7}
                  placeholder={"Add your code here."}
                  onChange={event => setNewCode(event.currentTarget.value)}
                  value={newCode}
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
          unfortunately there is no new responses for you to grade{" "}
        </Alert>
      ) : (
        <CircularProgress color="warning" sx={{ margin: "300px 600px 500px 580px" }} size="100px" />
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

      {email === "oneweb@umich.edu" && (
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
      {/* Edit Code Researcher Modal */}
      <Modal
        open={openEditModal}
        onClose={handleCloseEditModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...modalStyle,
            width: "500px",
            height: "250px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <Alert severity="success" className="VoteActivityAlert">
            {" "}
            Update your code below:
          </Alert>

          <Box>
            <TextareaAutosize
              style={{ width: "90%" }}
              minRows={5}
              value={code}
              placeholder={"Update your code here."}
              onChange={event => setCode(event.currentTarget.value)}
            />
            <Box sx={{ textAlign: "center" }}>
              <Button className="Button" variant="contained" onClick={handleEdit}>
                Update
              </Button>
              <Button
                variant="contained"
                className="Button Red"
                onClick={() => {
                  setCode("");
                  handleCloseEditModal();
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      {/* Delete Code Confirmation Modal for the authenticated res */}
      <Modal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Alert severity="error" className="VoteActivityAlert">
            Are you sure, you want to delete?
          </Alert>
          <br /> {selectedCode.code}
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              className="Button Red"
              onClick={() => {
                handleDelete();
              }}
            >
              Delete
            </Button>
            <Button
              className="Button"
              variant="contained"
              onClick={() => {
                setAdminCodeData({});
                handleCloseDeleteModal();
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
      {/* Edit Code Admin Modal */}
      <Modal
        open={openAdminEditModal}
        onClose={handleCloseAdminEditModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...modalStyle,
            width: "500px",
            height: "250px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <Typography variant="h6" margin-bottom="20px">
            Update the code below for {adminCodeData.coder}:
          </Typography>
          <Box>
            <TextareaAutosize
              style={{ width: "90%" }}
              minRows={5}
              value={code}
              placeholder={"Update the code here."}
              onChange={event => setCode(event.currentTarget.value)}
            />
            <Box sx={{ textAlign: "center" }}>
              <Button className="Button" variant="contained" disabled={submittingUpdate} onClick={handleAdminEdit}>
                Update
              </Button>
              <Button
                variant="contained"
                className="Button Red"
                onClick={() => {
                  setCode("");
                  handleCloseAdminEditModal();
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      {/* Add Code Admin Modal */}
      <Modal
        open={openAdminAddModal}
        onClose={handleCloseAdminAddModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...modalStyle,
            width: "500px",
            height: "350px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <Typography variant="h6">
            {feedbackCodeTitle === "Participant" ? "Your Code will be added for both questions" : "Add your Code below"}
          </Typography>
          <Box>
            <TextareaAutosize
              style={{ width: "90%", marginBottom: "10px" }}
              minRows={5}
              value={code}
              placeholder={"Add the code here."}
              onChange={event => setCode(event.currentTarget.value)}
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h6" sx={{ mr: "10px" }}>
                Add code for:
              </Typography>
              <Select
                native
                value={feedbackCodeTitle}
                input={<OutlinedInput label="Title" id="demo-dialog-native" />}
                onChange={event => setFeedbackCodeTitle(event.target.value || "")}
              >
                <option disabled value={""}>
                  Select Title
                </option>
                <option value={"Participant"}>Participant</option>
                <option value={"Researcher"}>Researcher</option>
              </Select>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Button
                disabled={!code || !feedbackCodeTitle}
                className="Button"
                variant="contained"
                onClick={handleAdminAddNewCode}
              >
                Add
              </Button>
              <Button
                className="Button Red"
                variant="contained"
                onClick={() => {
                  setCode("");
                  setFeedbackCodeTitle("");
                  handleCloseAdminAddModal();
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Delete Code Confirmation Modal for the Admin*/}
      <Modal
        open={openDeleteModalAdmin}
        onClose={handleCloseDeleteModalAdmin}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6" margin-bottom="20px">
            Are you sure, you want to delete?
            <br /> {adminCodeData.code}
          </Typography>
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              className="Button Red"
              disabled={submittingDelete}
              onClick={() => {
                handleAdminDelete();
              }}
            >
              Delete
            </Button>
            <Button
              className="Button"
              variant="contained"
              onClick={() => {
                setAdminCodeData({});
                handleCloseDeleteModalAdmin();
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
export default CodeFeedback;
