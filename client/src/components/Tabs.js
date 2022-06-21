import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tab from './Tab';
import Slider, { SliderThumb } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TimelineIcon from '@mui/icons-material/Timeline';
import HistoryIcon from '@mui/icons-material/History';
import { Icon } from '@mui/material';
import { borderRadius } from '@mui/system';
import NonContinous from './NonContinuous'

function valuetext(value) {
  return `${value}°C`;
}

const minDistance = 2;
const maxSliderVal = 100;

const PrettoSlider = styled(Slider)({
  color: '#fff',
  height: 0,
  '& .MuiSlider-track': {
    border: 'none',
    height: 30,
    borderRadius: "4px"
  },
  '& .MuiSlider-thumb': {
    height: 30,
    width: 30,
    borderRadius: "4px",
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: '#000',
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
    '& .MuiSlider-rail': {
      height: 4,
      opacity: 0,
      backgroundColor: '#bfbfbf',
      borderRadius: "4px"
    }
  },
});

function Tabs(props) {

  const [activeTab, setActiveTab] = useState(props.children[0].props.tabId);
  const [value, setValue] = React.useState([20, 37]);
  const [selectedBtn, setSelectedBtn] = useState(1); 

    const handleChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (selectedBtn === 1){
      if (activeThumb === 0) {
        setValue([Math.min(newValue[0], value[1] - minDistance), value[1]]);
      } else {
        setValue([value[0], Math.max(newValue[1], value[0] + minDistance)]);
      }
    } else {
      if (activeThumb === 0) {
        setValue([Math.min(newValue[0], value[1] - minDistance), maxSliderVal]);
      }
    }


  };

  const onClickTabItem = (tab) => {
    setActiveTab(tab);
  }

  const changeTitleTabItem = (tabId, newTitle) => {
    console.log("called onBlurTabItem! new value of " + tabId + " is: " + newTitle);
    const { setTabName } = props;
    setTabName(tabId, newTitle);
  }
  
  const deleteTab = (tabId) => {
    console.log("ewa");
    deleteTab(tabId);
  }

  const addTab = (tabId) => {
    const { addTab} = props;
    addTab(tabId);
  }

  const nonContinous = <NonContinous/>

  const footerHTML =
    <div className='footer'>
      <div className='timeAdjustment'>
        <ButtonGroup disableElevation className='buttonGroup' variant="contained" color="primary">
            <Button style={{height: '30px'}} color={selectedBtn === 1 ? "secondary" : "primary"} onClick={()=>setSelectedBtn(1)}><TimelineIcon/></Button>
            <Button style={{height: '30px'}} color={selectedBtn === 2 ? "secondary" : "primary"} onClick={()=>{setSelectedBtn(2); setValue([value[1], maxSliderVal])}}><HistoryIcon/></Button>
        </ButtonGroup>
        <div className='sliderWrapper'>
          <PrettoSlider
            min={0}
            max={maxSliderVal}
            getAriaLabel={() => 'Temperature range'}
            value={value} 
            onChange={handleChange}
            valueLabelDisplay="auto"
            getAriaValueText={valuetext}
            disableSwap
          />
        </div>
      </div>
    </div>

  return (
    <div className="tabs">
      <ol className="tab-list">
        {props.children.map((child) => {
          const { label, tabId } = child.props;


          return (
            <Tab
              activeTab={activeTab}
              key={label}
              tabId={tabId}
              label={label}
              onClick={onClickTabItem}
              changeTitle={changeTitleTabItem}
              deleteTab={deleteTab}
              float="left"
              editable="true"
            />
          );
        })}
        <button id="addTab" onMouseDown={addTab}>
          <svg style={{ width: "14px", height: "14px", padding: "0px" }} viewBox="0 0 22 22">
            <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
        </button>
        <Tab
          activeTab={activeTab}
          key="config"
          tabId="config"
          label="config"
          onClick={onClickTabItem}
          float="right"
          editable="false"
        />
      </ol>
      <div className="tab-content">
        {props.children.map((child) => {
          if (child.props.tabId !== activeTab) return undefined;
          return child.props.children;
        })}
        {activeTab === "config" ? nonContinous : undefined}
      </div>
      {activeTab === "config" ? undefined : footerHTML}


    </div>
  )
}

Tabs.propTypes = {
    children: PropTypes.instanceOf(Array).isRequired,
}

export default Tabs;