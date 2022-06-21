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
import RemoveIcon from '@mui/icons-material/Remove';
import TimelineIcon from '@mui/icons-material/Timeline';
import HistoryIcon from '@mui/icons-material/History';
import { useElementSize } from 'usehooks-ts';
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
//import * as socketData from '../index.js';
import signals from '../messages.json'

const SearchBar = ({ setSearchQuery }) => (
    <form>
        <TextField
            id="search-bar"
            className="searchbar"
            onInput={(e) => {
                setSearchQuery(e.target.value);
            }}
            label="Enter signal name"
            variant="outlined"
            placeholder="Search..."
        />
    </form>
);

const filterData = (query, data) => {
    if (!query) {
        return data;
    } else {
        return data.filter((d) => d.toLowerCase().includes(query.toLowerCase()));
    }
};

function PlotContent(props) {

    const searchData = [];

    signals.forEach(signal => {
        searchData.push(signal.Name)
    });

    const [searchQuery, setSearchQuery] = useState("");
    const dataFiltered = filterData(searchQuery, searchData);

    const [open, setOpen] = React.useState(false);
    const [selectedBtn, setSelectedBtn] = React.useState(1);
    const [historic, setHistoric] = React.useState(false);

    const [containerRef, { width, height }] = useElementSize();

    const historicButton = <TimelineIcon />
    const realtimeButton = <HistoryIcon />

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleTimeMode = () => {
        setHistoric(historic => !historic);
    }

    // Static JSON object definition
    const myJSON1 = '{"timestamp":"15/06/2022 20:33:20", "value":30}';
    const myObj1 = JSON.parse(myJSON1);
    const myJSON2 = '{"timestamp":"15/06/2022 20:34:20", "value":12}';
    const myObj2 = JSON.parse(myJSON2);
    const myJSON3 = '{"timestamp":"15/06/2022 20:35:20", "value":72}';
    const myObj3 = JSON.parse(myJSON3);
    const myJSON4 = '{"timestamp":"15/06/2022 20:36:20", "value":16}';
    const myObj4 = JSON.parse(myJSON4);
    const myJSON5 = '{"timestamp":"15/06/2022 20:37:20", "value":2}';
    const myObj5 = JSON.parse(myJSON5);
    const myJSON6 = '{"timestamp":"15/06/2022 20:38:20", "value":29}';
    const myObj6 = JSON.parse(myJSON6);
    const myJSON7 = '{"timestamp":"15/06/2022 20:39:20", "value":41}';
    const myObj7 = JSON.parse(myJSON7);
    const myJSON8 = '{"timestamp":"15/06/2022 20:40:20", "value":35}';
    const myObj8 = JSON.parse(myJSON8);
    const myJSON9 = '{"timestamp":"15/06/2022 20:41:20", "value":29}';
    const myObj9 = JSON.parse(myJSON9);

    const data = [myObj1, myObj2, myObj3, myObj4, myObj5, myObj6, myObj7, myObj8, myObj9];
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
        name: "Motor Power",
        x: x,
        y: y,
        line: { color: '#17BECF' }
    }

    let styling = {
        xaxis: {
            autorange: true,
            range: ["15/06/2022 20:33:20", "15/06/2022 20:41:20"],
            rangeselector: {
                buttons: [
                    {
                        count: 1,
                        label: '1h',
                        step: 'hour',
                        stepmode: 'backward'
                    },
                    {
                        count: 6,
                        label: '6h',
                        step: 'hour',
                        stepmode: 'backward'
                    },
                    {
                        count: 12,
                        label: '12h',
                        step: 'hours',
                        stepmode: 'backward'
                    },
                    {
                        count: 24,
                        label: '24h',
                        step: 'hour',
                        stepmode: 'backward'
                    },
                    { step: 'all' }
                ]
            },
            rangeslider: { range: ["14/06/2022 20:33:20", "15/06/2022 20:41:20"] },
            type: 'datetime',
            ticks: ''
        },
        yaxis: {
            autorange: true,
            range: [0, 100],
            type: "linear"
        },
        width: width,
        height: height + 10 - 36,
        autosize: true,
        useResizeHandler: true,
        className: "plotGraph",
        margin: {
            l: 30,
            r: 10,
            b: 10,
            t: 10,
            pad: 5
        },
    };

    // console.log(trace.x);


    return (
        <div class="plotContainer" ref={containerRef}>
            <div className="plotTitleContainer">
                <Button variant="text" onClick={handleClickOpen} className="plotTitleButton">
                    <EditIcon />
                </Button>
                <p>{props.plotName}</p>
                <Button variant="text" onClick={handleTimeMode} className="plotTitleButton">
                    {historic ? historicButton : realtimeButton}
                </Button>
            </div>
            <Plot
                data={[trace]}
                layout={styling}
                config={{
                    "displaylogo": false,
                    responsive: true
                }}

            />
            <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={"md"}>
                <DialogTitle>{props.plotName}</DialogTitle>
                <DialogContent>
                    <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button color={selectedBtn === 1 ? "secondary" : "primary"} onClick={() => setSelectedBtn(1)}>Lux</Button>
                        <Button color={selectedBtn === 2 ? "secondary" : "primary"} onClick={() => setSelectedBtn(2)}>Stella</Button>
                        <Button color={selectedBtn === 3 ? "secondary" : "primary"} onClick={() => setSelectedBtn(3)}>Vie</Button>
                    </ButtonGroup>
                    <div className="plotMenuGridContainer">
                        <div className="plotMenuGridTitleWrapper">
                            <div>Sensor</div>
                            <div>Post-processing</div>
                            <div>Color</div>
                            <div></div>
                        </div>
                        <div>Dit is tekst</div>
                        <div>Dit is tekst</div>
                        <div>Dit is tekst</div>
                        <div>
                            <RemoveIcon />
                        </div>
                        <div>Dit is tekst</div>
                        <div>Dit is tekst</div>
                        <div>Dit is tekst</div>
                        <div>
                            <RemoveIcon />
                        </div>
                    </div>
                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                    <div style={{ padding: 3 }}>
                        {dataFiltered.map((d) => (
                            <div key={d.id}>
                                {d}
                            </div>
                        ))}
                    </div>
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
