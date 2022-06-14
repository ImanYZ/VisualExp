import { addDoc, collection } from "firebase/firestore/lite";

import { Feedback } from "../../src/knowledgeTypes";
import { db } from "./firestoreClient.config";

export const addFeedback = async (feedback: Feedback) => {
  const docRef = await addDoc(collection(db, "feedback"), { feedback });
  console.log("Document written with ID: ", docRef.id);
};
