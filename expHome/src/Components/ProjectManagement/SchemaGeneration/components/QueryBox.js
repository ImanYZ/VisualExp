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
  handleSelecetedTags,
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
              label={"Keyword" + (index + 1)}
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
          <div>
            <ChipInput
              selectedTags={handleSelecetedTags}
              fullWidth
              disabled={props.readOnly}
              variant="outlined"
              id={`Keyword ${index + 1} Alternatives`}
              name={`Keyword${index + 1}Alternatives`}
              placeholder={`Keyword ${index + 1} Alternatives`}
              label={`Keyword ${index + 1} Alternatives`}
            />
          </div>
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
      {/* 
        <>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
        <span> The response should </span>

        <span>
          <strong style={{ color: "red" }}> NOT </strong>
        </span>
        <span>
          <strong> contain ALL the following concepts</strong>
        </span>
      </div>
      {schema
        .filter(elem => elem.not)
        .map((element, index) => {
          return (
            <>
              <div style={{ marginBottom: "40px" }}>
                <div
                  style={{
                    display: "flex",
                    marginLeft: "50px",
                    marginTop: "10px",
                    flexDirection: "row",
                    alignItems: "flex-start"
                  }}
                >
                  <TextField
                    disabled={props.noEdit}
                    label={"Keyword" + (index + 1)}
                    onChange={event => {
                      handleEditValue(event, element.id);
                    }}
                    value={element.keyword}
                    style={{ fontSize: "19px", padding: "2px 5px" }}
                  />

                  {!props.noEdit && (
                    <IconButton
                      disabled={props.noEdit}
                      style={{ color: "red", marginLeft: "5px", marginTop: "15px" }}
                      size="small"
                    >
                      <DeleteIcon
                        onClick={() => {
                          handleDeleteKeyword(element.id);
                        }}
                      />
                    </IconButton>
                  )}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}
                >
                  <div className="alternative-input-container">
                    {element?.alternatives?.map((alt, index) => (
                      <Chip
                        size="large"
                        label={alt}
                        onDelete={() => {
                          handleRemoveAlternative(alt, schema, element.id);
                        }}
                      />
                    ))}
                    <input
                      onKeyDown={event => {
                        handleAddAlternative(schema, element.id, event);
                      }}
                      className="alternative-input"
                      type="text"
                      placeholder="Add an alternative keyword"
                    />
                  </div>
                </div>
              </div>
            </>
          );
        })}
      {!props.noEdit && (
        <div style={{ flexDirection: "row", marginBottom: "30px", alignItems: "flex-start" }}>
          <Button
            sx={{ mt: 1, mr: 1, backgroundColor: "black", color: "common.white" }}
            variant="contained"
            disabled={props.noEdit}
            onClick={handleExcludeKeyword}
          >
            exclude A Keyword
          </Button>
        </div>
      )}
      </> 
      */}
    </div>
  </Paper>
);

export default QueryBox;

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
