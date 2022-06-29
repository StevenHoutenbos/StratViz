import React, { useState } from 'react';
import "./css/master.css";
import configJSON from "./config.json"
import Tabs from "./components/Tabs";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './css/tabs.css';

const theme = createTheme({
  palette: {
    primary: {
      light: '#DDD',
      main: '#DDD',
      dark: '#DDD',
      contrastText: '#000',
    },
    secondary: {
      light: '#CCC',
      main: '#CCC',
      dark: '#CCC',
      contrastText: '#000',
    },
  },
});

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
    var tabsState = {...config.tabs};
    tabsState.push(newTab(tabId));
    setConfig({tabsState}); 
  }

  return (
    <ThemeProvider theme={theme}>
      <Tabs config={config} setTabName={setTabName} addTab={addTab}/>
    </ThemeProvider>
  );
}

export default App;
