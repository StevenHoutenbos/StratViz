import React from "react";
import nonContinuousValues from '../nonContinuousValues.json'

function NonContinuous(props) {
    return(
        <div className="card">
            <h1>Non-continuous Values</h1>
            <div className="ncGridContainer">
            {nonContinuousValues.signals.map((signal) => {return(
                <>
                    <div><p>{signal.signalName}</p></div>
                    <div><p>{signal.value}</p></div>
                </>
            )
            })}
            </div>
        </div>
    )
}

export default NonContinuous;