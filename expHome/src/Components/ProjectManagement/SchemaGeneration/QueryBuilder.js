import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";

import IconButton from "@mui/material/IconButton";

export default function QueryBuilder(props) {
  const renderSchema = (schema, ids) => {
    const addKeyword = ids => {
      let tempSchema = { ...props.query };
      let tempSchema1 = { ...props.query };
      const tempIds = [...ids];
      const indexs = [];
      tempIds.shift();
      for (let id of tempIds) {
        const index = tempSchema.rules.findIndex(elm => elm.id === id);
        indexs.push(index);
        tempSchema1 = tempSchema1.rules.find(elm => elm.id === id);
      }
      tempSchema1.rules.push({
        id: "r-" + Date.now(),
        not: false,
        value: ""
      });
      props.onQueryChange(tempSchema);
    };
    const addGroup = ids => {
      let tempSchema = { ...props.query };
      let tempSchema1 = { ...props.query };
      const tempIds = [...ids];
      const indexs = [];
      tempIds.shift();
      for (let id of tempIds) {
        const index = tempSchema.rules.findIndex(elm => elm.id === id);
        indexs.push(index);
        tempSchema1 = tempSchema1.rules.find(elm => elm.id === id);
      }
      tempSchema1.rules.push({
        id: "r-" + Date.now(),
        combinator: "AND",
        rules: []
      });
      props.onQueryChange(tempSchema);
    };
    const editValue = (event, ids) => {
      let tempSchema = { ...props.query };
      let tempSchema1 = { ...props.query };
      const tempIds = [...ids];
      const indexs = [];
      tempIds.shift();
      const lastId = tempIds.pop();

      for (let id of tempIds) {
        const index = tempSchema.rules.findIndex(elm => elm.id === id);
        indexs.push(index);
        tempSchema1 = tempSchema1.rules.find(elm => elm.id === id);
      }
      const index = tempSchema1.rules.findIndex(elm => elm.id === lastId);
      tempSchema1.rules[index] = {
        ...tempSchema1.rules[index],
        value: event.currentTarget.value
      };
      props.onQueryChange(tempSchema);
    };
    const setChecked = ids => {
      let tempSchema = { ...props.query };
      let tempSchema1 = { ...props.query };
      const tempIds = [...ids];
      const indexs = [];
      tempIds.shift();
      const lastId = tempIds.pop();
      for (let id of tempIds) {
        const index = tempSchema.rules.findIndex(elm => elm.id === id);
        indexs.push(index);
        tempSchema1 = tempSchema1.rules.find(elm => elm.id === id);
      }
      const index = tempSchema1.rules.findIndex(elm => elm.id === lastId);
      tempSchema1.rules[index] = {
        ...tempSchema1.rules[index],
        not: !tempSchema1.rules[index].not
      };
      props.onQueryChange(tempSchema);
    };

    const changeAndOr = ids => {
      let tempSchema = { ...props.query };
      let tempSchema1 = { ...props.query };
      const tempIds = [...ids];
      const indexs = [];
      tempIds.shift();
      for (let id of tempIds) {
        const index = tempSchema.rules.findIndex(elm => elm.id === id);
        indexs.push(index);
        tempSchema1 = tempSchema1.rules.find(elm => elm.id === id);
      }
      tempSchema1.combinator = tempSchema1.combinator === "OR" ? "AND" : "OR";
      if (tempIds.length === 0) {
        props.onQueryChange(tempSchema1);
      } else {
        props.onQueryChange(tempSchema);
      }
    };

    const deleteKeyword = ids => {
      let tempSchema = { ...props.query };
      let tempSchema1 = { ...props.query };
      const tempIds = [...ids];
      const indexs = [];
      tempIds.shift();
      const lastId = tempIds.pop();

      for (let id of tempIds) {
        const index = tempSchema.rules.findIndex(elm => elm.id === id);
        indexs.push(index);
        tempSchema1 = tempSchema1.rules.find(elm => elm.id === id);
      }
      const index = tempSchema1.rules.findIndex(elm => elm.id === lastId);
      tempSchema1.rules.splice(index, 1);
      props.onQueryChange(tempSchema);
    };
    return (
      <Paper elevation={3} sx={{ minheight: "300px", width: "95%", padding: "5px" }}>
        <div style={{ flexDirection: "row", marginLeft: "50%", alignItems: "flex-start" }}>
          <Button
            disabled={props.noEdit}
            onClick={() => {
              addKeyword(ids);
            }}
          >
            ADD A KEYWORD
          </Button>
          <Button
            disabled={props.noEdit}
            onClick={() => {
              addGroup(ids);
            }}
          >
            ADD A GROUP
          </Button>
        </div>
        <div class="clt">
          <ul>
            <li>
              <Box sx={{ marginRight: "890px" }}>
                <div style={{ padding: "0px" }}>
                  <select
                    value={schema.combinator}
                    onChange={() => {
                      changeAndOr(ids);
                    }}
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                </div>
              </Box>
            </li>
            {schema?.rules?.map(element => {
              return (
                <li>
                  {element.rules ? (
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
                      {renderSchema(element, [...ids, element.id])}
                      <IconButton disabled={props.noEdit} style={{ marginLeft: "5px" }} size="small">
                        <DeleteIcon
                          onClick={() => {
                            deleteKeyword([...ids, element.id]);
                          }}
                        />
                      </IconButton>
                    </div>
                  ) : (
                    <Paper elevation={5} sx={{ height: "30px", width: "200px", padding: "10px" }}>
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
                        NOT
                        <input
                          type="checkbox"
                          checked={element.not}
                          onChange={() => setChecked([...ids, element.id])}
                        />
                        <input
                          disabled={props.noEdit}
                          onChange={event => {
                            editValue(event, [...ids, element.id]);
                          }}
                          value={element.value}
                          style={{ fontSize: "19px", padding: "2px 5px", width: "140px" }}
                        />
                        {!props.noEdit && (
                          <IconButton disabled={props.noEdit} style={{ marginLeft: "5px" }} size="small">
                            <DeleteIcon
                              onClick={() => {
                                deleteKeyword([...ids, element.id]);
                              }}
                            />
                          </IconButton>
                        )}
                      </div>
                    </Paper>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Paper>
    );
  };

  return <>{renderSchema(props.query, [props.query.id])}</>;
}
