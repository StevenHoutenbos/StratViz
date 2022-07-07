import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import io from "socket.io-client"

// add socket to listen for incoming car data
export const socket = io('http://78.47.218.125:4000');

// function for requesting historical data from the server
// Has input: data: {topic: "", key: "", start: 0, end: 0}
export function getHistoric(data, callback) {
  socket.emit("historical", data, callback);
}

// create a root for our react app to sit inside, render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App/>
);
