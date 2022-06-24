import React, { useEffect } from "react";
import RemoveIcon from '@mui/icons-material/Remove';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { height } from "@mui/system";
import { PropTypes } from "prop-types";

// define colors to choose from to use in plot
const colors = [
    'tomato', 'lightsalmon', 'gold', 'seagreen', 'lightblue', 'blue', 'slateblue'
]

const postProcessings = [
    'none', 'derivative', 'something else', 'i do not know'
]

function Signal(props){

    const [color, setColor] = React.useState(props.color);
    const [pp, setPP] = React.useState(props.pp);

    useEffect(() => { props.onChangeSignal(props.signalName, pp, color) }, [color]);
    useEffect(() => { props.onChangeSignal(props.signalName, pp, color) }, [pp]);

    const handleChangeColor = (event) => {
      setColor(event.target.value);
    };

    const handleChangePP = (event) => {
        setPP(event.target.value);
        props.onChangeSignal(props.signalName, pp, color)
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
                            {postProcessings.map(pp => {
                                return(
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
                            {colors.map(color => {
                                return(
                                    <MenuItem value={color}>
                                        <span class="dot" style={{
                                            height: 20,
                                            width: 20,
                                            backgroundColor: color
                                        }}>
                                        </span>
                                        {color}
                                    </MenuItem>
                                )
                            })}
                    </Select>
                </FormControl>
            </div>
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