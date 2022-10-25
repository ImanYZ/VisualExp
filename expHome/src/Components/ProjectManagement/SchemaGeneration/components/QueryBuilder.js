import React, { useEffect, useState } from "react";
import QueryBox from "./QueryBox";
import Button from "@mui/material/Button";
import { uuidv4 } from "../../../../utils";
import "./QueryBuilder.css";

const QueryBuilder = ({ ...props }) => {
  const [disableSubmitBtn, setDisableSubmitBtn] = useState(false);

  const { query: schema, selectedPhrase } = props;

  useEffect(() => {
    const containWords = Array.isArray(schema) && schema?.some(x => x.keyword && x.keyword !== "");
    setDisableSubmitBtn(containWords);
  }, [schema]);

  const handleAddAlternative = (schemaE, id, event) => {
    if (event.key !== "Enter") return;
    const value = event.target.value;
    if (!value.trim()) return;
    const index = schemaE.findIndex(elm => elm.id === id);
    const _schemaE = [...schemaE];
    _schemaE[index].alternatives.push(value);
    props.onQueryChange(_schemaE);
    event.target.value = "";
  };

  const handleRemoveAlternative = (alt, schemaE, id) => {
    const index = schemaE.findIndex(elm => elm.id === id);
    const _schemaE = [...schemaE];
    const indexOFAlt = _schemaE[index].alternatives.indexOf(alt);
    _schemaE[index].alternatives.splice(indexOFAlt, 1);
    props.onQueryChange(_schemaE);
  };

  const handleAddKeyword = () => {
    const schemaE = [...schema];
    schemaE.push({ id: uuidv4(), not: false, keyword: "", alternatives: [] });
    props.onQueryChange(schemaE);
  };

  const handleExcludeKeyword = () => {
    const schemaE = [...schema];
    schemaE.push({ id: uuidv4(), not: true, keyword: "", alternatives: [] });
    props.onQueryChange(schemaE);
  };

  const handleDeleteKeyword = id => {
    const schemaE = [...schema];
    const index = schemaE.findIndex(elm => elm.id === id);
    schemaE.splice(index, 1);
    props.onQueryChange(schemaE);
  };

  const handleEditValue = (event, id) => {
    const schemaE = [...schema];
    const index = schemaE.findIndex(elm => elm.id === id);
    schemaE[index].keyword = event.currentTarget.value;
    props.onQueryChange(schemaE);
  };

  // const handleSelectedTags = (items, id) => {
  //   const _schemaE = [...schema];
  //   const index = _schemaE.findIndex(elm => elm.id === id);
  //   if (!props.readOnly) {
  //     console.log({ _schemaE, id, _schemass: _schemaE[index], items });
  //     _schemaE[index].alternatives = [...items];
  //     // props.onQueryChange([..._schemaE]);
  //   }
  // }
  const handleSelectedTags = (items,id) => {
    const schemaE = [...schema];
    const index = schemaE.findIndex(elm => elm.id === id);
    schemaE[index].alternatives = items;
    console.log(items);
    props.onQueryChange(schemaE);
  };



  const showIfQueryExists = (() => {
    const filteredNOTSchema = Array.isArray(schema) && schema?.filter(elem => elem.not).length > 0;
    if (!props.readOnly) return true;
    if (props.readOnly && filteredNOTSchema) return true;
    return null;
  })();

  return (
    <div className="query-container" onClick={props.onClick}>
      <QueryBox
        className={"query-builder"}
        readOnly={props.readOnly}
        title={
          <>
            The response should <strong> contain ALL the following keywords</strong>
          </>
        }
        schema={schema.filter(elem => !elem.not)}
        selectedPhrase={selectedPhrase}
        subTitle={`Below each keyword, you can enter alternative words that serve the same meaning in this context.`}
        buttonText={"ADD A KEYWORD"}
        handleEditValue={handleEditValue}
        handleKeyword={handleAddKeyword}
        handleDeleteKeyword={handleDeleteKeyword}
        handleSelectedTags={handleSelectedTags}
        // handleExcludeKeyword={handleExcludeKeyword}
        handleRemoveAlternative={handleRemoveAlternative}
        handleAddAlternative={handleAddAlternative}
      />
      {showIfQueryExists && (
        <QueryBox
          className={"query-builder not"}
          readOnly={props.readOnly}
          title={
            <>
              The response should{" "}
              <span style={{ color: "#C62828" }}>
                <strong>NOT</strong>
              </span>{" "}
              <strong> contain the following keywords </strong>
            </>
          }
          schema={schema.filter(elem => elem.not)}
          selectedPhrase={selectedPhrase}
          subTitle={""}
          buttonText={"EXCLUDE A KEYWORD"}
          handleEditValue={handleEditValue}
          // handleAddKeyword={handleAddKeyword}
          handleDeleteKeyword={handleDeleteKeyword}
          handleSelectedTags={handleSelectedTags}
          handleKeyword={handleExcludeKeyword}
          handleRemoveAlternative={handleRemoveAlternative}
          handleAddAlternative={handleAddAlternative}
        />
      )}
      {props.handleSubmit && (
        <div className="query-container footer">
          <div className="content">
            <div style={{ marginRight: "15px" }}>
              <span className="result-text">
                Check what the result will look like on the right side, before you submit.
              </span>
            </div>
            <Button
              sx={{ mt: 1, mr: 1, backgroundColor: "#ff9800", color: "common.white" }}
              variant="contained"
              disabled={!disableSubmitBtn}
              onClick={props.handleSubmit}
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(QueryBuilder);
