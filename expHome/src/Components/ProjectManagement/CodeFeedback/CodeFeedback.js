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
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import Typography from "@mui/material/Typography";
import IconButton from '@mui/material/IconButton';

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Modal from '@mui/material/Modal';

import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";
import SnackbarComp from "../../SnackbarComp";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
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
  // const isAdmin = useRecoilValue(isAdminState);
  const [selectedCode, setSelectedCode] = useState("");
  const [allExperimentCodes, setAllExperimentsCodes] = useState([]);
  const [approvedNewCodes, setApprovedNewCodes] = useState([]);
  const [unApprovedNewCodes, setUnApprovedNewCodes] = useState([]);
  const [updateCode, setUpdateCode] = useState("");
  const [adminCodeData, setAdminCodeData] = useState({});
  // modal options
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
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
      field: "checked",
      headerName: "Approved/UnApproved",
      renderCell: cellValues => {
        return (
          <GridCellToolTip isLink={false} actionCell={true} cellValues={cellValues} />
        );
      }
    },
    {
      field: "coder",
      headerName: "Coder",
      renderCell: cellValues => {
        return (
          <GridCellToolTip isLink={false} cellValues={cellValues} />
        );
      }
    },
    {
      field: "question",
      headerName: "Question",
      renderCell: cellValues => {
        return (
          <GridCellToolTip isLink={false} cellValues={cellValues} />
        );
      }
    },
    {
      field: "title",
      headerName: "Title",
      renderCell: cellValues => {
        return (
          <GridCellToolTip isLink={false} cellValues={cellValues} />
        );
      }
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: cellValues => {
        return (
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={() => {
              setUpdateCode(cellValues.row.code);
              setAdminCodeData(cellValues.row);
              handleOpenAdminEditModal();
            }}
          >
            <EditIcon />
          </IconButton>
        );
      }
    }
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (project) {
      let allCodes = [];
      let approvedFeedbackCodeBooks = [];
      const experimentCodesDocs = await firebase.db
        .collection("experimentCodes")
        .where("project", "==", project)
        .get();
      const feedbackCodeBooksDocs = await firebase.db
        .collection("feedbackCodeBooks")
        .where("project", "==", project)
        .get();


      for (let Doc of experimentCodesDocs.docs) {
        let data = Doc.data();
        const newCode = {
          id: Doc.id,
          code: data.code,
          coder: data.coder,
          title: "Participant",
          question: data.question,
          checked: data.approved ? "???" : "???",
        };
        allCodes.push(newCode);
      }

      for (let Doc of feedbackCodeBooksDocs.docs) {
        let data = Doc.data();
        const newCode = {
          id: Doc.id,
          code: data.code,
          coder: data.coder,
          title: "Researcher",
          question: data.question,
          checked: data.approved ? "???" : "???",
        };
        allCodes.push(newCode);
        if (data.approved) {
          approvedFeedbackCodeBooks.push(data.code);
        }
      }
      setAllExperimentsCodes(allCodes);
      setApprovedCodes(approvedFeedbackCodeBooks);

      let quotesSelectedForCode = { ...quotesSelectedForCodes };
      let codesSelecting = {};
      for (let code of approvedFeedbackCodeBooks) {
        quotesSelectedForCode[code] = [];
        codesSelecting[code] = false;
      }
      setQuotesSelectedForCodes(quotesSelectedForCode);
      setSelected(codesSelecting);

    }
  }, [project]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    let foundResponse = false;
    const feedbackCodesDocs = await firebase.db
      .collection("feedbackCode")
      .where("approved", "==", false)
      .where("project", "==", project)
      .get();
    const feedbackCodeBooksDocs = await firebase.db
      .collection("feedbackCodeBooks")
      .where("approved", "==", true)
      .where("project", "==", project)
      .get();
    let approvedCodes = [];
    for (let codeBook of feedbackCodeBooksDocs.docs) {
      approvedCodes.push(codeBook.data().code);
    }

    for (let feedbackDoc of feedbackCodesDocs.docs) {
      const feedbackData = feedbackDoc.data();
      const lengthSentence = feedbackData.explanation.split(".").length;
      let response;
      if (lengthSentence > 1) {
        response = feedbackData.explanation.split(".", lengthSentence - 1);
      } else {
        response = feedbackData.explanation.split(".");
      }
      setDocId(feedbackDoc.id);
      //we check if the authenticated reserchers have aleardy casted his vote 
      //if so we get all his recorded past choices
      if (feedbackData.coders.includes(fullname)) {
        const myCodes = Object.keys(feedbackData.codersChoices[fullname]);
        if (myCodes.length !== approvedCodes.length) {
          const newCodes = approvedCodes.filter(code => !myCodes.includes(code));
          setApprovedNewCodes(newCodes);
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
          setSentences(response);
          foundResponse = true;
        }
      }

      setSubmitting(false);

      if (foundResponse) {
        break;
      }
    }
  }, [firebase, retrieveNext, project]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    // setUnApprovedNewCodes([]);
    const feedbackCodeBooksDocs = await firebase.db
      .collection("feedbackCodeBooks")
      .where("approved", "==", false)
      .where("project", "==", project)
      .where("coder", "==", fullname)
      .get();
    const unApprovedData = feedbackCodeBooksDocs.docs.map(doc => doc.data().code);
    setUnApprovedNewCodes(unApprovedData);
  }, [project, firebase, fullname]);

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
    if (!approvedCodes.includes(newCode) && newCode !== "") {
      codesRef.set({
        project,
        approved: false,
        code: newCode,
        coder: fullname,
        title: "Researcher",
        createdAt: firebase.firestore.Timestamp.fromDate(new Date())
      });

      if ("codesGenerated" in researcherUpdates.projects[project]) {
        researcherUpdates.projects[project].codesGenerated += 1;
      } else {
        researcherUpdates.projects[project].codesGenerated = 1;
      }
      setSnackbarMessage("You successfully submitted your code!");
      setUnApprovedNewCodes([...unApprovedNewCodes, newCode]);
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
    approvedCodes.forEach(thisCode => {
      selected[thisCode] = false;
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
      setSubmitting(true);
      let recievePoints = [];
      let recieveNegativePoints = [];
      const feedbackCodesDoc = await firebase.db.collection("feedbackCode").doc(docId).get();
      const feedbackCodeData = feedbackCodesDoc.data();
      let researcherVotes = {};
      let codesVotes = {};
      approvedCodes.forEach(code => {
        researcherVotes[code] = quotesSelectedForCodes[code];
        if (quotesSelectedForCodes[code].length !== 0) {
          codesVotes[code] = [fullname];
        } else {
          codesVotes[code] = [];
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
        await researcherRef.update(researcherUpdates);
      }

      for (let res of recievePoints) {
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
        if ("positiveCodingPoints" in researcherUpdates.projects[project]) {
          researcherUpdates.projects[project].positiveCodingPoints += 0.25;
        } else {
          researcherUpdates.projects[project].positiveCodingPoints = 0.25;
        }
        await researcherRef.update(researcherUpdates);
      }
      const feedbackCodesRef = await firebase.db.collection("feedbackCode").doc(docId);
      feedbackCodesRef.update(feedbackCodeUpdate);
      setRetrieveNext(oldValue => oldValue + 1);
      setSnackbarMessage("Your evaluation was submitted successfully.")
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      console.error({ err });
      setSnackbarMessage("Your evaluation is NOT submitted! Please try again. If the issue persists, contact Iman!");
    }
  };

  const handleCellClick = async clickedCell => {
    if (clickedCell.field === "checked") {
      let collection;
      if (clickedCell.row.title === "Participant") {
        collection = "experimentCodes";
      } else {
        collection = "feedbackCodeBooks";
      }
      let codesApp = [...allExperimentCodes];
      const appIdx = codesApp.findIndex(acti => acti.id === clickedCell.id);
      const isChecked = codesApp[appIdx][clickedCell.field] === "???";

      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;

        const codesAppDoc = await firebase.db.collection(collection).doc(id).get();
        const codesAppData = codesAppDoc.data();

        let codeUpdate = {
          ...codesAppData,
          approved: !isChecked
        };
        let collectionRef = await firebase.db.collection(collection).doc(id);
        await collectionRef.update(codeUpdate);

        codesApp[appIdx] = {
          ...codesApp[appIdx],
          checked: isChecked ? "???" : "???"
        };
        setAllExperimentsCodes(codesApp);
      }
    }
  };

  const handleDelete = async () => {
    const unApprovedCode = [...unApprovedNewCodes];
    await firebase.db
      .collection("feedbackCodeBooks")
      .where("code", "==", selectedCode)
      .where("project", "==", project)
      .where("coder", "==", fullname)
      .get()
      .then(async (doc) => {
        const [codeDoc] = doc.docs;
        await codeDoc.ref.delete()
        const updatedUnApprovedCode = unApprovedCode.filter(elem => elem !== selectedCode);
        setSnackbarMessage("code successfully deleted!");
        setUpdateCode("");
        setSelectedCode("")
        setUnApprovedNewCodes(updatedUnApprovedCode);
        handleCloseDeleteModal();
      })
      .catch(err => {
        console.error(err);
        setSnackbarMessage("There is some error while deleting your code, please try after some time!");
      });
  }

  // function to edit selected codes from the list until 
  // it gets approved by the admin
  // upon approval, the code will move from unapproved
  // to approved list.
  const handleEdit = async () => {
    const approvedCode = [...approvedCodes];
    const unApprovedCode = [...unApprovedNewCodes];

    // check if the code already exists in approvedCode or unapprovedCode
    const checkIfApprovedCodeExist = approvedCode.some(elem => elem === updateCode);
    const checkIfUnApprovedCodeExist = unApprovedCode.some(elem => elem === updateCode);
    if (checkIfApprovedCodeExist || checkIfUnApprovedCodeExist) {
      setSnackbarMessage("This code already exists, please try some other code");
      return;
    }

    const index = unApprovedCode.findIndex(elem => elem === selectedCode);
    if (index >= 0) {
      // update the document based on selected code
      firebase.db
        .collection("feedbackCodeBooks")
        .where("code", "==", selectedCode)
        .where("project", "==", project)
        .where("coder", "==", fullname)
        .get()
        .then(async (doc) => {
          const [codeDoc] = doc.docs;
          const codeData = codeDoc.data();
          const codeUpdate = {
            ...codeData,
            code: updateCode,
          };
          codeDoc.ref.update(codeUpdate);
          unApprovedCode[index] = updateCode;
          setUpdateCode("");
          setSelectedCode("");
          setUnApprovedNewCodes(unApprovedCode);
          handleCloseEditModal();
          setSnackbarMessage("Your code updated!");
        })
        .catch(err => {
          console.error(err);
          setSnackbarMessage("There is some error while updating your code, please try after some time!");
        });
    }
  }

  const handleAdminEdit = async () => {
    if (adminCodeData?.code && adminCodeData?.title) {
      let collection;
      if (adminCodeData.title === "Participant") {
        collection = "experimentCodes";
      } else {
        collection = "feedbackCodeBooks";
      }
      const experimentCodes = [...allExperimentCodes];

      // check if the code already exists in approvedCode or unapprovedCode
      const checkIfCodeExist = experimentCodes.some(elem => elem.code === updateCode);
      if (checkIfCodeExist) {
        setSnackbarMessage("This code already exists, please try some other code");
        return;
      }

      const index = experimentCodes.findIndex(elem => elem.code === adminCodeData.code);
      if (index >= 0) {
        // update the document based on selected code
        firebase.db
          .collection(collection)
          .where("code", "==", adminCodeData.code)
          .where("project", "==", project)
          .where("coder", "==", adminCodeData.coder)
          .get()
          .then(async (doc) => {
            const [codeDoc] = doc.docs;
            const codeData = codeDoc.data();
            const codeUpdate = {
              ...codeData,
              code: updateCode,
            };
            codeDoc.ref.update(codeUpdate);
            const updatedExperimentCode = {
              ...adminCodeData,
              code: updateCode
            }
            experimentCodes[index] = updatedExperimentCode;
            setSnackbarMessage(`Code updated for ${updatedExperimentCode.coder}!`);
            setUpdateCode("");
            setAdminCodeData({});
            setAllExperimentsCodes(experimentCodes);
            handleCloseAdminEditModal();
          })
          .catch(err => {
            console.error(err);
            setSnackbarMessage("There is some error while updating your code, please try after some time!");
          });
      }
    }
  }

  const handleAdminAddNewCode = async () => {
    const experimentCodes = [...allExperimentCodes];
    // check if the code already exists in approvedCode or unapprovedCode
    const checkIfCodeExist = experimentCodes.some(elem => elem.code === updateCode);
    if (checkIfCodeExist) {
      setSnackbarMessage("This code already exists, please try some other code");
      return;
    }

    const feedbackCodeBooksRed = firebase.db.collection("feedbackCodeBooks");
    const questionArray = [1, 2];
    questionArray.map(async (x, index) => {
      feedbackCodeBooksRed.add({
        approved: true,
        code: updateCode,
        coder: fullname,
        title: "Researcher",
        question: (index + 1),
        createdAt: firebase.firestore.Timestamp.fromDate(new Date())
      }).then((docRef) => {
        const experimentCode = {
          id: docRef.id,
          code: updateCode,
          coder: fullname,
          title: "Researcher",
          question: (index + 1),
          checked: "???"
        }
        experimentCodes.push(experimentCode);
        setAllExperimentsCodes(experimentCodes);
        if (index + 1 === questionArray.length) {
          setUpdateCode("");
          setAdminCodeData({});
          handleCloseAdminAddModal();
          setSnackbarMessage(`Code Add to both Questions!`);
        }
      })
        .catch((error) => {
          console.error("Error adding document: ", error);
        })
    });
  }

  return (
    <>
      {(unApprovedNewCodes.length > 0) && (
        <div>
          <Typography variant="h6" margin-bottom="20px">
            You can update your submitted code until it gets approved:
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <List
              sx={{
                paddingBlock: 1,
                width: "40%",
                height: "250px",
                overflow: "scroll",
                border: "1px #000 solid",
                "--List-decorator-width": "48px",
                "--List-item-paddingLeft": "1.5rem",
                "--List-item-paddingRight": "1rem"
              }}
            >
              {unApprovedNewCodes.map((code, idx) => (
                <ListItem
                  key={code}
                  disablePadding
                  selected={selected[code]}
                  secondaryAction={
                    <>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => {
                          setUpdateCode(code);
                          setSelectedCode(code);
                          handleOpenEditModal(code);
                        }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => {
                          setSelectedCode(code);
                          handleOpenDeleteModal(code);
                        }}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }>
                  <ListItemButton>
                    <ListItemText sx={{ width: "95%" }} multiline="true" id={idx} primary={code} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </div>
      )}
      {(approvedNewCodes.length > 0) && (
        <div>
          <Typography variant="h6" margin-bottom="20px">
            You have submitted your vote(s) before for this response, but for the past peroid, new codes have been added,
            please add your choice(s) for these codes and feel free to change your votes:
          </Typography>
          <List
            sx={{
              paddingBlock: 1,
              maxWidth: 500,
              "--List-decorator-width": "48px",
              "--List-item-paddingLeft": "1.5rem",
              "--List-item-paddingRight": "1rem"
            }}
          >
            {approvedNewCodes.map(code => (
              <ListItem key={code} disablePadding selected={selected[code]}>
                <ListItemButton
                >
                  <ListItemText id={`${code}`} primary={`${code}`} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </div>
      )}
      <Typography variant="h6" margin-bottom="20px">
        For each different code, please choose which response(s) contains the code:
      </Typography>
      <Paper elevation={3} sx={{ margin: "19px 5px 70px 19px" }}>
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
                {approvedCodes.map(code => (
                  <ListItem key={code} disablePadding selected={selected[code]}>
                    <ListItemButton
                      value={code}
                      onClick={() => {
                        handleSelectedCode(code);
                      }}
                    >
                      <ListItemText id={`${code}`} primary={`${code}`} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Sheet>
          </Box>
          <Box>
            <Sheet variant="outlined" >
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
                {sentences.map(sentence => (
                  <ListItem key={sentence} disablePadding>
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
        </Box>
        <Box style={{ width: 600, margin: "60px 50px 50px 50px" }}>
          <Box sx={{ padding: "10px 10px 20px 10px" }}>
            <Typography variant="h7" >
              If the code you're looking for does not exist in the list above, add it below :
              <br />
            </Typography>
          </Box>
          <TextareaAutosize
            style={{ width: "80%", alignItems: "center" }}
            minRows={7}
            placeholder={"Add your code here."}
            onChange={(event) => setNewCode(event.currentTarget.value)}
            value={newCode}
          />
          <Box>
            <Button variant="contained" style={{ margin: "5px 5px 5px 5ox" }} onClick={handleAddNewCode} disabled={(!newCode || newCode === "") && !creating}>
              {creating ? <CircularProgress color="warning" size="16px" /> : "Create"}
            </Button>
          </Box>
          <Box sx={{ margin: "0px 10px 60px 10px" }}>
            <Button
              variant="contained"
              style={{ margin: "19px 500px 10px 580px" }}
              onClick={handleSubmit}
              color="success"
              size="large"
              disabled={submitting}
            >
              {submitting ? <CircularProgress color="warning" size="16px" /> : "Submit"}
            </Button>
          </Box>
        </Box>
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
        <Box sx={{
          ...modalStyle,
          width: '500px',
          height: '250px',
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          <Typography variant="h6" margin-bottom="20px">
            Update your code below:
          </Typography>
          <Box>
            <TextareaAutosize
              style={{ width: '90%' }}
              minRows={5}
              value={updateCode}
              placeholder={"Update your code here."}
              onChange={(event) => setUpdateCode(event.currentTarget.value)}
            />
            <Box sx={{ textAlign: "center" }}>
              <Button className="Button" variant="contained" onClick={handleEdit}>
                Update
              </Button>
              <Button className="Button Red" variant="contained" onClick={handleCloseEditModal}>
                Cancel
              </Button>
            </Box>
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
        <Box sx={{
          ...modalStyle,
          width: '500px',
          height: '250px',
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          <Typography variant="h6" margin-bottom="20px">
            Update the code below for {adminCodeData.coder}:
          </Typography>
          <Box>
            <TextareaAutosize
              style={{ width: '90%' }}
              minRows={5}
              value={updateCode}
              placeholder={"Update the code here."}
              onChange={(event) => setUpdateCode(event.currentTarget.value)}
            />
            <Box sx={{ textAlign: "center" }}>
              <Button className="Button" variant="contained" onClick={handleAdminEdit}>
                Update
              </Button>
              <Button className="Button Red" variant="contained" onClick={handleCloseAdminEditModal}>
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
        <Box sx={{
          ...modalStyle,
          width: '500px',
          height: '250px',
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          <Typography variant="h6" margin-bottom="20px">
            Your Code will be added for both questions
          </Typography>
          <Box>
            <TextareaAutosize
              style={{ width: '90%' }}
              minRows={5}
              value={updateCode}
              placeholder={"Update the code here."}
              onChange={(event) => setUpdateCode(event.currentTarget.value)}
            />
            <Box sx={{ textAlign: "center" }}>
              <Button disabled={!updateCode} className="Button" variant="contained" onClick={handleAdminAddNewCode}>
                Add
              </Button>
              <Button className="Button Red" variant="contained" onClick={handleCloseAdminAddModal}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      {/* Delete Code Confirmation Modal */}
      <Modal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6" margin-bottom="20px">
            Are you sure, you want to delete?
            <br /> {selectedCode}
          </Typography>
          <Box sx={{ textAlign: "center" }}>
            <Button className="Button Red" variant="contained" onClick={handleDelete}>
              Delete
            </Button>
            <Button className="Button" variant="contained" onClick={handleCloseDeleteModal}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
export default CodeFeedback;
