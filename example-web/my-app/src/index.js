import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

window.addEventListener(
  "message",
  (event) => {
    // Accept messages only from same window
    if (event.source !== window) {
      return;
    }
    if (event.data.type && event.data.type === "signify-signature") {

      alert("Signed headers received\n"+ JSON.stringify(event.data.data, null, 2));
    }
  },
  false
);


root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
