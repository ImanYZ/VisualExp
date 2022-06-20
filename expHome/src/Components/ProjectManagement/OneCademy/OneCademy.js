import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";

import { red, green } from "@mui/material/colors";

import { isEmail } from "../../../utils/general";
import withRoot from "../../Home/modules/withRoot";

import {
  firebaseOneState,
  usernameState,
  emailOneState,
} from "../../../store/OneCademyAtoms";

import { notAResearcherState } from "../../../store/ProjectAtoms";

import ValidatedInput from "../../ValidatedInput/ValidatedInput";

import favicon from "../../../assets/favicon.png";

import "./OneCademy.css";

const colorKeys = [50];
for (let colorKey = 100; colorKey < 800; colorKey += 100) {
  colorKeys.push(colorKey);
}

const OneCademy = (props) => {
  const firebase = useRecoilValue(firebaseOneState);
  const notAResearcher = useRecoilValue(notAResearcherState);
  const [username, setUsername] = useRecoilState(usernameState);
  const [email, setEmail] = useRecoilState(emailOneState);

  const [password, setPassword] = useState("");
  const [invalidAuth, setInvalidAuth] = useState(false);
  const [activeUsers, setActiveUsers] = useState({});
  const [usersChanges, setUsersChanges] = useState([]);
  const [sNodesChanged, setSNodesChanged] = useState(false);

  useEffect(() => {
    if (firebase && !notAResearcher && username) {
      const usersQuery = firebase.db.collection("users").where("deTag", "==", {
        node: "WgF7yr5q7tJc54apVQSr",
        title: "Knowledge Visualization",
      });
      const usersSnapshot = usersQuery.onSnapshot((snapshot) => {
        const docChanges = snapshot.docChanges();
        setUsersChanges((oldUsersChanges) => {
          return [...oldUsersChanges, ...docChanges];
        });
      });
      return () => {
        setUsersChanges([]);
        usersSnapshot();
      };
    }
  }, [firebase, notAResearcher, username]);

  useEffect(() => {
    if (!notAResearcher && usersChanges.length > 0) {
      const tempUsersChanges = [...usersChanges];
      setUsersChanges([]);
      let aUsers = { ...activeUsers };
      for (let change of tempUsersChanges) {
        const userData = change.doc.data();
        if (
          (change.type === "removed" || userData.deleted) &&
          change.doc.id in aUsers
        ) {
          delete aUsers[change.doc.id];
        } else {
          if (!(change.doc.id in aUsers)) {
            aUsers[change.doc.id] = {
              fullname: userData.fName + " " + userData.lName,
              imageUrl: userData.imageUrl,
              sNode: userData.sNode,
              title: "",
              redIdx: -1,
              greenIdx: colorKeys.length - 1,
              color: green[colorKeys[colorKeys.length - 1]],
            };
          } else {
            aUsers[change.doc.id] = {
              fullname: userData.fName + " " + userData.lName,
              imageUrl: userData.imageUrl,
              sNode: userData.sNode,
              title: "",
              redIdx: -1,
              greenIdx: colorKeys.length - 1,
              color: green[colorKeys[colorKeys.length - 1]],
            };
          }
        }
      }
      console.log({ aUsers });
      setActiveUsers(aUsers);
      setSNodesChanged(true);
    }
  }, [notAResearcher, usersChanges, activeUsers]);

  useEffect(() => {
    const retrieveSNodes = async () => {
      setSNodesChanged(false);
      const aUsers = { ...activeUsers };
      for (let uId in aUsers) {
        if (aUsers[uId].sNode) {
          const sNodeDoc = await firebase.db
            .collection("nodes")
            .doc(aUsers[uId].sNode)
            .get();
          if (sNodeDoc.exists) {
            const sNodeData = sNodeDoc.data();
            aUsers[uId].title = sNodeData.title;
          }
        }
      }
      setActiveUsers(aUsers);
    };
    if (firebase && sNodesChanged && usersChanges.length === 0) {
      retrieveSNodes();
    }
  }, [firebase, sNodesChanged, activeUsers, usersChanges]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((oUsers) => {
        const aUsers = { ...oUsers };
        for (let uId in aUsers) {
          if (aUsers[uId].greenIdx > 0) {
            aUsers[uId].greenIdx -= 1;
            aUsers[uId].color = green[colorKeys[aUsers[uId].greenIdx]];
          } else if (aUsers[uId].redIdx < colorKeys.length - 1) {
            aUsers[uId].greenIdx = -1;
            aUsers[uId].redIdx += 1;
            aUsers[uId].color = red[colorKeys[aUsers[uId].redIdx]];
          }
        }
        return aUsers;
      });
    }, 40000);
    return () => {
      clearInterval(interval);
    };
  }, [firebase]);

  const passwordChange = (event) => {
    setPassword(event.target.value);
  };

  const emailChange = (event) => {
    setEmail(event.target.value);
  };

  const signIn = async (event) => {
    try {
      const loweredEmail = email.toLowerCase();
      await firebase.login(loweredEmail, password);
    } catch (err) {
      console.log({ err });
      setInvalidAuth(err.message);
    }
  };

  const signOut = async (event) => {
    try {
      await firebase.logout();
    } catch (err) {
      console.log({ err });
      setInvalidAuth(err.message);
    }
  };

  const onKeyPress = (event) => {
    if (event.key === "Enter" && validPassword) {
      signIn(event);
    }
  };

  const validPassword = password.length >= 7;
  const validEmail = isEmail(email);

  return (
    <div id="OneCademy">
      <Alert severity="warning">
        The chips below show the title of the last node each researcher
        interacted with. Colors have the following meanings:
        <ul>
          <li>
            <span style={{ fontWeight: "700", color: green[700] }}>
              Dark Green
            </span>
            : is currently activity
          </li>
          <li>
            <span style={{ fontWeight: "700", color: green[200] }}>
              Light Green
            </span>
            : was activity a few seconds ago
          </li>
          <li>
            <span style={{ fontWeight: "700", color: red[200] }}>
              Light Red
            </span>
            : was activity a while ago
          </li>
          <li>
            <span style={{ fontWeight: "700", color: red[700] }}>Dark Red</span>
            : has not been active for a while
          </li>
        </ul>
      </Alert>
      <Paper
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          listStyle: "none",
          p: 0.5,
          m: 0,
        }}
        component="ul"
      >
        {Object.keys(activeUsers).map((aUId) => {
          console.log({ color: activeUsers[aUId].color });
          return (
            <li key={aUId} style={{ margin: "4px" }}>
              <Tooltip title={activeUsers[aUId].fullname}>
                <Chip
                  avatar={
                    <Avatar
                      alt={activeUsers[aUId].fullname}
                      src={activeUsers[aUId].imageUrl}
                    />
                  }
                  label={activeUsers[aUId].title}
                  style={{ border: "2.5px solid " + activeUsers[aUId].color }}
                  variant="outlined"
                />
              </Tooltip>
            </li>
          );
        })}
      </Paper>
      {username ? (
        <div id="SignButtonContainer">
          <Button onClick={signOut} className="Button Red" variant="contained">
            Sign Out from 1Cademy
          </Button>
        </div>
      ) : (
        <>
          <h2>Sign in to 1Cademy to see your points!</h2>
          {/* <span id="EmailAddress">{email}</span> */}
          <ValidatedInput
            className="PleaseSpecify"
            onChange={emailChange}
            name="email"
            type="email"
            placeholder="Your 1Cademy Associated Email"
            label="Your 1Cademy Associated Email"
            errorMessage={
              validEmail
                ? null
                : "Please enter your 1Cademy Associated Email correctly!"
            }
            onKeyPress={onKeyPress}
          />
          <ValidatedInput
            className="PleaseSpecify"
            onChange={passwordChange}
            name="password"
            type="password"
            placeholder={"Your Password for " + email}
            label={"Your Password for " + email}
            errorMessage={
              validPassword
                ? null
                : "Please enter your password with at least 7 characters!"
            }
            onKeyPress={onKeyPress}
          />
          {invalidAuth && <div className="Error">{invalidAuth}</div>}
          <div id="SignButtonContainer">
            <Button
              id="SignButton"
              onClick={signIn}
              className={validPassword ? "Button" : "Button Disabled"}
              variant="contained"
              disabled={validPassword ? null : true}
            >
              Sign In to 1Cademy
            </Button>
          </div>
        </>
      )}
      <Alert severity="error">
        <h2>Set 1Cademy Tag to "Knowledge Visualization":</h2>
        <p>
          Before proposing any new nodes or improvements on 1Cademy, you should
          do one of the followings, otherwise, you'll not earn any points for
          the proposal:
        </p>
        <ul>
          <li>
            You should set your community membership (default tag) on 1Cademy to{" "}
            <strong>Knowledge Visualization</strong> to earn points.
          </li>
          <li>
            Alternatively, you can add the tag{" "}
            <strong>Knowledge Visualization</strong> to every node you propose
            related to this project.
          </li>
        </ul>
      </Alert>
      <Alert severity="success">
        <h2>1Cademy Points:</h2>
        <ul>
          <li>
            <strong>
              Your contribution ( <img src={favicon} width="15.1" /> ):
            </strong>{" "}
            every upvote minus downvote you receive from others on your 1Cademy
            proposals, e.g., about papers you summarize and present in our
            weekly meetings, gives you one point.
          </li>
          <li>
            <strong>Evaluating others' contribution ( ✅ ):</strong> you receive
            one point for every 25 upvotes you cast on your colleagues proposals
            in every single day.
          </li>
          <li>
            <strong>No partial or extra points:</strong> if on a single day you
            cast more than 25 upvotes on others' proposals, you'll not receive
            any extra points. If you cast fewer than 25 upvotes, you'll not
            receive any partial points, either.
          </li>
        </ul>
      </Alert>
      <p>...</p>
    </div>
  );
};

export default withRoot(OneCademy);
