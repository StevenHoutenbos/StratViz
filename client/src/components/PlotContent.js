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
import TimelineIcon from '@mui/icons-material/Timeline';
import HistoryIcon from '@mui/icons-material/History';
import { useElementSize } from 'usehooks-ts';
import signalsImport from '../messages.json';
import Signal from "./Signal.js";
import * as sio from "../index";
import Slider from "@mui/material/Slider";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Remove from "@mui/icons-material/Remove";


var hash = require("object-hash");

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

function PlotContent(props) {

    // Initialize list of signals to be searched
    const searchData = [];

    const minDistance = 10;
    const rangeMax = 100;
    const zoomDist = 3;

    // import all continuous signals so we can search trough them
    signalsImport.forEach(signal => {

        // check if a signals has at least 1 value that is continuous
        if (signal["Data types"].includes("int") || signal["Data types"].includes("float")) {

            // create arrays for the datatypes and fieldnames contained in the signal
            const dataTypesArr = signal["Data types"].replaceAll(" ", "").split(',');
            const fieldNamesArr = signal["Field names"].replaceAll(" ", "").split(',');

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
    const [signals, setSignals] = useState(props.signals);
    const [data, setData] = useState([]);
    const [range, setRange] = useState([10, 20])

    const [searchQuery, setSearchQuery] = useState("");
    const dataFiltered = filterData(searchQuery, searchData);

    const [open, setOpen] = React.useState(false);
    const [selectedCar, setSelectedCar] = React.useState(1);
    const [historic, setHistoric] = React.useState(false);
    const [i, setI] = useState(0);

    const [containerRef, { width, height }] = useElementSize();

    useEffect(() => {
        layout.width = width;
        layout.height = height - 26;
    }, [containerRef])

    // Add useEffect to check state of updated signals
    useEffect(() => { props.onChangePlot(props.plotId, plotName, signals) }, [signals]);
    useEffect(() => { props.onChangePlot(props.plotId, plotName, signals) }, [plotName]);
    useEffect(() => {
        sio.socket.on("dataevent", (data) => { // TODO: change to real-time only
            setData((curData) => [...curData, data]);
        })
        return function cleanup() {
            sio.socket.off("dataevent");
        };
    }, [])

    useEffect(() => {
        // data = { topic: topic, key: car, data: {data object}}
        if (data.length == 0) return;
        var sdata = data[0];
        signals.forEach((signal) => {
            if (signal.signalName.split(" - ")[0] === sdata.topic && ("car" + selectedCar) === sdata.key) {
                console.log(sdata);
                signal.trace.x.push(i);
                signal.trace.y.push(sdata.data[signal.signalName.split(" - ")[1]]);

                // update the signals
                setSignals(currentSignals => [...currentSignals]);// Update the signals
                setI(i + 1);
            }
        });
        // TODO: read off range from graph
        // document.getElementById(props.plotId).layout.xaxis.range
        data.shift();
        setData(data);
    }, [data]);

    const historicButton = <TimelineIcon />
    const realtimeButton = <HistoryIcon />

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleTimeMode = () => {
        var newRange = [range[0], rangeMax]
        setRange(newRange)
        setHistoric(historic => !historic);
    }

    const handleSliderChange = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
          return;
        }
    
        if (newValue[1] - newValue[0] < minDistance) {
          if (activeThumb === 0) {
            const clamped = Math.min(newValue[0], rangeMax - minDistance);
            setRange([clamped, clamped + minDistance]);
          } else if (historic){
            const clamped = Math.max(newValue[1], minDistance);
            setRange([clamped - minDistance, clamped]);
          }
        } else {
          if (historic){  
          setRange(newValue);
          } else {
            setRange([newValue[0], rangeMax])
          }
        }
      };

      const handleZoomIn = () => {
        if(historic){
            setRange([range[0] + zoomDist, range[1] - zoomDist])
        } else {
            setRange([range[0] + zoomDist, rangeMax])
        }
      }

      const handleZoomOut = () => {
        if(historic){
            setRange([range[0] - zoomDist , range[1] + zoomDist])
        } else {
            setRange([range[0] - zoomDist, rangeMax])
        }
      }

    const handleAddSignal = (e) => {

        // Add a signal. default post processing and color are handled by the signal component.
        const newSignals = signals.concat({
            signalName: e.target.value, trace: {
                type: "scatter",
                mode: "lines",
                name: e.target.value,
                x: [],
                y: [],
                line: { color: "#000" }
            }
        });

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

        // change the values that we want to change
        newSignals[signalIndex].signalName = signalName;
        newSignals[signalIndex].pp = pp;
        newSignals[signalIndex].color = color;
        newSignals[signalIndex].trace.line.color = color;

        // Set the newSignals array as the new array
        setSignals(newSignals);

        console.log("PlotContent:", signals)
    }

    const handleChangePlotName = (e) => {
        setPlotName(e.target.value);
    }

    // console.log(trace.x);

    var layout = {
        xaxis: {
            range: range,
            type: 'int',
        },
        yaxis: {
            autorange: true,
            type: "linear"
        },
        width: width,
        height: height -80,
        autosize: true,
        useResizeHandler: true,
        className: "plotGraph",
        margin: {
            l: 30,
            r: 10,
            b: 1,
            t: 15,
            pad: 5
        },
        datarevision: i,
        showlegend: false
    };

    return (
        <div class="plotComponentContainer" ref={containerRef}>
            <div className="plotTitleContainer">
                <Button variant="text" onClick={handleClickOpen} className="plotTitleButton">
                    <EditIcon />
                </Button>
                <p>{plotName}</p>
                <div>
                <Button variant="text" onClick={handleZoomIn} className="plotTitleButton">
                    <AddIcon/>
                </Button>
                <Button variant="text" onClick={handleZoomOut} className="plotTitleButton">
                    <RemoveIcon/>
                </Button>
                <Button variant="text" onClick={handleTimeMode} className="plotTitleButton">
                    {historic ? historicButton : realtimeButton}
                </Button>
                </div>
            </div>
            <div className="plotContainer">
            {signals.length == 0 ? undefined :
                <Plot
                    data={signals.map(({ trace }) => (trace))}
                    layout={layout}
                    config={{
                        "displaylogo": false,
                        responsive: true
                    }}
                    divId={props.plotId}
                />
            }
            </div>
            <div className="timeSliderContainer">
                <Slider
                    getAriaLabel={() => 'Minimum distance shift'}
                    value={range}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    disableSwap
                    sx={{width: "100%"}}
                />
            </div>
            <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={"md"}>
                <DialogTitle>
                    <TextField id="standard-basic" variant="standard" defaultValue={plotName} onBlur={handleChangePlotName} />
                    <ButtonGroup disableElevation variant="contained" color="primary" sx={{float: 'right'}}>
                        <Button color={selectedCar === 1 ? "secondary" : "primary"} onClick={() => handleChangeCar(1)}>Lux</Button>
                        <Button color={selectedCar === 2 ? "secondary" : "primary"} onClick={() => handleChangeCar(2)}>Stella</Button>
                        <Button color={selectedCar === 3 ? "secondary" : "primary"} onClick={() => handleChangeCar(3)}>Vie</Button>
                    </ButtonGroup>
                </DialogTitle>
                <DialogContent>
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
