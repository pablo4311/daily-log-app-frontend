import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import Box from "@mui/material/Box";
import CanvasComponent from "./CanvasComponent";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog({showDialogStatus, handleDialogClose, totalHour, dutyType, day, logs, totalMile, sheetDay, sheetMonth, sheetYear, value}) {
  const [open, setOpen] = React.useState(false);
  
  const handleClose = () => {
    handleDialogClose(false)
  };

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={showDialogStatus}
        onClose={handleClose}
        slots={{
          transition: Transition,
        }}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
          
            <Typography sx={{ ml: 2, flex: 1, color:'white' }} variant="h6" component="div">
              Driver's Daily Log
            </Typography>
              <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              style={{color:'white'}}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{textAlign:'center'}}>
          <CanvasComponent totalHour={totalHour} dutyType={dutyType} day={day} logs={logs} totalMile={totalMile} sheetDay={sheetDay} sheetMonth={sheetMonth} sheetYear={sheetYear} value={value} />
        </Box>
      </Dialog>
    </React.Fragment>
  );
}
