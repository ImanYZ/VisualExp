import React, { useState, useEffect } from 'react'
import { useRecoilValue } from 'recoil'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Button from '@mui/material/Button'
import CircularProgress from "@mui/material/CircularProgress";


import { firebaseState, fullnameState } from '../../../store/AuthAtoms'
import SnackbarComp from "../../SnackbarComp";
import { projectState } from '../../../store/ProjectAtoms'

const  CodeFeedback = (props) => {
  
  const firebase = useRecoilValue(firebaseState)
  // The authenticated researcher fullname
  const fullname = useRecoilValue(fullnameState)
  const project = useRecoilValue(projectState)
  const [newCode, setNewCode] = useState('')
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [explanation, setExplanation] = useState("");
  const [codes, setCodes] = useState([]);
  const [feed, setFeed] = useState({})
  const [retrieveNext, setRetrieveNext] = useState(0);
  const [submitting, setSubmitting] = useState(true);
  const [creating, setCreating] = useState(false)
  const [codeSelect, setCodeSelect] = useState([]);
  const [quotesSelect, setQuotesSelect]=useState([]);
  const [count,setCount]=useState([]);

 

useEffect(() => { 
  const retrieveFeedbackcodes = async () => {

  let foundResponse = false;
  const feedbackCodesDocs =  await firebase.db.collection('feedbackCodes').
    where("project","==",project)
    .get();
  const aleardyVotedDocs = await firebase.db.collection('feedbackCodes')
    .where("researcher","==",fullname)
    .get(); 
  let exp =[]
  for(let Doc of aleardyVotedDocs.docs){
     let data = Doc.data()
     if(!exp.includes(data.explanation)){
      exp.push(data.explanation)
     }
    
    }
  setCount(exp)
  console.log(count)  
  for (let feedDoc of feedbackCodesDocs.docs) {
    const feedData = feedDoc.data();
    setFeed(feedData)
    if(exp.includes(feedData.explanation)){
     
    }else{
    
    //  console.log(feedData);
   
        const CodesDocs =  await firebase.db.collection('feedbackCodes')
        .where("explanation","==",feedData.explanation)
        .where("project","==",project)
        .get();

        var cods = [];
         for (let code of CodesDocs.docs){ 
              const codeData = code.data();

              cods.push(codeData);      
         }
         foundResponse = true;
         setCodes(cods)
         setExplanation(feedData.explanation);

     setTimeout(() => {
      setSubmitting(false);
    }, 1000);
     if(foundResponse){
       break;
     }
  }
}

} 
if(firebase){
retrieveFeedbackcodes();
}


  }, [firebase,retrieveNext])
 
const submit =() =>{
  console.log(codeSelect);
  console.log(quotesSelect);
  setSubmitting(true);
  voteCode();
  setRetrieveNext((oldValue) => oldValue + 1);
}

const codeChange =(event) => {
    setNewCode(event.currentTarget.value)
  }


const addCode = async () =>{
 
        setCreating(true)
        await firebase.db.runTransaction(async (t) => {
    
        const researcherRef = firebase.db.collection("researchers").doc(fullname);
        const researcherDoc = await t.get(researcherRef);
        const researcherData = researcherDoc.data();
          
    
        
        
    
        const researcherUpdates = {
          projects: {
            ...researcherData.projects,
            [project]: {
              ...researcherData.projects[project],
            },
          },
        };
        const codesRef = firebase.db.collection('feedbackCodeBooks').doc()
        const feedCodesRef = firebase.db.collection('feedbackCodes').doc()
        
        let codef =[];
        for(let code of codes){
            codef.push(code.code)
        }

        if (!codef.includes(newCode)&&(newCode !=="")){
          codesRef.set({
            code: newCode,
            coder: fullname,
            createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
        })
        feedCodesRef.set({
        coder : fullname ,
        code : newCode,
        choice : feed.choice? feed.choice:"",
        approved: feed.approved,
        project :project,
        fullname: feed.fullname,
        session: feed.session,
        expIdx: feed.expIdx,
        explanation:feed.explanation,
        quotes:feed.quotes,
        createdAt:firebase.firestore.Timestamp.fromDate(new Date()),
        })
        
        if (
            "codesGenerated" in
            researcherUpdates.projects[project]
          ) {
            researcherUpdates.projects[
              project
            ].codesGenerated += 1;
          } else {
            researcherUpdates.projects[
              project
            ].codesGenerated = 1;
          }
    
        }
        if ("codesNum" in researcherUpdates.projects[project]) {
            researcherUpdates.projects[project].codesNum += 1;
          } else {
            researcherUpdates.projects[project].codesNum = 1;
          }
        
    
         
          t.update(researcherRef,researcherUpdates)
          setSnackbarMessage("You successfully submitted your code!");
    
        }); 
        
       setCodes([...codes,{
        coder : fullname ,
        code : newCode,
        choice : feed.choice? feed.choice:"",
        approved: feed.approved,
        project :project,
        fullname: feed.fullname,
        session: feed.session,
        expIdx: feed.expIdx,
        explanation:feed.explanation,
        quotes:feed.quotes,
        createdAt:firebase.firestore.Timestamp.fromDate(new Date()),
        }]);
       setNewCode("");
       setTimeout(() => {
        setCreating(false);
      }, 1000);
        
}


const voteCode = async (event) =>{
  for(let code of codeSelect){
  let approved =false;
  let codesVote = codes.filter((ele)=>{ return ele.code === code;});

  if(codesVote.length<3){
    console.log("we are here")
    if(codesVote.length===2){
      approved=true;
      const researcherRef = firebase.db.collection("researchers").doc(codesVote[0].coder);
      const researcherDoc = await researcherRef.get();
      const researcherData = researcherDoc.data();
      const researcherUpdates = {
        projects: {
          ...researcherData.projects,
          [feed.project]: {
            ...researcherData.projects[codesVote[0].project],
          },
        },
      };
      if("codesPoints" in researcherUpdates){
        researcherUpdates.projects[project].codesPoints +=1;
      }
      else{
        researcherUpdates.projects[project].codesPoints = 1;
      }
      researcherRef.update(researcherUpdates);

    }
   
    const codeRef = firebase.db.collection('feedbackCodes');
    let codeUpdate={
      coder:codesVote[0].coder,
      code : code,
      choice:codesVote[0].choice,
      approved:approved,
      project:project,
      fullname:codesVote[0].fullname,
      researcher:fullname,
      session:codesVote[0].session,
      expIdx:codesVote[0].expIdx,
      explanation:codesVote[0].explanation,
      quotes:quotesSelect,
      createdAt:codesVote[0].createdAt,
    };
    console.log(codeUpdate)
    codeRef.add(codeUpdate);
   }  
 }  
}




const codeSelected = async(event) =>{
  if(event.target.checked){
    setCodeSelect([...codeSelect,event.target.value])

  }else{
    let array = codeSelect.filter((ele)=>{ 
      return ele !== event.target.value; 
  });
      setCodeSelect(array);
  }
         
}


const quotesSelected = async(event) =>{
  if(event.target.checked){
    setQuotesSelect([...quotesSelect,event.target.value])

  }else{
    let array = quotesSelect.filter((ele)=>{return ele !== event.target.value;});
    setCodeSelect(array);
  }
    
}


  return (
    <>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            height: "50px",
          }}
        ></div>
        <container>
          <Grid container spacing={2}>
            <Grid item md={6}>
              <Paper>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Your Votes on Explanation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {explanation.split(".").filter(e => e !== ' ').map((row) => (
                        <div>
                        <TableRow>
                          <TableCell align="left">
                            <input
                              onChange={quotesSelected}
                              type="checkbox"
                              value={row}
                            ></input>
                          </TableCell>
                          <TableCell>
                            <label for={row}>{row}</label>
                          </TableCell>
                        </TableRow>
                      </div>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item md={5}>
              <Paper>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                      <TableCell>Your Votes on codes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {codes.map((row) => (
                        <div>
                          <TableRow>
                            <TableCell align="left">
                              <input
                                onChange={codeSelected}
                                type="checkbox"
                                value={row.code}
                              ></input>
                            </TableCell>
                            <TableCell>
                              <label for={row.code}>{row.code}</label>
                            </TableCell>
                          </TableRow>
                        </div>
                      ))}
                    </TableBody>
                  </Table>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        height: "25px",
                      }}
                    ></div>
                    <div style={{ padding: "10px" }}>
                      <Typography variant="h8" margin-bottom="20px">
                        {" "}
                        If the code you're looking for does not exist in the
                        list above, add it below :
                      </Typography>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          height: "30px",
                        }}
                      ></div>
                      <div id="ActivityDescriptionContainer">
                        <TextareaAutosize 
                          id="ActivityDescriptionTextArea"
                          minRows={7}
                          onChange={codeChange}
                          placeholder={"Add your code here."}
                          value={newCode}
                        />
                      </div>
                      <div>
                        <Button
                          variant="contained"
                          style={{ margin: "5px" }}
                          onClick={addCode}
                          disabled={creating}
                        >{creating ? (
                          <CircularProgress color="warning" size="16px" />
                        ) :("Create")}
                        </Button>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          height: "50px",
                        }}
                      ></div>
                    </div>
                  </div>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </container>
      </div>
      <div style={{ position: "relative", left: "45%", top: "50px" }}>
        <Button
          variant="contained"
          style={{ margin: "10px" }}
          onClick={submit}
          color="success"
          size="large"
          disabled={submitting}
        >{submitting ? (
          <CircularProgress color="warning" size="16px" />
        ) :("Submit")}
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          height: "200px",
        }}
      ></div>
      <SnackbarComp
        newMessage={snackbarMessage}
        setNewMessage={setSnackbarMessage}
      />
    </>
  );
}
export default CodeFeedback;