import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";

import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import { uuidv4 } from "../../../utils";
export default function QueryBuilder(props) {
  const renderSchema = (schema, ids, selectedPhrase) => {
    const handleAddAlternative = (schemaE, id, event) => {
      if (event.key !== "Enter") return;
      const value = event.target.value;
      if (!value.trim()) return;
      const index = schemaE.findIndex(elm => {
        return elm.id === id;
      });
      const _schemaE = [...schemaE];
      console.log(_schemaE, index);
      _schemaE[index].alternatives.push(value);
      props.onQueryChange(_schemaE);
      event.target.value = "";
    };
    const handleRemoveAlternative = (alt, schemaE, id) => {
      const index = schemaE.findIndex(elm => {
        return elm.id === id;
      });
      const _schemaE = [...schemaE];
      const indexOFAlt = _schemaE[index].alternatives.indexOf(alt);
      _schemaE[index].alternatives.splice(indexOFAlt, 1);
      props.onQueryChange(_schemaE);
    };

    const handleAddKeyword = id => {
      const schemaE = [...schema];
      schemaE.push({ id: uuidv4(), not: false, keyword: "", alternatives: [] });
      props.onQueryChange(schemaE);
    };
    const handleExcludeKeyword = id => {
      const schemaE = [...schema];
      schemaE.push({ id: uuidv4(), not: true, keyword: "", alternatives: [] });
      props.onQueryChange(schemaE);
    };

    const handleDeleteKeyword = id => {
      const schemaE = [...schema];
      const index = schemaE.findIndex(elm => {
        return elm.id === id;
      });
      schemaE.splice(index, 1);
      props.onQueryChange(schemaE);
    };

    const handleEditValue = (event, id) => {
      const schemaE = [...schema];
      const index = schemaE.findIndex(elm => {
        return elm.id === id;
      });
      schemaE[index].keyword = event.currentTarget.value;
      props.onQueryChange(schemaE);
    };

    return (
      <Paper elevation={3} sx={{ minheight: "300px", width: "95%", padding: "5px" }}>
        <div style={{}}>
          <div style={{ display: "flex", marginLeft: "50px", flexDirection: "row", alignItems: "flex-start" }}>
            The response should <strong> contain ALL the following keywords</strong>
          </div>
          <div
            style={{
              display: "flex",
              marginBottom: "25px",
              marginLeft: "50px",
              flexDirection: "row",
              alignItems: "flex-start"
            }}
          >
            Below each keyword, you can enter alternative words that serve the same meaning in this context.
          </div>
          {schema
            .filter(elem => !elem.not)
            .map((element, index) => {
              return (
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
                      label={"Keyword" + (index + 1)}
                      onChange={event => {
                        handleEditValue(event, element.id);
                      }}
                      value={element.keyword}
                      style={{ fontSize: "19px", padding: "2px 5px", width: "140px" }}
                    />

                    {!props.noEdit && (
                      <IconButton style={{ color: "red", marginLeft: "5px", marginTop: "15px" }} size="small">
                        <DeleteIcon
                          onClick={() => {
                            handleDeleteKeyword(element.id);
                          }}
                        />
                      </IconButton>
                    )}
                  </div>
                  <div style={{ display: "flex", marginLeft: "50px", flexDirection: "row", alignItems: "flex-start" }}>
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
                  {schema.filter(elem => !elem.not).indexOf(element) ===
                    schema.filter(elem => !elem.not).length - 1 && (
                    <div style={{ flexDirection: "row", marginRight: "71%", alignItems: "flex-start" }}>
                      <Button
                        sx={{ mt: 1, mr: 1, backgroundColor: "black", color: "common.white" }}
                        variant="contained"
                        disabled={props.noEdit}
                        onClick={() => {
                          handleAddKeyword(element.id);
                        }}
                      >
                        ADD A KEYWORD
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

          {schema
            .filter(elem => elem.not)
            .map((element, index) => {
              return (
                <>
                  {schema.filter(elem => elem.not).length > 0 && (
                    <div
                      style={{ display: "flex", marginLeft: "50px", flexDirection: "row", alignItems: "flex-start" }}
                    >
                      <span> The response should </span>

                      <span>
                        <strong style={{ color: "red" }}> NOT </strong>
                      </span>
                      <span>
                        <strong> contain ALL the following concepts</strong>
                      </span>
                    </div>
                  )}
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
                        style={{ fontSize: "19px", padding: "2px 5px", width: "140px" }}
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
                      style={{ display: "flex", marginLeft: "50px", flexDirection: "row", alignItems: "flex-start" }}
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

                    {schema.filter(elem => elem.not).indexOf(element) ===
                      schema.filter(elem => elem.not).length - 1 && (
                      <div style={{ flexDirection: "row", marginRight: "71%", alignItems: "flex-start" }}>
                        <Button
                          sx={{ mt: 1, mr: 1, backgroundColor: "black", color: "common.white" }}
                          variant="contained"
                          disabled={props.noEdit}
                          onClick={() => {
                            handleExcludeKeyword(element.id);
                          }}
                        >
                          exclude A Keyword
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              );
            })}
        </div>
      </Paper>
    );
  };

  return <>{renderSchema(props.query, [props.query.id], props.selectedPhrase)}</>;
}
