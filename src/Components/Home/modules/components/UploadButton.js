import React, { useState, useEffect, useRef } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import axios from "axios";

import LoadingButton from "@mui/lab/LoadingButton";
import UploadIcon from "@mui/icons-material/Upload";

import {
  firebaseState,
  //   uidState,
  fullnameState,
} from "../../../../store/AuthAtoms";

const UploadButton = (props) => {
  const firebase = useRecoilValue(firebaseState);
  //   const uid = useRecoilValue(uidState);
  const fullname = useRecoilValue(fullnameState);

  const [isUploading, setIsUploading] = useState(false);
  const [percentUploaded, setPercentUploaded] = useState(0);
  const [uploadError, setUploadError] = useState(false);
  const [fileUrl, setFileUrl] = useState("");

  const handleFileChange = useCallback(
    (event) => {
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
          const fileNameSplit = file.name.split(".");
          const fileExtension = fileNameSplit[fileNameSplit.length - 1];
          let fileName =
            fullname + "/" + new Date().toGMTString() + "." + fileExtension;
          const storageRef = firebase.storage.ref(filesFolder + fileName);
          const task = storageRef.put(fil);
          task.on(
            "state_changed",
            function progress(snapshot) {
              setPercentageUploaded(
                Math.ceil(
                  (100 * snapshot.bytesTransferred) / snapshot.totalBytes
                )
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
              const imageGeneratedUrl =
                await task.snapshot.ref.getDownloadURL();
              let responseObj = {};
              const postData = {
                imageUrl: imageGeneratedUrl,
              };
              const userAuthObj = firebase.auth.currentUser;
              await userAuthObj.updateProfile({
                photoURL: imageGeneratedUrl,
              });
              await firebase.idToken();
              responseObj = await axios.post("/user/image", postData);
              setImageUrlError(false);
              setIsUploading(false);
              setImageUrl(imageGeneratedUrl);
              setPercentageUploaded(100);
            }
          );
        }
      } catch (err) {
        console.error("Image Upload Error: ", err);
        setIsUploading(false);
        setImageUrlError("Upload your profile picture!");
      }
    },
    [firebase, uid]
  );

  const handleEditImage = useCallback(
    (event) => {
      if (!isUploading) {
        inputEl.current.click();
      }
    },
    [isUploading, inputEl]
  );

  return (
    <label htmlFor={props.name + "File"}>
      <input
        accept={props.mimeTypes.join(", ")}
        id={props.name + "File"}
        type="file"
        style={{ display: "none" }}
      />
      <LoadingButton
        loading={isUploading}
        loadingIndicator={percentUploaded + "%"}
        loadingPosition="start"
        startIcon={<UploadIcon />}
        variant="outlined"
      >
        {"Upload " + props.name}
      </LoadingButton>
    </label>
  );
};

export default UploadButton;
