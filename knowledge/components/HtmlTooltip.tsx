import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses,TooltipProps } from "@mui/material/Tooltip";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    maxWidth: "340px",
    fontWeight: theme.typography.fontWeightRegular,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    border: `1px solid ${theme.palette.grey[400]}`
  }
}));

export default HtmlTooltip;
