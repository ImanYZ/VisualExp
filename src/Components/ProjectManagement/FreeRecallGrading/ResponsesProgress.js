import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState } from "../../../store/AuthAtoms";
import Box from "@mui/material/Box";

const ResponsesProgress = () => {
  const firebase = useRecoilValue(firebaseState);
  const [progress, setProgress] = useState({});
  useEffect(() => {
    const loadProgres = async () => {
      const responsesProgressDocs = await firebase.db.collection("responsesProgress").orderBy("createdAt", "desc").get();
      const progressData = responsesProgressDocs.docs[0].data();
      console.log({ progressData });
      delete progressData.createdAt;
      delete progressData["no satisfied phrases"];

      setProgress(
        Object.fromEntries(
          Object.entries(progressData).sort((a, b) => {
            const percentageA = parseInt(a[0]);
            const percentageB = parseInt(b[0]);
            return percentageA - percentageB;
          })
        )
      );
    };

    if (firebase) {
      loadProgres();
    }
  }, [firebase]);

  return (
    <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Box>
        {Object.keys(progress).map(p => (
          <Box key={p} sx={{ mt: "9px" }}>
            {p}: {progress[p]}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
export default ResponsesProgress;
