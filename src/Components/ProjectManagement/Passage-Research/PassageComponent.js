import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Checkbox from "@mui/material/Checkbox";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

const PassageComponent = props => {
  return (
    <Box style={{ width: "70%", margin: "15px 0px 0px 20px", overflow: "scroll", height: "90vh" }}>
      <Box style={{ display: "flex", marginBottom: "5px" }}>
        <Box style={{ display: "flex", flexDirection: "column", marginRight: "20px" }}>
          <Typography variant="h6" component="Box">
            Passage
          </Typography>

          <Select value={props.userCondition} onChange={props.handlePassageChange}>
            {props.passages &&
              props.passages?.length > 0 &&
              props.passages.map(doc => <MenuItem value={doc.title}>{doc.title}</MenuItem>)}
          </Select>
        </Box>
        <Box style={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" component="Box">
            Passage Condition
          </Typography>
          <Select value={props.passageCondition} onChange={props.handlePassageConditionChange}>
            {props.optionsConditions.map(option => {
              return (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              );
            })}
          </Select>
        </Box>
      </Box>
      <iframe id="PassageFrame" frameBorder="0" src={props.pConURL} />
      <Typography variant="h5" gutterBottom component="Box">
        Questions and Answers
      </Typography>
      {props.passage &&
        props.passage?.questions?.length > 0 &&
        props.passage.questions.map((question, index) => {
          return (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content">
                <Typography variant="h6" component="Box">
                  {`${index + 1}. ${question.stem}`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ol id="sortable" type="a" start="1">
                  <li>
                    <Typography variant="h6" component="Box">
                      {question.a}
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="h6" component="Box">
                      {question.b}
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="h6" component="Box">
                      {question.c}
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="h6" component="Box">
                      {question.d}
                    </Typography>
                  </li>
                </ol>
                <Typography variant="h6" gutterBottom component="Box" mb={2}>
                  Answer: <mark>{question[question.answer]}</mark>
                </Typography>
                {(props.editor || props.email === "tirdad.barghi@gmail.com") && (
                  <List>
                    {["Inference", "memory"].map(type => (
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => {
                            props.handleTypeOfQuestion(type, props.passage.title, index);
                          }}
                          dense
                        >
                          <ListItemIcon>
                            <Checkbox edge="start" checked={question.type === type} disableRipple />
                          </ListItemIcon>
                          <ListItemText id={type} primary={`${type}`} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      {props.passage?.phrases?.length > 0 && (
        <Box>
          <Box sx={{ mt: "15px", mb: "15px" }}>
            <Typography variant="h5" gutterBottom component="Box">
              Phrases :
            </Typography>
          </Box>
          <Box>
            {props.editor && (
              <Button
                onClick={() => {
                  props.handleOpenddPhraseModal();
                  props.setChosenPassage(props.passage.title);
                }}
              >
                <AddIcon /> add New Phrase
              </Button>
            )}
          </Box>
        </Box>
      )}
      <Box>
        {props.passage &&
          props.passage?.phrases?.length > 0 &&
          props.passage?.phrases?.map((phrase, index) => (
            <ul key={index}>
              <li>
                <Box>{phrase}</Box>
                {props.editor && (
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => {
                        props.setPassagTitle(props.passage.title);
                        props.setNewPhrase(phrase);
                        props.setSelectedPhrase(phrase);
                        props.handleOpenEditModal(phrase);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => {
                        props.setPassagTitle(props.passage.title);
                        props.setSelectedPhrase(phrase);
                        props.handleOpenDeleteModal();
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <List>
                      {["Inference", "memory"].map(type => (
                        <ListItem disablePadding>
                          <ListItemButton
                            onClick={() => {
                              props.handleTypeOfPhrase(type, props.passage.title, index);
                            }}
                            dense
                          >
                            <ListItemIcon>
                              <Checkbox
                                edge="start"
                                checked={props.passage.phrasesTypes && props.passage?.phrasesTypes[index] === type}
                                disableRipple
                              />
                            </ListItemIcon>
                            <ListItemText id={type} primary={`${type}`} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </li>
            </ul>
          ))}
      </Box>
    </Box>
  );
};

export default PassageComponent;
