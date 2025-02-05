import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

socket.on("dataevent", (data) => {
  console.log(data);
})

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

io.on("dataevent", (data) => {
  console.log(data + "!");
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
