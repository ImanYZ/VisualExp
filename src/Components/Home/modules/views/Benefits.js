import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { gray200, gray300, gray50, orangeDark } from "../../../../utils/colors";

import valuesItems from "./valuesItems";

const Benefits = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState("Option1");
  const [selectedValue, setSelectedValue] = useState(valuesItems[0] ?? null);

  const handleChange = (option, name) => (event, newExpanded) => {
    setExpanded(newExpanded ? option : false);
    const newSelectedValues = valuesItems.find(value => value.name === name) ?? valuesItems[0];
    setSelectedValue(newExpanded ? newSelectedValues : null);
  };

  const getImage = (value, sx) => {
    return value ? (
      <Box
        sx={{
          width: { xs: "350px", sm: "400px", md: "450px", lg: "600px" },
          minWidth: { xs: "350px", sm: "400px", md: "450px", lg: "600px" },
          height: { xs: "350px", sm: "400px", md: "450px", lg: "600px" },
          alignSelf: "center",
          ...sx
        }}
      >
        <img src={`/benefits/${value.imageDark}`} alt={value.name} style={{ width: "100%", height: "100%" }} />
      </Box>
    ) : null;
  };

  return (
    <Stack direction={{ xs: "column-reverse", md: "row" }} justifyContent={"space-between"} sx={{ margin: "auto" }}>
      <Box sx={{ maxWidth: { xs: "none", md: "500px" } }}>
        {valuesItems.map((value, idx) => (
          <Accordion
            key={value.name}
            disableGutters
            elevation={0}
            square
            sx={{
              background: "transparent",
              border: "none",
              borderLeft: `4px solid ${expanded === `Option${idx + 1}` ? orangeDark : gray200}`,
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
                  background: theme => (theme.palette.mode === "light" ? "black" : gray50),
                  color: "black"
                }
              }}
            >
              <Typography
                component={"h4"}
                variant={"h4"}
                sx={{
                  color: gray200,
                  fontSize: "20px",
                  fontWeight: 400,
                  p: "8px",
                  cursor: "pointer",
                  
                }}
              >
                {value.name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                sx={{ p: "8px", pt: "0" }}
                fontSize={"16px"}
                color={theme.palette.mode === "dark" ? "#475467" : "#EAECF0"}
              >
                {value.body}
              </Typography>

              {getImage(value, { display: { xs: "block", md: "none" }, m: "0 auto" })}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {getImage(selectedValue, { display: { xs: "none", md: "block" } })}
    </Stack>
  );
};
export default Benefits;
