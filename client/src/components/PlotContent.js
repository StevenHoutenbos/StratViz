import React, { useState } from "react";
import { Button } from "@mui/material";
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ButtonGroup } from "@mui/material";
import { teal } from "@mui/material/colors";

const primary = teal[500];

function PlotContent(props){

    const [open, setOpen] = React.useState(false);
    const [selectedBtn, setSelectedBtn] = React.useState(1);

    const activeColor = teal[500]

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
                        <ButtonGroup disableElevation variant="contained" color="primary">
                            <Button color={selectedBtn === 1 ?  "secondary" : "primary"} onClick={()=>setSelectedBtn(1)}>Lux</Button>
                            <Button color={selectedBtn === 2 ? "secondary" : "primary"} onClick={()=>setSelectedBtn(2)}>Stella</Button>
                            <Button color={selectedBtn === 3 ? "secondary" : "primary"} onClick={()=>setSelectedBtn(3)}>Vie</Button>
                        </ButtonGroup>
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