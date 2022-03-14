import React, { useState } from "react";
import { useRecoilValue } from "recoil";

import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import LoadingButton from "@mui/lab/LoadingButton";

import UploadIcon from "@mui/icons-material/Upload";

import { firebaseState, fullnameState } from "../../../../store/AuthAtoms";

import PDFView from "./PDFView";

const UploadButton = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const fullname = useRecoilValue(fullnameState);

  const [isUploading, setIsUploading] = useState(false);
  const [percentUploaded, setPercentUploaded] = useState(0);
  const [uploadError, setUploadError] = useState(false);

  const handleFileChange = (event) => {
    try {
      event.preventDefault();
      const fil = event.target.files[0];
      if (!props.mimeTypes.includes(fil.type)) {
        setUploadError(props.typeErrorMessage);
      } else if (fil.size > props.maxSize * 1024 * 1024) {
        setUploadError(props.sizeErrorMessage);
      } else {
        setIsUploading(true);
        const rootURL =
          "https://storage.googleapis.com/" +
          props.storageBucket +
          ".appspot.com/";
        const filesFolder = props.storageFolder;
        const fileNameSplit = fil.name.split(".");
        const fileExtension = fileNameSplit[fileNameSplit.length - 1];
        let fileName =
          fullname + "/" + new Date().toGMTString() + "." + fileExtension;
        const storageRef = firebase.storage.ref(filesFolder + fileName);
        const task = storageRef.put(fil);
        task.on(
          "state_changed",
          function progress(snapshot) {
            setPercentUploaded(
              Math.ceil((100 * snapshot.bytesTransferred) / snapshot.totalBytes)
            );
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
            props.setFileUrl(props.name, generatedUrl);
            setUploadError(false);
            setIsUploading(false);
            setPercentUploaded(100);
          }
        );
      }
    } catch (err) {
      console.error("Upload Error: ", err);
      setIsUploading(false);
      setUploadError("Upload your " + props.name + "!");
    }
  };

  return (
    <>
      <label htmlFor={props.name + "File"}>
        <input
          onChange={handleFileChange}
          accept={props.mimeTypes.join(", ")}
          id={props.name + "File"}
          type="file"
          style={{ display: "none" }}
        />
        <LoadingButton
          loading={isUploading}
          loadingPosition="start"
          startIcon={<UploadIcon />}
          variant="outlined"
          component="span"
          style={{
            color: isUploading ? "gray" : "white",
            border: "none",
          }}
        >
          {(isUploading ? percentUploaded + "% " : "") + "Upload " + props.name}
        </LoadingButton>
      </label>
      {uploadError && <Alert severity="warning">{uploadError}</Alert>}
      <PDFView fileUrl={props.fileUrl} height="220px" />
    </>
  );
};

export default UploadButton;
