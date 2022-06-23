import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tab from './Tab';
import NonContinous from './NonContinuous'
import TabContent from './TabContent';

function Tabs(props) {

  const [tabs, setTabs] = useState(props.config.tabs);
  const [activeTab, setActiveTab] = useState(props.config.tabs[0].tabId);

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
    const {addTab} = props;
    addTab(tabId);
  }

  // TODO: update comments
  // handle change of plot
  const handleChangeTabs = (tabId, tabName, plots) => {

    // Find index of object we want to change
    const tabIndex = tabs.findIndex((tab => tab.tabId == tabId));
    console.log('tabIndex is: ', tabIndex)

    // copy the original array, as to not mutate the original array
    const newTabs = [...tabs];

    // change the value that we want to change
    newTabs[tabIndex] = { tabName, tabId, plots };

    // Send it to console for checking
    console.log('tabs changed to: ', newTabs[tabIndex])

    // Set the newSignals array as the new array
    setTabs(newTabs);
  }

  const nonContinous = <NonContinous />

  return (
    <div className="tabs">
      <ol className="tab-list">
        {props.config.tabs.map((tab) => {
          console.log(tab);

          return (
            <Tab
              activeTab={activeTab}
              key={tab.tabId}
              tabId={tab.tabId}
              label={tab.tabName}
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
          key="nc"
          tabId="nc"
          label="Non-Continuous"
          onClick={onClickTabItem}
          float="right"
          editable="false"
        />
      </ol>
      <div className="tab-content">
        {props.config.tabs.map((tab) => {
          if (tab.tabId !== activeTab) return undefined;
          return <TabContent tabName={tab.tabName} tabId={tab.tabId} plots={tab.plots} onChangeTabs={handleChangeTabs} />;
        })}
        {activeTab === "nc" ? nonContinous : undefined}
      </div>
    </div>
  )
}

Tabs.propTypes = {
  children: PropTypes.instanceOf(Array).isRequired,
}

export default Tabs;