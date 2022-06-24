import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Tab from './Tab';
import NonContinous from './NonContinuous'
import TabContent from './TabContent';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { v4 as uuid } from 'uuid';

function Tabs(props) {

  const [tabs, setTabs] = useState(props.config.tabs);
  const [activeTab, setActiveTab] = useState(props.config.tabs[0].tabId);

  const uploadRef = React.useRef(null);

  let tabCounter = 0;

  const newTab = (tabId) => {
    return {
      tabName: "new tab",
      tabId: tabId,
      plots: [{
        plotName: "new Plot",
        signals: []
      }, {
        plotName: "new Plot",
        signals: []
      }, {
        plotName: "new Plot",
        signals: []
      }, {
        plotName: "new Plot",
        signals: []
      },
      ]
    }
  }

  const onClickTabItem = (tab) => {
    setActiveTab(tab);
  }

  const handleChangeTabName = (tabId, newTitle) => {

    // Find index of object we want to change
    const tabIndex = tabs.findIndex((tab => tab.tabId == tabId));

    // copy the original array, as to not mutate the original array
    const newTabs = [...tabs];

    // change the value that we want to change
    newTabs[tabIndex].tabName = newTitle;

    // Set the newSignals array as the new array
    setTabs(newTabs);
  }

  const handleDeleteTab = (tabId) => {
    // Find index of object we want to change
    const tabIndex = tabs.findIndex((tab => tab.tabId == tabId));

    // copy the original array, as to not mutate the original array
    const newTabs = [...tabs];

    // change the value that we want to change
    newTabs.splice(tabIndex);

    // Set the newSignals array as the new array
    setTabs(newTabs);
  }

  const addTab = (tabId) => {
    // copy the original array, as to not mutate the original array
    const newTabs = [...tabs];

    // change the value that we want to change
    newTabs.push(newTab(uuid()));

    // Set the newSignals array as the new array
    setTabs(newTabs);
  }

  // TODO: update comments
  // handle change of plot
  const handleChangeTabs = (tabId, tabName, plots) => {

    // Find index of object we want to change
    const tabIndex = tabs.findIndex((tab => tab.tabId == tabId));

    // copy the original array, as to not mutate the original array
    const newTabs = [...tabs];

    // change the value that we want to change
    newTabs[tabIndex] = { tabName, tabId, plots };

    // Set the newSignals array as the new array
    setTabs(newTabs);
  }

  const downloadConfig = () => {

    const file = new File([JSON.stringify(tabs)], 'config', {
      type: 'text/plain',
    })

    const link = document.createElement('a')
    const url = URL.createObjectURL(file)

    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }


  const handleUploadClick = event => {
    uploadRef.current.click();
  }


  // handle uploading files
  const handleUploadFile = async (e) => {
    e.preventDefault()
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = (e.target.result)
      console.log(tabs)
      console.log(JSON.parse(text))
      setTabs(JSON.parse(text))
    };
    reader.readAsText(e.target.files[0])
  }


  const nonContinous = <NonContinous />

  return (
    <div className="tabs">
      <ol className="tab-list">
        {tabs.map((tab) => {
          return (
            <Tab
              activeTab={activeTab}
              key={tab.tabId}
              tabId={tab.tabId}
              label={tab.tabName}
              onClick={onClickTabItem}
              onChangeTabName={handleChangeTabName}
              onDelete={handleDeleteTab}
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
        <button id="downloadConfig" className='tabButton' onMouseDown={downloadConfig}>
          <CloudDownloadIcon className='tabButton' />
        </button>

        <input type="file" style={{display: 'none'}} id="upload" ref={uploadRef} onChange={handleUploadFile} />
        <button id="uploadConfig" onClick={handleUploadClick}>
          <CloudUploadIcon className='tabButton' />
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
        {tabs.map((tab) => {
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