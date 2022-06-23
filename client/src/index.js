import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import io from 'socket.io-client';

// Create the socket instance as part of our sever
const socket = io('http://localhost:4000');

socket.on("dataevent", (data) => {
  // We receive the following data:
  // data = {topic: "topic", key: "key", data: {data object}}

  // Now we need to send this data to some managing object/system that can forward the data to the right tab
  // And then forwards the data to the right plot
});

function subscribe(topic, key) {
  socket.emit("client-subscribe", { topic, key });
}

function unsubscribe(topic, key) {
  socket.emit("client-unsubscribe", { topic, key });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Export the functions that allow components to subscribe/unsubscribe from topics
// To import: import {subscribe, unsubscribe} from 'path/to/index.js'
module.exports = {
  subscribe,
  unsubscribe
};

// socket.on("dataevent", (arg) => {
//   //data = arg;
// });

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
