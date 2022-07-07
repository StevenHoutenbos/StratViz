import React, { useEffect } from "react";
import RemoveIcon from '@mui/icons-material/Remove';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { height } from "@mui/system";
import { PropTypes } from "prop-types";

// define colors to choose from to use in plot (html color names)
const colors = [
    'tomato', 'lightsalmon', 'gold', 'seagreen', 'lightblue', 'blue', 'slateblue'
]

// define list of post processing options
const postProcessings = [
    'none', 'derivative'
]

function Signal(props){

    // define state variables:
    const [color, setColor] = React.useState(props.color);  // color
    const [pp, setPP] = React.useState(props.pp);           // Post processing

    // When color/post-processing changes: push that update to the parent component
    useEffect(() => { props.onChangeSignal(props.signalName, pp, color) }, [color]);
    useEffect(() => { props.onChangeSignal(props.signalName, pp, color) }, [pp]);

    // Handle dropdown menu for choosing color
    const handleChangeColor = (event) => {
      setColor(event.target.value);
    };

    // handle dropdown menu for choosing post processing
    const handleChangePP = (event) => {
        setPP(event.target.value);
    };

    return(
        <div className="plotMenuItem">
            <div>{props.signalName}</div>
            
            {/* Post processing selector */}
            <div>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <Select
                        labelId="select-pp"
                        id="select-pp"
                        value={pp}
                        onChange={handleChangePP}
                    >
                        {/* for every post-processing option: */}
                            {postProcessings.map(pp => {
                                return(
                                    // return a menu item
                                    <MenuItem value={pp}>
                                        {pp}
                                    </MenuItem>
                                )
                            })}
                    </Select>
                </FormControl>
            </div>

            {/* Color selector */}
            <div>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <Select
                        labelId="demo-select-small"
                        id="demo-select-small"
                        value={color}
                        onChange={handleChangeColor}
                    >
                        {/* for every color option: */}
                            {colors.map(color => {
                                return(
                                    // return a menu item
                                    <MenuItem value={color}>
                                        
                                        {/* add a colored dot infront of the color name */}
                                        <span class="dot" style={{
                                            height: 20,
                                            width: 20,
                                            backgroundColor: color
                                        }}>
                                        </span>

                                        {/* display color name */}
                                        {color}

                                    </MenuItem>
                                )
                            })}
                    </Select>
                </FormControl>
            </div>

            {/* display a button that removes the signal on click */}
            <div onClick={() => props.onRemoveSignal(props.signalName)}>
                <RemoveIcon/>
            </div>
            
        </div>
    )
}

Signal.propTypes = {
    onRemoveSignal: PropTypes.func.isRequired,
    onChangeSignal: PropTypes.func.isRequired,
    signalName: PropTypes.string.isRequired,
    pp: PropTypes.string.isRequired,
    color: PropTypes.string,
}

Signal.defaultProps = {
    pp: postProcessings[0],
    color: colors[0],
}

export default Signal