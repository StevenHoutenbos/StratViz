import React, { useEffect, useState } from "react";
import signals from '../messages.json'
import * as sio from "../index.js"
import { Button, ButtonGroup } from "@mui/material";

function NonContinuous(props) {

    // define state variables:

    // last received values
    const [lastVals, setLastVals] = useState({});

    // last received timestamp
    const [lastUpdate, setLastUpdate] = useState({});
    
    // Buffer for incoming data
    const [data, setData] = useState([]);

    // What car is selected by the user
    const [selectedCar, setSelectedCar] = React.useState(1);

    // Handle user selecting another car
    const handleChangeCar = (car) => {

        // Clear data arrays
        setLastVals({});
        setLastUpdate({});

        // Set the selected car
        setSelectedCar(car);
    }

    // Handle data coming in from server
    useEffect(() => {
        // on data coming in
        sio.socket.on("dataevent", (data) => {
            // add the new data to the data buffer
            setData((curData) => [...curData, data]);
        })
        // make sure the socket is closed when we dont need it anymore
        return function cleanup() {
            sio.socket.off("dataevent");
        };
    }, [])

    // Process data that is in the buffer
    useEffect(() => {

        // create a clone of the current data ( since current data is inmutable )
        var newVals = structuredClone(lastVals);
        var newUpdate = structuredClone(lastUpdate);

        // while there is data in the buffer
        while (data.length !== 0) {

            // take the last item in the buffer (FIFO)
            // sdata = { topic: topic, key: car, data: {data object}}
            var sdata = data[data.length - 1];

            // Ensure this date is newer than the last
            if (newUpdate[sdata.topic] > sdata.data.timestamp || sdata.key !== "car" + selectedCar) {
                // Ignore this entry
                data.pop();
                continue;
            }

            // define var to store our new data object in
            var newVal = {};

            // For all the fields in the data object
            for (const key of Object.keys(sdata.data)) {
                // That are not timestamp or name
                if (key === "timestamp" || key === "name") {
                    continue;
                }

                // Add it to the newVal object
                newVal[key] = sdata.data[key].toString();
            }

            // Then set the value object of this topic to the new value
            newVals[sdata.topic] = newVal;
            // And set the timestamp of the last update
            newUpdate[sdata.topic] = sdata.data.timestamp;

            // Remove sdata
            data.pop();
        }

        // Update the state
        setLastVals(newVals);
        setLastUpdate(newUpdate);
        setData(data);

    }, [data]); // Do this whenever "data" is updated

    return (
        <div className="card">

            <div className="ncHeader ml12 mr12">
                <h1>Non-continuous Values</h1>

                {/* Buttons to select a car */}
                <ButtonGroup disableElevation variant="contained" color="primary">
                    <Button color={selectedCar === 1 ? "secondary" : "primary"} onClick={() => handleChangeCar(1)}>Lux</Button>
                    <Button color={selectedCar === 2 ? "secondary" : "primary"} onClick={() => handleChangeCar(2)}>Stella</Button>
                    <Button color={selectedCar === 3 ? "secondary" : "primary"} onClick={() => handleChangeCar(3)}>Vie</Button>
                </ButtonGroup>
            </div>

            {/* Table of non continuous values */}
            <div className="ncGridContainer ml12 mr12">

                {/* Column titles */}
                <div><p className="signalName ncColumnTitle">Signal Name</p></div>
                <div><p className="ncColumnTitle">Field Name</p></div>
                <div><p className="ncColumnTitle">Last Value</p></div>
                <div><p className="ncColumnTitle">Unit</p></div>
                <div><p className="ncColumnTitle">Last Update</p></div>

                {/* For every signal: */}
                {signals.map((signal) => {

                    // take all fields from the signal and store them in arrays
                    const unitsArr = signal["Units"].replaceAll(" ", "").split(',');
                    const fieldNamesArr = signal["Field names"].replaceAll(" ", "").split(',');
                    const dataTypesArr = signal["Data types"].replaceAll(" ", "").split(',');

                    // define array to store our JSX objects in
                    const jsxArr = [];

                    // check if taking the fields from the signal makes sense
                    if (unitsArr.length != fieldNamesArr.length) {
                        console.log('Arrays not of same size!')
                    } else { // if it makes sense:

                        // for every fieldname:
                        for (let i = 0; i < fieldNamesArr.length; i++) {

                            // Skip subfields that contain int or float values
                            if (dataTypesArr[i].includes("int") || dataTypesArr[i].includes("float")) {
                                continue;
                            }

                            // push a table row to the JSX array (5 divs makes a row, using our CSS grid)
                            jsxArr.push(
                                <>
                                    {/* only add the signalname to the first row of the signal */}
                                    <div><p className="signalName">{(i == 0) ? signal.Name : ""}</p></div>

                                    <div><p>{fieldNamesArr[i]}</p></div>
                                    <div><p>{lastVals[signal.Name] == undefined ? "-" : lastVals[signal.Name][fieldNamesArr[i]]}</p></div>
                                    <div><p>{unitsArr[i]}</p></div>
                                    <div><p>{(i == 0) ? (lastUpdate[signal.Name] == undefined ? "" : new Date(lastUpdate[signal.Name]).toLocaleTimeString()) : ""}</p></div>
                                </>
                            )

                        }

                        return (
                            <> {jsxArr} </>
                        )
                    }
                }
                )}
            </div>
        </div>
    )
}

export default NonContinuous;