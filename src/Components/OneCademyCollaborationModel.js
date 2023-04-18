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
import { Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
const d3 = require("d3");

const legends = [
  { text: "Known Positive Effect", color: "#56E41B" },
  { text: "Hypothetical Positive Effect", color: "#1BBAE4" },
  { text: "Known Negative Effect", color: "#A91BE4" },
  { text: "Hypothetical Negative Effect", color: "#E4451B" }
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
  const [explanationLink, setExplanationLink] = useState("");
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
  const [zoomState, setZoomState] = useState(null);
  const [linkOrder, setLinkOrder] = useState(null);
  const [stepLink, setStepLink] = useState(0);
  const [maxDepth, setMaxDepth] = useState(0);
  const [ingnorOrder, setIngnorOrder] = useState(false);
  const [deleteDialogLinkOpen, setDeleteDialogLinkOpen] = useState(false);
  const editor = true;

  function ColorBox(props) {
    return (
      <Box
        sx={{
          bgcolor: props.color,
          color: "primary.contrastText",
          p: 0.7,
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
    var g = new dagreD3.graphlib.Graph({ compound: true })
      .setGraph({ rankdir: "LR", isMultigraph: true })
      .setDefaultEdgeLabel(function () {
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
          selectedNode === tempNodesChange.doc.id
            ? "type-ST"
            : collabModelNode.type === "Negative Outcome"
            ? "type-NO"
            : collabModelNode.type === "Positive Outcome"
            ? "type-PO"
            : "type-DF"
      });
    }
    _allNodes.sort((a, b) => (a.title > b.title ? 1 : -1));
    setAllNodes(_allNodes);
    let _maxDepth = 0;
    for (let tempNodeChange of tempNodesChanges) {
      const collabModelNode = tempNodeChange.doc.data();
      if (!collabModelNode.children || !collabModelNode.children.length) continue;
      for (let elementChild of collabModelNode.children) {
        if (_maxDepth < elementChild?.order) {
          _maxDepth = elementChild?.order;
        }
        let color = legends.find(legend => legend.text === elementChild.type)?.color || "";
        let _arrowheadStyle = `fill: ${color}`;
        let _style = `stroke: ${color}; stroke-width: 2px;`;

        if (!visibleNodes.includes(elementChild.id) || !visibleNodes.includes(tempNodeChange.doc.id)) continue;
        if (parseInt(elementChild.order) === stepLink && stepLink !== 0) {
          _style = `stroke:${color}; stroke-width: 3px;filter: drop-shadow(3px 3px 5px ${color}); stroke-width: 2.7px;`;
        }
        if (selectedLink.v === tempNodeChange.doc.id && selectedLink.w === elementChild.id) {
          _style = "stroke: #212121; stroke-width: 3px; filter: drop-shadow(3px 3px 5px #212121); stroke-width: 2.7px;";
          _arrowheadStyle = "fill: #212121";
        }
        if (ingnorOrder || showAll || (parseInt(elementChild.order) > 0 && parseInt(elementChild.order) <= stepLink)) {
          g.setEdge(tempNodeChange.doc.id, elementChild.id, {
            label: elementChild.order,
            curve: d3.curveBasis,
            style: _style,
            arrowheadStyle: _arrowheadStyle
          });
        }
      }
    }
    setMaxDepth(_maxDepth);
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
      if (selectedNode || openAddNode) {
        var button2 = nodeElement
          .append("foreignObject")
          .attr("width", 20)
          .attr("height", 20)
          .attr("x", nodeBBox.x + nodeBBox.width / 2 - 10)
          .attr("y", nodeBBox.y - 10)
          .attr("class", "hide-button");

        var buttonBody2 = button2.append("xhtml:body").style("margin", "0px").style("padding", "0px");
        if (childrenIds.includes(v)) {
          buttonBody2
            .append("xhtml:button")
            .style("background", "white")
            .style("color", "black")
            .style("border", "1px solid black")
            .style("border-radius", "50%")
            .style("width", "20px")
            .style("height", "20px")
            .style("font-weight", "bold")
            .style("font-size", "25px")
            .style("line-height", "2px")
            .style("padding", "0")
            .style("text-align", "center")
            .text("-")
            .on("click", function (e) {
              e.stopPropagation();
              removeChild(v);
            });
        } else {
          buttonBody2
            .append("xhtml:button")
            .style("background", "white")
            .style("color", "black")
            .style("border", "1px solid black")
            .style("border-radius", "50%")
            .style("width", "20px")
            .style("height", "20px")
            .style("font-weight", "bold")
            .style("font-size", "25px")
            .style("line-height", "2px")
            .style("padding", "0")
            .style("text-align", "center")
            .text("+")
            .on("click", function (e) {
              e.stopPropagation();
              addChild(v);
            });
        }
      }
    });

    const zoom = d3.zoom().on("zoom", function (d) {
      svgGroup.attr("transform", d3.zoomTransform(this));
      setZoomState(d3.zoomTransform(this));
    });
    svg.call(zoom);
    if (visibleNodes.length >= 8) {
      const svgWidth = (window.innerWidth * 70) / 100;
      const svgHeight = 600;
      const graphWidth = g.graph().width + 50;
      const graphHeight = g.graph().height + 50;

      const zoomScale = Math.min(svgWidth / graphWidth, svgHeight / graphHeight);
      const translateX = (svgWidth - graphWidth * zoomScale) / 2;
      const translateY = (svgHeight - graphHeight * zoomScale) / 2;

      svg.call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(zoomScale));
    }

    const nodes = svg.selectAll("g.node");
    if (editor) {
      nodes.on("click", function (d) {
        d.stopPropagation();
        modifyNode(d.target.__data__);
      });
    }
    var edges = svg.selectAll("g.edgePath");

    edges.on("click", function (d) {
      // d.target.event.stopPropagation();
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
      setZoomState(null);
    };
  }, [nodesLoded]);

  const AddNewNode = second => {
    setTitle("");
    setType("");
    setChildrenIds([]);
    setSelectedNode("");
    setSelectedLink({});
    setDeleteDialogOpen(false);
    setOpenAddNode(true);
    setLoadData(true);
    setOpenModifyLink(false);
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
    const _visibleNodes = [...visibleNodes];
    try {
      if (!selectedNode) {
        const children = [];
        for (let child of childrenIds) {
          children.push({
            id: child,
            explanation: "",
            type: "Hypothetical Positive Effect",
            order: 0
          });
          _visibleNodes.push(child);
        }
        const collabModelRef = firebase.firestore().collection("collabModelNodes").doc();
        await collabModelRef.set({
          title,
          type: type,
          children
        });
        _visibleNodes.push(collabModelRef.id);
      } else {
        const collabModelRef = firebase.firestore().collection("collabModelNodes").doc(selectedNode);
        const collabModelDoc = await collabModelRef.get();
        const collabModelNode = collabModelDoc.data();
        let _childrenCollab = collabModelNode.children;
        _childrenCollab = _childrenCollab.filter(child => childrenIds.includes(child.id));

        childrenIds.forEach(childId => {
          if (_childrenCollab.some(_child => _child.id === childId)) return;

          _childrenCollab.push({
            id: childId,
            explanation: "",
            type: "Hypothetical Positive Effect"
          });
          _visibleNodes.push(childId);
        });
        await collabModelRef.update({ title, type, children: _childrenCollab });
      }
    } catch (error) {
      console.log(error);
    }
    setVisibleNodes(_visibleNodes);
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
    setExplanationLink(child.explanation);
    setPopoverType(child.type);
    if (child.explanation !== "") {
      setSelectedLink(data);
    }
    setLoadData(true);
  };

  const handleVisibileNodes = node => {
    const _visibleNodes = visibleNodes;
    setShowAll(false);
    setIngnorOrder(true);
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
    let _showall = true;
    for (let node of allNodes) {
      if (!_visibleNodes.includes(node.id)) {
        _showall = false;
        break;
      }
    }
    setShowAll(_showall);
    setVisibleNodes(_visibleNodes);
    setLoadData(true);
    setStepLink(0);
  };

  const handleCloseLink = () => {
    setOpenModifyLink(false);
    setExplanation("");
    setTypeLink("");
    setSelectedLink({});
    setLoadData(true);
    setLinkOrder(null);
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
    setLinkOrder(child.order);
    setOpenModifyLink(true);
    setOpenAddNode(false);
    setLoadData(true);
    setSelectedNode("");
  };

  const handleSaveLink = async () => {
    firebase.db.runTransaction(async t => {
      const nodeId = selectedLink.v;
      const childId = selectedLink.w;
      const nodeRef = firebase.firestore().collection("collabModelNodes").doc(nodeId);
      const nodeDoc = await t.get(nodeRef);
      const nodeData = nodeDoc.data();
      const children = nodeData.children;
      const child = children.find(child => child.id === childId);
      if (child.order !== linkOrder) {
        if (child.order === 0) {
          for (let node of allNodes) {
            const _children = node.children;
            for (let _child of _children) {
              if (_child.order >= linkOrder) {
                _child.order = parseInt(_child.order) + 1;
              }
              if (nodeId === node.id && _child.id === child.id) {
                _child.order = linkOrder;
                _child.explanation = explanation;
                _child.type = typeLink;
              }
            }
            const nodeRef = firebase.firestore().collection("collabModelNodes").doc(node.id);
            t.update(nodeRef, { children: _children });
          }
        } else {
          for (let node of allNodes) {
            const _children = node.children;

            if (child.order < linkOrder) {
              for (let _child of _children) {
                if (_child.order === 7) {
                  debugger;
                }
                if (_child.order > child.order && _child.order <= linkOrder) {
                  _child.order = parseInt(_child.order) - 1;
                } else if (_child.order === child.order) {
                  _child.order = linkOrder;
                  _child.explanation = explanation;
                  _child.type = typeLink;
                }
              }
            }
            if (linkOrder < child.order) {
              for (let _child of _children) {
                if (_child.order >= linkOrder && _child.order < child.order) {
                  _child.order = parseInt(_child.order) + 1;
                } else if (_child.order === child.order) {
                  _child.order = linkOrder;
                  _child.explanation = explanation;
                  _child.type = typeLink;
                }
              }
            }
            const nodeRef = firebase.firestore().collection("collabModelNodes").doc(node.id);
            t.update(nodeRef, { children: _children });
          }
        }
      }
      if (linkOrder > stepLink) {
        setStepLink(linkOrder);
      }
      setLinkOrder(null);
      setOpenModifyLink(false);
      setSelectedLink({});
      setExplanation("");
      setTypeLink("");
      setLoadData(true);
    });
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
    setStepLink(0);
  };

  const handleInputValidation = event => {
    const value = event.target.value;
    const cleanedValue = value.replace(/[^0-9.]+/g, "");
    event.target.value = cleanedValue;
    setLinkOrder(parseInt(cleanedValue));
  };

  const nextLink = () => {
    const _visibleNodes = [];
    allNodes.forEach(node => {
      node.children.forEach(child => {
        if (stepLink + 1 >= child.order && child.order !== 0) {
          if (!_visibleNodes.includes(child.id)) {
            _visibleNodes.push(child.id);
          }
          if (!_visibleNodes.includes(node.id)) {
            _visibleNodes.push(node.id);
          }
        }
      });
    });
    setStepLink(prevActiveStep => (prevActiveStep + 1 < maxDepth ? prevActiveStep + 1 : maxDepth));
    setVisibleNodes(_visibleNodes);
    setLoadData(true);
    setShowAll(false);
    setIngnorOrder(false);
  };
  const previousLink = () => {
    const _visibleNodes = [];
    allNodes.forEach(node => {
      node.children.forEach(child => {
        if (stepLink - 1 >= child.order && child.order !== 0) {
          if (!_visibleNodes.includes(child.id)) {
            _visibleNodes.push(child.id);
          }
          if (!_visibleNodes.includes(node.id)) {
            _visibleNodes.push(node.id);
          }
        }
      });
    });
    setVisibleNodes(_visibleNodes);
    setStepLink(prevActiveStep => (prevActiveStep - 1 > 0 ? prevActiveStep - 1 : 0));
    setLoadData(true);
    setShowAll(false);
    setIngnorOrder(false);
  };
  const deleteLink = async () => {
    const nodeId = selectedLink.v;
    const childId = selectedLink.w;
    const nodeRef = firebase.firestore().collection("collabModelNodes").doc(nodeId);
    const nodeDoc = await nodeRef.get();
    const nodeData = nodeDoc.data();
    const children = nodeData.children.filter(child => child.id !== childId);
    await nodeRef.update({ children });
    setDeleteDialogLinkOpen(false);
    setOpenModifyLink(false);
    setExplanation("");
    setTypeLink("");
    setSelectedLink({});
    setLoadData(true);
    setLinkOrder(null);
  };

  const addChild = child => {
    const _childIds = childrenIds;
    if (_childIds.includes(child)) return;
    _childIds.push(child);
    setChildrenIds(_childIds);
    setLoadData(true);
  };
  const removeChild = child => {
    const _childIds = childrenIds;
    if (!_childIds.includes(child)) return;
    _childIds.splice(_childIds.indexOf(child), 1);
    setChildrenIds(_childIds);
    setLoadData(true);
  };
  return (
    <Box sx={{ height: "100vh", overflow: "auto" }}>
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
      <Dialog open={deleteDialogLinkOpen} onClose={handleClose}>
        <DialogActions>
          <Button onClick={deleteLink}>Confirm</Button>
          <Button
            onClick={() => {
              setDeleteDialogLinkOpen(false);
            }}
            autoFocus
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={2} direction="row-reverse">
        <Grid item xs={9}>
          <Paper
            id="graphPaper"
            sx={{ mt: "10px", ml: "10px", height: "600px", width: "900", display: "flex", justifyContent: "center" }}
          >
            {visibleNodes.length > 0 ? (
              <svg id="graphGroup" width="100%" height="98%" ref={svgRef} style={{ marginTop: "15px" }}></svg>
            ) : (
              <div
                style={{
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Typography align="center" variant="h7">
                  To show the nodes in the diagram, check them in the list.
                </Typography>
              </div>
            )}
          </Paper>
          <Box sx={{ ml: "14px", mt: "14px" }}>
            {openModifyLink && editor && (
              <Box sx={{ display: "flex", flexDirection: "inline" }}>
                <TextField
                  label="Explanation"
                  variant="outlined"
                  value={explanation}
                  onChange={handlExplanation}
                  fullWidth
                  sx={{ mt: "9px" }}
                />
                <Box
                  component="form"
                  sx={{
                    "& > :not(style)": { m: 1, width: "25ch" }
                  }}
                  noValidate
                  autoComplete="off"
                >
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
                  <TextField
                    label="Order"
                    type="number"
                    value={linkOrder}
                    inputProps={{
                      min: "1",
                      step: "1"
                    }}
                    onChange={handleInputValidation}
                  />
                </Box>
                <Box>
                  <Button onClick={handleSaveLink}>Save</Button>
                  <Button onClick={handleCloseLink} autoFocus>
                    Cancel
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setDeleteDialogLinkOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
            {openModifyLink && !editor && explanationLink !== "" && (
              <Typography sx={{ p: 2 }}>{explanationLink}</Typography>
            )}
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
                        <MenuItem key={node.id + node.title} value={node.id} sx={{ display: "center" }}>
                          {node.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: "14px" }}>
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
                  { text: "Input", color: "#1976d2" },
                  { text: "Positive Outcome", color: "#4caf50" },
                  { text: "Negative Outcome", color: "#cc0119" }
                ].map((resource, index) => (
                  <ColorBox key={resource.text} text={resource.text} color={resource.color} />
                ))}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  sx={{ ml: "30px", mb: "20px", display: "flex", justifyContent: "flex-end" }}
                  variant="contained"
                  onClick={previousLink}
                  disabled={stepLink === 0}
                >
                  Previous
                </Button>
                <Button
                  sx={{ ml: "30px", mb: "20px", display: "flex", justifyContent: "flex-end" }}
                  variant="contained"
                  onClick={nextLink}
                  disabled={stepLink === maxDepth}
                >
                  Next
                </Button>
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
              <Box sx={{ display: "flex" }}>
                {[
                  { text: "Known Positive Effect", color: "#56E41B" },
                  { text: "Hypothetical Positive Effect", color: "#1BBAE4" },
                  { text: "Known Negative Effect", color: "#A91BE4" },
                  { text: "Hypothetical Negative Effect", color: "#E4451B" }
                ].map((resource, index) => (
                  <div style={{ marginInline: "14px" }}>
                    <TrendingFlatIcon style={{ fontSize: "40px", color: resource.color }} />
                    <Typography sx={{ fontSize: "14px", color: resource.color }}> {resource.text}</Typography>
                  </div>
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box
            sx={{
              height: "100vh",
              mb: "10px",
              overflow: "auto"
            }}
          >
            <Box sx={{ position: "sticky", top: "0", zIndex: "1", backgroundColor: "white", p: 1, ml: "5px" }}>
              {" "}
              <Typography
                sx={{
                  fontWeight: "bold"
                }}
              >
                Choose nodes to show their causal relations.
              </Typography>{" "}
              Show All the Nodes <Checkbox checked={showAll} onClick={showAllNodes} />
            </Box>

            {allNodes.map((node, index) => (
              <ListItem
                key={node.title + index}
                disablePadding
                sx={{
                  "&$selected": {
                    backgroundColor: "orange",
                    zIndex: 100,
                    ml: 9
                  }
                }}
              >
                <Checkbox
                  checked={visibleNodes.includes(node.id)}
                  onClick={() => {
                    handleVisibileNodes(node);
                  }}
                />
                <ListItemText id={node.title} primary={`${node.title}`} />
              </ListItem>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
export default OneCademyCollaborationModel;
