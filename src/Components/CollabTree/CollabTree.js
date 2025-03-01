import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import AddBoxIcon from "@mui/icons-material/AddBox";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import { Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import CheckBox from "@mui/material/Checkbox";

const CollabTree = ({ data, setData, setSelectedGroups, selectedGroups }) => {
  const handleAddNode = parentId => {
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));

      const addNode = nodes => {
        nodes.forEach(node => {
          if (node.id === parentId) {
            if (!node.subgroups) node.subgroups = [];
            node.subgroups.push({ id: Date.now().toString(), label: "New Node", subgroups: [] });
          } else if (node.subgroups) {
            addNode(node.subgroups);
          }
        });
      };
      addNode(newData);
      return newData;
    });
  };

  const handleDeleteNode = nodeId => {
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));

      const deleteNode = (nodes, parent = null) => {
        return nodes.filter(node => {
          if (node.id === nodeId) return false;
          if (node.subgroups) node.subgroups = deleteNode(node.subgroups, node);
          return true;
        });
      };

      return deleteNode(newData);
    });
  };

  const renderTree = groups => (
    <>
      {groups.map(group => (
        <TreeItem
          key={group.id}
          itemId={group.id}
          label={
            <Box sx={{ display: "flex", gap: "7px", alignItems: "center" }}>
              <CheckBox
                onClick={e => {
                  e.stopPropagation();
                  setSelectedGroups(prev => {
                    const _prev = new Set(prev);
                    if (_prev.has(group.id)) {
                      _prev.delete(group.id);
                    } else {
                      _prev.add(group.id);
                    }
                    return _prev;
                  });
                }}
                checked={selectedGroups.has(group.id)}
                sx={{ p: 0 }}
              />
              <Typography>{group.label}</Typography>
              {/*   <IconButton
                size="small"
                sx={{ ml: "auto" }}
                onClick={e => {
                  e.stopPropagation();
                  handleAddNode(group.id);
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteNode(group.id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton> */}
            </Box>
          }
          nodeId={group.id}
          slots={{
            expandIcon: group.subgroups && group.subgroups.length > 0 ? AddBoxIcon : IndeterminateCheckBoxIcon
          }}

          /*   sx={{ backgroundColor: selectedGroups.has(group.id) ? "#4caf50" : "", borderBlock: "1px solid gray" }} */
        >
          {group.subgroups && group.subgroups.length > 0 ? renderTree(group.subgroups) : null}
        </TreeItem>
      ))}
    </>
  );

  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <SimpleTreeView>{renderTree(data)}</SimpleTreeView>
    </Box>
  );
};

export default CollabTree;
