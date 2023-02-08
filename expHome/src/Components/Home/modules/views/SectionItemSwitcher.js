import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography, useTheme } from "@mui/material";
import React, { useMemo, useState } from "react";
import { gray100, gray200, gray25, gray300, gray50, orangeDark } from "../../Communities";




export const SectionItemSwitcher = ({ items }) => {
  const [expandedIdx, setExpandedIdx] = useState(0);
  const theme = useTheme();

  const handleChange = (idxItem) => (event, newExpanded) => {
    setExpandedIdx(newExpanded ? idxItem : -1);
  };

  const MediaComponent = useMemo(() => {
    const selectedItem = items[expandedIdx];
    if (!selectedItem) return null;

    return (
      <img
        src={`${theme.palette.mode === "dark" ? selectedItem.imageDark : selectedItem.image}`}
        alt={selectedItem.title}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }, [expandedIdx, items, theme.palette.mode]);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, columnGap: "20px" }}>
      <Box>
        {items.map((cur, idx) => (
          <Accordion
            key={cur.id}
            disableGutters
            elevation={0}
            square
            sx={{
              background: "transparent",
              border: "none",
              borderLeft: theme =>
                `4px solid ${expandedIdx === idx ? orangeDark : theme.palette.mode === "light" ? gray25 : gray100}`,
              "&:before": {
                display: "none",
              },
              ":hover": {
                borderLeft: expandedIdx !== idx ? `4px solid ${gray300}` : undefined,
              },
            }}
            expanded={expandedIdx === idx}
            onChange={handleChange(idx)}
          >
            <AccordionSummary
              sx={{
                ":hover": {
                  background: theme => (theme.palette.mode === "light" ? "black" : gray50),
                },
              }}
            >
              <Typography
                component={"h4"}
                variant={"h4"}
                sx={{
                  fontSize: "20px",
                  fontWeight: 400,
                  p: "8px",
                  cursor: "pointer",
                  color:gray200
                }}
              >
                {cur.title}
              </Typography>
              {cur.link && (
                <Button
                  variant="text"
                  href={cur.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  sx={{ color: orangeDark }}
                >
                  Visit
                  <ArrowForwardIcon fontSize={"small"} sx={{ ml: "10px" }} color="inherit" />
                </Button>
              )}
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                sx={{ p: "8px", pt: "0" }}
                fontSize={"16px"}
                color={theme => (theme.palette.mode === "dark" ? "#475467" : "#EAECF0")}
              >
                {cur.content}
              </Typography>

              <Box
                sx={{
                  width: { xs: "350px", sm: "400px", md: "450px", lg: "600px" },
                  minWidth: { xs: "350px", sm: "400px", md: "450px", lg: "600px" },
                  height: { xs: "350px", sm: "400px", md: "450px", lg: "600px" },
                  alignSelf: "center",
                  display: { xs: "block", md: "none" },
                  m: "0 auto",
                }}
              >
                {MediaComponent}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Box
        sx={{
          display: { xs: "none", md: "block" },
        }}
      >
        {MediaComponent}
      </Box>
    </Box>
  );
};
