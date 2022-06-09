import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tab from './Tab';
import Slider from '@mui/material/Slider';

function valuetext(value) {
  return `${value}°C`;
}

function Tabs(props) {

  const [activeTab, setActiveTab] = useState(props.children[0].props.tabId);
  const [value, setValue] = React.useState([20, 37]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const onClickTabItem = (tab) => {
    setActiveTab(tab);
  }

  const changeTitleTabItem = (tabId, newTitle) => {
    console.log("called onBlurTabItem! new value of " + tabId + " is: " + newTitle);
    const { setTabName } = props;
    setTabName(tabId, newTitle);
  }

  const footerHTML =
    <div className='footer'>
      <div className='timeAdjustment'>
        <Slider
          getAriaLabel={() => 'Temperature range'}
          value={value}
          onChange={handleChange}
          valueLabelDisplay="auto"
          getAriaValueText={valuetext}
        />
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
              float="left"
              editable="true"
            />
          );
        })}
        <button id="addTab" onclick="addTab()">
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
      </div>
      {activeTab === "config" ? undefined : footerHTML}

    </div>
  )
}

Tabs.propTypes = {
    children: PropTypes.instanceOf(Array).isRequired,
}

export default Tabs;