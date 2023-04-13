import React, { useRef, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { firebaseState } from "../store/AuthAtoms";
import Button from "@mui/material/Button";
import dagreD3 from "dagre-d3";
import "./OneCademyCollaborationModel.css";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import TextareaAutosize from "@mui/base/TextareaAutosize";
import { Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

const d3 = require("d3");

const OneCademyCollaborationModel = () => {
  const firebase = useRecoilValue(firebaseState);
  const [openAddNode, setOpenAddNode] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Positive Outcome");
  const [nodesChanges, setNodesChanges] = useState([]);
  const [nodesLoded, setNodesLoded] = useState(false);
  const svgRef = useRef();
  const [allNodes, setAllNodes] = useState([]);
  const [explanation, setExplanation] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverTitle, setPopoverTitle] = useState("");
  const [popoverType, setPopoverType] = useState("");
  const [children, setChildren] = useState([]);
  const [loadData, setLoadData] = useState(false);
  const [selectedNode, setSelectedNode] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  function ColorBox(props) {
    return (
      <Box
        sx={{
          bgcolor: props.color,
          color: "primary.contrastText",
          p: 2,
          borderRadius: 2,
          maxWidth: 150,
          mr: 1,
          mb: 1
        }}
        key={props.text}
      >
        {props.text}
      </Box>
    );
  }
  useEffect(() => {
    const collabModelNodesQuery = firebase.db.collection("collabModelNodes");
    const collabModelNodesSnapshot = collabModelNodesQuery.onSnapshot(snapshot => {
      const changes = snapshot.docChanges();
      setNodesChanges(oldChanges => [...oldChanges, ...changes]);
      setNodesLoded(true);
      setLoadData(false);
    });
    return () => {
      collabModelNodesSnapshot();
      setNodesLoded(false);
      setLoadData(false);
    };
  }, [firebase, loadData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (!nodesLoded) return;
    setExplanation("");
    var g = new dagreD3.graphlib.Graph({ compound: true }).setGraph({ rankdir: "LR" }).setDefaultEdgeLabel(function () {
      return {};
    });
    d3.select("#graphGroup").selectAll("*").remove();
    const tempNodesChanges = [...nodesChanges];
    setNodesChanges([]);
    const _allNodes = [];
    for (let tempNodesChange of tempNodesChanges) {
      const collabModelNode = tempNodesChange.doc.data();
      if (_allNodes.findIndex(node => node.id === tempNodesChange.doc.id) === -1) {
        _allNodes.push({ id: tempNodesChange.doc.id, ...collabModelNode });
      }
      if (g.nodes().some(node => node === tempNodesChange.doc.id)) continue;

      g.setNode(tempNodesChange.doc.id, {
        label: collabModelNode.title,
        class:
          collabModelNode.type === "Negative Outcome"
            ? "type-NO"
            : collabModelNode.type === "Positive Outcome"
            ? "type-PO"
            : "type-DF"
      });
    }
    setAllNodes(_allNodes);

    for (let tempNodeChange of tempNodesChanges) {
      const collabModelNode = tempNodeChange.doc.data();
      if (!collabModelNode.children || !collabModelNode.children.length) continue;
      for (let elementChild of collabModelNode.children) {
        g.setEdge(tempNodeChange.doc.id, elementChild, {
          curve: d3.curveBasis
          /* ,
          style:
            elementChild.type === "Positive Effect"
              ? "stroke: #0cd894; fill: #0cd894;"
              : "stroke: #cc0119; fill: #cc0119;" */
        });
      }
    }

    g.nodes().forEach(function (v) {
      var node = g.node(v);
      if (node) {
        node.rx = node.ry = 5;
      }
    });

    var render = new dagreD3.render();

    const svg = d3.select("svg");
    const svgGroup = svg.append("g");

    render(svgGroup, g);
    svgGroup.selectAll("g.node").each(function (v) {
      var node = g.node(v);
      var nodeElement = d3.select(this);
      var nodeLabel = nodeElement.select("rect");
      var nodeBBox = nodeLabel.node().getBBox();

      var button = nodeElement
        .append("foreignObject")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", nodeBBox.width / 2 - 9)
        .attr("y", -nodeBBox.height / 2 - 9)
        .attr("class", "hide-button");

      var buttonBody = button
        .append("xhtml:body")
        .style("margin", "0px") // remove margin to better align the button
        .style("padding", "0px");

      buttonBody
        .append("xhtml:button")
        .style("background", "transparent") // transparent background
        .style("color", "black") // text color
        .style("border", "none") // no border
        .style("font-weight", "bold") // bold text
        .style("width", "100%")
        .style("height", "100%")
        .text("X") // change text to "X"
        .on("click", function (e) {
          e.stopPropagation(); // Prevent triggering the node click event
          // toggleNodeVisibility(v);
        });
    });

    const zoom = d3.zoom().on("zoom", function (d) {
      svgGroup.attr("transform", d3.zoomTransform(this));
    });
    svg.call(zoom);
    const nodes = svg.selectAll("g.node");
    nodes.on("click", function (d) {
      modifyNode(d.target.__data__);
    });
    // nodes.on("mouseover", function (d) {
    //   showDetails(d.target.__data__);
    //   handlePopoverOpen(d);
    // });
    var edges = svg.selectAll("g.edgePath");
    edges.on("click", function (d) {});
    return () => {
      d3.select("#graphGroup").selectAll("*").remove();
    };
  }, [nodesLoded]);

  const AddNewNode = second => {
    setOpenAddNode(true);
  };
  const handleClose = () => {
    setTitle("");
    setType("");
    setChildren([]);
    setOpenAddNode(false);
    setDeleteDialogOpen(false);
  };
  const handleSave = async () => {
    if (!selectedNode) {
      const collabModelRef = firebase.firestore().collection("collabModelNodes").doc();
      await collabModelRef.set({
        title,
        type: type,
        children: children.map(child => child.id)
      });
    } else {
      const collabModelRef = firebase.firestore().collection("collabModelNodes").doc(selectedNode);
      await collabModelRef.update({ title, type, children: children.map(child => child.id) });
    }
    setOpenAddNode(false);
    setLoadData(true);
  };

  const changeExplanation = event => {
    setExplanation(event.target.value);
  };

  const modifyNode = async nodeId => {
    const nodeDoc = await firebase.firestore().collection("collabModelNodes").doc(nodeId).get();
    const node = nodeDoc.data();
    const childrenNodes = await firebase.firestore().collection("collabModelNodes").get();
    const _children = [];
    for (let _nodeDoc of childrenNodes.docs) {
      const _node = _nodeDoc.data();
      if (node.children.includes(_nodeDoc.id)) {
        _children.push({ id: _nodeDoc.id, ..._node });
      }
    }
    setChildren(_children);
    setTitle(node.title);
    setType(node.type);
    setSelectedNode(nodeId);
    setOpenAddNode(true);
  };

  const deleteNode = async () => {
    if (!selectedNode) return;
    const nodeRef = firebase.firestore().collection("collabModelNodes").doc(selectedNode);
    for (let node of allNodes) {
      const _children = node.children;
      if (node.children.includes(selectedNode)) {
        _children.splice(_children.indexOf(selectedNode), 1);
        const _nodeRef = firebase.firestore().collection("collabModelNodes").doc(node.id);
        await _nodeRef.update({ children: _children });
      }
    }
    await nodeRef.delete();
    setOpenAddNode(false);
    setDeleteDialogOpen(false);
    setLoadData(true);
  };

  const showDetails = async nodeId => {
    const nodeDoc = await firebase.firestore().collection("collabModelNodes").doc(nodeId).get();
    const node = nodeDoc.data();
    setPopoverTitle(node.title);
    setPopoverType(node.type);
  };
  const handlePopoverOpen = event => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  return (
    <div>
      <Dialog open={deleteDialogOpen} onClose={handleClose}>
        <DialogActions>
          <Button onClick={deleteNode}>Confirm</Button>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
            }}
            autoFocus
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddNode} onClose={handleClose} sx={{ fontWeight: "50px" }}>
        <DialogContent>
          <IconButton
            color="error"
            aria-label="delete"
            onClick={() => {
              setDeleteDialogOpen(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
          <Box
            component="form"
            sx={{
              "& > :not(style)": { m: 1, width: "25ch" }
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              label="Title"
              variant="outlined"
              value={title}
              onChange={e => {
                setTitle(e.currentTarget.value);
              }}
            />
            <FormControl>
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                label="Type"
                onChange={e => {
                  setType(e.target.value);
                }}
                sx={{ width: "100%", color: "black", border: "1px", borderColor: "white" }}
              >
                {["Positive Outcome", "Negative Outcome", "Design Features"].map(row => (
                  <MenuItem key={row} value={row} sx={{ display: "center" }}>
                    {row}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>children</InputLabel>
              <Select
                label="children"
                value={children}
                multiple
                onChange={e => {
                  setChildren(e.target.value);
                }}
                sx={{ width: "100%", color: "black", border: "1px", borderColor: "white" }}
              >
                {allNodes.map(node => (
                  <MenuItem key={node.id} value={node} sx={{ display: "center" }}>
                    {node.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={handleClose} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <Paper elevation={3} sx={{ mt: "10px", ml: "10px" }}>
            <svg id="graphGroup" width="100%" height="900" ref={svgRef} style={{ padding: "15px" }}></svg>
            <Box sx={{ display: "flex", marginBottom: "15px" }}>
              {[
                { text: "Design Features", color: "#33b9f7" },
                { text: "Positive Outcome", color: "#4caf50" },
                { text: "Negative Outcome", color: "#cc0119" }
              ].map((resource, index) => (
                <ColorBox key={resource.text} text={resource.text} color={resource.color} />
              ))}
              {[
                { text: "Known Positive Effect", color: "#1b5e20" },
                { text: "Hypothetical Positive Effect", color: "#8bc34a" },
                { text: "Known Negative Effect", color: "#b71c1c" },
                { text: "Hypothetical Negative Effect", color: "#e57373" }
              ].map((resource, index) => (
                <Grid key={resource.text} container alignItems="center" spacing={0.5}>
                  <Grid item>
                    <TrendingFlatIcon style={{ fontSize: "48px", color: resource.color }} />
                  </Grid>
                  <Grid item>
                    <Typography> {resource.text}</Typography>
                  </Grid>
                </Grid>
              ))}
            </Box>
          </Paper>
          <Box sx={{ display: "flex", marginBottom: "15px" }}></Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ pt: "10px", width: "90%", height: "80%" }}>
            <TextareaAutosize
              aria-label="empty textarea"
              placeholder="Write your explanation here..."
              value={explanation}
              onChange={changeExplanation}
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
          <Box elevation={3} sx={{ mt: "50px" }}>
            <Button sx={{ ml: "30px" }} variant="contained" onClick={AddNewNode}>
              Add New Node
            </Button>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default OneCademyCollaborationModel;
