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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getUnixTime, format } from "date-fns";


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
    const zoomMultiplier = 0.2;

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

    // Specified range: (unix time)
    //     Historical mode: the dateTimes specified in the plotmenu
    //     Realtime mode: last received timestamp, and 'realTimeRange' minutes before that.
    const [specRange, setSpecRange] = useState([1655432776, 1656432800])

    // Current range: range that is currently viewed
    const [curRange, setCurRange] = useState([1655432876, 1656432700])

    // Last recieved timestamp (from incoming data)
    const [lastTimestamp, setLastTimestamp] = useState([1655432776, 1656432800]);
    // Number of seconds we want to see in real time mode
    const [realTimeRange, setRealTimeRange] = useState(7200);
    // DateTimes from the plot menu
    const [dateTimes, setDateTimes] = useState([new Date('2014-08-18T21:11:54'), new Date('2014-08-18T23:11:54')])

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
        sio.socket.on("dataevent", (date) => { // TODO: change to real-time only
            setData((curData) => [...curData, date]);
        })
        return function cleanup() {
            sio.socket.off("dataevent");
        };
    }, [])

    // handle adding new timestamp
    const appendTimeStamp = (newTimestamp) => {
        setLastTimestamp([lastTimestamp[1], newTimestamp])
    }

    useEffect(() => {
        // data = { topic: topic, key: car, data: {data object}}
        while (data.length != 0) {
            var sdata = data[0];
            signals.forEach((signal) => {
                console.log(signal.signalName.split(" - ")[0] + ":" + sdata.topic);
                if (signal.signalName.split(" - ")[0] === sdata.topic && ("car" + selectedCar) === sdata.key) {
                    console.log(sdata);

                    // push data to plot
                    signal.trace.x.push(sdata.data.timestamp);
                    signal.trace.y.push(sdata.data[signal.signalName.split(" - ")[1]]);

                    // update last timestamp, so range slider functions correctly
                    if (sdata.data.timestamp > lastTimestamp) {
                        appendTimeStamp(sdata.data.timestamp);
                    }

                }
            });
            // TODO: read off range from graph
            // document.getElementById(props.plotId).layout.xaxis.range
            data.shift();
        }

        // update the signals
        setSignals(currentSignals => [...currentSignals]);// Update the signals
        setI(i + 1);
        setData(data);
    }, [data]);

    // update the range when in real time mode
    useEffect(() => {
        if (!historic) {
            // Set spec range from last timestamp 
            setSpecRange([lastTimestamp[1] - realTimeRange, lastTimestamp[1]])
            // slide the current range along to the last timestamp
            setCurRange([curRange[0] + (lastTimestamp[1] - lastTimestamp[0]), lastTimestamp[1]])
        }
    }, [lastTimestamp])

    const historicButton = <TimelineIcon />
    const realtimeButton = <HistoryIcon />

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleTimeMode = () => {

        // switch time mode
        setHistoric(!historic);

        // if time mode is historic
        if (historic) {
            // Set range to dateTime inputs from plot menu
            setSpecRange([getUnixTime(dateTimes[0]), getUnixTime(dateTimes[1])])
            // set current range to the complete specified range
            setCurRange(specRange)
        } else {
            // Set range from last timestamp to 'realTimeRange' seconds before that.
            setSpecRange([lastTimestamp[1] - realTimeRange, lastTimestamp[1]]);
            // set current range to 10 minutes from the end
            setCurRange(specRange)
        }

    }

    const handleSliderChange = (event, newValue, activeThumb) => {

        if (!Array.isArray(newValue)) {
            return;
        }

        // if the distance between thumbs is smaller than minDistance
        if (newValue[1] - newValue[0] < minDistance) {
            // if we have the leftmost thumb
            if (activeThumb === 0) {
                // update the value
                const clamped = Math.min(newValue[0], curRange[1] - minDistance);
                setCurRange([clamped, clamped + minDistance]);
            } else if (historic) { // if we have the rightmost thumb, only update in historical mode
                const clamped = Math.max(newValue[1], minDistance);
                setCurRange([clamped - minDistance, clamped]);
            }
        } else {
            if (historic) {
                setCurRange(newValue);
            } else {
                setCurRange([newValue[0], curRange[1]])
            }
        }
    };

    // handle change dateTime 
    const handleChangeDateTimesLeft = (newValue) => {
        setDateTimes([newValue, dateTimes[1]]);
    }

    const handleChangeDateTimesRight = (newValue) => {
        setDateTimes([dateTimes[0], newValue])
    }

    // if DateTime is changed, request new data from the server
    useEffect(() => {
        if (historic) {
            setSpecRange([getUnixTime(dateTimes[0]), getUnixTime(dateTimes[1])]);
            setCurRange([getUnixTime(dateTimes[0]), getUnixTime(dateTimes[1])]);

            signals.forEach((signal) => {
                const input = { topic: signal.signalName.split(" - ")[0], key: ("car" + selectedCar), start: getUnixTime(dateTimes[0]), end: getUnixTime(dateTimes[1]) }
                sio.getHistoric(input, (result) => { console.log(result) })
            })
        }
    }, [dateTimes])

    const handleZoomIn = () => {
        var rangeSize = (curRange[1] - curRange[0]) * zoomMultiplier;
        if (historic) {
            setCurRange([curRange[0] + rangeSize, curRange[1] - rangeSize])
        } else {
            setCurRange([curRange[0] + rangeSize, specRange[1]])
        }
    }

    const handleZoomOut = () => {
        var rangeSize = (curRange[1] - curRange[0]) * zoomMultiplier;
        if (historic) {
            setCurRange([curRange[0] - rangeSize, curRange[1] + rangeSize])
        } else {
            setCurRange([curRange[0] - rangeSize, specRange[1]])
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

        //sio.subscribe(e.target.value.split(" - ")[0], "car" + selectedCar);
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

    const convertDateLabel = (value) => {
        return format(new Date(value * 1000), 'MM-dd HH:mm:ss')
    }

    // console.log(trace.x);

    var layout = {
        xaxis: {
            range: curRange,
            type: 'int',
        },
        yaxis: {
            autorange: true,
            type: "linear"
        },
        width: width,
        height: height - 80,
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
                        <AddIcon />
                    </Button>
                    <Button variant="text" onClick={handleZoomOut} className="plotTitleButton">
                        <RemoveIcon />
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
                            responsive: true,
                            "modeBarButtonsToRemove": ['zoomIn2d', 'zoomOut2D']
                        }}
                        divId={props.plotId}
                    />
                }
            </div>

            {/* time slider */}
            <div className="timeSliderContainer">
                <Slider
                    getAriaLabel={() => 'Minimum distance shift'}
                    getAriaValueText={convertDateLabel}
                    value={curRange}
                    onChange={handleSliderChange}
                    valueLabelFormat={convertDateLabel}
                    valueLabelDisplay="auto"
                    min={specRange[0]}
                    max={specRange[1]}
                    disableSwap
                    sx={{ width: "100%" }}
                />
            </div>

            {/* plot menu */}
            <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={"md"}>
                <DialogTitle>
                    <TextField id="standard-basic" variant="standard" defaultValue={plotName} onBlur={handleChangePlotName} />
                    <ButtonGroup disableElevation variant="contained" color="primary" sx={{ float: 'right' }}>
                        <Button color={selectedCar === 1 ? "secondary" : "primary"} onClick={() => handleChangeCar(1)}>Lux</Button>
                        <Button color={selectedCar === 2 ? "secondary" : "primary"} onClick={() => handleChangeCar(2)}>Stella</Button>
                        <Button color={selectedCar === 3 ? "secondary" : "primary"} onClick={() => handleChangeCar(3)}>Vie</Button>
                    </ButtonGroup>
                </DialogTitle>
                <DialogContent>
                <Button variant="text" onClick={handleTimeMode} className="plotTitleButton">
                        {historic ? historicButton : realtimeButton}
                    </Button>
                    historical from:
                    <DateTimePicker
                        disabled={historic}
                        label="DateTime picker"
                        value={dateTimes[0]}
                        onChange={handleChangeDateTimesLeft}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    to:
                    <DateTimePicker
                        disabled={historic}
                        label="DateTime picker"
                        value={dateTimes[1]}
                        onChange={handleChangeDateTimesRight}
                        renderInput={(params) => <TextField {...params} />}
                    />
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
