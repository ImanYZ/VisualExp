import React, { useState, useEffect, useRef } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import axios from "axios";

import LoadingButton from "@mui/lab/LoadingButton";
import UploadIcon from "@mui/icons-material/Upload";

import {
  firebaseState,
  uidState,
  fullnameState,
} from "../../../../store/AuthAtoms";

const UploadButton = (props) => {
  const firebase = useRecoilValue(firebaseState);
  const uid = useRecoilValue(uidState);
  const [fileUrl, setFileUrl] = useRecoilState(fileUrlState);

  const [isUploading, setIsUploading] = useState(false);
  const [percentUploaded, setPercentUploaded] = useState(0);
  const [uploadError, setUploadError] = useState(false);

  const handleImageChange = useCallback(
    (event) => {
      try {
        event.preventDefault();
        const image = event.target.files[0];
        if (
          image.type !== "image/jpg" &&
          image.type !== "image/jpeg" &&
          image.type !== "image/png"
        ) {
          setImageUrlError(
            "We only accept JPG, JPEG, or PNG images. Please upload another image."
          );
        } else if (image.size > 1024 * 1024) {
          setImageUrlError(
            "We only accept file sizes less than 1MB for profile images. Please upload another image."
          );
        } else {
          setIsUploading(true);
          const rootURL =
            "https://storage.googleapis.com/onecademy-1.appspot.com/";
          const picturesFolder = "ProfilePictures/";
          const imageNameSplit = image.name.split(".");
          const imageExtension = imageNameSplit[imageNameSplit.length - 1];
          let imageFileName =
            uid + "/" + new Date().toGMTString() + "." + imageExtension;
          const storageRef = firebase.storage.ref(
            picturesFolder + imageFileName
          );
          const task = storageRef.put(image);
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
              console.error("Image Upload Error: ", err);
              setIsUploading(false);
              setImageUrlError(
                "There is an error with uploading your picture. Please upload your profile picture again! If the problem persists, please try another picture."
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
    <LoadingButton
      loading={isUploading}
      loadingIndicator={percentUploaded + "%"}
      loadingPosition="start"
      startIcon={<UploadIcon />}
      variant="outlined"
    >
      {"Upload " + props.name}
    </LoadingButton>
  );
};

export default UploadButton;
