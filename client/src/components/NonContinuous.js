import React, { useEffect, useState } from "react";
import signals from '../messages.json'
import * as sio from "../index.js"

function NonContinuous(props) {
    const [lastVals, setLastVals] = useState({});
    const [lastUpdate, setLastUpdate] = useState({});
    const [data, setData] = useState([]);

    useEffect(() => {
        sio.socket.on("dataevent", (data) => {
            setData((curData) => [...curData, data]);
        })
        return function cleanup() {
            sio.socket.off("dataevent");
        };
    }, [])

    useEffect(() => {
        var newVals = structuredClone(lastVals);
        var newUpdate = structuredClone(lastUpdate);

        while (data.length != 0) {
            // sdata = { topic: topic, key: car, data: {data object}}
            var sdata = data[0];

            var newVal = {};

            // For all the fields in the data object
            for (const [key, value] of Object.entries(sdata.data)) {
                // That are not timestamp or name
                if (key === "timestamp" || key === "name") {
                    continue;
                }

                // Add it to the newVal object
                newVal[key] = sdata.data[key].toString();
            }

            console.log(newVal);
            // Then set the value object of this topic to the new value
            newVals[sdata.topic] = newVal;
            // And set the timestamp of the last update
            newUpdate[sdata.topic] = sdata.data.timestamp;

            // Remove sdata
            data.shift();
        }

        // Update the state
        setLastVals(newVals);
        setLastUpdate(newUpdate);
        setData(data);
    }, [data]);

    return (
        <div className="card">
            <h1>Non-continuous Values</h1>
            <div className="ncGridContainer">
                {signals.map((signal) => {
                    if (!(signal["Data types"].includes("int") || signal["Data types"].includes("float"))) {

                        const unitsArr = signal["Units"].replaceAll(" ", "").split(',');
                        const fieldNamesArr = signal["Field names"].replaceAll(" ", "").split(',');

                        const jsxArr = [];

                        if (unitsArr.length != fieldNamesArr.length) {
                            console.log('Arrays not of same size!')
                        } else {
                            for (let i = 0; i < fieldNamesArr.length; i++) {
                                console.log(fieldNamesArr[i]);
                                console.log(lastVals[signal.Name]);

                                jsxArr.push(
                                    <>
                                        <div><p className="signalName">{(i == 0) ? signal.Name : ""}</p></div>
                                        <div><p>{fieldNamesArr[i]}</p></div>
                                        <div><p>{lastVals[signal.Name] == undefined ? "-" : lastVals[signal.Name][fieldNamesArr[i]]}</p></div>
                                        <div><p>{unitsArr[i]}</p></div>
                                        <div><p>{(i == 0) ? lastUpdate[signal.Name] : ""}</p></div>
                                    </>
                                )

                            }

                            return (
                                <> {jsxArr} </>
                            )
                        }
                    }
                }
                )}
            </div>
        </div>
    )
}

export default NonContinuous;