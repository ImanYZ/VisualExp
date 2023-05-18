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
import MenuIcon from "@mui/icons-material/Menu";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import LegendToggleIcon from "@mui/icons-material/LegendToggle";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "@mui/material/Drawer";
import EditIcon from "@mui/icons-material/Edit";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

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
  const [linkOrder, setLinkOrder] = useState(0);
  const [stepLink, setStepLink] = useState(0);
  const [maxDepth, setMaxDepth] = useState(0);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [ingnorOrder, setIngnorOrder] = useState(true);
  const [deleteDialogLinkOpen, setDeleteDialogLinkOpen] = useState(false);
  const [openLegend, setOpenLegend] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState("");
  const [newDiagramName, setNewDiagramName] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [listOfDiagrams, setListOfDiagrams] = useState([]);
  const [editingDiagram, setEditingDiagram] = useState(false);

  const editor = true; /* email === "oneweb@umich.edu" */

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const ColorBox = props => {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: props.color,
          color: "primary.contrastText",
          fontSize: 13,
          borderRadius: 2,
          maxWidth: 90,
          ml: 0.9,
          mr: 0.5,
          mb: 0.5,
          textAlign: "center",
          width: "100%",
          height: "40px"
        }}
        key={props.text}
      >
        {props.text}
      </Box>
    );
  };
  function addPencilButton(edgeElement, edgeData, pencilButtonsGroup, order) {
    let edgeLabel = edgeElement.select("path");
    let edgePath = edgeLabel.node();
    let pathLength = edgePath.getTotalLength();
    let positionRatio = 0.7;
    let point = edgePath.getPointAtLength(pathLength * positionRatio);

    let button = pencilButtonsGroup
      .append("foreignObject")
      .attr("width", 20)
      .attr("height", 20)
      .attr("x", point.x - 10)
      .attr("y", point.y - 10)
      .attr("class", "pencil-button")
      .style("z-index", "19999");

    let buttonBody = button.append("xhtml:body").style("margin", "0px").style("padding", "0px");

    buttonBody
      .append("xhtml:button")
      .style("background", "transparent")
      .style("color", "black")
      .style("border", "none")
      .style("font-weight", "bold")
      .style("width", "100%")
      .style("height", "100%")
      .text("✏️")
      .on("click", function (e) {
        e.stopPropagation();
        setSelectedLink({});
        modifyLink(edgeData);
      });
    // pencilButtonsGroup
    //   .append("text")
    //   .attr("class", "custom-text-color")
    //   .attr("x", point.x)
    //   .attr("y", point.y + 14)
    //   .attr("font-family", "Arial, sans-serif")
    //   .attr("font-size", "15px")
    //   .text(order);
  }

  useEffect(() => {
    const _listOfDiagrams = [...listOfDiagrams];
    const diagramsListQuery = firebase.db.collection("collabModelDiagrams");

    const diagramsListcSnapshot = diagramsListQuery.onSnapshot(snapshot => {
      const changes = snapshot.docChanges();
      for (let change of changes) {
        if (change.type === "added" || change.type === "modified") {
          if (!_listOfDiagrams.includes(change.doc.data().name)) {
            if (listOfDiagrams.findIndex(diagram => diagram.id === change.doc.id) === -1) {
              _listOfDiagrams.push({ ...change.doc.data(), id: change.doc.id });
            }
          }
        }
      }
      setListOfDiagrams(_listOfDiagrams);
      setSelectedDiagram(_listOfDiagrams[0]?.name || "");
      setVisibleNodes(_listOfDiagrams[0]?.nodes || []);
    });
    return () => {
      diagramsListcSnapshot();
    };
  }, [firebase]);

  useEffect(() => {
    let collabModelNodesQuery = firebase.db.collection("collabModelNodes");
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
  }, [firebase, loadData, selectedDiagram]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (!nodesLoded) return;
    setAllNodes([]);
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
      if (_allNodes.findIndex(node => node.id === tempNodesChange.doc.id) === -1 && !collabModelNode.deleted) {
        _allNodes.push({ id: tempNodesChange.doc.id, ...collabModelNode });
      }
      if (g.nodes().some(node => node === tempNodesChange.doc.id)) continue;
      if (!visibleNodes.includes(tempNodesChange.doc.id)) continue;
      if (collabModelNode.deleted) continue;
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
    for (let collabModelNode of _allNodes) {
      if (!collabModelNode.children || !collabModelNode.children.length) continue;
      for (let elementChild of collabModelNode.children) {
        if (elementChild.deleted) continue;
        if (_maxDepth < elementChild?.order) {
          _maxDepth = elementChild?.order;
        }
        let color = legends.find(legend => legend.text === elementChild.type)?.color || "";
        let _arrowheadStyle = `fill: ${color}`;
        let _style = `stroke: ${color}; stroke-width: 2px;`;

        if (!visibleNodes.includes(elementChild.id) || !visibleNodes.includes(collabModelNode.id)) continue;
        // if (parseInt(elementChild.order) === stepLink && stepLink !== 0) {
        //   _style = `stroke:${color}; stroke-width: 3px;filter: drop-shadow(3px 3px 5px ${color}); stroke-width: 2.7px;`;
        // }
        if (selectedLink.v === collabModelNode.id && selectedLink.w === elementChild.id) {
          _style = "stroke: #212121; stroke-width: 3px; filter: drop-shadow(3px 3px 5px #212121); stroke-width: 2.7px;";
          _arrowheadStyle = "fill: #212121";
        }
        if (ingnorOrder || showAll || (parseInt(elementChild.order) > 0 && parseInt(elementChild.order) <= stepLink)) {
          g.setEdge(collabModelNode.id, elementChild.id, {
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
      let nodeElement = d3.select(this);
      let nodeLabel = nodeElement.select("rect");
      let nodeBBox = nodeLabel.node().getBBox();

      let button = nodeElement
        .append("foreignObject")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", nodeBBox.width / 2 - 9)
        .attr("y", -nodeBBox.height / 2 - 9)
        .attr("class", "hide-button");

      let buttonBody = button.append("xhtml:body").style("margin", "0px").style("padding", "0px");

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
        let button2 = nodeElement
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

    const pencilButtonsGroup = svg.append("g");
    const zoom = d3.zoom().on("zoom", function (d) {
      svgGroup.attr("transform", d3.zoomTransform(this));
      pencilButtonsGroup.attr("transform", d3.zoomTransform(this));
      setZoomState(d3.zoomTransform(this));
    });
    svg.call(zoom);
    if (zoomState) {
      svgGroup.attr("transform", zoomState);
      pencilButtonsGroup.attr("transform", zoomState);
    }

    const svgWidth = (window.innerWidth * 70) / 100;
    const svgHeight = 600;
    const graphWidth = g.graph().width + 50;
    const graphHeight = g.graph().height + 50;

    const zoomScale = Math.min(svgWidth / graphWidth, svgHeight / graphHeight);
    const translateX = (svgWidth - graphWidth * zoomScale) / 2;
    const translateY = (svgHeight - graphHeight * zoomScale) / 2;
    if (!zoomState) {
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
    if (editor) {
      edges.each(function (edgeData) {
        var edgeElement = d3.select(this);
        const nodeIdx = _allNodes.findIndex(node => node.id === edgeData.v);
        const childIdx = _allNodes[nodeIdx].children.findIndex(child => child.id === edgeData.w);
        const order = _allNodes[nodeIdx].children[childIdx].order;
        addPencilButton(edgeElement, edgeData, pencilButtonsGroup, order);
      });
    }
    if (!editor) {
      edges.on("click", function (d) {
        setSelectedLink({});
        showLinkDetails(d.target.__data__);
        setOpenModifyLink(true);
        setOpenAddNode(false);
      });
    }

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
        for (let childId of childrenIds) {
          const idex = collabModelNode.children.findIndex(_child => _child.id === childId);
          if (idex === -1) {
            collabModelNode.children.push({
              id: childId,
              explanation: "",
              type: "Hypothetical Positive Effect",
              order: 0
            });
          } else if (
            idex !== -1 &&
            collabModelNode.children[idex].hasOwnProperty("deleted") &&
            collabModelNode.children[idex]?.deleted
          ) {
            collabModelNode.children[idex].deleted = false;
          }
          if (_visibleNodes.includes(childId) && !collabModelNode.children[idex]?.deleted) {
            _visibleNodes.push(childId);
          }
        }
        for (let child of collabModelNode.children) {
          if (!childrenIds.some(childId => childId === child.id)) {
            for (let _child of collabModelNode.children) {
              if (_child.id === child.id) continue;
              if (_child.order > child.order && child.order !== 0) {
                _child.order = parseInt(_child.order) - 1;
              }
            }
            if (child.order > 0) {
              for (let node of allNodes) {
                if (node.id === selectedNode) continue;
                const _children = node.children;
                for (let _child of _children) {
                  if (_child.order >= child.order) {
                    _child.order = parseInt(_child.order) - 1;
                  }
                }
                const nodeRef = firebase.firestore().collection("collabModelNodes").doc(node.id);
                nodeRef.update({ children: _children });
              }
            }
            child.deleted = true;
            child.order = 0;
          }
        }
        await collabModelRef.update({ title, type, children: collabModelNode.children });
      }
    } catch (error) {}
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
      if (node.children.some(child => child.id === _nodeDoc.id && !child.deleted)) {
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
    const _allnodes = [...allNodes];
    for (let node of _allnodes) {
      if (node.id === selectedNode) {
        node.deleted = true;
      }
      const index = node.children.findIndex(child => child.id === selectedNode && !child?.deleted);
      if (index !== -1) {
        const oldOrder = node.children[index].order;
        node.children[index].deleted = true;
        node.children[index].order = 0;
        for (let node of _allnodes) {
          for (let _child of node.children) {
            if (_child.order > oldOrder && !_child?.deleted) {
              _child.order = parseInt(_child.order) - 1;
            }
          }
        }
      }
    }
    await firebase.db.runTransaction(async t => {
      for (let node of _allnodes) {
        const nodeRef = firebase.firestore().collection("collabModelNodes").doc(node.id);
        t.update(nodeRef, { children: node.children, deleted: node?.deleted || false });
      }
    });
    setOpenAddNode(false);
    setDeleteDialogOpen(false);
    setLoadData(true);
    setSelectedNode("");
  };

  const showLinkDetails = async data => {
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

  const handleVisibileNodes = async node => {
    const _visibleNodes = visibleNodes;
    setShowAll(false);
    setIngnorOrder(true);
    const _listOfDiagrams = [...listOfDiagrams];
    const _diagram = _listOfDiagrams.findIndex(diagram => diagram.name === selectedDiagram);
    const diagramRef = await firebase.db.collection("collabModelDiagrams").doc(listOfDiagrams[_diagram].id);
    console.log(_diagram);

    if (_visibleNodes.includes(node.id)) {
      _visibleNodes.splice(_visibleNodes.indexOf(node.id), 1);
    } else {
      _visibleNodes.push(node.id);
      for (let child of node.children) {
        const indexChild = allNodes.findIndex(_node => _node.id === child.id);
        if (indexChild === -1) continue;
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
    if (_diagram !== -1) {
      _listOfDiagrams[_diagram].nodes = [..._visibleNodes];
      await diagramRef.update({ nodes: _visibleNodes });
    }
    setListOfDiagrams(_listOfDiagrams);
    // setZoomState(null);
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
    setLinkOrder(0);
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
    await firebase.db.runTransaction(async t => {
      const nodeId = selectedLink.v;
      const childId = selectedLink.w;
      const nodeRef = firebase.firestore().collection("collabModelNodes").doc(nodeId);
      const nodeDoc = await t.get(nodeRef);
      const nodeData = nodeDoc.data();
      const children = nodeData.children;
      const child = children.find(child => child.id === childId);
      if (child.order !== linkOrder) {
        if (child.order === 0 || Number.isNaN(child.order)) {
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
        } else if (linkOrder === 0) {
          for (let node of allNodes) {
            const _children = node.children;
            for (let _child of _children) {
              if (_child.order >= child.order) {
                _child.order = parseInt(_child.order) - 1;
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
      } else if (child.order === linkOrder) {
        const nodeRef = firebase.firestore().collection("collabModelNodes").doc(nodeId);
        const _children = nodeData.children;
        const child = _children.find(child => child.id === childId);
        child.explanation = explanation;
        child.type = typeLink;
        t.update(nodeRef, { children: _children });
      }
      if (linkOrder > stepLink) {
        setStepLink(linkOrder);
      }
      setLinkOrder(0);
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
    setZoomState(null);
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
    await firebase.db.runTransaction(async t => {
      const nodeId = selectedLink.v;
      const childId = selectedLink.w;
      const nodeRef = firebase.firestore().collection("collabModelNodes").doc(nodeId);
      const nodeDoc = await nodeRef.get();
      const nodeData = nodeDoc.data();
      const childIdx = nodeData.children.findIndex(child => child.id === childId);
      const childp = nodeData.children[childIdx];
      for (let node of allNodes) {
        let _children = node.children;
        for (let _child of _children) {
          if (_child.order > childp.order) {
            _child.order = parseInt(_child.order) - 1;
          }
          if (nodeId === node.id && _child.id === childId) {
            _child.order = 0;
            _child.deleted = true;
          }
        }
        const nodeRef = firebase.firestore().collection("collabModelNodes").doc(node.id);
        t.update(nodeRef, { children: _children });
      }
    });

    setDeleteDialogLinkOpen(false);
    setOpenModifyLink(false);
    setExplanation("");
    setTypeLink("");
    setSelectedLink({});
    setLinkOrder(null);
    setLoadData(true);
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
  const resetOrder = () => {
    const _visibleNodes = [];
    allNodes.forEach(node => {
      node.children.forEach(child => {
        if (1 >= child.order && child.order !== 0) {
          if (!_visibleNodes.includes(child.id)) {
            _visibleNodes.push(child.id);
          }
          if (!_visibleNodes.includes(node.id)) {
            _visibleNodes.push(node.id);
          }
        }
      });
    });
    setStepLink(1);
    setVisibleNodes(_visibleNodes);
    setLoadData(true);
    setShowAll(false);
    setIngnorOrder(false);
  };
  const handleOpenSidBar = () => {
    setOpenSideBar(old => !old);
    setZoomState(null);
  };
  const handleLegend = () => {
    setOpenLegend(old => !old);
  };
  const handlChangeDiagram = event => {
    setSelectedDiagram(event.target.value);
    const _diagram = listOfDiagrams.find(diagram => diagram.name === event.target.value);
    setVisibleNodes(_diagram.nodes);
    setShowAll(false);
    setNodesLoded(false);
  };

  const handleEditDiagram = async () => {
    try {
      setEditingDiagram(true);
      const _listOfDiagrams = [...listOfDiagrams];
      const index = _listOfDiagrams.findIndex(d => d.name === selectedDiagram);
      _listOfDiagrams[index].name = newDiagramName;
      const diagramDoc = await firebase.db.collection("collabModelDiagrams").where("name", "==", selectedDiagram).get();
      await diagramDoc.docs[0].ref.update({ name: newDiagramName });
      setListOfDiagrams(_listOfDiagrams);
      setSelectedDiagram(newDiagramName);
      setOpenEditModal(false);
      setEditingDiagram(false);
      setNewDiagramName("");
    } catch (error) {}
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handlNewDiagramName = event => {
    setNewDiagramName(event.target.value);
  };
  const editDiagram = () => {
    setNewDiagramName(selectedDiagram);
    setOpenEditModal(true);
  };

  const addNewDiagram = () => {
    setNewDiagramName("");
    setOpenAddModal(true);
  };
  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleAddDiagram = () => {
    const ref = firebase.db.collection("collabModelDiagrams").doc();
    ref.set({
      name: newDiagramName,
      nodes: []
    });
    setNewDiagramName("");
    setOpenAddModal(false);
  };

  return (
    <Box sx={{ height: "100vh", overflowY: "scroll" }}>
      <Dialog open={openEditModal} onClose={handleCloseEditModal}>
        <DialogTitle sx={{ fontSize: "15px" }}> Update the diagram name:</DialogTitle>
        <DialogContent sx={{ width: "500px", mt: "5px" }}>
          <TextField
            label="Diagram name"
            variant="outlined"
            value={newDiagramName}
            onChange={handlNewDiagramName}
            fullWidth
            multiline
            rows={3}
            sx={{ width: "95%", m: 0.5 }}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={false /* editingDiagram */} variant="contained" onClick={handleEditDiagram}>
            Update
          </Button>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddModal} onClose={handleCloseAddModal}>
        <DialogTitle sx={{ fontSize: "15px" }}> Add new diagram:</DialogTitle>
        <DialogContent sx={{ width: "500px", mt: "5px" }}>
          <TextField
            label="Diagram name"
            variant="outlined"
            value={newDiagramName}
            onChange={handlNewDiagramName}
            fullWidth
            multiline
            rows={3}
            sx={{ width: "95%", m: 0.5 }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleAddDiagram}>
            Add
          </Button>
          <Button onClick={handleCloseAddModal}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Box>
        <Drawer
          PaperProps={{
            style: {
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0
            }
          }}
          open={openSideBar && isMobile}
        >
          {" "}
          <CloseIcon
            sx={{
              position: "fixed",
              top: "3%",
              right: "3%",
              zIndex: "1000"
            }}
            onClick={handleOpenSidBar}
          />
          <Box sx={{ direction: "ltr" }}>
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
        </Drawer>
        <Drawer open={openLegend}>
          <CloseIcon
            sx={{
              position: "fixed",
              top: "3%",
              right: "3%",
              zIndex: "1000"
            }}
            onClick={handleLegend}
          />
          <Grid container spacing={1} sx={{ mt: "50px", ml: "30px" }}>
            {[
              { text: "Input", color: "#1976d2" },
              { text: "Positive Outcome", color: "#4caf50" },
              { text: "Negative Outcome", color: "#cc0119" }
            ].map((resource, index) => (
              <Grid item xs={12} sm={4} md={3}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: resource.color,
                    color: "primary.contrastText",
                    fontSize: 13,
                    borderRadius: 2,
                    maxWidth: 90,
                    mr: 0.5,
                    mb: 0.5,
                    textAlign: "center",
                    width: "100%",
                    height: "40px"
                  }}
                  key={resource.text}
                >
                  {resource.text}
                </Box>
              </Grid>
            ))}
            {[
              { text: "Known Positive Effect", color: "#56E41B" },
              { text: "Hypothetical Positive Effect", color: "#1BBAE4" },
              { text: "Known Negative Effect", color: "#A91BE4" },
              { text: "Hypothetical Negative Effect", color: "#E4451B" }
            ].map((resource, index) => (
              <Grid item xs={12} sm={6} md={3} style={{ marginInline: "14px" }}>
                <TrendingFlatIcon style={{ fontSize: "40px", color: resource.color }} />
                <Typography sx={{ fontSize: "14px", color: resource.color, marginTop: "-10px" }}>
                  {resource.text}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Drawer>
      </Box>

      <Box /* sx={{ height: "calc(100vh - 10px)", overflow: "auto" }} */>
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
          <Grid item xs={openSideBar && !isMobile ? 9 : 12}>
            <Paper
              id="graphPaper"
              sx={{
                mt: "10px",
                mr: "9px",
                ml: isMobile ? "9px" : "",
                height: isMobile ? "530px" : "90vh",
                width: "600",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column"
              }}
              elevation={4}
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
              {!openSideBar && (
                <MenuIcon
                  sx={{
                    position: "absolute",
                    top: "5%",
                    left: "10px",
                    zIndex: "1000",
                    transform: "translateY(-50%)"
                  }}
                  onClick={handleOpenSidBar}
                />
              )}

              {!openLegend && isMobile && (
                <LegendToggleIcon
                  sx={{
                    position: "absolute",
                    top: "1%",
                    right: "10px",
                    zIndex: "1000",
                    transform: "translateX(-50%)"
                  }}
                  onClick={handleLegend}
                />
              )}
              {visibleNodes.length > 0 && !isMobile && (
                <Box sx={{ display: "flex" }}>
                  {[
                    { text: "Input", color: "#1976d2" },
                    { text: "Positive Outcome", color: "#4caf50" },
                    { text: "Negative Outcome", color: "#cc0119" }
                  ].map((resource, index) => (
                    <ColorBox key={resource.text} text={resource.text} color={resource.color} />
                  ))}
                  {[
                    { text: "Known Positive Effect", color: "#56E41B" },
                    { text: "Hypothetical Positive Effect", color: "#1BBAE4" },
                    { text: "Known Negative Effect", color: "#A91BE4" },
                    { text: "Hypothetical Negative Effect", color: "#E4451B" }
                  ].map((resource, index) => (
                    <Box style={{ marginInline: "14px" }}>
                      <TrendingFlatIcon style={{ fontSize: "40px", color: resource.color }} />
                      <Typography sx={{ fontSize: "14px", color: resource.color, marginTop: "-10px" }}>
                        {resource.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
            <Box sx={{ ml: "14px", mt: "14px" }}>
              {openModifyLink && editor && (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <TextField
                    label="Explanation"
                    variant="outlined"
                    value={explanation}
                    onChange={handlExplanation}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ width: "95%", m: 0.5 }}
                  />
                  <Box sx={{ display: "flex", flexDirection: "inline" }}>
                    <Box
                      component="form"
                      sx={{
                        "& > :not(style)": { m: 0.5, width: "25ch" }
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
                      {/* <TextField
                        label="Order"
                        type="number"
                        value={linkOrder}
                        inputProps={{
                          min: "1",
                          step: "1"
                        }}
                        onChange={handleInputValidation}
                      /> */}
                    </Box>
                    <Box sx={{ mt: "15px" }}>
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
                </Box>
              )}
              {openModifyLink && !editor && explanationLink !== "" && (
                <Typography sx={{ p: 2 }}>{explanationLink}</Typography>
              )}
              {openAddNode && (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <TextField
                    label="Title"
                    variant="outlined"
                    value={title}
                    fullWidth
                    sx={{ width: "95%", m: 0.5 }}
                    onChange={e => {
                      setTitle(e.currentTarget.value);
                    }}
                  />
                  <Box sx={{ display: "flex", flexDirection: "inline" }}>
                    <Box
                      component="form"
                      sx={{
                        "& > :not(style)": { m: 0.5, width: "25ch" }
                      }}
                      noValidate
                      autoComplete="off"
                    >
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
                </Box>
              )}
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    flexWrap: "wrap"
                  }}
                >
                  <Button
                    sx={{
                      ml: ["15px", "30px"],
                      mb: "20px",
                      flexGrow: 1,
                      justifyContent: "center"
                    }}
                    variant="contained"
                    onClick={previousLink}
                    disabled={true /* stepLink === 0 */}
                  >
                    Previous
                  </Button>
                  <Button
                    sx={{
                      ml: ["15px", "30px"],
                      mb: "20px",
                      flexGrow: 1,
                      justifyContent: "center"
                    }}
                    variant="contained"
                    onClick={nextLink}
                    disabled={true /* stepLink === maxDepth */}
                  >
                    Next
                  </Button>
                  <Button
                    sx={{
                      ml: ["15px", "30px"],
                      mb: "20px",
                      mr: "30px",
                      flexGrow: 1,
                      justifyContent: "center"
                    }}
                    variant="contained"
                    onClick={resetOrder}
                    disabled={true /* stepLink <= 1 */}
                  >
                    Reset
                  </Button>
                  {editor && (
                    <Button
                      sx={{
                        mr: "30px",
                        ml: ["15px", "30px"],
                        mb: "20px",
                        flexGrow: 1,
                        justifyContent: "center"
                      }}
                      variant="contained"
                      onClick={AddNewNode}
                    >
                      Add New Node
                    </Button>
                  )}
                  {editor && (
                    <Button
                      sx={{
                        mr: "30px",
                        ml: ["15px", "30px"],
                        mb: "20px",
                        flexGrow: 1,
                        justifyContent: "center"
                      }}
                      variant="contained"
                      onClick={addNewDiagram}
                    >
                      Add New Diagram
                    </Button>
                  )}
                  {editor && selectedDiagram && selectedDiagram !== "" && !openModifyLink && !openAddNode && (
                    <EditIcon
                      sx={{
                        mb: "20px",
                        justifyContent: "center"
                      }}
                      onClick={editDiagram}
                    />
                  )}

                  {!openModifyLink && !openAddNode && listOfDiagrams.length > 0 && (
                    <FormControl
                      sx={{
                        ml: ["15px", "30px"],
                        mr: ["15px", "30px"],
                        mb: "20px",
                        flexGrow: 1,
                        justifyContent: "center"
                      }}
                    >
                      <InputLabel>diagram</InputLabel>
                      <Select
                        label="diagram"
                        value={selectedDiagram}
                        onChange={handlChangeDiagram}
                        sx={{ width: "100%", color: "black", border: "1px", borderColor: "white" }}
                      >
                        {[...listOfDiagrams].map(diagram => (
                          <MenuItem key={diagram.id} value={diagram.name} sx={{ display: "center" }}>
                            {diagram.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={openSideBar && !isMobile ? 3 : 0}>
            {openSideBar && (
              <Paper
                sx={{
                  height: "100vh",
                  mb: "10px",
                  overflow: "auto",
                  direction: "rtl",
                  "&::-webkit-scrollbar": {
                    width: "10px"
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "5px"
                  }
                }}
              >
                {openSideBar && !isMobile && (
                  <ArrowBackIosNewIcon
                    sx={{
                      position: "absolute",
                      top: "3%",
                      zIndex: "1000",
                      transform: "translateY(-50%)"
                    }}
                    onClick={handleOpenSidBar}
                  />
                )}
                <Box sx={{ direction: "ltr" }}>
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
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
export default OneCademyCollaborationModel;
