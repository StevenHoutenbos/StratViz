import React, { useState } from "react";
import { Button } from "@mui/material";
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function PlotContent(props){

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };

    return (
        <div>
            <p>
                <Button variant="outlined" onClick={handleClickOpen}>
                    {props.plotName}
                </Button>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{props.plotName}</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        Here we will display options for the plot we want to edit.
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleClose}>Save</Button>
                    </DialogActions>
                </Dialog>
            </p>
        </div>
    )
}

export default PlotContent;