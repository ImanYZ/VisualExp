import React, { useEffect, useState } from "react";
import {
  getDocs,
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import {
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Alert
} from "@mui/material";

const ManageResearchers = () => {
  const [researchers, setResearchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [researcherToRemove, setResearcherToRemove] = useState(null);
  const [error, setError] = useState(null);

  const db = getFirestore();

  const getFullName = async email => {
    const querySnapshot = await getDocs(query(collection(db, "users"), where("email", "==", email)));
    if (!querySnapshot.empty) {
      const { firstname, lastname } = querySnapshot.docs[0].data();
      return firstname + " " + lastname;
    }
    return null;
  };

  useEffect(() => {
    const loadResearchers = () => {
      const q = query(collection(db, "researchers"), where("projects.Autograding.active", "==", true));

      const unsubscribe = onSnapshot(q, querySnapshot => {
        const researchersList = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          researchersList.push({
            id: doc.id,
            email: data.email,
            fullname: null,
            projects: data.projects
          });
        });
        setResearchers(researchersList);
      });

      return () => unsubscribe();
    };

    loadResearchers();
  }, [db]);

  useEffect(() => {
    const loadMissingFullNames = async () => {
      const updatedResearchers = await Promise.all(
        researchers.map(async researcher => {
          if (researcher.fullname === null) {
            const fullname = await getFullName(researcher.email);

            return { ...researcher, fullname };
          }
          return researcher;
        })
      );
      setResearchers(updatedResearchers);
    };

    if (researchers.some(researcher => researcher.fullname === null)) {
      loadMissingFullNames();
    }
  }, [researchers, db]);

  const handleAddResearcher = async () => {
    if (newEmail.trim() === "") return;

    try {
      const userQuery = query(collection(db, "users"), where("email", "==", newEmail));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setError("The account with this email doesn't exist.");
        return;
      }

      const existingResearcherQuery = query(collection(db, "researchers"), where("email", "==", newEmail));
      const existingResearcherSnapshot = await getDocs(existingResearcherQuery);

      if (!existingResearcherSnapshot.empty) {
        const existingResearcherDoc = existingResearcherSnapshot.docs[0];
        await updateDoc(doc(db, "researchers", existingResearcherDoc.id), {
          "projects.Autograding.active": true
        });

        setResearchers(
          researchers.map(r => (r.email === newEmail ? { ...r, projects: { Autograding: { active: true } } } : r))
        );
      } else {
        const researcherRef = await addDoc(collection(db, "researchers"), {
          email: newEmail,
          projects: {
            Autograding: {
              active: true
            }
          }
        });

        setResearchers([
          ...researchers,
          {
            id: researcherRef.id,
            email: newEmail,
            fullname: null,
            projects: { Autograding: { active: true } }
          }
        ]);
      }

      setShowModal(false);
      setNewEmail("");
      setError(null);
    } catch (error) {
      console.error("Error adding or updating researcher: ", error);
      setError("An error occurred while adding the researcher.");
    }
  };

  const handleRemoveResearcher = async () => {
    if (!researcherToRemove) return;

    try {
      const researcherDoc = doc(db, "researchers", researcherToRemove.id);
      await updateDoc(researcherDoc, {
        "projects.Autograding.active": false
      });
      setResearchers(researchers.filter(r => r.id !== researcherToRemove.id));
      setShowConfirmDialog(false);
      setResearcherToRemove(null);
    } catch (error) {
      console.error("Error removing researcher: ", error);
    }
  };

  const confirmRemoveResearcher = researcher => {
    setResearcherToRemove(researcher);
    setShowConfirmDialog(true);
  };

  return (
    <Box sx={{ p: "13px", height: "98vh", overflow: "auto" }}>
      <h2>Manage Researchers for Autograding</h2>
      <Button variant="contained" color="primary" onClick={() => setShowModal(true)}>
        Add Researcher
      </Button>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Researcher</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {researchers.map(researcher => (
              <TableRow key={researcher.id}>
                <TableCell>{researcher.fullname || "Loading..."}</TableCell>
                <TableCell>{researcher.email}</TableCell>

                <TableCell>
                  <Button variant="contained" color="success" onClick={() => confirmRemoveResearcher(researcher)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogContent sx={{ width: "500px" }}>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
          />
        </DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <DialogActions>
          <Button
            onClick={() => {
              setShowModal(false);
              setError(null);
              setNewEmail("");
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleAddResearcher} color="primary">
            Add Researcher
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Confirm Remove Researcher</DialogTitle>
        <DialogContent>Are you sure you want to remove this researcher?</DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemoveResearcher} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageResearchers;
