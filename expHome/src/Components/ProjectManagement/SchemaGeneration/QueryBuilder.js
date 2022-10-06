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
      console.log(ids);
      console.log(tempSchema);
      for (let id of tempIds) {
        const index = tempSchema.rules.findIndex(elm => elm.id === id);
        console.log(index);
        indexs.push(index);
        tempSchema1 = tempSchema1.rules.find(elm => elm.id === id);
      }
      tempSchema1.rules.push({
        id: "r-" + Date.now(),
        not: false,
        value: ""
      });
      console.log(tempSchema);
      console.log(Date.now());
      props.onQueryChange(tempSchema);
    };
    const addGroup = ids => {
      let tempSchema = { ...props.query };
      let tempSchema1 = { ...props.query };
      const tempIds = [...ids];
      const indexs = [];
      tempIds.shift();
      console.log(ids);
      console.log(tempSchema);
      for (let id of tempIds) {
        const index = tempSchema.rules.findIndex(elm => elm.id === id);
        console.log(index);
        indexs.push(index);
        tempSchema1 = tempSchema1.rules.find(elm => elm.id === id);
      }
      tempSchema1.rules.push({
        id: "r-" + Date.now(),
        combinator: "AND",
        rules: []
      });
      console.log(tempSchema);
      console.log(Date.now());
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
      console.log("rules ::::: :::::: ", tempSchema1.rules);
      console.log(index);
      console.log(tempSchema1.rules[index]);
      tempSchema1.rules[index] = {
        ...tempSchema1.rules[index],
        key: event.currentTarget.value
      };
      console.log(tempSchema);
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
      console.log(tempSchema1.rules[index]);
      tempSchema1.rules[index] = {
        ...tempSchema1.rules[index],
        not: !tempSchema1.rules[index].not
      };
      console.log(tempSchema);
      props.onQueryChange(tempSchema);
    };

    const changeAndOr = ids => {
      let tempSchema = { ...props.query };
      let tempSchema1 = { ...props.query };
      const tempIds = [...ids];
      const indexs = [];
      tempIds.shift();
      console.log(ids);
      console.log(tempSchema);
      for (let id of tempIds) {
        const index = tempSchema.rules.findIndex(elm => elm.id === id);
        console.log(index);
        indexs.push(index);
        tempSchema1 = tempSchema1.rules.find(elm => elm.id === id);
      }
      console.log("befor", tempSchema);
      tempSchema1.combinator = tempSchema1.combinator === "OR" ? "AND" : "OR";
      console.log(tempSchema1);
      console.log(Date.now());
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
      console.log("rules ::::: :::::: ", tempSchema1.rules);
      console.log(index);
      console.log(tempSchema1.rules[index]);
      tempSchema1.rules.splice(index, 1);
      console.log(tempSchema);
      props.onQueryChange(tempSchema);
    };
    return (
      <Paper elevation={3} sx={{ minheight: "300px", width: "80%", padding: "5px" }}>
        <div style={{ flexDirection: "row", marginLeft: "50%", alignItems: "flex-start" }}>
          <Button
            onClick={() => {
              addKeyword(ids);
            }}
          >
            ADD A KEYWORD
          </Button>
          <Button
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
                    <div style={{display: "flex", flexDirection: "row", alignItems: "flex-start" }} >
                      {renderSchema(element, [...ids, element.id])}
                      <IconButton style={{ marginLeft: "5px" }} size="small">
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
                          onChange={event => {
                            editValue(event, [...ids, element.id]);
                          }}
                          value={element.key}
                          style={{ fontSize: "19px", padding: "2px 5px", width: "140px" }}
                        />
                        <IconButton style={{ marginLeft: "5px" }} size="small">
                          <DeleteIcon
                            onClick={() => {
                              deleteKeyword([...ids, element.id]);
                            }}
                          />
                        </IconButton>
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
