import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Checkbox, FormControlLabel, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import React, { FC, useState } from "react";

import { KnowledgeNode } from "../src/knowledgeTypes";

type Props = {
  node: KnowledgeNode;
};

const QuestionItem: FC<Props> = ({ node }) => {
  const initialChoicesState = new Array(node.choices?.length || 0).fill(false);

  const [choicesState, setChoicesState] = useState<boolean[]>(initialChoicesState);

  const handleToggleQuestion = (index: number) => {
    setChoicesState(previousChoiceState => {
      const oldPreviousChoiceState = [...previousChoiceState];
      oldPreviousChoiceState[index] = !oldPreviousChoiceState[index];
      return oldPreviousChoiceState;
    });
  };

  if (!node.choices) {
    return null;
  }

  return (
    <>
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {node.choices.map((value, idx) => {
          return (
            <div key={idx}>
              <ListItem disablePadding>
                <ListItemIcon>
                  <FormControlLabel
                    label={value.choice}
                    control={
                      <>
                        {!choicesState[idx] && (
                          <Checkbox checked={choicesState[idx]} onChange={() => handleToggleQuestion(idx)} />
                        )}
                        {choicesState[idx] && !value.correct && (
                          <IconButton onClick={() => handleToggleQuestion(idx)}>
                            <CloseIcon color="error" />
                          </IconButton>
                        )}
                        {choicesState[idx] && value.correct && (
                          <IconButton onClick={() => handleToggleQuestion(idx)}>
                            <CheckIcon color="success" />
                          </IconButton>
                        )}
                      </>
                    }
                  />
                </ListItemIcon>
              </ListItem>

              {choicesState[idx] && (
                <ListItem disablePadding>
                  <ListItemText primary={value.feedback} />
                </ListItem>
              )}
            </div>
          );
        })}
      </List>
    </>
  );
};

export default QuestionItem;
