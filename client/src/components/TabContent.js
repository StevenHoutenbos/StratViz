import React, { useEffect } from "react";
import { PropTypes } from "prop-types";
import PlotContent from "./PlotContent.js";

function TabContent(props) {

    // Define state variables:

    // store plots that are in this tab
    const [plots, setPlots] = React.useState(props.plots);

    // when plots are changed, push these updates to parent component
    useEffect(() => { props.onChangeTabs(props.tabId, props.tabName, plots) }, [plots]);

    // handle change of plot
    const handleChangePlot = (plotId, plotName, signals) => {

        // Find index of object we want to change
        const plotIndex = plots.findIndex((plot => plot.plotId == plotId));

        // copy the original array, as to not mutate the original array
        const newPlots = [...plots];

        // change the value that we want to change
        newPlots[plotIndex] = { plotName, plotId, signals };

        // Set the newPlots array as the new array
        setPlots(newPlots);
    }

    return (

        // div to store contents of the tab
        <div label={props.tabName} tabId={props.tabId}>

            {/* grid of plots */}
            <div className='gridContainer'>

                {/* for every plot, do: */}
                {plots.map(plot =>

                    // create PlotContent component with corresponding properties
                    <PlotContent
                        plotName={plot.plotName}
                        plotId={plot.plotId}
                        signals={plot.signals}
                        onChangePlot={handleChangePlot}
                    />
                    
                )}
            </div>
        </div>
    )


}

TabContent.propTypes = {
    tabName: PropTypes.string.isRequired,
    plots: PropTypes.array.isRequired,
}

export default TabContent