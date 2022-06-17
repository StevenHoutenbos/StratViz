import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const { io, connect } = require('socket.io-client');
const socket = io('http://localhost:3001');

socket.on("connect", () => {
  console.log("Connected");
})

socket.on("connect_error", (error) => {
  console.log(`Error: ${error.message}`);
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


socket.on("dataevent", (arg) => {
  data = arg;
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
