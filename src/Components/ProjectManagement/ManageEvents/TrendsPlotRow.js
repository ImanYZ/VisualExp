// import "./TrendsPlotRow.css";

import { Box } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryZoomContainer } from "victory";

const gray300 = "#D0D5DD";
const gray200 = "#EAECF0";
const gray800 = "#1D2939";
const primary600 = "#00b0ff";
const TrendsPlotRow = props => {
  const [zoomDomain, setZoomDomain] = useState({});
  const chartRef = useRef(null);
  const legendChartRef = useRef(null);

  useEffect(() => {
    if (!chartRef) return;
    if (!legendChartRef) return;

    const chartContainer = chartRef.current;
    const chartLegendContainer = legendChartRef.current;
    if (!chartContainer) return;
    if (!chartLegendContainer) return;

    const rect = chartContainer.querySelector("rect");
    const rectLegend = chartLegendContainer.querySelector("rect");

    if (!rect) return;
    if (!rectLegend) return;

    rect.setAttribute("rx", "10");
    rectLegend.setAttribute("rx", "10");
  }, []);

  useEffect(() => {
    if (props.trendData.length !== 0) {
      let oneThirdIndex = Math.floor(props.trendData.length / 3);
      let oneThirdValue = props.trendData[oneThirdIndex][props.x];
      let twoThirdIndex = Math.floor((props.trendData.length * 2) / 3);
      let twoThirdValue = props.trendData[twoThirdIndex][props.x];
      if (props.x === "date") {
        // console.log({ oneThirdValue, twoThirdValue });
        oneThirdValue = new Date(oneThirdValue);
        twoThirdValue = new Date(twoThirdValue);
      }
      setZoomDomain({
        x: [twoThirdValue, oneThirdValue]
      });
    }
  }, [props.trendData, props.x]);

  return (
    <Box className="TrendPlotRow">
      <Box ref={chartRef}>
        <VictoryChart
          padding={{ top: 0, left: 50, right: 4, bottom: 32 }}
          width={props.width}
          height={props.heightTop}
          theme={VictoryTheme.material}
          domainPadding={25}
          scale={{ x: props.scaleX, y: "linear" }}
          containerComponent={
            <VictoryZoomContainer zoomDimension="x" zoomDomain={zoomDomain} onZoomDomainChange={setZoomDomain} />
          }
          style={{
            background: {
              fill: gray200
            }
          }}
        >
          <VictoryAxis
            scale={props.scaleX}
            style={{
              axis: { stroke: "transparent", size: 0 },
              ticks: { size: 0 },
              tickLabels: {
                fontSize: 12,
                fill: gray800
              },

              grid: {
                stroke: gray300,
                strokeDasharray: null
              }
            }}
          />
          <VictoryAxis
            dependentAxis
            scale={props.scaleY}
            style={{
              axis: { stroke: "transparent" },
              tickLabels: {
                fontSize: 12,
                fill: gray800
              },
              ticks: { size: 0 },
              grid: {
                stroke: gray300,
                strokeDasharray: null
              }
            }}
          />
          <VictoryBar
            barWidth={4}
            style={{
              data: { fill: primary600 }
            }}
            data={props.trendData}
            x={props.x}
            y={props.y}
          />
        </VictoryChart>
      </Box>
    </Box>
  );
};

export default React.memo(TrendsPlotRow);
