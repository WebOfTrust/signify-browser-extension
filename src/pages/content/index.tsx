import { createRoot } from 'react-dom/client';
import './style.css' 
import Dialog from '../dialog/Dialog';

// Handle messages from web page
window.addEventListener("message", async (event) => {
  // Accept messages only from same window
  if (event.source !== window) {
    return;
  }
  console.log("Content script received from web page: " + event.data.type);
  if (event.data.type) {
    switch (event.data.type) {
      case "getVersion":
        const manifest =  chrome.runtime.getManifest()
        chrome.runtime.sendMessage({type: "isUnlocked"});
        // alert('Signify extension installed with version: '+manifest.version)
        insertReactComponent()
        break;
      case "isUnlocked":
        break;
    
    
    }

    }
}, false);

// Handle messages from background script
chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {
    console.log(sender)
    if (sender.origin === "chrome-extension://" + chrome.runtime.id ) {
            // handle messages from Popup
            console.log("Message received from browser extension pupup: " + message)
            // sendResponse({ resp: "received" });
        }
    }
);

function insertReactComponent() {
  console.log('inserting react component')
  const div = document.createElement('div');
  div.id = '__root';
  document.body.appendChild(div);

  const rootContainer = document.querySelector('#__root');
  const root = createRoot(rootContainer!);
  root.render(<Dialog/>)

}

    
