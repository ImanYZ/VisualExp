import React, { useRef, useEffect, useState, useCallback } from "react";
import AddIcon from "@mui/icons-material/Add";
import { LoadingButton } from "@mui/lab";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import CloseIcon from "@mui/icons-material/Close";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import BedtimeIcon from "@mui/icons-material/Bedtime";
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
import { Tooltip, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import MenuIcon from "@mui/icons-material/Menu";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import LegendToggleIcon from "@mui/icons-material/LegendToggle";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "@mui/material/Drawer";
import EditIcon from "@mui/icons-material/Edit";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useThemeContext } from "../ThemeContext";
import FormControlLabel from "@mui/material/FormControlLabel";
import AddNodeTypeModal from "./CollaborativeModel/AddNodeTypeModal";
import GetAppIcon from "@mui/icons-material/GetApp";
import CollabTree from "./CollabTree/CollabTree";
import useConfirmDialog from "../hooks/useConfirmDialog";
import usePromptDialog from "../hooks/usePromptDialog";
import axios from "axios";
const d3 = require("d3");

const legends = [
  { text: "Known Positive Effect", color: "#56E41B" },
  { text: "Hypothetical Positive Effect", color: "#1BBAE4" },
  { text: "Known Negative Effect", color: "#A91BE4" },
  { text: "Hypothetical Negative Effect", color: "#E4451B" }
];
// const NODE_TYPES = ["Positive Outcome", "Negative Outcome", "Design Features"];

const getColor = (nodeType, nodeTypes, factor) => {
  console.log(
    "nodeTypes[nodeType.toLowerCase()]?.color",
    nodeType.toLowerCase(),
    nodeTypes[nodeType.toLowerCase()]?.color
  );
  const color = nodeTypes[nodeType.toLowerCase()]?.color || "";
  return changeAlphaColor(color, factor);
};

const changeAlphaColor = (color, factor) => {
  let hex = color.replace("#", "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map(x => x + x)
      .join("");
  if (hex.length === 6)
    return `rgba(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(
      hex.slice(4, 6),
      16
    )}, ${factor})`;
  if (hex.length === 8)
    return `rgba(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(
      hex.slice(4, 6),
      16
    )}, ${(parseInt(hex.slice(6, 8), 16) / 255) * factor})`;
  return hex;
};

const NODE_TYPES = "nodeTypes";
const COLLAB_MODEL_NODES = "collabModelNodes";
const GROUPS = "groups";
const LINKS = "links";
const NODES = "nodes";
const DIAGRAMS = "diagrams";
const LINKS_TYPES = {
  "known positive": { text: "Known Positive Effect", color: "#4caf50" },
  "hypothetical positive": { text: "Hypothetical Positive Effect", color: "#1BBAE4" },
  "known negative": { text: "Known Negative Effect", color: "#A91BE4" },
  "hypothetical negative": { text: "Hypothetical Negative Effect", color: "#E4451B" }
};

const OneCademyCollaborationModel = () => {
  const firebase = useRecoilValue(firebaseState);
  const svgRef = useRef();
  const { darkMode, toggleTheme } = useThemeContext();

  const [newNode, setNewNode] = useState(null);

  const [selectedLink, setSelectedLink] = useState(null);
  const [zoomState, setZoomState] = useState(null);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState({ id: "", title: "" });
  const [nodeTypes, setNodeTypes] = useState({});
  const [isModalAddTypeOpen, setIsModalAddTypeOpen] = useState(false);
  const [editNodeType, setEditNodeType] = useState(null);
  const [groups, setGroups] = useState([]);
  const [links, setLinks] = useState([]);
  const [nodes, setNodes] = useState({});
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const [diagrams, setDiagrams] = useState([]);

  const { promptIt, ConfirmDialog, confirmIt } = useConfirmDialog();
  const { promptItDiagram, PromptDialog } = usePromptDialog();
  const [loadingResponse, setLoadingResponse] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const editor = true;

  const ColorBox = props => {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: props.color,
          color: "white",
          fontSize: 13,
          borderRadius: 2,
          maxWidth: 90,
          ml: 0.9,
          mr: 0.5,
          mb: 0.5,
          textAlign: "center",
          width: "100%",
          height: "40px",
          position: "relative",
          cursor: editor ? "pointer" : ""
        }}
        key={props.text}
        onClick={() => {
          if (!editor) return;
          setEditNodeType({
            color: props.color,
            type: props.text,
            id: props.id
          });
          setIsModalAddTypeOpen(true);
        }}
      >
        {props.text}
      </Box>
    );
  };
  const addPencilButton = (edgeElement, edgeData, pencilButtonsGroup) => {
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
        modifyLink(edgeData);
      });
    pencilButtonsGroup
      .append("text")
      .attr("class", "custom-text-color")
      .attr("x", point.x)
      .attr("y", point.y + 14)
      .attr("font-family", "Arial, sans-serif")
      .attr("font-size", "15px");
  };

  useEffect(() => {
    const unsubscribe = firebase.db.collection(NODE_TYPES).onSnapshot(snapshot => {
      const newNodeTypes = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        newNodeTypes[data.type.toLowerCase()] = { ...doc.data(), id: doc.id };
      });
      setNodeTypes(newNodeTypes);
    });

    return unsubscribe;
  }, [firebase]);

  const saveNewType = async (type, color, editedNodeType) => {
    if (editedNodeType) {
      const nodeTypeRef = firebase.db.collection(NODE_TYPES).doc(editedNodeType.id);
      nodeTypeRef.update({
        type,
        color
      });

      const nodesDocsSnapshot = await firebase.db
        .collection(COLLAB_MODEL_NODES)
        .where("type", "==", editedNodeType.type)
        .get();

      const batch = firebase.db.batch();

      nodesDocsSnapshot.forEach(doc => {
        batch.update(doc.ref, { type });
      });

      await batch.commit();
    } else {
      const newTypeRef = firebase.db.collection(NODE_TYPES).doc();
      await newTypeRef.set({
        type: type,
        color
      });
    }
  };
  const processGroupChanges = (prev, changes, object = false) => {
    const _prev = object ? { ...prev } : [...prev];
    console.log("changes ==>", changes);
    changes.forEach(change => {
      const index = object ? -1 : _prev.findIndex(group => group.id === change.doc.id);
      if (change.type === "added" || change.type === "modified") {
        if (object) {
          _prev[change.doc.id] = { ...change.doc.data(), id: change.doc.id };
        } else if (index === -1) {
          _prev.push({ ...change.doc.data(), id: change.doc.id });
        } else {
          _prev[index] = { ...change.doc.data(), id: change.doc.id };
        }
      } else if (change.type === "removed") {
        if (object) {
          delete _prev[change.doc.id];
        } else if (index !== -1) {
          _prev.splice(index, 1);
        }
      }
    });
    return _prev;
  };

  useEffect(() => {
    const diagramsQuery = firebase.db.collection(DIAGRAMS);
    const unsubscribeDiagrams = diagramsQuery.onSnapshot(snapshot => {
      const changes = snapshot.docChanges();
      setDiagrams(prev => processGroupChanges(prev, changes));
    });
    return () => {
      unsubscribeDiagrams();
    };
  }, [firebase.db]);

  useEffect(() => {
    console.log("selectedDiagram?.id =====>", selectedDiagram?.id);
    if (!selectedDiagram?.id) {
      console.log(diagrams, "diagrams");
      setSelectedDiagram(diagrams[0]);
    }
  }, [diagrams, selectedDiagram?.id]);

  useEffect(() => {
    if (!selectedDiagram?.id) return;

    const groupsQuery = firebase.db.collection(GROUPS).where("diagrams", "array-contains", selectedDiagram.id);
    const linksQuery = firebase.db.collection(LINKS).where("diagrams", "array-contains", selectedDiagram.id);
    const nodesQuery = firebase.db.collection(NODES).where("diagrams", "array-contains", selectedDiagram.id);

    const unsubscribeGroups = groupsQuery.onSnapshot(snapshot => {
      const changes = snapshot.docChanges();
      setGroups(prev => processGroupChanges(prev, changes));
    });

    const unsubscribeLinks = linksQuery.onSnapshot(snapshot => {
      const changes = snapshot.docChanges();
      setLinks(prev => processGroupChanges(prev, changes));
    });

    const unsubscribeNodes = nodesQuery.onSnapshot(snapshot => {
      const changes = snapshot.docChanges();
      setNodes(prev => processGroupChanges(prev, changes, true));
    });

    return () => {
      unsubscribeGroups();
      unsubscribeLinks();
      unsubscribeNodes();
    };
  }, [firebase.db, selectedDiagram?.id]);

  console.log("groups", groups, links, nodes);

  useEffect(() => {
    var g = new dagreD3.graphlib.Graph({ compound: true })
      .setGraph({ rankdir: "LR", isMultigraph: true })
      .setDefaultEdgeLabel(function () {
        return {};
      });
    d3.select("#graphGroup").selectAll("*").remove();
    console.log("useEffect", {
      nodes,
      darkMode,
      nodeTypes
    });

    for (let visibleNodeId in nodes) {
      if (nodes[visibleNodeId] && !g.nodes().includes(visibleNodeId)) {
        const nodeData = nodes[visibleNodeId];
        const isBlurred = !selectedGroups.has(nodeData.groups[0].id) && !newNode;
        let nodeColor = getColor(nodeData.nodeType, nodeTypes, isBlurred ? 0.1 : 1);
        const textColor = changeAlphaColor(!darkMode && isBlurred ? "#000000" : "#fff", isBlurred ? 0.1 : 1);

        g.setNode(nodeData.id, {
          label: nodeData.label,
          class: `${"type-PO"}`,
          style: `fill: ${nodeColor};`,
          labelStyle: `fill: ${textColor};`
        });
      }
    }

    for (let { source, target, polarity, certainty } of links) {
      if (target && source) {
        const isHighlighted =
          (selectedGroups.has(nodes[source]?.groups[0]?.id) && selectedGroups.has(nodes[target]?.groups[0]?.id)) ||
          !!newNode;
        const color = LINKS_TYPES[`${certainty.trim()} ${polarity.trim()}`]?.color || "";

        const adjustedColor = changeAlphaColor(color, isHighlighted ? 1 : 0.1);

        let _arrowheadStyle = `fill: ${adjustedColor};`;
        let _style = `stroke: ${adjustedColor}; stroke-width: 2px;`;

        if (selectedLink?.v === source && selectedLink?.w === target) {
          _style = "stroke: #212121; stroke-width: 3px; filter: drop-shadow(3px 3px 5px #212121); opacity: 1;";
          _arrowheadStyle = "fill: #212121; opacity: 1;";
        }

        if (g.nodes().includes(source) && g.nodes().includes(target)) {
          g.setEdge(source, target, {
            curve: d3.curveBasis,
            style: _style,
            arrowheadStyle: _arrowheadStyle,
            label: ""
          });
        }
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
      let nodeElement = d3.select(this);
      let nodeLabel = nodeElement.select("rect");
      let nodeBBox = nodeLabel.node().getBBox();

      nodeElement
        .style("cursor", "pointer")
        .on("mouseover", function () {
          nodeLabel.style("fill-opacity", 0.8);
        })
        .on("mouseout", function () {
          nodeLabel.style("fill-opacity", 1);
        });
      let button = nodeElement
        .append("foreignObject")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", nodeBBox.width / 2 - 10)
        .attr("y", -nodeBBox.height / 2 - 10)
        .attr("class", "hide-button")
        .style("cursor", "pointer");

      let buttonBody = button.append("xhtml:body").style("margin", "0px").style("padding", "0px");

      /*   if (editor) {
        buttonBody
          .append("xhtml:button")
          .style("background", "white")
          .style("color", "black")
          .style("border", "1px solid black")
          .style("border-radius", "50%")
          .style("width", "20px")
          .style("height", "20px")
          .style("font-weight", "bold")
          .style("font-size", "12px")
          .style("line-height", "18px")
          .style("text-align", "center")
          .style("padding", "0")
          .text("X")
          .on("click", function (e) {
            e.stopPropagation();
            removeNode(v);
          })
          .on("mouseover", function () {
            d3.select(this).style("background", "orange");
          })
          .on("mouseout", function () {
            d3.select(this).style("background", "white");
          });
      } */
      if (!!newNode) {
        let button2 = nodeElement
          .append("foreignObject")
          .attr("width", 20)
          .attr("height", 20)
          .attr("x", nodeBBox.x + nodeBBox.width / 2 - 10)
          .attr("y", nodeBBox.y - 10)
          .attr("class", "hide-button");

        var buttonBody2 = button2.append("xhtml:body").style("margin", "0px").style("padding", "0px");
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("visibility", "hidden")
          .style("background-color", "rgba(0,0,0,0.7)")
          .style("color", "white")
          .style("padding", "5px")
          .style("border-radius", "4px")
          .style("font-size", "12px");

        if (newNode.children.includes(v)) {
          buttonBody2
            .append("xhtml:button")
            .style("background", "white")
            .style("border", "1px solid black")
            .style("border-radius", "50%")
            .style("width", "20px")
            .style("height", "20px")
            .style("font-size", "25px")
            .style("line-height", "10px")
            .style("padding", "0")
            .style("text-align", "center")
            .style("cursor", "pointer")
            .style("padding-bottom", "3px")
            .text("-")
            .on("click", function (e) {
              e.stopPropagation();
              removeChild(v);
              tooltip.style("visibility", "hidden");
            })
            .on("mouseover", function (event) {
              d3.select(this).style("background", "#FFCC80"); // light orange
              tooltip
                .style("visibility", "visible")
                .text("Remove as child")
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY + 10 + "px");
            })
            .on("mouseout", function () {
              d3.select(this).style("background", "white");
              tooltip.style("visibility", "hidden");
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
            .style("font-size", "25px")
            .style("line-height", "2px")
            .style("padding", "0")
            .style("text-align", "center")
            .style("cursor", "pointer")
            .text("+")
            .on("click", function (e) {
              e.stopPropagation();
              addChild(v);
              tooltip.style("visibility", "hidden");
            })
            .on("mouseover", function (event) {
              d3.select(this).style("background", "orange");
              tooltip
                .style("visibility", "visible")
                .text("Add as child")
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY + 10 + "px");
            })
            .on("mouseout", function () {
              d3.select(this).style("background", "white");
              tooltip.style("visibility", "hidden");
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

    const gNodes = svg.selectAll("g.node");
    if (editor) {
      gNodes.on("click", function (d) {
        d.stopPropagation();
        modifyNode(d.target.__data__);
      });
    }
    var edges = svg.selectAll("g.edgePath");
    if (editor) {
      edges.each(function (edgeData) {
        var edgeElement = d3.select(this);
        const nodeData = nodes[edgeData.v];
        if (!nodeData) return;
        /*  const childIdx = nodeData.children.findIndex(child => child.id === edgeData.w);
        if (childIdx === -1) return;
        const order = nodeData.children[childIdx].order; */
        addPencilButton(edgeElement, edgeData, pencilButtonsGroup);
      });
    }
    if (!editor) {
      edges.on("click", function (d) {
        setSelectedLink(null);
        showLinkDetails(d.target.__data__);
      });
    }

    return () => {
      d3.select("#graphGroup").selectAll("*").remove();
      setZoomState(null);
    };
  }, [selectedLink, darkMode, nodeTypes, nodes, links, selectedGroups, newNode]);

  const AddNewNode = second => {
    setSelectedLink(null);
    setNewNode({
      label: "",
      nodeType: "process variable",
      isLeverage: false,
      groups: [],
      diagrams: [],
      children: [],
      nodeType: "",
      new: true
    });
  };

  const handleClose = () => {
    setSelectedLink(null);
    setNewNode(null);
  };

  const handleSave = async () => {
    try {
      if (newNode?.new) {
        const newNodeRef = firebase.db.collection(NODES).doc();
        newNode.groups = newNode.groups.map(c => {
          return {
            label: c.label,
            id: c.id
          };
        });

        await newNodeRef.set({
          label: newNode.label,
          nodeType: newNode.nodeType,
          diagrams: [selectedDiagram.id],
          groups: newNode.groups,
          id: newNodeRef.id
        });
        for (let child of newNode.children) {
          const newLinkRef = firebase.db.collection("links").doc();
          const newLink = {
            source: newNodeRef.id,
            target: child,
            certainty: "known",
            polarity: "positive",
            diagrams: [selectedDiagram.id],
            detail: ""
          };
          newLinkRef.set(newLink);
        }
      } else if (!!newNode.previous) {
        const previousChildren = links.filter(c => c.source === newNode.id);
        for (let previous of previousChildren) {
          if (!newNode.children.includes(previous.target)) {
            const linkRef = firebase.db.collection(LINKS).doc(previous.id);
            linkRef.delete();
          }
        }
        for (let child of newNode.children) {
          const indx = previousChildren.findIndex(c => c.target === child);
          if (indx === -1) {
            const newLinkRef = firebase.db.collection("links").doc();
            const newLink = {
              source: newNode.id,
              target: child,
              certainty: "known",
              polarity: "positive",
              diagrams: [selectedDiagram.id],
              detail: ""
            };
            newLinkRef.set(newLink);
          }
        }
        const newNodeRef = firebase.db.collection(NODES).doc(newNode.id);

        newNode.groups = newNode.groups.map(c => {
          return {
            label: c.label,
            id: c.id
          };
        });
        await newNodeRef.update({
          label: newNode.label,
          nodeType: newNode.nodeType,
          diagrams: [selectedDiagram.id],
          groups: newNode.groups,
          id: newNodeRef.id
        });
      }
      setNewNode(null);
    } catch (error) {
      console.error(error);
    }
  };

  const modifyNode = async nodeId => {
    const children = [];
    for (let link of links) {
      if (link.source === nodeId) {
        children.push(link.target);
      }
    }
    setNewNode({ ...nodes[nodeId], children, previous: true });
    setSelectedLink(null);
  };
  console.log(newNode, "newNode ==>");

  const deleteNode = async () => {
    if (!newNode) return;
    if (await confirmIt("Are you sure you want to delete this node?", "Delete", "Keep")) {
      const nodeRef = firebase.db.collection(NODES).doc(newNode.id);
      nodeRef.delete();
      setNewNode(null);
    }
  };

  const showLinkDetails = async data => {
    /*    const nodeId = data.v;
    const childId = data.w;
    const nodeDoc = await firebase.firestore().collection(COLLAB_MODEL_NODES).doc(nodeId).get();
    const nodeData = nodeDoc.data();
    const children = nodeData.children;
    const child = children.find(child => child.id === childId);
    setExplanationLink(child.explanation);
    if (child.explanation !== "") {
      setSelectedLink(data);
    } */
  };

  const modifyLink = async data => {
    console.log(data, "data== >");
    const nodeId = data.v;
    const childId = data.w;
    const link = links.find(link => link.source === nodeId && link.target === childId);

    setSelectedLink({ ...link, ...data });
    setNewNode(null);
  };

  const handleSaveLink = async () => {
    await firebase.db.runTransaction(async t => {
      const linkRef = firebase.db.collection("links").doc(selectedLink.id);
      linkRef.update({
        certainty: selectedLink.certainty,
        detail: selectedLink.detail,
        polarity: selectedLink.polarity
      });

      setSelectedLink(null);
    });
  };

  const addChild = child => {
    setNewNode(prev => {
      const _prev = { ...prev };
      if (!_prev.children.includes(child)) {
        _prev.children.push(child);
      }
      return _prev;
    });
  };
  const removeChild = child => {
    setNewNode(prev => {
      const _prev = { ...prev };
      if (_prev.children.includes(child)) {
        _prev.children.splice(_prev.children.indexOf(child), 1);
      }
      return _prev;
    });
  };

  const handleOpenSidBar = () => {
    setOpenSideBar(old => !old);
    setZoomState(null);
  };

  const handleChangeDiagram = event => {
    const _diagram = diagrams.find(diagram => diagram.title === event.target.value);
    console.log("_diagram ==>", _diagram, event.target.value);
    setSelectedDiagram(_diagram);
    setGroups([]);
    setNodes([]);
    setLinks([]);
    setSelectedGroups(new Set());
  };

  const downloadSvg = () => {
    const svgElement = svgRef.current;
    if (svgElement) {
      const clone = svgElement.cloneNode(true);
      const svgStyles = document.createElement("style");
      const cssRules = Array.from(document.styleSheets)
        .reduce((acc, styleSheet) => {
          try {
            return acc.concat(Array.from(styleSheet.cssRules));
          } catch {
            return acc; // Ignore CSS rules we can't access
          }
        }, [])
        .map(rule => rule.cssText)
        .join(" ");

      svgStyles.textContent = cssRules;
      clone.insertBefore(svgStyles, clone.firstChild);

      const svgData = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "graph.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(url);
    }
  };
  const generateNewDiagram = async () => {
    try {
      const documentDetailed = await promptItDiagram("Generate a new diagram:", "Generate", "Cancel");

      console.log(documentDetailed);
      if (!documentDetailed.trim()) return;
      setLoadingResponse(true);

      const r = await axios.post("/api/generateCollabDiagram", { documentDetailed });
      console.log(r.data.response, "generateCollabDiagram");
      setLoadingResponse(true);

      const response = r.data.response;
      console.log("response ==>", response);

      const newDiagramRef = firebase.db.collection("diagrams").doc();

      for (let group of response.groupHierarchy) {
        const groupRef = firebase.db.collection("groups").doc();
        const id = groupRef.id;
        group.id = id;
        groupRef.set({
          id,
          createdAt: new Date(),
          ...group,
          diagrams: [newDiagramRef.id]
        });
      }
      for (let node of response["nodes"]) {
        const nodeRef = firebase.db.collection("nodes").doc();
        const id = nodeRef.id;
        const _groups = node.groups.map(c => {
          return {
            id: response.groupHierarchy.find(g => g.label === c).id,
            label: response.groupHierarchy.find(g => g.label === c).label
          };
        });
        node.groups = _groups;
        node.id = id;
        const _node = {
          ...node,
          createdAt: new Date()
        };
        console.log("_node ==>", _node);
        nodeRef.set({
          ..._node,
          diagrams: [newDiagramRef.id]
        });
      }
      for (let link of response["links"]) {
        link.source = response["nodes"].find(c => c.label === link.source)?.id || "";
        link.target = response["nodes"].find(c => c.label === link.target)?.id || "";
        const linkRef = firebase.db.collection("links").doc();
        linkRef.set({ ...link, diagrams: [newDiagramRef.id] });
      }
      console.log(response);
      setLoadingResponse(false);
      const diagramName = await promptIt("What do you want to call the diagram?", "Ok");
      newDiagramRef.set({
        title: diagramName,
        id: newDiagramRef.id
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingResponse(false);
    }
  };
  const improveDiagram = async () => {
    console.log("first");
    const response = await promptItDiagram("Improve the diagram:", "improve", "cancel");
    /*   const documentDetailed = await promptIt("Enter the prompt bellow", "Start");
    console.log("documentDetailed ==>", documentDetailed); */
  };
  console.log("selectedLink ==>", selectedLink);

  const deleteLink = async () => {
    if (await confirmIt("Are you sure you want to delete the link?", "Delete", "Keep")) {
      if (selectedLink) {
        const linkRef = firebase.db.collection("links").doc(selectedLink.id);
        linkRef.delete();
        setSelectedLink(null);
      }
    }
  };
  console.log("newNode.groups", newNode, groups);

  return (
    <Box sx={{ backgroundColor: darkMode ? "#272727" : "" }}>
      {diagrams.length > 0 ? (
        <Box>
          <Grid container spacing={2} direction="row-reverse">
            <Grid item xs={openSideBar && !isMobile ? 9 : 12} sx={{ height: "110vh", overflowY: "scroll" }}>
              <Box
                id="graphPaper"
                sx={{
                  ml: isMobile ? "9px" : "",
                  height: isMobile ? "530px" : "100%",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column"
                }}
                elevation={4}
              >
                {Object.keys(nodes).length > 0 && <svg id="graphGroup" width="100%" height="100%" ref={svgRef}></svg>}
                {!openSideBar && (
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: "3%",
                      left: "10px",
                      zIndex: "1000",
                      transform: "translateY(-50%)"
                    }}
                    onClick={handleOpenSidBar}
                  >
                    <MenuIcon sx={{ fontSize: "35px" }} />
                  </IconButton>
                )}
                <Box
                  sx={{
                    position: "absolute",
                    top: "3%",
                    right: "10px",
                    zIndex: "1000",
                    transform: "translateY(-50%)",
                    display: "flex",
                    gap: "22px"
                  }}
                >
                  {" "}
                  <Tooltip title={"Generate a diagram"} sx={{ mt: "3px" }}>
                    {loadingResponse ? (
                      <Box
                        sx={{
                          width: "35px",
                          height: "35px",
                          border: "1px solid gray",
                          borderRadius: "10px",
                          alignItems: "center",
                          display: "flex",
                          justifyContent: "center"
                        }}
                      >
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <IconButton
                        variant="contained"
                        onClick={generateNewDiagram}
                        sx={{ width: "35px", height: "35px", border: "1px solid gray", borderRadius: "10px" }}
                      >
                        <AutoFixHighIcon />
                      </IconButton>
                    )}
                  </Tooltip>
                  {/* <Tooltip title={"Improve Diagram"} sx={{ mt: "3px" }}>
                  {loadingResponse ? (
                    <Box
                      sx={{
                        width: "35px",
                        height: "35px",
                        border: "1px solid gray",
                        borderRadius: "10px",
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "center"
                      }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <IconButton
                      variant="contained"
                      onClick={improveDiagram}
                      sx={{ width: "35px", height: "35px", border: "1px solid gray", borderRadius: "10px" }}
                    >
                      <AutoAwesomeIcon />
                    </IconButton>
                  )}
                </Tooltip> */}
                  <Tooltip title={"Add new node"}>
                    {loadingResponse ? (
                      <Box
                        sx={{
                          width: "35px",
                          height: "35px",
                          border: "1px solid gray",
                          borderRadius: "10px",
                          alignItems: "center",
                          display: "flex",
                          justifyContent: "center"
                        }}
                      >
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <IconButton
                        variant="contained"
                        onClick={AddNewNode}
                        sx={{ width: "35px", height: "35px", border: "1px solid gray", borderRadius: "10px" }}
                        disabled={newNode?.new}
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </Tooltip>
                  <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}></Box>
                  {diagrams.length > 0 && (
                    <FormControl sx={{}}>
                      <InputLabel>Diagram</InputLabel>
                      <Select
                        label="diagram"
                        value={selectedDiagram?.title || ""}
                        onChange={handleChangeDiagram}
                        sx={{
                          width: "200px",
                          border: "1px",
                          borderColor: "white",
                          borderRadius: "25px",
                          p: 0,
                          "& .MuiSelect-select": {
                            padding: 0,
                            p: "10px"
                          }
                        }}
                      >
                        {[...diagrams].map(diagram => (
                          <MenuItem key={diagram.id} value={diagram.title} sx={{ display: "center" }}>
                            {diagram.title}
                          </MenuItem>
                        ))}
                        {/*   <MenuItem
                        key={"diagram.id"}
                        value={""}
                        sx={{
                          display: "center",
                          backgroundColor: "orange",
                          borderRadius: "25px",
                          alignItems: "center",
                          textAlign: "center"
                        }}
                      >
                        <AddIcon /> <Typography>Add diagram</Typography>
                      </MenuItem> */}
                      </Select>
                    </FormControl>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      flexWrap: "wrap",
                      alignItems: "center"
                    }}
                  >
                    <Tooltip title={"Download as SVG"}>
                      <IconButton
                        variant="contained"
                        onClick={downloadSvg}
                        sx={{ width: "35px", height: "35px", border: "1px solid gray", borderRadius: "10px" }}
                      >
                        <GetAppIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <FormControlLabel
                    control={
                      <Tooltip title={darkMode ? "Turn on the light" : "Turn off the light"}>
                        <Box
                          onClick={toggleTheme}
                          sx={{
                            border: "1px solid gray",
                            borderRadius: "10px",
                            p: 0.5,
                            pb: 0.3,
                            ":hover": {
                              backgroundColor: !darkMode ? "#e0e0e0" : "gray"
                            }
                          }}
                        >
                          {darkMode ? <WbSunnyIcon sx={{ color: "white" }} /> : <BedtimeIcon sx={{ color: "gray" }} />}
                        </Box>
                      </Tooltip>
                    }
                  />
                </Box>
                {!!newNode && (
                  <Paper
                    sx={{
                      position: "absolute",
                      top: "13%",
                      right: "10px",
                      zIndex: "1000",
                      transform: "translateY(-50%)",
                      display: "flex",
                      gap: "22px",
                      p: "9px",
                      backgroundColor: darkMode ? "#272727" : "#d0d0d0",
                      borderRadius: "25px"
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", borderRadius: "20px" }}>
                      <Typography sx={{ paddingBottom: "13px" }}>
                        {!!newNode?.new ? "Add new node:" : `Modify the node ${newNode.label}:`}
                      </Typography>
                      <TextField
                        label="Title"
                        variant="outlined"
                        value={newNode.label}
                        fullWidth
                        sx={{ width: "95%", m: 0.5 }}
                        onChange={e => {
                          setNewNode(prev => {
                            const _prev = { ...prev };
                            _prev.label = e.target?.value || "";
                            return _prev;
                          });
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
                              value={newNode.nodeType.toLowerCase()}
                              label="Type"
                              onChange={e => {
                                setNewNode(prev => {
                                  const _prev = { ...prev };
                                  _prev.nodeType = e.target.value;
                                  return _prev;
                                });
                              }}
                              sx={{ width: "100%", border: "1px", borderColor: "white" }}
                            >
                              {Object.values(nodeTypes).map((row, index) => (
                                <MenuItem
                                  key={row.type + index}
                                  value={row.type.toLowerCase()}
                                  sx={{ display: "center" }}
                                >
                                  {row.type}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl>
                            <InputLabel>children</InputLabel>
                            <Select
                              label="children"
                              value={newNode.children}
                              multiple
                              onChange={e => {
                                setNewNode(prev => {
                                  const _prev = { ...prev };
                                  _prev.children = e.target.value;
                                  return _prev;
                                });
                              }}
                              sx={{ width: "100%", border: "1px", borderColor: "white" }}
                            >
                              {Object.values(nodes).map(node => (
                                <MenuItem key={node.id + node.label} value={node.id} sx={{ display: "center" }}>
                                  {node.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl>
                            <InputLabel>Groups</InputLabel>
                            <Select
                              label="Groups"
                              value={newNode.groups.map(g => g.id)} // Map selected groups to their IDs
                              multiple
                              onChange={e => {
                                setNewNode(prev => ({
                                  ...prev,
                                  groups: groups.filter(g => e.target.value.includes(g.id)) // Get full objects based on selected IDs
                                }));
                              }}
                              sx={{ width: "100%", border: "1px", borderColor: "white" }}
                            >
                              {groups.map(group => (
                                <MenuItem key={group.id} value={group.id} sx={{ display: "center" }}>
                                  {group.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        <Box sx={{ mt: "14px", display: "flex", gap: "7px", width: "500px", mx: "14px" }}>
                          <Button
                            onClick={handleSave}
                            variant="contained"
                            sx={{ borderRadius: "25px" }}
                            disabled={
                              !newNode.label.trim() ||
                              !newNode.children.length ||
                              !newNode.nodeType.trim() ||
                              !newNode.groups.length
                            }
                          >
                            {!!newNode?.new ? "Add" : "Save"}
                          </Button>

                          <Button onClick={handleClose} autoFocus sx={{ borderRadius: "25px" }}>
                            Cancel
                          </Button>
                          {!newNode?.new && (
                            <Button
                              color="error"
                              onClick={deleteNode}
                              variant="contained"
                              sx={{ borderRadius: "25px", ml: "auto" }}
                            >
                              Delete Node
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                )}
                {selectedLink && (
                  <Paper
                    sx={{
                      position: "absolute",
                      top: "23%",
                      right: "10px",
                      zIndex: "1000",
                      transform: "translateY(-50%)",
                      display: "flex",
                      gap: "22px",
                      p: "9px",
                      width: "500px",
                      flexDirection: "column",
                      borderRadius: "15px",
                      backgroundColor: darkMode ? "#272727" : "#d0d0d0"
                    }}
                    elevation={4}
                  >
                    <Box sx={{ display: "flex", gap: "10px" }}>
                      <Typography sx={{ fontWeight: "bold", fontSize: "19px" }}>
                        Editing the link:{" "}
                        <strong style={{ color: "orange" }}>{nodes[selectedLink.source].label}</strong>
                      </Typography>
                      <ArrowForwardIcon />
                      <Typography>
                        <strong style={{ color: "orange" }}>{nodes[selectedLink.target].label}</strong>
                      </Typography>
                    </Box>

                    <TextField
                      label="Detail"
                      variant="outlined"
                      value={selectedLink.detail}
                      onChange={e => {
                        setSelectedLink(prev => {
                          const _prev = { ...prev };
                          _prev.detail = e.target.value;
                          return _prev;
                        });
                      }}
                      fullWidth
                      multiline
                      rows={3}
                      sx={{ width: "95%", m: 0.5 }}
                    />
                    <FormControl>
                      <InputLabel>Certainty</InputLabel>
                      <Select
                        value={selectedLink.certainty}
                        label="Certainty"
                        onChange={e => {
                          setSelectedLink(prev => {
                            const _prev = { ...prev };
                            _prev.certainty = e.target.value;
                            return _prev;
                          });
                        }}
                        sx={{ width: "100%", border: "1px", borderColor: "white" }}
                      >
                        {["known", "hypothetical"].map((row, index) => (
                          <MenuItem key={row + index} value={row} sx={{ display: "center" }}>
                            {row}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <InputLabel>Polarity</InputLabel>
                      <Select
                        value={selectedLink.polarity}
                        label="Polarity"
                        onChange={e => {
                          setSelectedLink(prev => {
                            const _prev = { ...prev };
                            _prev.polarity = e.target.value;
                            return _prev;
                          });
                        }}
                        sx={{ width: "100%", border: "1px", borderColor: "white" }}
                      >
                        {["positive", "negative"].map((row, index) => (
                          <MenuItem key={row + index} value={row} sx={{ display: "center" }}>
                            {row}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box sx={{ display: "flex", flexDirection: "inline", gap: "15px" }}>
                      <Button onClick={handleSaveLink} variant="contained" sx={{ borderRadius: "25px" }}>
                        Save
                      </Button>{" "}
                      <Button color="error" variant="contained" onClick={deleteLink} sx={{ borderRadius: "25px" }}>
                        Delete Link
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedLink(null);
                        }}
                        autoFocus
                        sx={{ borderRadius: "25px" }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Paper>
                )}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: "0%",
                    left: openSideBar ? "25%" : "10px",
                    zIndex: "1000",
                    transform: "translateY(-50%)"
                  }}
                >
                  {Object.keys(nodes).length > 0 && !isMobile && (
                    <Box sx={{ display: "flex" }}>
                      {Object.values(nodeTypes).map((resource, index) => (
                        <ColorBox
                          id={resource.id}
                          key={resource.type + index}
                          text={resource.type}
                          color={resource.color}
                        />
                      ))}
                      {editor && (
                        <Tooltip title="Add new node type">
                          <IconButton
                            sx={{
                              display: "flex",
                              borderRadius: "50%",
                              alignItems: "center",
                              fontSize: 13,
                              ml: 6,
                              mr: 0.5,
                              textAlign: "center",
                              width: "40px",
                              height: "40px",
                              backgroundColor: "orange"
                            }}
                            onClick={() => {
                              setIsModalAddTypeOpen(true);
                            }}
                            variant="contained"
                          >
                            <AddIcon sx={{ color: "white" }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Box sx={{ gap: "13px", display: "flex", mx: "6px" }}>
                        {Object.entries(LINKS_TYPES).map(resource => (
                          <Box key={resource[0]} sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <TrendingFlatIcon style={{ fontSize: "40px", color: resource[1].color }} />
                            <Typography sx={{ fontSize: "14px", color: resource[1].color }}>{resource[0]}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={openSideBar && !isMobile ? 3 : 0}>
              {openSideBar && (
                <Paper
                  sx={{
                    height: "100vh",
                    overflowY: "auto",
                    direction: "rtl",
                    backgroundColor: darkMode ? "#4b4949" : "#f5f5f5",
                    // borderRadius: 3,
                    boxShadow: 3,
                    borderRight: darkMode ? "1px solid white" : "1px solid black",
                    "&::-webkit-scrollbar": {
                      display: "none"
                    }
                  }}
                >
                  <Box
                    sx={{
                      direction: "ltr",
                      "&::-webkit-scrollbar": {
                        display: "none"
                      },
                      mb: 4
                    }}
                  >
                    <Box
                      sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        p: 1,
                        backgroundColor: darkMode ? "#4b4949" : "#f5f5f5",
                        borderBottom: darkMode ? "1px solid white" : "1px solid black"
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography sx={{ fontWeight: "bold", fontSize: "20px" }}>
                          Choose groups to show their causal relations:
                        </Typography>
                        {openSideBar && !isMobile && (
                          <IconButton
                            sx={{
                              boxShadow: 1,
                              "&:hover": { backgroundColor: "#f0f0f0" }
                            }}
                            onClick={handleOpenSidBar}
                          >
                            <CloseIcon sx={{ "&:hover": { color: darkMode ? "black" : "" } }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <CollabTree
                        data={groups}
                        setData={setGroups}
                        setSelectedGroups={setSelectedGroups}
                        selectedGroups={selectedGroups}
                      />
                      {/* <CheckBox checked={false} /> */}
                    </Box>
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box
          sx={{
            backgroundColor: darkMode ? "#272727" : "",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <LoadingButton variant="contained" onClick={generateNewDiagram} loading={loadingResponse}>
            Generate a diagram
          </LoadingButton>
        </Box>
      )}
      {editor && (
        <AddNodeTypeModal
          open={isModalAddTypeOpen}
          onClose={() => {
            setIsModalAddTypeOpen(false);
            setEditNodeType(null);
          }}
          onSave={saveNewType}
          editNodeType={editNodeType}
        />
      )}
      {ConfirmDialog}
      {PromptDialog}
    </Box>
  );
};
export default OneCademyCollaborationModel;
