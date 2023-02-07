import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Stack, Typography, useTheme } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { RiveComponentMemoized } from "../../../Rive/RiveComponentMemoized";
import { gray100, gray200, gray25, gray300, gray50, orangeDark } from "../../Communities";
import { RE_DETECT_NUMBERS_WITH_COMMAS, wrapStringWithBoldTag } from "./HowItWorks";
import whichValues from "./whichItems";

const Systems = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState("Option1");
  const [selectedValue, setSelectedValue] = useState(whichValues[0] ?? null);

  const [stats, setStats] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await fetch("https://1cademy.com//api/stats");
      const data = await response.json();

      setStats(data);
    })();
  }, []);

  const getDescription = useCallback(
    whichItem => {
      if (!whichItem.getBody) return whichItem.body;
      if (!stats) return whichItem.body;

      stats.communities = "49";
      return whichItem.getBody(stats);
    },
    [stats]
  );

  const handleChange = (option, name) => (event, newExpanded) => {
    setExpanded(newExpanded ? option : false);
    const newSelectedValues = whichValues.find(value => value.name === name) ?? whichValues[0];
    setSelectedValue(newExpanded ? newSelectedValues : null);
  };

  const getAnimation = (value, sx) => {
    return value ? (
      <Box
        sx={{
          width: { xs: "350px", sm: "400px", md: "450px", lg: "600px", xl: "750px" },
          height: {
            xs: getHeight(350),
            sm: getHeight(400),
            md: getHeight(450),
            lg: getHeight(600),
            xl: getHeight(750)
          },
          alignSelf: "center",
          ...sx
        }}
      >
        {value.id === "notebook" && (
          <RiveComponentMemoized
            src="notebook.riv"
            artboard={"artboard-6"}
            animations={["Timeline 1", "dark"]}
            autoplay={true}
          />
        )}
        {value.id === "assistant" && (
          <RiveComponentMemoized
            src="goals.riv"
            artboard={"artboard-3"}
            animations={["Timeline 1", "dark"]}
            autoplay={true}
          />
        )}
        {value.id === "extensions" && (
          <RiveComponentMemoized
            src="extension.riv"
            artboard={"extension"}
            animations={["Timeline 1", "dark"]}
            autoplay={true}
          />
        )}
      </Box>
    ) : null;
  };

  return (
    <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent={"space-between"} sx={{ margin: "auto" }}>
      <Box sx={{ maxWidth: "500px", flex: 1 }}>
        {whichValues.map((value, idx) => (
          <Accordion
            key={value.name}
            disableGutters
            elevation={0}
            square
            sx={{
              background: "transparent",
              border: "none",
              borderLeft: `4px solid ${
                expanded === `Option${idx + 1}` ? orangeDark : theme.palette.mode === "dark" ? gray25 : gray100
              }`,
              "&:before": {
                display: "none"
              },
              ":hover": {
                borderLeft: theme =>
                  expanded !== `Option${idx + 1}`
                    ? theme.palette.mode === "light"
                      ? `4px solid ${gray300}`
                      : `4px solid ${gray300}`
                    : undefined
              }
            }}
            expanded={expanded === `Option${idx + 1}`}
            onChange={handleChange(`Option${idx + 1}`, value.name)}
          >
            <AccordionSummary
              sx={{
                ":hover": {
                  background: theme => (theme.palette.mode === "dark" ? "black" : gray50),
                  color: "black"
                }
              }}
            >
              <Typography
                component={"h4"}
                variant={"h4"}
                fontSize={20}
                sx={{ color: gray200, fontWeight: 400, p: "8px", cursor: "pointer" ,":hover": {
                  color: "black"
                }}}
              >
                {value.name}
              </Typography>
              <Button
                variant="text"
                href={value.link}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                sx={{ color: orangeDark }}
              >
                Visit
                <ArrowForwardIcon fontSize={"small"} sx={{ ml: "10px" }} color="inherit" />
              </Button>
            </AccordionSummary>
            <AccordionDetails>
              {getDescription(value)
                .split("\n")
                .map((paragraph, idx) => (
                  <Typography
                    key={idx}
                    fontSize={"16px"}
                    color={theme.palette.mode === "dark" ? "#475467" : "#EAECF0"}
                    sx={{ p: "8px", pt: "0" }}
                  >
                    {wrapStringWithBoldTag(paragraph, RE_DETECT_NUMBERS_WITH_COMMAS)}
                  </Typography>
                ))}

              {getAnimation(value, {
                display: { xs: "block", sm: "none" },
                m: "0 auto",
                opacity: selectedValue?.id !== value.id ? "0" : "1"
              })}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {getAnimation(selectedValue, { display: { xs: "none", sm: "block" }, flex: 1 })}
    </Stack>
  );
};
const getHeight = width => (300 * width) / 500;
export default Systems;
