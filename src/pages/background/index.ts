
console.log('Background script loaded');

chrome.runtime.onConnect.addListener(function(port) {
    console.log("Connection with content script established")
    console.assert(port.name === "signify");
    port.onMessage.addListener(function(msg, sender) {
        console.log("Message received from content script: ",msg);
        port.postMessage({signature: "ABCD"});
        
    });
  });

