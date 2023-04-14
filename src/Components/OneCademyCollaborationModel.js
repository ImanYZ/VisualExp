import React, { useRef, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { emailState, firebaseState } from "../store/AuthAtoms";
import Button from "@mui/material/Button";
import dagreD3 from "dagre-d3";
import "./OneCademyCollaborationModel.css";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
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
import { ButtonUnstyled } from "@mui/base";
import { Container } from "@mui/system";
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
    style: "stroke: #ef6c00; stroke-width: 2px;",
    arrowheadStyle: "fill: #ef6c00"
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
  const [showAll, setShowAll] = useState(false);
  const email = useRecoilValue(emailState);
  const editor = true; /* email === "oneweb@umich.edu" */

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
      if (!visibleNodes.includes(tempNodesChange.doc.id)) continue;
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
        let _style = legends.find(legend => legend.text === elementChild.type)?.style || "";
        let _arrowheadStyle =
          legends.find(legend => legend.text === elementChild.type)?.arrowheadStyle || "fill: #0cd894";
        if (!visibleNodes.includes(elementChild.id) || !visibleNodes.includes(tempNodeChange.doc.id)) continue;
        if (selectedLink.v === tempNodeChange.doc.id && selectedLink.w === elementChild.id) {
          _style = "stroke: #0000ff; stroke-width: 3px;";
          _arrowheadStyle = "fill: #0000ff";
        }
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

      var buttonBody = button.append("xhtml:body").style("margin", "0px").style("padding", "0px");

      buttonBody
        .append("xhtml:button")
        .style("background", "transparent")
        .style("color", "black")
        .style("border", "none")
        .style("font-weight", "bold")
        .style("width", "100%")
        .style("height", "100%")
        .text("X")
        .on("click", function (e) {
          e.stopPropagation();
          removeNode(v);
        });
    });

    const zoom = d3.zoom().on("zoom", function (d) {
      svgGroup.attr("transform", d3.zoomTransform(this));
    });
    svg.call(zoom);
    const nodes = svg.selectAll("g.node");
    if (editor) {
      nodes.on("click", function (d) {
        modifyNode(d.target.__data__);
      });
    }
    var edges = svg.selectAll("g.edgePath");

    edges.on("pointerdown", function (d) {
      if (editor) {
        setSelectedLink({});
        modifyLink(d.target.__data__);
      } else {
        setSelectedLink({});
        showDetails(d.target.__data__);
        setOpenModifyLink(true);
        setOpenAddNode(false);
      }
    });

    setNodesLoded(false);
    return () => {
      d3.select("#graphGroup").selectAll("*").remove();
    };
  }, [nodesLoded]);

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
    setSelectedLink({});
    setDeleteDialogOpen(false);
    setLoadData(true);
  };

  const handleSave = async () => {
    const children = [];
    for (let child of childrenIds) {
      children.push({
        id: child,
        explanation: "",
        type: "Hypothetical Positive Effect"
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
    setSelectedLink({});
    setOpenAddNode(true);
    setOpenModifyLink(false);
    setLoadData(true);
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

  const showDetails = async data => {
    const nodeId = data.v;
    const childId = data.w;
    const nodeDoc = await firebase.firestore().collection("collabModelNodes").doc(nodeId).get();
    const nodeData = nodeDoc.data();
    const children = nodeData.children;
    const child = children.find(child => child.id === childId);
    setPopoverTitle(child.explanation);
    setPopoverType(child.type);
    if (child.explanation !== "") {
      setSelectedLink(data);
    }
    setLoadData(true);
  };

  const handleVisibileNodes = node => {
    const _visibleNodes = visibleNodes;
    if (_visibleNodes.includes(node.id)) {
      _visibleNodes.splice(_visibleNodes.indexOf(node.id), 1);
    } else {
      _visibleNodes.push(node.id);
      for (let child of node.children) {
        if (!_visibleNodes.includes(child.id)) {
          _visibleNodes.push(child.id);
        }
      }
    }
    setVisibleNodes(_visibleNodes);
    setLoadData(true);
  };

  const handleCloseLink = () => {
    setOpenModifyLink(false);
    setExplanation("");
    setTypeLink("");
    setSelectedLink({});
    setLoadData(true);
  };

  const modifyLink = async data => {
    const nodeId = data.v;
    const childId = data.w;
    const nodeDoc = await firebase.firestore().collection("collabModelNodes").doc(nodeId).get();
    const nodeData = nodeDoc.data();
    const children = nodeData.children;
    const child = children.find(child => child.id === childId);
    setExplanation(child.explanation);
    setTypeLink(child.type);
    setSelectedLink(data);
    setOpenModifyLink(true);
    setOpenAddNode(false);
    setLoadData(true);
  };

  const handleSaveLink = async () => {
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
    setOpenModifyLink(false);
    setSelectedLink({});
    setExplanation("");
    setTypeLink("");
    setLoadData(true);
  };

  const removeNode = nodeId => {
    const _visibleNodes = visibleNodes;
    if (_visibleNodes.includes(nodeId)) {
      _visibleNodes.splice(_visibleNodes.indexOf(nodeId), 1);
    }
    setVisibleNodes(_visibleNodes);
    setLoadData(true);
  };
  const handlExplanation = e => {
    setExplanation(e.currentTarget.value);
  };
  const showAllNodes = () => {
    let _visibleNodes = visibleNodes;
    if (showAll) {
      _visibleNodes = [];
      setShowAll(false);
    } else {
      for (let node of allNodes) {
        if (!_visibleNodes.includes(node.id)) {
          _visibleNodes.push(node.id);
        }
      }
      setShowAll(true);
    }
    setVisibleNodes(_visibleNodes);
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

      <Grid container spacing={2}>
        <Grid item xs={9}>
          <Paper elevation={3} sx={{ mt: "10px", ml: "10px", height: "600px" }}>
            <svg id="graphGroup" width="100%" height="98%" ref={svgRef} style={{ marginTop: "15px" }}></svg>
          </Paper>
          <Box sx={{ ml: "14px", mt: "14px" }}>
            {openModifyLink && editor && (
              <Box sx={{ display: "flex", flexDirection: "inline" }}>
                <Box
                  component="form"
                  sx={{
                    "& > :not(style)": { m: 1, width: "25ch" }
                  }}
                  noValidate
                  autoComplete="off"
                >
                  <TextField label="Explanation" variant="outlined" value={explanation} onChange={handlExplanation} />
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
                <Box>
                  <Button onClick={handleSaveLink}>Save</Button>
                  <Button onClick={handleCloseLink} autoFocus>
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
            {openModifyLink && !editor && popoverTitle !== "" && <Typography sx={{ p: 2 }}>{popoverTitle}</Typography>}
            {openAddNode && (
              <Box sx={{ display: "flex", flexDirection: "inline" }}>
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
                <Box>
                  <Button onClick={handleSave}>Save</Button>
                  <Button onClick={handleClose} autoFocus>
                    Cancel
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
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
                  { text: "Hypothetical Negative Effect", color: "#ef6c00" }
                ].map((resource, index) => (
                  <div style={{ marginInline: "14px" }}>
                    <TrendingFlatIcon style={{ fontSize: "40px", color: resource.color }} />
                    <Typography sx={{ fontSize: "14px", color: resource.color }}> {resource.text}</Typography>
                  </div>
                ))}
                {editor && (
                  <Button
                    sx={{ ml: "30px", mb: "20px", display: "flex", justifyContent: "flex-end" }}
                    variant="contained"
                    onClick={AddNewNode}
                  >
                    Add New Node
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box
            sx={{
              height: "950px",
              overflow: "auto"
            }}
          >
            <Typography
              sx={{
                position: "sticky",
                top: "0",
                zIndex: "1",
                backgroundColor: "white"
              }}
            >
              Choose nodes to show their causal relations.
              <br />
              <Checkbox checked={showAll} onClick={showAllNodes} /> Show All the Nodes
            </Typography>

            {allNodes.map((node, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{
                  "&$selected": {
                    backgroundColor: "orange",
                    zIndex: 100
                  }
                }}
              >
                <ListItemButton
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
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OneCademyCollaborationModel;
