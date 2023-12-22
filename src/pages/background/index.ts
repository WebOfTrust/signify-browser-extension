import { userService } from "@pages/background/services/user";
import { configService } from "@pages/background/services/config";

console.log('Background script loaded');

// Handle messages
chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        (async () => {
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
                if(message.type === "authentication" && message.subtype === "persist-token"){
                    await userService.setToken(message.passcode)
                    await configService.setUrl(message.vendorUrl)
                    const token = await userService.getToken()
                    console.log("token", token);
                }
                console.log("sender", sender);
                sendResponse({ resp: "received" });
            }
        })();

        // Important! Return true to indicate you want to send a response asynchronously
        return true;
    }
);

