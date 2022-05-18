import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

const TypographyUnderlined = styled(Typography)(() => ({
  display: "inline-block",
  paddingBottom: "7px",
  position: "relative",
  color: "white",
  "&::before": {
    content: '""',
    position: "absolute",
    width: "50%",
    height: "1px",
    bottom: "0",
    left: "25%",
    borderBottom: "1px solid #ff8a33 ",
  },
}));

export default TypographyUnderlined;
