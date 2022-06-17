import React from "react";
import nonContinuousValues from '../messages.json'

function NonContinuous(props) {
    return (
        <div className="card">
            <h1>Non-continuous Values</h1>
            <div className="ncGridContainer">
                {nonContinuousValues.map((signal) => {
                    if (!(signal["Data types"].includes("int") || signal["Data types"].includes("float"))) {

                        const dataTypesArr = signal["Data types"].split(',');
                        const fieldNamesArr = signal["Field names"].split(',');
                        
                        const jsxArr = [];

                        if (dataTypesArr.length != fieldNamesArr.length) {
                            console.log('Arrays not of same size!')
                        } else {
                            for (let i = 0; i < dataTypesArr.length; i++) {
                                if (!dataTypesArr[i].includes("int") || !dataTypesArr[i].includes("float")) {
                                    jsxArr.push(
                                        <>
                                            <div><p className="signalName">{(i == 0) ? signal.Name : ""}</p></div>
                                            <div><p>{fieldNamesArr[i]}</p></div>
                                            <div><p>{dataTypesArr[i]}</p></div>
                                        </>
                                    )
                                }
                            }

                            return(
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