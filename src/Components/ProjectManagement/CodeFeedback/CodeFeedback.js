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
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

import { firebaseState, fullnameState } from '../../../store/AuthAtoms'

import { projectState, feedbackcodeState } from '../../../store/ProjectAtoms'

const CodeFeedback = (props) => {
  const firebase = useRecoilValue(firebaseState)
  // The authenticated researcher fullname
  const fullname = useRecoilValue(fullnameState)
  const project = useRecoilValue(projectState)

  const [feedBackCode, setFeedBackCode] = useRecoilState(feedbackcodeState)
  const [currentExps, setCurrentExps] = useState([])
  const [sentence,setSentence] = useState([])
  const [newCode, setNewCode] = useState('')
  const [codes,setCodes] = useState([])
  

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


const vote = async (event) => { 
  console.log("hello")
  const code = currentExps[event.target.id].code
  console.log(currentExps[event.target.id].code)
  const coder = currentExps[event.target.id].coder
  console.log(currentExps[event.target.id].coder)
  const exp = currentExps[event.target.id].explanation
  console.log(currentExps[event.target.id].explanation)
  await firebase.db.runTransaction(async (t) => {


    const Ref = firebase.db.collection("feedbackCodes").doc()

    


    console.log(Ref)
    const CodesDoc = await t.get(Ref);
    const codesData = CodesDoc.data();

    const codesUpdates = { ...codesData}
    console.log(CodesDoc)
    console.log(codesData)

    const researcherRef = firebase.db.collection("researchers").doc(coder);
    const researcherDoc = await t.get(researcherRef);
    const researcherData = researcherDoc.data();
      

    
    const researcherUpdates = {
      projects: {
        ...researcherData.projects,
        [codesUpdates.project]: {
          ...researcherData.projects[codesUpdates.project],
        },
      },
    };


   
if(event.target.checked){
  if (
    "codesVotes" in
    codesUpdates
  ) {
    codesUpdates.codesVotes += 1;
    if(codesUpdates.codesVotes>=2){
      codesUpdates.approved = "true"
      if("codesPoints" in researcherUpdates){
        researcherUpdates.projects[project].codesPoints +=1;
      }
      else{
        researcherUpdates.projects[project].codesPoints = 1;
      }
    }


  } else {
    codesUpdates.codesVotes = 1;
  }

   
}else{

  researcherUpdates.projects[project].codesPoints -=1

}

    
    
   
    t.update(researcherRef,researcherUpdates)
    t.update(Ref,codesUpdates)

    
    
  });
 }

const handlechange = (event) =>{
     console.log(currentExps[event.target.id].coder)
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
                    <TableCell>Votes</TableCell>
                    <TableCell>Codes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentExps.map((row) => (
                    <div>
                      <TableCell align="left">
                      <input onChange={vote}  type="checkbox" id={currentExps.indexOf(row)} value={row} ></input>
                      <label for = {row.code} >{row.code}</label>                            
                        </TableCell>
                    </div>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </div>

      <div>
        <div style ={{position:"relative" ,left:"800px",top:"50px"}}>
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
     
    </>
  );
}

export default CodeFeedback
