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



  const[record,setRecord] = useState({})


 
  

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
    setSentence(str.split("."))

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


const vote = async (coder, code, exp) => { 
  console.log("hello")

  await firebase.db.runTransaction(async (t) => {


    const codeRef = firebase.db.collection("feedbackCodes").where("code","==",code).where("coder","==",coder).where("explanation","==",exp).doc();
    
    const CodesDoc = await t.get(codeRef);
    const codesData = CodesDoc.data();

    const codesUpdates = { ...codesData}


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

    t.update(researcherRef,researcherUpdates)
    t.update(codeRef,codesUpdates)

    
    
  });
 }

const handleChange =(code) =>{
  console.log(code)
}


  return (
    <>
      <div>
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
                    <TableRow>
                      <TableCell align="left">
                        <Checkbox />
                      </TableCell>

                      <TableCell align="left">{row.code}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </div>

      <div>
        <container Width="500">
          <Typography variant="h8">
            {" "}
            If the code you're looking for does not exist in the list above, add
            it below :
          </Typography>

          <form noValidate autoComplete="off">
            <TextField onChange={codeChange} value={newCode}/>
            <Button style={{ margin: "5px" }} onClick={addCode}>
              Create
            </Button>

            <Button style={{ margin: "5px" }} onClick={nextExplanation}>
              Submit
            </Button>
          </form>
          <form sx={{ height: "50%" }}>
            

           
          </form>
        </container>
      </div>
    </>
  );
}

export default CodeFeedback
