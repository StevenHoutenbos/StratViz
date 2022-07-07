import React, { useState } from 'react';

// import css
import "./css/master.css";

// import the file that defines the default config
import configJSON from "./config.json"

import Tabs from "./components/Tabs";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';


// create a theme that react will use
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

    return (

        // add localization provider for dateTime selectors in plot menus
        <LocalizationProvider dateAdapter={AdapterDateFns}>

            {/* add the theme to the react app */}
            <ThemeProvider theme={theme}>

                {/* load the main component of our app */}
                <Tabs config={configJSON} />

            </ThemeProvider>
            
        </LocalizationProvider>
    );
}

export default App;
