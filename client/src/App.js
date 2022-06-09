import React, { useState } from 'react';
import "./css/tabs.css";
import configJSON from "./tabsConfig.json"
import Tabs from "./components/Tabs";

function App() {

  const [config, setConfig] = useState(configJSON);

  const setTabName = (tabId, newTitle) => {
    console.log(config.tabs.find(x => x._uid === tabId));
    const newConfig = structuredClone(config);
    newConfig.tabs.find(x => x._uid === tabId).tabName = newTitle;
    setConfig(newConfig);
    console.log(JSON.stringify(config)); 
  }

  

  return (
    <Tabs setTabName={setTabName}>
      {config.tabs.map((tab) => {
        return (
          <div label={tab.tabName} tabId={tab._uid}>
            <div className='gridContainer'>
              {tab.graphs.map((graph) => {
                return (
                  <div>
                    <p>
                      {graph.graphName} 
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </Tabs>
  );
}

export default App;
