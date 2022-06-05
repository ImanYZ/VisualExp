import React, { useState, useEffect } from 'react'
import { useRecoilValue, useRecoilState } from 'recoil'

import Checkbox from '@mui/material/Checkbox'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'


import { firebaseState, fullnameState } from '../../../store/AuthAtoms'
import SnackbarComp from "../../SnackbarComp";
import { projectState, feedbackcodeState } from '../../../store/ProjectAtoms'

const  CodeFeedback = (props) => {
  const firebase = useRecoilValue(firebaseState)
  // The authenticated researcher fullname
  const fullname = useRecoilValue(fullnameState)
  const project = useRecoilValue(projectState)

  const [feedBackCode, setFeedBackCode] = useRecoilState(feedbackcodeState)
  const [currentExps, setCurrentExps] = useState([])
  const [sentence,setSentence] = useState([])
  const [newCode, setNewCode] = useState('')
  const [codes,setCodes] = useState([])
  const [codeUpdate,setCodeUpdate] = useState([])
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [feed, setFeed] = useState({})




 
  

useEffect(() => {
    const firebaseRef = firebase.db.collection('feedbackCodes').where("project","==",project)
    firebaseRef.onSnapshot((snap) => {
      let fetched = snap.docs.map((doc) => {
        return {...doc.data() }
      })
     setFeedBackCode(fetched)

     nextExplanation();
     
    //  const array1 = feedBackCode;   
    //  const key0 = array1[0]
    //  setFeed(key0)
    //  var newArray= feedBackCode.filter((el) => { return el.explanation === key0.explanation });
    // console.log(newArray)
    // setCurrentExps(newArray)
    // setSentence(fetched[0].explanation.split("."))

    
    })
  }, [])
 

  

  const nextExplanation=()=>{

    const array1 = feedBackCode;
    const key0 = array1[0];
    setFeed(key0);
    const str = key0.explanation;
    var newArray= array1.filter((el) => { return el.explanation === key0.explanation });
    var remainingArr = array1.filter((el) => { return el.explanation !== key0.explanation });
    setFeedBackCode(remainingArr);
    setCurrentExps(newArray)
    
    setSentence(str.split(".").filter(e => e !== ' '))


}


const codeChange =(event) => {
    setNewCode(event.currentTarget.value)
  }




const addCode = async () => {
   
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

      firebase.db.collection('feedbackCodes').onSnapshot((snap) => {
        var fetched = snap.docs?.map((doc) => {
          return {...doc.data() }
        })
       
       setCodes(fetched)
      

      })
      
      var newA= codes.filter((el) => { return el.explanation === feed.explanation });
      var newArr =newA.filter((el)=>{return el.code === newCode })
    


    if (newArr.length===0){
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

    }); 
    
    
   setNewCode("")
    
  }




const vote = async (event) =>{
  const code = currentExps[event.target.id].code
  console.log(currentExps[event.target.id].code)
  const coder = currentExps[event.target.id].coder
  console.log(currentExps[event.target.id].coder)
  const exp = currentExps[event.target.id].explanation
  console.log(currentExps[event.target.id].explanation)
  

  await firebase.db.runTransaction(async (t) => {
  const codeRef = firebase.db.collection('feedbackCodes').where("project","==",project).where("code","==",code).where("coder","==",coder).where("explanation","==",exp)
  codeRef.onSnapshot((snap) => {
    let fetched = snap.docs.map((doc) => {
      return {...doc.data() }
    })
    setCodeUpdate(fetched) 
  })
 
  console.log(codeUpdate[0])
  console.log( ("codesVotes" in codeUpdate[0]))
  const researcherRef = firebase.db.collection("researchers").doc(coder);
    const researcherDoc = await t.get(researcherRef);
    const researcherData = researcherDoc.data();
    console.log(researcherData)

    
    const researcherUpdates = {
      projects: {
        ...researcherData.projects,
        [codeUpdate.project]: {
          ...researcherData.projects[codeUpdate.project],
        },
      },
    };
if(event.target.checked){
  if (
    "codesVotes" in
    codeUpdate[0]
  ) {
    console.log("i'm here")
    codeUpdate[0].codesVotes += 1;
    if(codeUpdate[0].codesVotes>=2){
      codeUpdate.approved = "true"
      if("codesPoints" in researcherUpdates){
        researcherUpdates.projects[project].codesPoints +=1;
      }
      else{
        researcherUpdates.projects[project].codesPoints = 1;
      }
    }


  } else {
    console.log("look over here")
    codeUpdate[0].codesVotes = 1;
  }
  setSnackbarMessage(
    "You successfully voted for someone else's code!"
  );
   
}else{

  researcherUpdates.projects[project].codesPoints -=1

}

    console.log(codeUpdate)
    
   
    t.update(researcherRef,researcherUpdates)
    t.set(codeRef,codeUpdate)

  }); 
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
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          spacing={2}
        >
          <Paper sx={{ width: "50%" }}>
            <TableContainer component={Paper} sx={{ height: 500 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Votes</TableCell>
                    <TableCell>Explanation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sentence.map((row) => (
                    <TableRow>
                      <TableCell align="left">
                        <Checkbox />
                      </TableCell>

                      <TableCell align="left">{row}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper sx={{ width: "50%" }}>
            <TableContainer component={Paper} sx={{ height: 500 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Codes</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentExps.map((row) => (
                    <div>
                      <TableRow>
                      <TableCell align="left">
                      <input onChange={vote}  type="checkbox" id={currentExps.indexOf(row)} value={row} ></input>
                      </TableCell>
                      <TableCell>
                      <label for = {row.code} >{row.code}</label>                            
                      </TableCell>
                      </TableRow>  
                    </div>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </div>

      <div>
        <div style ={{position:"relative" ,left:"700px",top:"50px"}}>
          <Typography variant="h8" margin-bottom = "20px">
            {" "}
            If the code you're looking for does not exist in the list above, add
            it below :
            
          </Typography>
          <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            height: "50px",
          }}
        ></div>
          <div>
          <TextField  style={{ width: "500px" }} onChange={codeChange} value={newCode} />
          <Button variant="contained"  style={{ margin: "5px" }} onClick={addCode}>
            Create
          </Button>
          </div>
        </div>
       
      </div>
        <div  style ={{position:"relative" ,left:"500px",top:"50px"}}>
         
            <Button  variant="contained" style={{ margin: "5px" }} onClick={nextExplanation}>
              Submit
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