import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Tab from './Tab.js';
import NonContinous from './NonContinuous.js'
import TabContent from './TabContent.js';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuid } from 'uuid';

function Tabs(props) {

  const importConfig = (tabs) => {
    tabs.forEach(tab => {
      tab.tabId = uuid()
      tab.plots.forEach(plot => {
        plot.plotId = uuid()
      });
    });
    console.log(tabs)
    return tabs
  }

  const [tabs, setTabs] = useState(importConfig(props.config.tabs));
  const [activeTab, setActiveTab] = useState(props.config.tabs[0].tabId);

  const uploadRef = React.useRef(null);

  const newTab = () => {
    return {
      tabName: "new tab",
      tabId: uuid(),
      plots: [{
        plotName: "new Plot",
        plotId: uuid(),
        signals: []
      }, {
        plotName: "new Plot",
        plotId: uuid(),
        signals: []
      }, {
        plotName: "new Plot",
        plotId: uuid(),
        signals: []
      }, {
        plotName: "new Plot",
        plotId: uuid(), 
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
    newTabs.push(newTab());

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

    console.log('tabs:', tabs)
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
      setTabs(importConfig(JSON.parse(text)))
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
        <AddIcon id="addTab" onMouseDown={addTab} sx={{  height: '16px'}} style={{cursor: 'pointer', paddingLeft: 4, color: "#777" }}/>

        <div style={{flexGrow: 1}}></div>
          
        <CloudDownloadIcon className='tabButton' id="downloadConfig" onMouseDown={downloadConfig} sx={{  height: '20px'}}/>

        <input type="file" style={{display: 'none'}} id="upload" ref={uploadRef} onChange={handleUploadFile} />
        <CloudUploadIcon className='tabButton' id="uploadConfig" onClick={handleUploadClick} sx={{  height: '20px'}}/>
        
        <Tab
          styleName="ncTab"
          activeTab={activeTab}
          key="nc"
          tabId="nc"
          label="Non-Continuous"
          onClick={onClickTabItem}
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