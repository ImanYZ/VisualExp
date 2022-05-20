import React, { FC } from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";

type Props = {
  onClose: () => void;
  open: boolean;
  src: string;
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FullScreenImage: FC<Props> = ({ src, open, onClose }) => {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography
            sx={{ ml: 2, flex: 1, color: "white" }}
            variant="h6"
            component="div"
          >
            Full-screen View
          </Typography>
        </Toolbar>
      </AppBar>
      <img src={src} width="100%" />
    </Dialog>
  );
};

export default FullScreenImage;
