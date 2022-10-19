import React from "react";
import PropTypes from "prop-types";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import ChipInput from './ChipInput';
import './QueryBox.css';

const QueryBox = ({
  title,
  schema,
  subTitle,
  className,
  buttonText,
  handleKeyword,
  handleEditValue,
  handleDeleteKeyword,
  handleSelectedTags,
  ...props
}) => (
  <Paper className={className} elevation={3}>
    <div>
      <div>
        <span className="title">
          {title}
        </span>
        <br />
        <span className="subtitle">
          {subTitle}
        </span>
      </div>
      {schema.map((element, index) => (
        <React.Fragment key={index}>
          <div className="keyword">
            <TextField
              label={`Keyword ${index + 1}`}
              onChange={event => {
                handleEditValue(event, element.id);
              }}
              disabled={props.readOnly}
              value={element.keyword}
              style={{ fontSize: "19px" }}
            />

            {!props.readOnly && (
              <IconButton size="small">
                <DeleteIcon
                  className="keyword-delete"
                  onClick={() => {
                    handleDeleteKeyword(element.id);
                  }}
                />
              </IconButton>
            )}
          </div>
          {element.keyword && element.keyword !== "" &&
            <div>
              <ChipInput
                selectedTags={(items) => handleSelectedTags(items, element.id)}
                fullWidth
                disabled={props.readOnly}
                variant="outlined"
                id={`Keyword ${index + 1} Alternatives`}
                name={`Keyword${index + 1}Alternatives`}
                placeholder={`Keyword ${index + 1} Alternatives`}
                label={`Keyword ${index + 1} Alternatives`}
              />
            </div>
          }
        </React.Fragment>
      )
      )}
      {!props.readOnly && (
        <Button
          sx={{ mt: 1, mr: 1, backgroundColor: "black", color: "common.white" }}
          variant="contained"
          disabled={props.readOnly}
          onClick={handleKeyword}
        >
          {buttonText}
        </Button>
      )}
    </div>
  </Paper>
);

export default React.memo(QueryBox);

QueryBox.defaultProps = {
  title: <>The response should <strong> contain ALL the following keywords</strong></>,
  subTitle: `Below each keyword, you can enter alternative words that serve the same meaning in this context.`,
  buttonText: 'ADD A KEYWORD',
  className: 'query-builder',
};

QueryBox.propTypes = {
  title: PropTypes.any,
  subTitle: PropTypes.string,
  buttonText: PropTypes.string,
  className: PropTypes.string,
};
