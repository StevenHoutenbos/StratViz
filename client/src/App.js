import React, { useState } from 'react';
import "./css/tabs.css";
import configJSON from "./config.json"
import Tabs from "./components/Tabs";
import TabContent from "./components/TabContent"

function App() {

  var tabIdCounter = 0;

  const getNewTabId = () => {
    while (config.tabs.find(x => x.tabId === tabIdCounter) != undefined) {
      tabIdCounter++;
    }
    return tabIdCounter;
  }

  const [config, setConfig] = useState(configJSON);

  const setTabName = (tabId, newTitle) => {
    console.log(config.tabs.find(x => x.tabId === tabId));
    const newConfig = structuredClone(config);
    newConfig.tabs.find(x => x.tabId === tabId).tabName = newTitle;
    setConfig(newConfig);
    console.log(JSON.stringify(config));
  }

  const newTab = (newTabId) => {
    return {
      tabId: "joe",
      tabName: "new tab",
      graphs: [
        {
          graphName: "new title"
        },
        {
          graphName: "new title"
        },
        {
          graphName: "new title"
        },
        {
          graphName: "new title"
        }
      ]
    }
  }

  const addTab = (tabId) => {
    var tabsState = { ...config.tabs };
    tabsState.push(newTab(tabId));
    setConfig({ tabsState });
  }

  function random_rgba() {
    let o = Math.round, r = Math.random, s = 255;
    return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')';
  }

  return (
    <Tabs config={config} setTabName={setTabName} addTab={addTab}/>
  );
}

export default App;
