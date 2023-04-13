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
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";

const d3 = require("d3");

const legends = [
  { text: "Known Positive Effect", style: "stroke: #1b5e20; stroke-width: 2px;", arrowheadStyle: "fill: #1b5e20" },
  {
    text: "Hypothetical Positive Effect",
    style: "stroke: #8bc34a; stroke-width: 2px;",
    arrowheadStyle: "fill: #8bc34a"
  },
  { text: "Known Negative Effect", style: "stroke: #b71c1c; stroke-width: 2px;", arrowheadStyle: "fill: #b71c1c" },
  {
    text: "Hypothetical Negative Effect",
    style: "stroke: #e57373; stroke-width: 2px;",
    arrowheadStyle: "fill: #e57373"
  }
];

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
  const [childrenIds, setChildrenIds] = useState([]);
  const [loadData, setLoadData] = useState(false);
  const [selectedNode, setSelectedNode] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [visibleNodes, setVisibleNodes] = useState([]);
  const [openModifyLink, setOpenModifyLink] = useState(false);
  const [typeLink, setTypeLink] = useState("");
  const [selectedLink, setSelectedLink] = useState({});
  function ColorBox(props) {
    return (
      <Box
        sx={{
          bgcolor: props.color,
          color: "primary.contrastText",
          p: 1,
          fontSize: 14,
          borderRadius: 2,
          maxWidth: 90,
          mr: 1,
          mb: 1,
          textAlign: "center"
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
        const _style = legends.find(legend => legend.text === elementChild.type)?.style || "";
        const _arrowheadStyle =
          legends.find(legend => legend.text === elementChild.type)?.arrowheadStyle || "fill: #0cd894";
        g.setEdge(tempNodeChange.doc.id, elementChild.id, {
          curve: d3.curveBasis,
          style: _style,
          arrowheadStyle: _arrowheadStyle
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
          toggleNodeVisibility(v);
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
    edges.on("click", function (d) {
      modifyLink(d.target.__data__);
      console.log(d.target.__data__);
    });
    setNodesLoded(false);
    return () => {
      d3.select("#graphGroup").selectAll("*").remove();
    };
  }, [nodesLoded]);
  console.log("allNodes", nodesLoded);

  const toggleNodeVisibility = v => {};

  const AddNewNode = second => {
    setOpenAddNode(true);
  };
  const handleClose = () => {
    setTitle("");
    setType("");
    setChildrenIds([]);
    setSelectedNode("");
    setOpenAddNode(false);
    setDeleteDialogOpen(false);
  };

  const handleSave = async () => {
    const children = [];
    for (let child of childrenIds) {
      children.push({
        id: child,
        explanation: "",
        type: ""
      });
    }
    if (!selectedNode) {
      const collabModelRef = firebase.firestore().collection("collabModelNodes").doc();
      await collabModelRef.set({
        title,
        type: type,
        children
      });
    } else {
      const collabModelRef = firebase.firestore().collection("collabModelNodes").doc(selectedNode);
      await collabModelRef.update({ title, type, children });
    }
    setOpenAddNode(false);
    setLoadData(true);
    setTitle("");
    setType("");
    setChildrenIds([]);
    setSelectedNode("");
    setOpenAddNode(false);
    setDeleteDialogOpen(false);
  };

  const modifyNode = async nodeId => {
    const nodeDoc = await firebase.firestore().collection("collabModelNodes").doc(nodeId).get();
    const node = nodeDoc.data();
    const childrenNodes = await firebase.firestore().collection("collabModelNodes").get();
    const _children = [];
    for (let _nodeDoc of childrenNodes.docs) { 
      if (node.children.some(child => child.id === _nodeDoc.id)) {
        _children.push(_nodeDoc.id);
      }
    }
    setChildrenIds(_children);
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
        const index = node.children.findIndex(child => child.id === selectedNode);
        _children.splice(_children.indexOf(index), 1);
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
  console.log("render", allNodes);
  const handleVisibileNodes = node => {
    const _visibleNodes = visibleNodes;
    if (_visibleNodes.includes(node.id)) {
      _visibleNodes.splice(_visibleNodes.indexOf(node.id), 1);
    } else {
      _visibleNodes.push(node.id);
    }
    setVisibleNodes(_visibleNodes);
    console.log("visibleNodes", _visibleNodes);
  };

  const handleCloseLink = () => {
    setOpenModifyLink(false);
    setExplanation("");
    setTypeLink("");
    setSelectedLink({});
  };

  const modifyLink = async data => {
    console.log("data", data);
    const nodeId = data.v;
    const childId = data.w;
    const nodeDoc = await firebase.firestore().collection("collabModelNodes").doc(nodeId).get();
    const nodeData = nodeDoc.data();
    console.log("nodeData", nodeData);
    const children = nodeData.children;
    const child = children.find(child => child.id === childId);
    setExplanation(child.explanation);
    setTypeLink(child.type);
    setSelectedLink(data);
    setOpenModifyLink(true);
  };
  const handleSaveLink = async () => {
    console.log("save link", explanation, typeLink);
    const nodeId = selectedLink.v;
    const childId = selectedLink.w;
    const nodeRef = firebase.firestore().collection("collabModelNodes").doc(nodeId);
    const nodeDoc = await nodeRef.get();
    const nodeData = nodeDoc.data();
    const children = nodeData.children;
    const child = children.find(child => child.id === childId);
    child.explanation = explanation;
    child.type = typeLink;
    await nodeRef.update({ children });
    console.log(child);
    console.log("nodeData", nodeData);
    setOpenModifyLink(false);
    setSelectedLink({});
    setExplanation("");
    setTypeLink("");
    setLoadData(true);
  };
  return (
    <Box>
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
      <Dialog open={openModifyLink} onClose={handleCloseLink} sx={{ fontWeight: "50px" }}>
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
              label="Explanation"
              variant="outlined"
              value={explanation}
              onChange={e => {
                setExplanation(e.currentTarget.value);
              }}
            />
            <FormControl>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeLink}
                label="Type"
                onChange={e => {
                  setTypeLink(e.target.value);
                }}
                sx={{ width: "100%", color: "black", border: "1px", borderColor: "white" }}
              >
                {[
                  "Known Positive Effect",
                  "Hypothetical Positive Effect",
                  "Known Negative Effect",
                  "Hypothetical Negative Effect"
                ].map(row => (
                  <MenuItem key={row} value={row} sx={{ display: "center" }}>
                    {row}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveLink}>Save</Button>
          <Button onClick={handleCloseLink} autoFocus>
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
                value={childrenIds}
                multiple
                onChange={e => {
                  setChildrenIds(e.target.value);
                }}
                sx={{ width: "100%", color: "black", border: "1px", borderColor: "white" }}
              >
                {allNodes.map(node => (
                  <MenuItem key={node.id} value={node.id} sx={{ display: "center" }}>
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
        <Grid item xs={2}>
          {/* <Box sx={{ pt: "10px", width: "90%", p: 1, height: "800px" }}>
            {allNodes.map((node, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{
                  mb: "5px",
                  "&$selected": {
                    backgroundColor: "orange",
                    zIndex: 100
                  }
                }}
              >
                <ListItemButton
                  role={undefined}
                  style={{ width: 500 }}
                  onClick={() => {
                    handleVisibileNodes(node);
                  }}
                >
                  <ListItemIcon>
                    {visibleNodes.includes(node.id) ? <Checkbox checked={true} /> : <Checkbox checked={false} />}
                  </ListItemIcon>
                  <ListItemText id={node.title} primary={`${node.title}`} />
                </ListItemButton>
              </ListItem>
            ))}
          </Box> */}
          <Box elevation={3} sx={{ mt: "50px" }}>
            <Button sx={{ ml: "30px" }} variant="contained" onClick={AddNewNode}>
              Add New Node
            </Button>
          </Box>
        </Grid>
        <Grid item xs={9}>
          <Paper elevation={3} sx={{ mt: "10px", ml: "10px", height: "700px" }}>
            <svg id="graphGroup" width="100%" height="100%" ref={svgRef} style={{ padding: "15px" }}></svg>
            <Box>
              <Box sx={{ display: "flex" }}>
                {[
                  { text: "Design Features", color: "#1976d2" },
                  { text: "Positive Outcome", color: "#4caf50" },
                  { text: "Negative Outcome", color: "#cc0119" }
                ].map((resource, index) => (
                  <ColorBox key={resource.text} text={resource.text} color={resource.color} />
                ))}
              </Box>
              <Box sx={{ display: "flex" }}>
                {[
                  { text: "Known Positive Effect", color: "#1b5e20" },
                  { text: "Hypothetical Positive Effect", color: "#8bc34a" },
                  { text: "Known Negative Effect", color: "#b71c1c" },
                  { text: "Hypothetical Negative Effect", color: "#e57373" }
                ].map((resource, index) => (
                  <div style={{ marginInline: "14px" }}>
                    <TrendingFlatIcon style={{ fontSize: "40px", color: resource.color }} />
                    <Typography sx={{ fontSize: "14px", color: resource.color }}> {resource.text}</Typography>
                  </div>
                ))}
              </Box>
            </Box>
          </Paper>
          <Box sx={{ display: "flex", marginBottom: "15px" }}></Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OneCademyCollaborationModel;
