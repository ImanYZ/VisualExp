import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";

import Alert from "@mui/material/Alert";

import { firebaseState, fullnameState } from "../../store/AuthAtoms";

import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";

const Withdraw = () => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);

  const [notLoggedIn, setNotLoggedIn] = useState(false);

  useEffect(() => {
    const withdrawUser = async () => {
      const userRef = db.collection("users").doc(fullname);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        await userRef.update({
          stoppedAppl: true,
          updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
        });
      }
    };
    if (firebase && fullname) {
      withdrawUser();
    } else {
      setNotLoggedIn(true);
    }
  }, [firebase, fullname]);

  return (
    <PagesNavbar>
      {notLoggedIn ? (
        <Alert severity="error">
          <Typography variant="h3" gutterBottom marked="center" align="center">
            Please log in and try again!
          </Typography>
        </Alert>
      ) : (
        <div>
          <Typography variant="h3" gutterBottom marked="center" align="center">
            You Withdrew Your 1Cademy Application!
          </Typography>
          <p>We will not send you any more reminders.</p>
          <p>
            If you'd like to continue your application at any point, you can
            email us at onecademy@umich.edu
          </p>
        </div>
      )}
    </PagesNavbar>
  );
};

export default Withdraw;
