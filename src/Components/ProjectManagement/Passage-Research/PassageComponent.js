import React, { useRef } from "react";
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
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

const PassageComponent = props => {
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const containerRef = useRef(null);

  const handleSorting = () => {
    const _phrases = [...props.passage.phrases];
    const dragItemContent = _phrases[dragItem.current];
    _phrases.splice(dragItem.current, 1);
    _phrases.splice(dragOverItem.current, 0, dragItemContent);
    props.savePhrasesOrder({ passageId: props.passage.id, phrasesOrder: _phrases, passageNum: props.passageNum });
  };

  const handleDragOver = e => {
    e.preventDefault();

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const mouseY = e.clientY;

    const distanceFromTop = mouseY - containerRect.top;
    const distanceFromBottom = containerRect.bottom - mouseY;

    const scrollSpeed = 15;

    const scrollThreshold = 100;

    const scrollAreaHeight = 100;

    if (distanceFromTop < scrollAreaHeight) {
      const scrollAmount = scrollSpeed * (1 - distanceFromTop / scrollAreaHeight);

      container.scrollTop -= scrollAmount;
    } else if (distanceFromTop < scrollThreshold) {
      container.scrollTop -= scrollSpeed;
    } else if (distanceFromBottom < scrollThreshold) {
      container.scrollTop += scrollSpeed;
    }
  };

  return (
    <Box ref={containerRef} style={{ width: "70%", overflow: "scroll", height: "90vh" }}>
      <Box
        sx={{ position: "sticky", top: 0, zIndex: 999, backgroundColor: "white", display: "flex", marginBottom: "5px" }}
      >
        <Box sx={{ display: "flex", flexDirection: "row", mr: "20px", ml: "20px" }}>
          <Box style={{ flex: "1", display: "flex", alignItems: "center", fontWeight: "bold" }}>Passage:</Box>
          <Select value={props.userCondition} onChange={props.handlePassageChange} style={{ marginLeft: "10px" }}>
            {props.passages &&
              props.passages?.length > 0 &&
              props.passages.map(doc => <MenuItem value={doc.title}>{doc.title}</MenuItem>)}
          </Select>
        </Box>
        <Box style={{ display: "flex", flexDirection: "row" }}>
          <Box style={{ flex: "1", display: "flex", alignItems: "center", fontWeight: "bold" }}>Condition:</Box>
          <Select
            value={props.passageCondition}
            onChange={props.handlePassageConditionChange}
            style={{ marginLeft: "10px" }}
          >
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
      <iframe id="PassageFrame" frameborder="0" src={props.pConURL} title={props.passage.title} />
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
      {props.editor && (
        <Button
          onClick={() => {
            props.handleOpenddPhraseModal();
            props.setChosenPassage(props.passage.title);
          }}
          sx={{ mt: "15px" }}
        >
          <AddIcon /> add New Phrase
        </Button>
      )}

      {props.passage && props.passage?.phrases?.length > 0 && (
        <List>
          {props.passage?.phrases?.map((phrase, index) => (
            <ListItem
              draggable
              onDragStart={e => {
                dragItem.current = index;
              }}
              onDragEnter={e => {
                dragOverItem.current = index;
              }}
              onDragOver={handleDragOver}
              onDragEnd={handleSorting}
              style={{ borderBottom: "1px solid black" }}
            >
              <ListItemIcon>
                <DragIndicatorIcon />
                {index + 1}
              </ListItemIcon>
              <ListItemText id="switch-list-label-wifi" primary={phrase} style={{ userSelect: "text" }} />
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
                  {props.email === "oneweb@umich.edu" && (
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
                  )}
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default PassageComponent;
