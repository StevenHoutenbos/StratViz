import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import io from "socket.io-client"

let data;
//export {data};

export const socket = io('http://localhost:4000');

socket.on("dataevent", (data) => {
  // data = { topic: topic, key: car, data: {data object}}
})

export function subscribe(topic, key) {
  socket.emit("client-subscribe", { topic, key });
  console.log("subscribed to: " + topic + ", car: " + key)
}

export function unsubscribe(topic, key) {
  socket.emit("client-unsubscribe", { topic, key });
  console.log("unsubscribed from: " + topic)
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

// socket.on("dataevent", (arg) => {
//   //data = arg;
// });

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
