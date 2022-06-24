import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import TextField from '@mui/material/TextField';
import Plot from 'react-plotly.js';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { ButtonGroup } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
let dataArray = require('../data');
import TimelineIcon from '@mui/icons-material/Timeline';
import HistoryIcon from '@mui/icons-material/History';
import { useElementSize } from 'usehooks-ts';
import signalsImport from '../messages.json';
import Signal from "./Signal";
import * as sio from "../index"

const SearchBar = ({ setSearchQuery }) => (
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
);

const filterData = (query, data) => {
    if (!query) {
        return data.splice(0, 20);
    } else {
        return data.filter((d) => d.toLowerCase().startsWith(query.toLowerCase())).splice(0, 20);
    }
};

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

    // Initialize list of signals to be searched
    const searchData = [];

    // import all continuous signals so we can search trough them
    signalsImport.forEach(signal => {

        // check if a signals has at least 1 value that is continuous
        if (signal["Data types"].includes("int") || signal["Data types"].includes("float")) {

            // create arrays for the datatypes and fieldnames contained in the signal
            const dataTypesArr = signal["Data types"].split(',');
            const fieldNamesArr = signal["Field names"].split(',');

            // Check if the number of found datatypes and fieldnames match
            if (dataTypesArr.length != fieldNamesArr.length) {
                console.log('Arrays not of same size!')
            } else {

                // For every datatype-fieldname pair, check:
                for (let i = 0; i < dataTypesArr.length; i++) {

                    // Do we find a continuous signal? then:
                    if (!dataTypesArr[i].includes("int") || !dataTypesArr[i].includes("float")) {

                        // We push the signal name together with the fieldname to the searchlist
                        searchData.push(signal.Name + " - " + fieldNamesArr[i])
                    }
                }
            }
        }
    });

    const [plotName, setPlotName] = useState(props.plotName)
    const [signals, setSignals] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const dataFiltered = filterData(searchQuery, searchData);

    const [open, setOpen] = React.useState(false);
    const [selectedCar, setSelectedCar] = React.useState(1);
    const [historic, setHistoric] = React.useState(false);

    const [containerRef, { width, height }] = useElementSize();


    // Add useEffect to check state of updated signals
    useEffect(() => { props.onChangePlot(plotName, signals) }, [signals]);


    const historicButton = <TimelineIcon />
    const realtimeButton = <HistoryIcon />

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

    const handleTimeMode = () => {
        setHistoric(historic => !historic);
    }

    const handleAddSignal = (e) => {

        // Add a signal. default post processing and color are handled by the signal component.
        const newSignals = signals.concat({ signalName: e.target.value });

        // Set newSignals to be the new signals array
        setSignals(newSignals);

        sio.subscribe(e.target.value.split(" - ")[0], "car" + selectedCar);
    }

    const clearSignals = () => {
        signals.forEach((signal) => {
            sio.unsubscribe(signal.signalName.split(" - ")[0], "car" + selectedCar);
        })
        setSignals([]);
    }

    const handleChangeCar = (car) => {
        clearSignals();
        setSelectedCar(car);
    }

    const handleRemoveSignal = (signalName) => {

        // Filter the current signals array for the signalName we got, set it to a new array
        const newSignals = signals.filter((obj) => {
            return obj.signalName != signalName;
        }) 
        
        // If there are no other signals that share the same source, unsubscribe from the source signal
        if (newSignals.filter(signal => signal.signalName.split(" - ")[0] == signalName.split(" - ")[0]).length == 0) {
            sio.unsubscribe(signalName.split(" - ")[0], "car" + selectedCar);
        }

        // Set newSignals to be the new signals array
        setSignals(newSignals);
    }

    const handleChangeSignal = (signalName, pp, color) => {

        // Find index of object we want to change
        const signalIndex = signals.findIndex((signal => signal.signalName == signalName));

        // copy the original array, as to not mutate the original array
        const newSignals = [...signals];

        // change the value that we want to change
        newSignals[signalIndex] = { signalName, pp, color };

        // Send it to console for checking
        console.log('signals changed to: ', newSignals[signalIndex])

        // Set the newSignals array as the new array
        setSignals(newSignals);

    }

    const handleChangePlotName = (e) => {
        setPlotName(e.target.value);
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

    return (
        <div class="plotContainer" ref={containerRef}>
            <div className="plotTitleContainer">
                <Button variant="text" onClick={handleClickOpen} className="plotTitleButton">
                    <EditIcon />
                </Button>
                <p>{plotName}</p>
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
                <DialogTitle><TextField id="standard-basic" variant="standard" defaultValue={plotName} onBlur={handleChangePlotName} /></DialogTitle>
                <DialogContent>
                    <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button color={selectedCar === 1 ? "secondary" : "primary"} onClick={() => handleChangeCar(1)}>Lux</Button>
                        <Button color={selectedCar === 2 ? "secondary" : "primary"} onClick={() => handleChangeCar(2)}>Stella</Button>
                        <Button color={selectedCar === 3 ? "secondary" : "primary"} onClick={() => handleChangeCar(3)}>Vie</Button>
                    </ButtonGroup>

                    <div className="signalContainer">
                        <div className="plotMenuItem bold">
                            <div>Sensor</div>
                            <div>Post-processing</div>
                            <div>Color</div>
                            <div></div>
                        </div>

                        {/* render list of added signals */}
                        {signals.map(signal => {
                            return (<Signal signalName={signal.signalName} pp={signal.pp} color={signal.color} onRemoveSignal={handleRemoveSignal} onChangeSignal={handleChangeSignal} />)
                        })}



                        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                        <div style={{ padding: 3 }} className="searchResults">
                            {dataFiltered.map((d) => (

                                <button key={d.id} className="searchResult" value={d} onClick={handleAddSignal}>
                                    {d}
                                </button>


                            ))}
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} type="submit">Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default PlotContent;
