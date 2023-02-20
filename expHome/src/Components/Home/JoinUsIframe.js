import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import {
  firebaseState,
  emailState,
  fullnameState,
  resumeUrlState,
  transcriptUrlState,
  applicationsSubmittedState
} from "../../store/AuthAtoms";

import { hasScheduledState, completedExperimentState } from "../../store/ExperimentAtoms";

const JoinUsIframe = props => {
  const [hasScheduled, setHasScheduled] = useRecoilState(hasScheduledState);
  const [completedExperiment, setCompletedExperiment] = useRecoilState(completedExperimentState);
  const [applicationsSubmitted, setApplicationsSubmitted] = useRecoilState(applicationsSubmittedState);
  const [resumeUrl, setResumeUrl] = useRecoilState(resumeUrlState);
  const [transcriptUrl, setTranscriptUrl] = useRecoilState(transcriptUrlState);
  const [applicationProcess, setApplicationProcess] = useState({});
  const [needsUpdate, setNeedsUpdate] = useState(true);
  const [uploadError, setUploadError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fullname, setFullname] = useRecoilState(fullnameState);
  const [email, setEmail] = useRecoilState(emailState);

  const firebase = useRecoilValue(firebaseState);

  const uploadFile = async ({ fil, mimeTypes, maxSize, storageFolder, fullname, nameFeild }) => {
    try {
      if (!mimeTypes.includes(fil.type)) {
        setUploadError("We only accept a file with PDF format. Please upload another file.");
      } else if (fil.size > maxSize * 1024 * 1024) {
        setUploadError("We only accept file sizes less than 10MB. Please upload another file.");
      } else {
        setIsUploading(true);
        const filesFolder = storageFolder;
        const fileNameSplit = fil.name.split(".");
        const fileExtension = fileNameSplit[fileNameSplit.length - 1];
        let fileName = fullname + "/" + new Date().toGMTString() + "." + fileExtension;
        const storageRef = firebase.storage.ref(filesFolder + fileName);
        const task = storageRef.put(fil);
        task.on(
          "state_changed",
          function progress(snapshot) {
            // setPercentUploaded(Math.ceil((100 * snapshot.bytesTransferred) / snapshot.totalBytes));
          },
          function error(err) {
            console.error("Upload Error: ", err);
            setIsUploading(false);
            setUploadError(
              "There is an error with uploading your file. Please upload it again! If the problem persists, please try another file."
            );
          },
          async function complete() {
            const generatedUrl = await task.snapshot.ref.getDownloadURL();

            if (fullname) {
              const userRef = firebase.db.collection("users").doc(fullname);
              const userDoc = await userRef.get();
              if (userDoc.exists) {
                await userRef.update({
                  [nameFeild]: generatedUrl,
                  updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
                });
              }
              if (nameFeild === "Resume") {
                setResumeUrl(generatedUrl);
              } else if (nameFeild === "Transcript") {
                setTranscriptUrl(generatedUrl);
              }
            }
            setUploadError(false);
            // setPercentUploaded(100);
          }
        );
      }
    } catch (err) {
      console.error("Upload Error: ", err);
      setIsUploading(false);
      setUploadError("Upload your " + nameFeild + "!");
    }
  };
  useEffect(() => {
    if (!email) return;
    window.parent.postMessage(
      {
        email,
        completedExperiment,
        applicationsSubmitted,
        hasScheduled,
        resumeUrl,
        transcriptUrl,
        fullname,
        applicationProcess,
        uploadError
      },
      "http://1cademy.com/"
    );

    window.parent.postMessage(
      {
        email,
        completedExperiment,
        applicationsSubmitted,
        hasScheduled,
        resumeUrl,
        transcriptUrl,
        fullname,
        applicationProcess,
        uploadError
      },
      "http://localhost:3000/"
    );
  }, [
    email,
    completedExperiment,
    applicationsSubmitted,
    hasScheduled,
    resumeUrl,
    transcriptUrl,
    fullname,
    applicationProcess,
    needsUpdate,
    uploadError
  ]);

  useEffect(() => {
    const parentResponse = async event => {
      if (!(event.origin === "http://localhost:3000") && !(event.origin === "http://1cademy.com/")) return;
      if (event?.data) {
        if (event.data.function === "uploadButton") {
          const { fil, storageFolder, nameFeild } = event.data;
          await uploadFile({
            fil,
            mimeTypes: "application/pdf",
            maxSize: 10,
            storageFolder,
            fullname,
            nameFeild
          });
        } else if (event.data.function === "explanation") {
          const { explanation, communityId } = event.data;
          const applRef = firebase.db.collection("applications").doc(`${fullname}_${communityId}`);
          const applDoc = await applRef.get();
          if (applDoc.exists) {
            const appData = applDoc.data();
            await applRef.update({
              explanation,
              updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
            });
            setApplicationProcess({
              ...appData,
              explanation,
              updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
            });
          } else {
            await applRef.set({
              fullname,
              communiId: communityId,
              explanation,
              createdAt: firebase.firestore.Timestamp.fromDate(new Date())
            });
            setApplicationProcess({
              fullname,
              communiId: communityId,
              explanation,
              createdAt: firebase.firestore.Timestamp.fromDate(new Date())
            });
          }
        } else if (event.data.function === "applications") {
          const { communityId } = event.data;
          const applRef = firebase.db.collection("applications").doc(`${fullname}_${communityId}`);
          const applDoc = await applRef.get();
          if (applDoc.exists) {
            const applData = applDoc.data();
            setApplicationProcess(applData);
          } else {
            setApplicationProcess({});
          }
        } else if (event.data.function === "courseraUrl") {
          const { communityId, courseraUrl } = event.data;
          const applRef = firebase.db.collection("applications").doc(`${fullname}_${communityId}`);
          const applDoc = await applRef.get();
          if (applDoc.exists()) {
            await applRef.update({
              courseraUrl,
              updatedAt: firebase.firestore.Timestamp.fromDate(new Date())
            });
          } else {
            await applRef.set({
              fullname,
              communiId: props.community.id,
              courseraUrl,
              createdAt: firebase.firestore.Timestamp.fromDate(new Date())
            });
          }
        } else if (event.data.function === "portfolioUrl") {
          const { communityId, portfolioUrl } = event.data;
          const applRef = firebase.db.collection("applications").doc(`${fullname}_${communityId}`);
          const applDoc = await applRef.get();
          if (applDoc.exists()) {
            await applRef.update({
              portfolioUrl,
              updatedAt: firebase.firestore.fromDate(new Date())
            });
          } else {
            await applRef.set({
              fullname,
              email,
              communiId: props.community.id,
              portfolioUrl,
              createdAt: firebase.firestore.fromDate(new Date())
            });
          }
        }
        setNeedsUpdate(true);
      }
    };
    window.addEventListener("message", parentResponse);
    return () => {
      window.removeEventListener("message", parentResponse);
    };
  }, [firebase, fullname]);
  return <div></div>;
};

export default JoinUsIframe;
