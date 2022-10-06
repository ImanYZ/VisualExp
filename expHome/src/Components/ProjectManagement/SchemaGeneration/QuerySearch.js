import React, { useEffect, useState } from "react";
import { firebaseState, fullnameState, emailState } from "../../../store/AuthAtoms";
import { useRecoilValue } from "recoil";

function QuerySearch() {
  const firebase = useRecoilValue(firebaseState);
  const [recallResponses, setRecallResponses] = useState([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    const recallGradesDoc = await  firebase.db.collection("recallGrades").get();
    const recallTexts = [];
    for(let recallDoc of recallGradesDoc.docs){
       const recallData = recallDoc.data();
       recallTexts.push(recallData.response);
    }
    setRecallResponses(recallTexts);
    return () => {};
  }, [firebase]);

console.log(recallResponses);
  const search = () => { 

 }

  return <div>QuerySearch</div>;
}

export default QuerySearch;
