import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Sheet from "@mui/joy/Sheet";
import { DataGrid } from "@mui/x-data-grid";
import GridCellToolTip from "../../GridCellToolTip";

import Typography from "@mui/material/Typography";

import Paper from "@mui/material/Paper";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import Box from "@mui/material/Box";

import { firebaseState, fullnameState, isAdminState } from "../../../store/AuthAtoms";
import { projectState } from "../../../store/ProjectAtoms";

const codesColumn = [
  {
    field: "code",
    headerName: "Code",
    width: 220,
    renderCell: cellValues => {
      return <GridCellToolTip isLink={false} cellValues={cellValues} />;
    }
  },
  {
    field: "checked",
    headerName: "Approved",
    width: 160,
    disableColumnMenu: true,
    renderCell: cellValues => {
      return (
        <GridCellToolTip isLink={false} actionCell={true} Tooltip="Click to check/uncheck!" cellValues={cellValues} />
      );
    }
  }
];

const CodeFeedback = props => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);
  console.log("fullname", fullname);
  const project = useRecoilValue(projectState);
  const [newCode, setNewCode] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [explanation, setExplanation] = useState("");
  const [codes, setCodes] = useState([]);
  const [feed, setFeed] = useState({});
  const [retrieveNext, setRetrieveNext] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [checked, setChecked] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [selected, setSelected] = useState({});
  const [quotesSelectedForCodes, setQuotesSelectedForCodes] = useState({});
  const [selecte, setSelecte] = useState(null);
  const [docId, setDocId] = useState("");
  const isAdmin = useRecoilValue(isAdminState);
  const [newCodes, setNewCodes] = useState([]);
  const [newexperimentCodes, setNewexperimentCodes] = useState([]);
  const [newCodesAdded, setNewCodesAdded]  = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (project) {
      const feedbackCodeBooksDocs = await firebase.db
        .collection("experimentCodes")
        .where("project", "==", project)
        .get();

      let experimentCodes = [];
      for (let Doc of feedbackCodeBooksDocs.docs) {
        let data = Doc.data();
        const newCode = {
          code: data.code,
          checked: data.approved ? "✅" : "◻",
          id: Doc.id
        };
        experimentCodes.push(newCode);
      }
      setNewexperimentCodes(experimentCodes);
    }
  }, [project]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    let approvedFeedbackCodeBooks = [];
    const feedbackCodeBooksDocs = await firebase.db
      .collection("feedbackCodeBooks")
      .where("project", "==", project)
      .get();

    let FeedbackCodeBooksCodes = [];
    console.log(feedbackCodeBooksDocs);
    for (let Doc of feedbackCodeBooksDocs.docs) {
      let data = Doc.data();
      const newCode = {
        code: data.code,
        checked: data.approved ? "✅" : "◻",
        id: Doc.id
      };
      FeedbackCodeBooksCodes.push(newCode);
      if (data.approved) {
        approvedFeedbackCodeBooks.push(data.code);
      }
    }
    console.log(approvedFeedbackCodeBooks.length);
    setCodes(approvedFeedbackCodeBooks);
    setNewCodes(FeedbackCodeBooksCodes);
    console.log(approvedFeedbackCodeBooks);
    let quotesSelectedForCode = { ...quotesSelectedForCodes };
    let codesSelecting = {};
    for (let code of approvedFeedbackCodeBooks) {
      quotesSelectedForCode[code] = [];
      codesSelecting[code] = false;
    }
    setQuotesSelectedForCodes(quotesSelectedForCode);
    setSelected(codesSelecting);
    console.log({ quotesSelectedForCode });
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
      if(lengthSentence >1){   
         response = feedbackData.explanation.split(".",lengthSentence-1);
      }else{
         response = feedbackData.explanation.split(".");
      }
      
      console.log(feedbackData.explanation);
      console.log("::::::::::::::::::::split response::::::::::::",feedbackData.explanation);
      setDocId(feedbackDoc.id);

    //we check if the authenticated reserchers have aleardy casted his vote 
    //if so we get all his recorded past choices
      if (feedbackData.coders.includes(fullname)) {
        const myCodes = Object.keys(feedbackData.codersChoices[fullname]);
        console.log(myCodes.length);
        console.log(codes.length);
        console.log(myCodes.length !== approvedCodes.length);
        if (myCodes.length !== approvedCodes.length) {
          let newCodes = [];
          for(let code of approvedCodes){
              if(!myCodes.includes(code)){
                newCodes.push(code);
              }
          }
          setNewCodesAdded(newCodes);
          setSentences(response);
          foundResponse = true;
          for (let code of myCodes) {
            quotesSelectedForCodes[code] = feedbackData.codersChoices[fullname][code];
          }
          for(let code of newCodes){
            quotesSelectedForCodes[code] = [];
          }
          setQuotesSelectedForCodes(quotesSelectedForCodes);
        }
    // if the authenticated researcher didn't vote on this  explanation yet 
    // we check if all the others coders who previously casted their vote that they checked 
    //the new code added ,so that way we would know if we can show this explanation or not 
      } else {
        setNewCodesAdded([]);
        const allowOtherResearchersToVote = true;
        for(let coder of feedbackData.coders){
          const myCodes = Object.keys(feedbackData.codersChoices[coder]);
          if(myCodes.length !== approvedCodes.length){
            allowOtherResearchersToVote = false;
          }
        }
        if(allowOtherResearchersToVote){
        console.log(feedbackDoc.id);
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

  // set new code.
  const handleCodeChange = event => setNewCode(event.currentTarget.value);

  // add new code to the database
  const handleAddNewCode = async () => {
    debugger;
    setCreating(true);

    const researcherRef = await firebase.db.collection("researchers").doc(fullname);
    const researcherGet = await researcherRef.get();
    const researcherData = await researcherGet.data();
    console.log({ researcherData });

    const researcherUpdates = {
      projects: {
        ...researcherData.projects,
        [project]: {
          ...researcherData.projects[project]
        }
      }
    };
    const codesRef = firebase.db.collection("feedbackCodeBooks").doc();
    if (!codes.includes(newCode) && newCode !== "") {
      codesRef.set({
        approved: false,
        project,
        code: newCode,
        coder: fullname,
        createdAt: firebase.firestore.Timestamp.fromDate(new Date())
      });

      if ("codesGenerated" in researcherUpdates.projects[project]) {
        researcherUpdates.projects[project].codesGenerated += 1;
      } else {
        researcherUpdates.projects[project].codesGenerated = 1;
      }
      setSnackbarMessage("You successfully submitted your code!");
      setCodes([...codes, newCode]);
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
    console.log(code);
    codes.forEach(thisCode => {
      selected[thisCode] = false;
    });
    selected[code] = true;
    console.log(selected);
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
    setChecked(newChecked);
    let quotesSelectedForCode = { ...quotesSelectedForCodes };
    quotesSelectedForCode[selecte] = newChecked;
    setQuotesSelectedForCodes(quotesSelectedForCode);
    console.log({ quotesSelectedForCodes });
  };

  // here we go through all the codes and check the ones
  // that the voter have chosen and append them to his name in the feedbackCode collection
  const handleSubmit = async () => {
    setSubmitting(true);
    console.log({ docId });
    const feedbackCodesDoc = await firebase.db.collection("feedbackCode").doc(docId).get();
    const feedbackCodeData = feedbackCodesDoc.data();
    let researcherVotes = {};
    let codesVotes = {};
    console.log({ quotesSelectedForCodes });
    codes.forEach(code => {
      researcherVotes[code] = quotesSelectedForCodes[code];
      if (quotesSelectedForCodes[code].length !== 0) {
        codesVotes[code] = [fullname];
      } else {
        codesVotes[code] = [];
      }
    });
    console.log({ coders: feedbackCodeData.coders });
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
    let recievePoints = [];
    let recieveNegativePoints = [];
    const keys = Object.keys(feedbackCodeData.codesVotes);
    console.log({ keys });
    console.log({ feedbackCodeData: feedbackCodeData.coders.length });
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
      console.log("recievePoints::::::::::::::::", recievePoints);
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
        researcherUpdates.projects[project].negativeCodingPoints += 0.5;
      } else {
        researcherUpdates.projects[project].negativeCodingPoints = 0.5;
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
        researcherUpdates.projects[project].positiveCodingPoints += 0.5;
      } else {
        researcherUpdates.projects[project].positiveCodingPoints = 0.5;
      }
      await researcherRef.update(researcherUpdates);
    }
    const feedbackCodesRef = await firebase.db.collection("feedbackCode").doc(docId);

    feedbackCodesRef.update(feedbackCodeUpdate);
    setRetrieveNext(oldValue => oldValue + 1);
    console.log(feedbackCodeUpdate);
  };

  const checkCodeAdmin = async clickedCell => {
    if (clickedCell.field === "checked") {
      let codesApp = [...newCodes];
      const appIdx = codesApp.findIndex(acti => acti.id === clickedCell.id);
      const isChecked = codesApp[appIdx][clickedCell.field] === "✅";

      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;

        codesApp[appIdx] = {
          ...codesApp[appIdx],
          checked: isChecked ? "◻" : "✅"
        };
        setNewCodes(codesApp);

        const codesAppDoc = await firebase.db.collection("feedbackCodeBooks").doc(id).get();

        const codesAppData = codesAppDoc.data();

        let codeUpdate = {
          ...codesAppData,
          approved: !isChecked
        };
        let feedbackCodeBookRef = await firebase.db.collection("feedbackCodeBooks").doc(id);
        await feedbackCodeBookRef.update(codeUpdate);
      }
    }
  };

  const checkCodeExperimentAdmin = async clickedCell => {
    if (clickedCell.field === "checked") {
      let codesApp = [...newexperimentCodes];
      const appIdx = codesApp.findIndex(acti => acti.id === clickedCell.id);
      const isChecked = codesApp[appIdx][clickedCell.field] === "✅";

      if (appIdx >= 0 && codesApp[appIdx][clickedCell.field] !== "O") {
        const id = clickedCell.id;

        codesApp[appIdx] = {
          ...codesApp[appIdx],
          checked: isChecked ? "◻" : "✅"
        };
        setNewexperimentCodes(codesApp);

        const codesAppDoc = await firebase.db.collection("experimentCodes").doc(id).get();

        const codesAppData = codesAppDoc.data();

        let codeUpdate = {
          ...codesAppData,
          approved: !isChecked
        };
        let feedbackCodeBookRef = await firebase.db.collection("experimentCodes").doc(id);
        await feedbackCodeBookRef.update(codeUpdate);
      }
    }
  };

  console.log("RETURN:::::", { quotesSelectedForCodes });
  return (
    <>
      <Typography variant="h6" margin-bottom="20px">
        For each different code,please choose which response(s) contains the code:
      </Typography>
      {(newCodesAdded.length !== 0)&&(
        <div>
           <Typography variant="h6" margin-bottom="20px">
           You have submited your Votes before for this response ,but for the past peroide new codes have been added ,
           please add your choices for these codes and fell free to change your votes:
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
           {newCodesAdded.map(code => (
             <ListItem key={code} disablePadding selected={selected[code]}>
               <ListItemButton
               >
                 <ListItemText id={`${code}`} primary={`${code}`} />
               </ListItemButton>
             </ListItem>
           ))}
         </List>
   
       </div>

      ) }

      <Paper elevation={3} sx={{ margin: "19px 5px 70px 19px", height: 900 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            
              width:"90%",
           
            justifyContent: "center",
            gap: 0
          }}
        >
          <Box>
            <Sheet variant="outlined" sx={{  overflow: "auto" }}>
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
                {codes.map(code => (
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
                {sentences.map(sentence => {
       

                  return (
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
                        <ListItemText id={sentence} primary={` ${sentence}`} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Sheet>
          </Box>
        </Box>
       <Box style ={{width:600, margin:"60px 50px 50px 50px"}}>
        <Box sx = {{padding:"10px 10px 20px 10px"}}>
       <Typography variant="h7" >
              If the code you're looking for does not exist in the list above, add it below :
              <br />
            </Typography>
            </Box>
            <TextareaAutosize
              style={{ width: "80%", alignItems: "center" }}
              minRows={7}
              placeholder={"Add your code here."}
              onChange={handleCodeChange}
              value={newCode}
            />
            <Box>
            <Button variant="contained" style={{ margin: "5px 5px 5px 5ox" }} onClick={handleAddNewCode} disabled={creating}>
              {creating ? <CircularProgress color="warning" size="16px" /> : "Create"}
            </Button>
            </Box>
            <Box sx = {{margin:"0px 10px 60px 10px"}}>
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
      {fullname === "Iman YeckehZaare" && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            "& > :not(style)": {
              m: 3,
              m: 0,
              width: 700,
              height: "100%"
            },
            height: "96%",
            m:"50px 10px 100px 50px"
          }}
        >
          <Paper>
            <Typography variant="h6" gutterBottom marked="center" align="center">
              {" "}
              Code added by researchers{" "}
            </Typography>
            <DataGrid
              rows={newCodes}
              columns={codesColumn}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoPageSize
              autoHeight
              hideFooterSelectedRowCount
              loading={false}
              onCellClick={checkCodeAdmin}
            />
          </Paper>
          <Paper>
            <Typography variant="h6" gutterBottom marked="center" align="center">
              Code Added by Participants in the Experiment{" "}
            </Typography>
            <DataGrid
              rows={newexperimentCodes}
              columns={codesColumn}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoPageSize
              autoHeight
              hideFooterSelectedRowCount
              loading={false}
              onCellClick={checkCodeExperimentAdmin}
            />
          </Paper>
        </Box>
      )}
    </>
  );
};
export default CodeFeedback;
