import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import io from "socket.io-client"

let data;
//export {data};

export const socket = io('http://78.47.218.125:4000');

export function subscribe(topic, key) {
  socket.emit("client-subscribe", { topic, key });
  console.log("subscribed to: " + topic + ", car: " + key)
}

export function unsubscribe(topic, key) {
  socket.emit("client-unsubscribe", { topic, key });
  console.log("unsubscribed from: " + topic);
}

// Has input: data: {topic: "", key: "", start: 0, end: 0}
//            callback => function
export function getHistoric(data, callback) {
  socket.emit("historical", data, callback);
  // wait for server to process
  // now wait for new event to appear (e.g. historical-result)
}

function test() {
  data = {};
  data.topic = "ACU_KeepAlive";
  data.key = "car1";
  data.start = 140203200
  data.end = 1381838404;

  getHistoric(data, (historic) => {
    console.log(historic);
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App/>
);

// socket.on("dataevent", (arg) => {
//   //data = arg;
// });
