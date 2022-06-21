import React, { useState } from 'react';
import "./css/tabs.css";
import configJSON from "./tabsConfig.json"
import Tabs from "./components/Tabs";
import PlotContent from "./components/PlotContent"

function App() {

  var tabIdCounter = 0;

  const getNewTabId = () => {
    while (config.tabs.find(x => x._uid === tabIdCounter) != undefined) {
      tabIdCounter++;
    }
    return tabIdCounter;
  }

  const [config, setConfig] = useState(configJSON);

  const setTabName = (tabId, newTitle) => {
    console.log(config.tabs.find(x => x._uid === tabId));
    const newConfig = structuredClone(config);
    newConfig.tabs.find(x => x._uid === tabId).tabName = newTitle;
    setConfig(newConfig);
    console.log(JSON.stringify(config));
  }

  const newTab = (newTabId) => {
    return {
      _uid: "joe",
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
    var tabsState = {...config.tabs};
    tabsState.push(newTab(tabId));
    setConfig({tabsState});
  }

  function random_rgba() {
    let o = Math.round, r = Math.random, s = 255;
    return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
  }

var color = random_rgba();

  return (
    <Tabs setTabName={setTabName} addTab={addTab}>
      {config.tabs.map((tab) => {
        return (
          <div label={tab.tabName} tabId={tab._uid}>
            <div className='gridContainer'>
              {tab.graphs.map(graph => <PlotContent plotName={graph.graphName} graphColor={random_rgba()}/>)}
            </div>
          </div>
        )
      })}
    </Tabs>
  );
}

export default App;
