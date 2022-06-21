import React, { useState } from "react";
import { Button } from "@mui/material";
import TextField from '@mui/material/TextField';
import Plot from 'react-plotly.js';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ButtonGroup } from "@mui/material";
import { teal } from "@mui/material/colors";
import EditIcon from '@mui/icons-material/Edit';
import * as socketData from '../index.js';

const primary = teal[500];

function PlotContent(props) {

    const [open, setOpen] = React.useState(false);
    const [selectedBtn, setSelectedBtn] = React.useState(1);

    const activeColor = teal[500]

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    let data = [JSON.parse('{"timestamp":"' + new Date(2019, 1, 2).toDateString() + '", "value":' + 40 + '}')];
    for (let i = 1; i < 200; i++) {
        let date = new Date(2019, 1, 2+i);
        let string = "" + date.getMonth() + "/" + date.getDate() + " " + date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds();
        data.unshift(JSON.parse('{"timestamp":"' + date + '", "value":' + String(data[0].value+((Math.random()-0.5)*10)) + '}'));
    }
    console.log(data);
    // If the connection to the database works, all we should need to do is switch from the line above to
    // const data = plotData

    let x = [];
    let y = [];

    for (let i = 0; i < data.length; i++) {
        x.push(data[i].timestamp);
        // TODO: Switch to actual signal name when connection is up
        y.push(data[i].value);
    }

    let trace = {
        type: "scatter",
        fill: "tozeroy",
        mode: "lines",
        name: props.plotName,
        x: x,
        y: y,
        line: { color: props.graphColor }
    }

    let styling = {
        title: props.plotName,
        xaxis: {
            autorange: false,
            range: [new Date(2019, 1, 100).toDateString(), new Date(2019, 1, 105).toDateString()],
            rangeslider: { range: [new Date(2019, 1, 100).toDateString(), new Date(2019, 1, 105).toDateString()] },
            type: 'datetime',
            tickformat: '%d %B (%a)\n %Y'
        },
        yaxis: {
            autorange: true,
            range: [0, 100],
            type: "linear"
        },
        autosize: true,
        useResizeHandler: true,
        className: "plotGraph"
    };

    // console.log(trace.x);


    return (
        <div class="plotContainer">
            <Plot
                data={[trace]}
                layout={styling}
            />
            <Button variant="outlined" onClick={handleClickOpen} class="editButton" style={{ position: "relative", top: "-210px", borderRadius: "10px" }}>
                <EditIcon />
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{props.plotName}</DialogTitle>
                <DialogContent>
                    <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button color={selectedBtn === 1 ? "secondary" : "primary"} onClick={() => setSelectedBtn(1)}>Lux</Button>
                        <Button color={selectedBtn === 2 ? "secondary" : "primary"} onClick={() => setSelectedBtn(2)}>Stella</Button>
                        <Button color={selectedBtn === 3 ? "secondary" : "primary"} onClick={() => setSelectedBtn(3)}>Vie</Button>
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
        </div>
    )
}

export default PlotContent;
