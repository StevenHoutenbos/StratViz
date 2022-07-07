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
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
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

    // Constants for time slider
    const minDistance = 60;
    const zoomMultiplier = 0.2;


    // define state variables:

    // plotname
    const [plotName, setPlotName] = useState(props.plotName)

    // signals, including signal name and what post-processing/color was selected
    const [signals, setSignals] = useState(props.signals);

    // buffer for incoming data
    const [data, setData] = useState([]);


    // define variables storing information about what range is read, and what range is displayed:

    // Specified range: (unix time)
    //     Historical mode: the dateTimes specified in the plotmenu
    //     Realtime mode: last received timestamp, and 'realTimeRange' minutes before that.
    const [specRange, setSpecRange] = useState([1655432776, 1656432800])

    // Current range: range that is currently viewed
    const [curRange, setCurRange] = useState([1655432876, 1656432700])

    // array of the last two timestamps we received. This is needed to calculate delta between timestamps
    const [lastTimestamp, setLastTimestamp] = useState([1655432776, 1656432800]);
    // Number of seconds we want to see in real time mode
    const [realTimeRange, setRealTimeRange] = useState(7200000);
    // DateTimes from the plot menu
    const [dateTimes, setDateTimes] = useState([new Date('2022-07-02T21:11:54'), new Date('2022-07-02T23:11:54')])

    // function to easily update lastTimeStamp array
    const appendTimeStamp = (newTimestamp) => {
        setLastTimestamp([lastTimestamp[1], newTimestamp])
    }


    // states for plot menu components
    const [plotMenuOpen, setPlotMenuOpen] = React.useState(false);
    const [selectedCar, setSelectedCar] = React.useState(1);
    const [historic, setHistoric] = React.useState(false);


    // variable used to force plotly to update
    const [i, setI] = useState(0);

    // state used to display message to the user when we are waiting for data to come back from the server 
    const [loading, setLoading] = React.useState(false);


    // Initialize list of signals to be searched
    const searchData = [];

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

        // define variables for search input
        const [searchQuery, setSearchQuery] = useState("");
        const dataFiltered = filterData(searchQuery, searchData);

    // get size of referenced parent container to get plotly to scale dynamically
    const [containerRef, { width, height }] = useElementSize();

    // when size of referenced parent container changes, update plotly plot dimensions
    useEffect(() => {
        layout.width = width;
        layout.height = height - 26;
    }, [containerRef])


    // Add useEffect to check state of updated signals
    useEffect(() => { props.onChangePlot(props.plotId, plotName, signals) }, [signals]);
    useEffect(() => { props.onChangePlot(props.plotId, plotName, signals) }, [plotName]);
    useEffect(() => {
        sio.socket.on("dataevent", (date) => {
            console.log("DATA!")
            setData((curData) => [...curData, date]);
        })
        return function cleanup() {
            sio.socket.off("dataevent");
        };
    }, [])


    // Process data that is in the buffer
    useEffect(() => {

        // while there is data in the buffer
        while (data.length != 0) {

            // take the first item in the buffer
            var sdata = data[0];

            // if we are in real-time mode, do:
            if (!historic) {

                // for each selected signal
                signals.forEach((signal) => {

                    // if incoming data is from one of the signals we selected
                    if (signal.signalName.split(" - ")[0] === sdata.topic && ("car" + selectedCar) === sdata.key) {

                        // push data to plot
                        signal.trace.x.push(sdata.data.timestamp);
                        signal.trace.y.push(sdata.data[signal.signalName.split(" - ")[1]]);

                        // update last timestamp, so range slider functions correctly
                        if (sdata.data.timestamp > lastTimestamp[1]) {
                            appendTimeStamp(sdata.data.timestamp);
                        }

                    }
                });
            }
            data.shift();
        }

        // update the signals
        setSignals(currentSignals => [...currentSignals]);
        setI(i + 1); // we use this to force plotly to update
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

    const handleClickOpen = () => {
        setPlotMenuOpen(true);
    };

    const handleClose = () => {
        setPlotMenuOpen(false);
    };

    const handleTimeMode = () => {

        // switch time mode
        setHistoric(!historic);
    }


    // when time mode is changed:
    useEffect(() => {
        // clear data
        signals.forEach(signal => {
            signal.trace.x = [];
            signal.trace.y = [];
        })

        // if time mode is historic
        if (historic) {

            // Set range to dateTime inputs from plot menu
            setSpecRange([getUnixTime(dateTimes[0] * 1000), getUnixTime(dateTimes[1]) * 1000])
            // set current range to the complete specified range
            setCurRange([getUnixTime(dateTimes[0]) * 1000, getUnixTime(dateTimes[1]) * 1000])

        } else {

            // Set range from last timestamp to 'realTimeRange' seconds before that.
            setSpecRange([lastTimestamp[1] - realTimeRange, lastTimestamp[1]]);
            // set current range to 10 minutes from the end
            setCurRange([lastTimestamp[1] - realTimeRange, lastTimestamp[1]])

        }
    }, [historic])


    // handle change of dateTime selectors
    const handleChangeDateTimesLeft = (newValue) => {
        setDateTimes([newValue, dateTimes[1]]);
    }

    const handleChangeDateTimesRight = (newValue) => {
        setDateTimes([dateTimes[0], newValue])
    }


    // if DateTime is changed, request new data from the server
    useEffect(() => {
        if (!plotMenuOpen) {
            if (historic) {
                setSpecRange([getUnixTime(dateTimes[0]) * 1000, getUnixTime(dateTimes[1]) * 1000]);
                setCurRange([getUnixTime(dateTimes[0]) * 1000, getUnixTime(dateTimes[1]) * 1000]);

                requestHistoric();
            }
        }
    }, [plotMenuOpen])


    const requestHistoric = () => {
        signals.forEach((signal) => {
            const input = { topic: signal.signalName.split(" - ")[0], key: ("car" + selectedCar), start: getUnixTime(dateTimes[0]) * 1000, end: getUnixTime(dateTimes[1]) * 1000 }
            console.log("in")
            setLoading(true)
            sio.getHistoric(input, (result) => {
                // console.log("requested data", input, result)

                signal.trace.x = [];
                signal.trace.y = [];



                result.forEach((sdata) => {
                    // push data to plot
                    signal.trace.x.push(sdata.timestamp);
                    signal.trace.y.push(sdata[signal.signalName.split(" - ")[1]]);

                })

                setLoading(false);
            })
        })
    }


    // slider logic:
    const handleSliderChange = (event, newValue, activeThumb) => {

        // check if input is an array
        if (!Array.isArray(newValue)) {
            return;
        }

        // if the distance between thumbs is smaller than minDistance
        if (newValue[1] - newValue[0] < minDistance) {
            // if we have the leftmost thumb

            if (activeThumb === 0) {
                // update the value, making sure distance between thumbs is never too small
                const clamped = Math.min(newValue[0], curRange[1] - minDistance);
                setCurRange([clamped, clamped + minDistance]);

                // if we have the rightmost thumb, only update in historical mode
            } else if (historic) {
                // update the value, making sure distance between thumbs is never too small
                const clamped = Math.max(newValue[1], minDistance);
                setCurRange([clamped - minDistance, clamped]);
            }

            // if distance between thumbs is larger than minDistance
        } else {

            // in historic mode, update both thumbs
            if (historic) {
                setCurRange(newValue);

                // in real-time mode, only update the leftmost thumb
            } else {
                setCurRange([newValue[0], curRange[1]])

            }
        }
    };

    const handleZoomIn = () => {

        // decrease range by zoomMultiplier 
        var rangeSize = (curRange[1] - curRange[0]) * zoomMultiplier;

        // in historic mode, update both slider thumbs
        if (historic) {
            setCurRange([curRange[0] + rangeSize, curRange[1] - rangeSize])

        // in real-time mode, only update leftmost slider
        } else {
            setCurRange([curRange[0] + rangeSize, specRange[1]])
        }
    }

    const handleZoomOut = () => {

        // increase range by zoomMultiplier 
        var rangeSize = (curRange[1] - curRange[0]) * zoomMultiplier;

        // in historic mode, update both slider thumbs
        if (historic) {
            setCurRange([curRange[0] - rangeSize, curRange[1] + rangeSize])

        // in real-time mode, only update leftmost slider
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
    }

    const handleChangeCar = (car) => {

        // clear signals list
        setSignals([]);

        // set selected car
        setSelectedCar(car);
    }

    const handleRemoveSignal = (signalName) => {

        // Filter the current signals array for the signalName we got, set it to a new array
        const newSignals = signals.filter((obj) => {
            return obj.signalName != signalName;
        })

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

        // console.log("PlotContent:", signals)
    }

    const handleChangePlotName = (e) => {
        setPlotName(e.target.value);
    }

    // function for showing a formatted date on slider thumbs
    const convertDateLabel = (value) => {
        if (historic) {
            return format(new Date(value), 'MM-dd HH:mm:ss')
        } else {
            return format(lastTimestamp[1] - value - 3600000, 'HH:mm:ss')
        }
    }


    const downloadPlotData = () => {
        
        // for every signal in the plot
        signals.forEach(signal => {

            // make a file
            const file = new File(

                // add JSON string of signal object to file
                [JSON.stringify(signal)], 

                // specify file name
                format(specRange[0], 'MM-dd-yy') + '_' + signal.signalName + "_" + format(specRange[0], 'HHmm') + "_" + format(specRange[1], 'HHmm'), 
                
                {type: 'text/plain',}
            )

        // create a link 
        const link = document.createElement('a')

        // create a url to the file we created
        const url = URL.createObjectURL(file)

        // Add the url to the link
        link.href = url
        link.download = file.name

        // programatically add hidden link, and click it
        document.body.appendChild(link)
        link.click()

        // remove the link object after clicking it
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        })
    }

    // define layout for the plotly plot
    var layout = {

        xaxis: {
            // get range from component state
            range: curRange,

            // set range to fixed, so user cannot use plotly x-axis zoom. We use our own custom zoom functions.
            fixedrange: true,
            type: 'date',
        },

        yaxis: {
            autorange: true,
            type: "linear"
        },

        // get width and height from component state
        width: width,
        height: height - 80,

        autosize: true,
        useResizeHandler: true,
        className: "plotGraph",

        // margins for making plot show up nicely
        margin: {
            l: 35,
            r: 10,
            b: 35,
            t: 15,
            pad: 5
        },

        // get data revision from state. 
        // 'i' is increased when new data is read. 
        // This is used to force plotly to update.
        datarevision: i,

        showlegend: false
    };

    // define html as js object so we can use it in js functions
    const historicButton = <TimelineIcon />
    const realtimeButton = <HistoryIcon />


    // draw the plot component
    return (
        <div class="plotComponentContainer" ref={containerRef}>

            {/* upper bar with plot title, and buttons for opening plot menu, downloading data, zooming in, zooming out */}
            <div className="plotTitleContainer">
                <div>
                    <Button variant="text" onClick={handleClickOpen} className="plotTitleButton">
                        <EditIcon />
                    </Button>
                    <Button variant="text" onClick={downloadPlotData} className="plotTitleButton">
                        <CloudDownloadIcon disabled={!historic} />
                    </Button>
                </div>
                <p>{loading ? "Loading..." : plotName}</p>
                <div>
                    <Button variant="text" onClick={handleZoomIn} className="plotTitleButton">
                        <AddIcon />
                    </Button>
                    <Button variant="text" onClick={handleZoomOut} className="plotTitleButton">
                        <RemoveIcon />
                    </Button>
                </div>
            </div>

            {/* container for the plotly graph */}
            <div className="plotContainer">

                {/* when no signals are selected, show no graph */}
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

            {/* bottom bar that contains the time slider */}
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
            <Dialog open={plotMenuOpen} onClose={handleClose} fullWidth={true} maxWidth={"md"}>

                <DialogTitle>

                    <TextField id="standard-basic" variant="standard" defaultValue={plotName} onBlur={handleChangePlotName} />

                    {/* car selector */}
                    <ButtonGroup disableElevation variant="contained" color="primary" sx={{ float: 'right' }}>
                        <Button color={selectedCar === 1 ? "secondary" : "primary"} onClick={() => handleChangeCar(1)}>Lux</Button>
                        <Button color={selectedCar === 2 ? "secondary" : "primary"} onClick={() => handleChangeCar(2)}>Stella</Button>
                        <Button color={selectedCar === 3 ? "secondary" : "primary"} onClick={() => handleChangeCar(3)}>Vie</Button>
                    </ButtonGroup>

                </DialogTitle>

                <DialogContent>

                    <div className="timeModeContainer">

                        {/* time mode selector */}
                        <ButtonGroup disableElevation variant="contained" color="primary">
                            <Button color={historic ? "secondary" : "primary"} onClick={handleTimeMode}>Historic</Button>
                            <Button color={!historic ? "secondary" : "primary"} onClick={handleTimeMode}>Real-time™</Button>
                        </ButtonGroup>

                        {/* dateTime picker for start of range */}
                        <DateTimePicker
                            disabled={!historic}
                            label="start date"
                            value={dateTimes[0]}
                            onChange={handleChangeDateTimesLeft}
                            renderInput={(params) => <TextField {...params} />}
                        />

                        {/* dateTime picker for end of range */}
                        <DateTimePicker
                            disabled={!historic}
                            label="end date"
                            value={dateTimes[1]}
                            onChange={handleChangeDateTimesRight}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </div>

                    {/* grid container for displaying selected signals */}
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

                        {/* signal search bar */}
                        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                        {/* render search results */}
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
                    {/* button for closing the plotmenu */}
                    <Button onClick={handleClose} type="submit">Close</Button>
                </DialogActions>

            </Dialog>
        </div>
    )
}

export default PlotContent;
