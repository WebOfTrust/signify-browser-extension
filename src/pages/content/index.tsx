import { createRoot } from 'react-dom/client';
import './style.css' 

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
        alert('Signify extension installed with version: '+manifest.version)
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

  // OPEN A DIALOG IN WEB PAGE 
  //   document.body.innerHTML += '<dialog data-dialog="animated-dialog" data-dialog-mount="opacity-100 translate-y-0 scale-100" data-dialog transition="transition-all duration-300" class="relative m-4 w-2/5 min-w-[40%] max-w-[40%] rounded-lg bg-white font-sans text-base font-light leading-relaxed text-blue-gray-500 antialiased shadow-2xl">Select AID<br><br><button class="select-none rounded-lg bg-gradient-to-tr from-gray-900 to-gray-800 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">Sign in</button></dialog>';
  //   var dialog = document.querySelector("dialog")
    
  //   dialog.querySelector("button").addEventListener("click", function() {
  //     port.postMessage(event.data.text);  
  //     dialog.close()
  //   })
  //   dialog.showModal()
  
  // dialog.showModal()
    
