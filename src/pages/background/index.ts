import { randomPasscode, SignifyClient, Tier, ready } from 'signify-ts'
const url = "https://keria-dev.rootsid.cloud/admin"
const boot_url = "https://keria-dev.rootsid.cloud"

console.log('Background script loaded');

// Handle messages
chrome.runtime.onMessage.addListener(
    async function (message, sender, sendResponse) {
        if (sender.tab) {
            // Handle mesages from content script
            console.log("Message received from content script at " + sender.tab.url + ": " + message.type)
            if (message.type) {
                switch (message.type) {
                    case "getVersion":
                        const manifestData = chrome.runtime.getManifest()
                        sendResponse(manifestData.version);
                        break;
                    case "isUnlocked":
                        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
                        const response = chrome.tabs.sendMessage(tab.id!, {type: "for_content_script"});
                        // sendResponse(true);
                        break;
                    case "hasLogin":
                        sendResponse({ login: "AID 123" });
                        break;
                    case "authenticate":
                        sendResponse({ signature: "ABCD" });
                        break;
                    default:
                        break;
                }
            }

        } else if (sender.origin === "chrome-extension://" + chrome.runtime.id &&
            sender.url === "chrome-extension://" + chrome.runtime.id + "/src/pages/popup/index.html") {
            // handle messages from Popup
            console.log("Message received from browser extension pupup: " + message)
            sendResponse({ resp: "received" });
        }
    }
);

