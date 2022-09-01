import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { DataGrid } from "@mui/x-data-grid";
import GridCellToolTip from "../../GridCellToolTip";

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

import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import orderBy from "lodash.orderby";
import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";
import SnackbarComp from "../../SnackbarComp";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

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
  const [approvedCodes, setApprovedCodes] = useState([]);
  const [retrieveNext, setRetrieveNext] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sentences, setSentences] = useState([]);
  const [selected, setSelected] = useState({});
  const [quotesSelectedForCodes, setQuotesSelectedForCodes] = useState({});
  const [selecte, setSelecte] = useState(null);
  const [docId, setDocId] = useState("");
  const [codeBooksChanges, setCodeBooksChanges] = useState([]);
  const [codeBooksLoaded, setCodeBooksLoaded] = useState(false);
  const [loadNewCodes, setLoadNewCodes] = useState(false);
  // const isAdmin = useRecoilValue(isAdminState);
  const [selectedCode, setSelectedCode] = useState({});
  const [allExperimentCodes, setAllExperimentCodes] = useState([]);
  const [approvedNewCodes, setApprovedNewCodes] = useState([]);
  const [unApprovedNewCodes, setUnApprovedNewCodes] = useState([]);
  const [code, setCode] = useState("");
  const [chosenCondition, setChosenCondition] = useState("");
  const [feedbackCodeTitle, setFeedbackCodeTitle] = useState("");
  const [adminCodeData, setAdminCodeData] = useState({});
  // modal options
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDeleteModalAdmin, setOpenDeleteModalAdmin] = useState(false);

  const [openAdminEditModal, setOpenEditAdminModal] = useState(false);
  const [openAdminAddModal, setOpenAddAdminModal] = useState(false);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (firebase) {
      const CodeBooksQuery = firebase.db.collection("feedbackCodeBooks");

      const passagesSnapshot = CodeBooksQuery.onSnapshot(snapshot => {
        const docChanges = snapshot.docChanges();
        setCodeBooksChanges(oldPassagessChanges => {
          return [...oldPassagessChanges, ...docChanges];
        });
        setCodeBooksLoaded(true);
      });
      return () => {
        setCodeBooksChanges([]);
        passagesSnapshot();
      };
    }
  }, [firebase, loadNewCodes, retrieveNext]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (codeBooksLoaded) {
      const allCodes = [...allExperimentCodes];
      const tempPassagesChanges = [...codeBooksChanges];
      setCodeBooksChanges([]);
      const approvedFeedbackCodeBooks = [...approvedCodes];
      const unApprovedCodes = [...unApprovedNewCodes];
      for (let change of tempPassagesChanges) {
        const data = change.doc.data();
        const id = change.doc.id;
        if (change.type === "modified") {
          const findCode = allCodes.find(code => code.id === id);
          allCodes[allCodes.indexOf(findCode)] = {
            id: change.doc.id,
            code: data.code,
            coder: data.coder,
            addedBy: data.addedBy,
            title: data && data.title ? data.title : "",
            question: data.question,
            approved: data.approved ? "✅" : "◻",
            rejected: data.rejected ? "❌" : "◻"
          };
          if (data.approved) {
            approvedFeedbackCodeBooks[approvedFeedbackCodeBooks.indexOf(findCode)] = data;
          } else {
            if (data.coder === fullname) {
              const findCodeUnapproved = unApprovedCodes.find(codeData => codeData.id === change.doc.id);
              unApprovedCodes[unApprovedCodes.indexOf(findCodeUnapproved)] = {
                ...unApprovedCodes[unApprovedCodes.indexOf(findCodeUnapproved)],
                code: data.code
              };
            }
          }
        } else if (change.type === "added") {
          const newCode = {
            id: change.doc.id,
            code: data.code,
            coder: data.coder,
            addedBy: data.addedBy,
            title: data && data.title ? data.title : "",
            question: data.question,
            approved: data.approved ? "✅" : "◻",
            rejected: data.rejected ? "❌" : "◻"
          };

          if (data.approved) {
            if (!approvedFeedbackCodeBooks.some(dataCode => dataCode.code === data.code)) {
              approvedFeedbackCodeBooks.push({ id: change.doc.id, ...data });
              if (unApprovedCodes.some(code => code.id === change.doc.id)) {
                unApprovedCodes.splice(unApprovedCodes.indexOf({ id: change.doc.id, ...data }), 1);
              }
            }
          } else {
            if (data.coder === fullname && !unApprovedCodes.some(code => code.id === change.doc.id)) {
              unApprovedCodes.push({ id: change.doc.id, ...data });
              if (approvedFeedbackCodeBooks.some(code => code.id === change.doc.id)) {
                approvedFeedbackCodeBooks.splice(approvedFeedbackCodeBooks.indexOf({ id: change.doc.id, ...data }), 1);
              }
            }
          }

          const findCode = allCodes.find(code => code.id === id);
          if (!allCodes.includes(findCode)) {
            allCodes.push(newCode);
          }
        } else if (change.type === "removed") {
          const findCode = allCodes.find(code => code.id === id);
          if (allCodes.includes(findCode)) {
            allCodes.splice(allCodes.indexOf(findCode), 1);
          }
          if (approvedFeedbackCodeBooks.some(code => code.id === change.doc.id)) {
            approvedFeedbackCodeBooks.splice(approvedFeedbackCodeBooks.indexOf({ id: change.doc.id, ...data }), 1);
          }
          if (unApprovedCodes.some(code => code.id === change.doc.id)) {
            unApprovedCodes.splice(unApprovedCodes.indexOf({ id: change.doc.id, ...data }), 1);
          }
        }
      }
      setApprovedCodes(approvedFeedbackCodeBooks);
      setUnApprovedNewCodes(unApprovedCodes);
      const sortedAllCodes = orderBy(allCodes, ["coder", "code"], ["asc", "asc"]);

      setAllExperimentCodes(sortedAllCodes);

      let quotesSelectedForCode = { ...quotesSelectedForCodes };
      let codesSelecting = {};
      for (let codeData of approvedFeedbackCodeBooks) {
        quotesSelectedForCode[codeData.code] = [];
        codesSelecting[codeData.code] = false;
      }
      setQuotesSelectedForCodes(quotesSelectedForCode);
      setSelected(codesSelecting);
      setCodeBooksLoaded(false);
    }
  }, [codeBooksLoaded, retrieveNext]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    let foundResponse = false;
    const quotesSelectedForCode = {};
    for (let codeData of approvedCodes) {
      quotesSelectedForCode[codeData.code] = [];
    }
    setQuotesSelectedForCodes(quotesSelectedForCode);

    const feedbackCodesDocs = await firebase.db.collection("feedbackCode").where("approved", "==", false).get();
    const feedbackCodeBooksDocs = await firebase.db.collection("feedbackCodeBooks").where("approved", "==", true).get();
    const newSet = new Set();
    for (let feedbackCodeBooksDoc of feedbackCodeBooksDocs.docs) {
      const data = feedbackCodeBooksDoc.data();
      if (!newSet.has(data.code)) {
        newSet.add(data.code);
      }
    }

    for (let feedbackDoc of feedbackCodesDocs.docs) {
      const feedbackData = feedbackDoc.data();
      if ("choice" in feedbackData) {
        setChosenCondition(feedbackData.choice);
      }
      const lengthSentence = feedbackData.explanation.split(".").length;
      let response;
      if (lengthSentence > 1) {
        response = feedbackData.explanation.split(".", lengthSentence - 1);
      } else {
        response = feedbackData.explanation.split(".");
      }

      //we check if the authenticated reserchers have aleardy casted his vote
      //if so we get all his recorded past choices
      if (feedbackData.coders.includes(fullname)) {
        const myCodes = Object.keys(feedbackData.codersChoices[fullname]);

        if (myCodes.length !== newSet.size) {
          const newCodes = approvedCodes.filter(codeData => !myCodes.includes(codeData.code));
          setApprovedNewCodes(newCodes);
          setDocId(feedbackDoc.id);
          setSentences(response);
          foundResponse = true;
          for (let code of myCodes) {
            quotesSelectedForCodes[code] = feedbackData.codersChoices[fullname][code];
          }
          for (let code of newCodes) {
            quotesSelectedForCodes[code] = [];
          }
          setQuotesSelectedForCodes(quotesSelectedForCodes);
        }
        // if the authenticated researcher didn't vote on this  explanation yet
        // we check if all the others coders who previously casted their vote that they checked
        //the new code added ,so that way we would know if we can show this explanation or not
      } else {
        setApprovedNewCodes([]);
        let allowOtherResearchersToVote = true;
        for (let coder of feedbackData.coders) {
          const myCodes = Object.keys(feedbackData.codersChoices[coder]);
          if (myCodes.length !== approvedCodes.length) {
            allowOtherResearchersToVote = false;
          }
        }
        if (allowOtherResearchersToVote) {
          setDocId(feedbackDoc.id);
          setSentences(response);
          foundResponse = true;
        }
      }

      setSubmitting(false);

      if (foundResponse) {
        break;
      }
    }
  }, [firebase, retrieveNext, project, codeBooksLoaded]);

  // add new code to the database
  const handleAddNewCode = async () => {
    setCreating(true);

    const researcherRef = await firebase.db.collection("researchers").doc(fullname);
    const researcherGet = await researcherRef.get();
    const researcherData = await researcherGet.data();

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

  const handleSelectedCode = async code => {
    approvedCodes.forEach(thisCodeData => {
      selected[thisCodeData.code] = false;
    });
    selected[code] = true;
    setSelected(selected);
    setSelecte(code);
  };

  const handleQuotesSelected = value => () => {
    const currentIndex = quotesSelectedForCodes[selecte].indexOf(value);
    const newChecked = quotesSelectedForCodes[selecte];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    let quotesSelectedForCode = { ...quotesSelectedForCodes };
    quotesSelectedForCode[selecte] = newChecked;
    setQuotesSelectedForCodes(quotesSelectedForCode);
  };

  // here we go through all the codes and check the ones
  // that the voter have chosen and append them to his name in the feedbackCode collection
  const handleSubmit = async () => {
    try {
      await firebase.db.runTransaction(async t => {
        setSubmitting(true);
        let recievePoints = [];
        let recieveNegativePoints = [];
        const feedbackCodesDoc = await firebase.db.collection("feedbackCode").doc(docId).get();
        const feedbackCodeData = feedbackCodesDoc.data();
        let researcherVotes = quotesSelectedForCodes;
        let codesVotes = {};
        approvedCodes.forEach(codeData => {
          // researcherVotes[codeData.code] = quotesSelectedForCodes[codeData.code];
          if (quotesSelectedForCodes[codeData.code].length !== 0 ) {
            if(feedbackCodeData.codesVotes[codeData.code]){
              const voters = feedbackCodeData.codesVotes[codeData.code];
              voters.push(fullname);
              codesVotes[codeData.code] = voters;
            }else{
              codesVotes[codeData.code] = [fullname];
            }
          }
        });
        let feedbackCodeUpdate = {
          codersChoices: {
            ...feedbackCodeData.codersChoices,
            [fullname]: researcherVotes
          },
          coders: feedbackCodeData.coders.includes(fullname)
            ? feedbackCodeData.coders
            : [...feedbackCodeData.coders, fullname],
          codesVotes,
          updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
        };
        const keys = Object.keys(feedbackCodeData.codesVotes);
        if (feedbackCodeData.coders.length === 3) {
          for (let key of keys) {
            if (feedbackCodeData.codesVotes[key].length >= 3) {
              for (let researcher of feedbackCodeData.codesVotes[key]) {
                recievePoints.push(researcher);
              }
            } else {
              for (let researcher of feedbackCodeData.codesVotes[key]) {
                recieveNegativePoints.push(researcher);
              }
            }
          }
        }

        for (let res of recieveNegativePoints) {
          const researcherRef = await firebase.db.collection("researchers").doc(res);
          const researcherData = researcherRef.get().data();

          const researcherUpdates = {
            projects: {
              ...researcherData.projects,
              [project]: {
                ...researcherData.projects[project]
              }
            }
          };
          if ("negativeCodingPoints" in researcherUpdates.projects[project]) {
            researcherUpdates.projects[project].negativeCodingPoints += 0.25;
          } else {
            researcherUpdates.projects[project].negativeCodingPoints = 0.25;
          }
          t.update(researcherRef, researcherUpdates);
        }

        for (let res of recievePoints) {
          const researcherRef = await firebase.db.collection("researchers").doc(res);
          const researcherData = researcherRef.get().data();

          const researcherUpdates = {
            projects: {
              [project]: {
                ...researcherData.projects[project]
              }
            }
          };
          if ("positiveCodingPoints" in researcherUpdates.projects[project]) {
            researcherUpdates.projects[project].positiveCodingPoints += 0.25;
          } else {
            researcherUpdates.projects[project].positiveCodingPoints = 0.25;
          }
          t.update(researcherRef, researcherUpdates);
        }
        const feedbackCodesRef = await firebase.db.collection("feedbackCode").doc(docId);

        t.update(feedbackCodesRef, feedbackCodeUpdate);
        setRetrieveNext(oldValue => oldValue + 1);
        setSnackbarMessage("Your evaluation was submitted successfully.");
        setSubmitting(false);
      });
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

  const handleAdminDelete = async () => {
    try {
      const selectedCodeRef = await firebase.db.collection("feedbackCodeBooks").doc(adminCodeData.id);
      await selectedCodeRef.delete();
      setSnackbarMessage("code successfully deleted!");
      setCode("");
      setAdminCodeData({});
      handleCloseDeleteModalAdmin();
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
    const unApprovedCode = [...unApprovedNewCodes];

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

  const handleAdminEdit = async () => {
    if (adminCodeData?.code && adminCodeData?.title) {
      const experimentCodes = [...allExperimentCodes];

      // check if the code already exists in approvedCode or unapprovedCode
      const codes = experimentCodes.filter(elem => elem.code === code);
      if (codes.length >= 2) {
        setSnackbarMessage("This code already exists 2 or more times, please try some other code");
        return;
      }

      const index = experimentCodes.findIndex(elem => elem.id === adminCodeData.id);
      if (index >= 0) {
        // update the document based on selected code
        firebase.db
          .collection("feedbackCodeBooks")
          .where("code", "==", adminCodeData.code)
          .where("project", "==", project)
          .where("coder", "==", adminCodeData.coder)
          .get()
          .then(async doc => {
            const [codeDoc] = doc.docs;
            const codeData = codeDoc.data();
            const codeUpdate = {
              ...codeData,
              code: code
            };
            codeDoc.ref.update(codeUpdate);
            const updatedExperimentCode = {
              ...adminCodeData,
              code: code
            };
            experimentCodes[index] = updatedExperimentCode;
            setSnackbarMessage(`Code updated for ${updatedExperimentCode.coder}!`);
            setCode("");
            setAdminCodeData({});
            // setAllExperimentCodes(experimentCodes);
            handleCloseAdminEditModal();
          })
          .catch(err => {
            console.error(err);
            setSnackbarMessage("There is some error while updating your code, please try after some time!");
          });
      }
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
        await questionArray.map(async (x, index) => {
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
    setLoadNewCodes(true);
  };

  return (
    <>
      {unApprovedNewCodes.length > 0 && (
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
              {unApprovedNewCodes.map(codeData => (
                <ListItem key={codeData.id} disablePadding>
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
      {approvedNewCodes.length > 0 && (
        <div>
          <Alert severity="error" className="VoteActivityAlert">
            You have submitted your vote(s) before for this response, but for the past peroid, new codes have been
            <br />
            added, please add your choice(s) for these codes and feel free to change your votes:
            <List>
              {approvedNewCodes.map(codeData => (
                <div key={codeData.id} disablePadding selected={selected[codeData.code]}>
                  <strong>{codeData.code}</strong>
                </div>
              ))}
            </List>
          </Alert>
        </div>
      )}
      <Alert severity="warning">
        <h2>The participant chose {chosenCondition}.</h2>
        <ol>
          <li>
            Read the participant's qualitative response that we've divided into sentences and listed in the right box
            below.
          </li>
          <li>Click and read every single code from the codebook listed in the left box below.</li>
          <li>
            If you see any sentence in the right box that indicates the clicked code in the left box, check-mark that
            sentence in the right box.
          </li>
          <li>
            For every code, if you check any of the sentences, it also check-marks the code indicating that the code was
            mentioned by the participant due to the sentence that you checked.
          </li>
          <li>Select all the sentences that apply to the code you have selected.</li>
          <li>
            After going through all the codes, if you found an important point in the participant's feedback that is not
            mentioned in any of the codes in the codebook, then you can manually add a new concise code that summarizes
            the important point in the box on the bottom left. Clicking the add button will add this new code to the
            codebook.
          </li>
        </ol>
      </Alert>
      <Paper elevation={3} sx={{ margin: "19px 5px 70px 19px", width: "1500px" }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 0
          }}
        >
          <Box>
            <Sheet variant="outlined" sx={{ overflow: "auto" }}>
              <h2>The Codebook</h2>
              <List
                sx={{
                  paddingBlock: 1,
                  maxWidth: 500,
                  height: 500,
                  "--List-decorator-width": "48px",
                  "--List-item-paddingLeft": "1.5rem",
                  "--List-item-paddingRight": "1rem"
                }}
              >
                {approvedCodes.map(codeData => (
                  <ListItem key={codeData.id} disablePadding selected={selected[codeData.code]}>
                    <ListItemButton
                      value={codeData.code}
                      onClick={() => {
                        handleSelectedCode(codeData.code);
                      }}
                    >
                      {quotesSelectedForCodes[codeData.code] && quotesSelectedForCodes[codeData.code].length !== 0 ? (
                        <Checkbox checked={true} color="success" />
                      ) : (
                        <Checkbox checked={false} />
                      )}

                      <ListItemText primary={`${codeData.code}`} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Sheet>

            <Alert severity="success" className="VoteActivityAlert">
              If the code you're looking for does not exist in the list above, add it below :
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
            <Sheet variant="outlined">
              <h2>Participant's response in sentences</h2>
              <List
                sx={{
                  paddingBlock: 1,
                  width: 700,
                  height: 500,
                  "--List-decorator-width": "48px",
                  "--List-item-paddingLeft": "1.5rem",
                  "--List-item-paddingRight": "1rem"
                }}
              >
                {sentences.map((sentence, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton role={undefined} onClick={handleQuotesSelected(sentence)} dense>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selecte ? quotesSelectedForCodes[selecte].indexOf(sentence) !== -1 : false}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText id={sentence} primary={`${sentence}`} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Sheet>
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

      {email === "oneweb@umich.edu" && (
        <Box sx={{ mb: "50px" }}>
          <Paper>
            <Button className="Button" variant="contained" onClick={handleOpenAdminAddModal}>
              Add New Code
            </Button>
            <DataGrid
              rows={allExperimentCodes}
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
              <Button className="Button" variant="contained" onClick={handleAdminEdit}>
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
