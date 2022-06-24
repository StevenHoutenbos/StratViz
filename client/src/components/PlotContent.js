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

let dataArray = require('../data');

const primary = teal[500];

function timeConverter(UNIX_timestamp) {
    let a = new Date(UNIX_timestamp * 1000);
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = a.getHours();
    let min = a.getMinutes();
    let sec = a.getSeconds();
    let time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

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

    // Static randomized JSON objects for testing purposes
    let data = [JSON.parse('{"timestamp":"' + new Date(2019, 1, 2).toDateString() + '", "value":' + 40 + '}')];
    for (let i = 1; i < 200; i++) {
        let date = new Date(2019, 1, 2+i);
        let string = "" + date.getMonth() + "/" + date.getDate() + " " + date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds();
        data.unshift(JSON.parse('{"timestamp":"' + date + '", "value":' + String(data[0].value+((Math.random()-0.5)*10)) + '}'));
    }

    let x = [];
    let y = [];

    // Actual dynamic data input
    // TODO: Use actual names as used in development
    for (let j=0; j < dataArray.length; j++) {
        if (dataArray[j].topic == subscribed_topic && dataArray[j].key == subscribed_key) {
            x.push(timeConverter(dataArray[j].timestamp));
            y.push(dataArray[j].signalValue)
        }
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
            autorange: true,
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
