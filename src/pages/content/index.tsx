import { createRoot } from 'react-dom/client';
import './style.css' 
const div = document.createElement('div');
div.id = '__root';
document.body.appendChild(div);

const rootContainer = document.querySelector('#__root');
if (!rootContainer) throw new Error("Can't find Options root element");
const root = createRoot(rootContainer);
root.render(
  <div className='absolute bottom-0 left-0 text-lg text-black bg-amber-400 z-50'  >
    content script injected
  </div>
);

try {
  console.log('content script injected');
} catch (e) {
  console.error(e);
}

var port = chrome.runtime.connect({name: "signify"});

port.onMessage.addListener(function(msg) {
  console.log("received message from background script: "+msg.signature)
  alert('signature received from extension: '+msg.signature);

});

window.addEventListener("message", (event) => {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (event.data.type === "FROM_PAGE")) {
    console.log("Content script received from web page: " + event.data.text);
    document.body.innerHTML += '<dialog data-dialog="animated-dialog" data-dialog-mount="opacity-100 translate-y-0 scale-100" data-dialog transition="transition-all duration-300" class="relative m-4 w-2/5 min-w-[40%] max-w-[40%] rounded-lg bg-white font-sans text-base font-light leading-relaxed text-blue-gray-500 antialiased shadow-2xl">Select AID<br><br><button class="select-none rounded-lg bg-gradient-to-tr from-gray-900 to-gray-800 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">Sign in</button></dialog>';
    var dialog = document.querySelector("dialog")
    
    dialog.querySelector("button").addEventListener("click", function() {
      port.postMessage(event.data.text);  
      dialog.close()
    })
    dialog.showModal()
  
  dialog.showModal()
    
    }
}, false);

