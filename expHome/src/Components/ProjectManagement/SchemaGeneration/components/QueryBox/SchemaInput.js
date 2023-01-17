import { IconButton, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useEffect, useState } from "react";
import ChipInput from "../ChipInput";

const SchemaInput = ({
  element,
  index,
  readOnly,
  handleDeleteKeyword,
  handleSelectedTags,
  handleEditValue
}) => {
  const [keyword, setKeyword] = useState(element.keyword);
  // for deferred behaviour in react 17
  const [deferredInterval, setDeferredInterval] = useState(null);

  useEffect(() => {
    setKeyword((keyword) => {
      return keyword === element.keyword ? keyword : element.keyword
    })
  }, [setKeyword, element.keyword])
  return (
    <>
      <div className="keyword">
        {readOnly ? (
          <span>
            Keyword {index + 1} : <strong>{element.keyword}</strong>
          </span>
        ) : (
          <TextField
            label={`Keyword ${index + 1}`}
            onChange={event => {
              const val = event.currentTarget.value;
              setKeyword(val);
              if(deferredInterval) {
                clearTimeout(deferredInterval);
              }
              const t = setTimeout(() => {
                handleEditValue(val, element.id);
              }, 1000);
              setDeferredInterval(t);
            }}
            value={keyword}
            style={{ fontSize: "19px" }}
          />
        )}
        {!readOnly && (
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
      {element.keyword && element.keyword !== "" && (
        <div>
          {readOnly ? (
            <>
              <ChipInput
                tags={element.alternatives}
                selectedTags={handleSelectedTags}
                fullWidth
                readOnly={readOnly}
                variant="outlined"
                id={`Keyword ${index + 1} Alternatives`}
                name={`Keyword${index + 1}Alternatives`}
                label={`Keyword ${index + 1} Alternatives`}
              />
            </>
          ) : (
            <ChipInput
              tags={element.alternatives}
              selectedTags={items => handleSelectedTags(items, element.id)}
              fullWidth
              disabled={readOnly}
              itemId={element.id}
              variant="outlined"
              id={`Keyword ${index + 1} Alternatives`}
              name={`Keyword${index + 1}Alternatives`}
              placeholder={`Keyword ${index + 1} Alternatives`}
              label={`Keyword ${index + 1} Alternatives`}
            />
          )}
        </div>
      )}
    </>
  )
}

export default React.memo(SchemaInput)