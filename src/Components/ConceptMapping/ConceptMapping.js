import React, { useEffect } from "react";

import dagre from "dagre";
import dagreD3 from "dagre-d3";
import * as d3 from "d3";

import "./ConceptMapping.css";

let svg, inner;

const ConceptMapping = (props) => {
  useEffect(() => {
    svg = d3
      .select("#CMapContainer")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    inner = svg.append("g");
    const zoom = d3.zoom().on("zoom", function (event) {
      inner.attr("transform", event.transform);
    });
    svg.call(zoom);
  }, []);

  useEffect(() => {
    const g = new dagre.graphlib.Graph({ compound: true });

    g.setGraph({
      rankdir: "TD",
      node: { shape: "rectangle", style: "rounded" },
    });

    g.setDefaultEdgeLabel(function () {
      return {};
    });

    // g.setNode("Sample", { label: "Sample" });
    // g.setNode("Main", { label: "Main" });
    for (let cIdx = 0; cIdx < props.cMap.length; cIdx++) {
      const cRow = props.cMap[cIdx];
      if (cRow.from && cRow.to) {
        g.setNode(cRow.from, { label: cRow.from });
        g.setNode(cRow.to, { label: cRow.to });
        // if (cIdx < 4) {
        //   g.setParent(cRow.from, "Sample");
        //   g.setParent(cRow.to, "Sample");
        // } else {
        //   g.setParent(cRow.from, "Main");
        //   g.setParent(cRow.to, "Main");
        // }
        g.setEdge(cRow.from, cRow.to, {
          label: cRow.link,
          curve: d3.curveBasis,
        });
      }
    }
    {
      // g.setNode("p1", { label: "p1", shape: "ellipse", rx: 0.01, ry: 0.01 });
      // g.setNode("h1", { label: "h1", width: 40, height: 40 });
      // g.setNode("o1", { label: "o1" });
      // g.setNode("o2", { label: "o2" });
      // g.setNode("t1a", { label: "t1a" });
      // g.setNode("t1b", { label: "t1b" });
      // g.setNode("t2a", { label: "t2a" });
      // g.setNode("e1", { label: "e1" });
      // g.setNode("e2", { label: "e2" });
      // g.setNode("e3", { label: "e3" });
      // g.setNode("e4", { label: "e4" });
      // g.setNode("e5", { label: "e5" });
      // g.setNode("e6", { label: "e6" });
      // g.setNode("x", { label: "x" });
      // g.setNode("Ps", {
      //   label: "",
      //   style: "fill: transparent",
      // });
      // g.setParent("p1", "Ps");
      // g.setNode("Hs", {
      //   label: "",
      //   style: "fill: transparent",
      // });
      // g.setParent("h1", "Hs");
      // g.setNode("Os", {
      //   label: "",
      //   style: "fill: transparent",
      // });
      // g.setParent("o1", "Os");
      // g.setParent("o2", "Os");
      // g.setNode("Ts", {
      //   label: "",
      //   style: "fill: transparent",
      // });
      // g.setParent("t1a", "Ts");
      // g.setParent("t1b", "Ts");
      // g.setParent("t2a", "Ts");
      // Add edges to the graph.
      // g.setEdge("h1", "p1", { curve: d3.curveBasis });
      // g.setEdge("o1", "h1", { curve: d3.curveBasis });
      // g.setEdge("o2", "h1", { curve: d3.curveBasis });
      // g.setEdge("t1a", "o1", { curve: d3.curveBasis });
      // g.setEdge("t1b", "o1", { curve: d3.curveBasis });
      // g.setEdge("t2a", "o2", { curve: d3.curveBasis });
      // g.setEdge("e1", "t1a", { label: "label", curve: d3.curveBasis });
      // g.setEdge("x", "t1a", { label: "label", curve: d3.curveBasis });
      // g.setEdge("x", "e1", { curve: d3.curveBasis });
      // g.setEdge("e2", "t1b", { label: "label", curve: d3.curveBasis });
      // g.setEdge("x", "t1b", { label: "label", curve: d3.curveBasis });
      // g.setEdge("x", "e2", { curve: d3.curveBasis });
      // g.setEdge("x", "e6", { curve: d3.curveBasis });
      // g.setEdge("e6", "e5", { curve: d3.curveBasis });
      // g.setEdge("e5", "e4", { curve: d3.curveBasis });
      // g.setEdge("e4", "e3", { curve: d3.curveBasis });
      // g.setEdge("e3", "t2a", { label: "label", curve: d3.curveBasis });
    }
    dagre.layout(g, { rankdir: "TD" });

    var render = new dagreD3.render();
    render(inner, g);
  }, [props.cMap]);

  return <div id="CMapContainer"></div>;
};

export default ConceptMapping;
