import { Box, Typography } from "@mui/material";
import { forwardRef } from "react";
import { gray200, gray25, gray600 } from "../../Communities";
import { RE_DETECT_NUMBERS_WITH_COMMAS } from "./HowItWorks";
import { wrapStringWithBoldTag } from "./Which";

const getDescription = (section, stats) => {
  const statsCopy = { ...stats };
  if (!section.getDescription) return section.description;
  if (!stats) return section.description;

  stats.communities = "49";
  return section.getDescription(statsCopy);
};

export const SectionWrapper = forwardRef(({ section, children, textAlign = "left", stats }, ref) => {
  return (
    <Box
      id={section.id}
      ref={ref}
      component={"section"}
      sx={{
        
        py: { xs: "64px", sm: "96px" },
        px: { xs: "16px", sm: "32px" },
        maxWidth: "1280px",
        m: "auto",
        textAlign
        //   border: "solid 2px royalBlue",
      }}
    >
      <Box sx={{ mb: "64px" }}>
        <Typography sx={{ fontSize: "36px", mb: "20px", textTransform: "uppercase", fontWeight: 600,color:gray25 }}>
          {section.label}
        </Typography>

        {getDescription(section, stats)
          .split("\n")
          .map(paragraph => (
            <Typography
              key={paragraph}
              color={theme => (theme.palette.mode === "dark" ? gray200 : gray600)}
              sx={{ fontSize: "20px", maxWidth: textAlign === "left" ? "768px" : undefined,color:gray200 }}
            >
              {wrapStringWithBoldTag(paragraph, RE_DETECT_NUMBERS_WITH_COMMAS)}
            </Typography>
          ))}
      </Box>
      {children}
    </Box>
  );
});

SectionWrapper.displayName = "SectionWrapper";
