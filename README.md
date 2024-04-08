# Signify Browser Extension
This browser extension was initially developed as part of Provenant's [Bounty PB311.1](https://docs.google.com/document/d/1mq82RDRGfoOMCs8sR8Cuj_hMC5i1_aP7e6DVqp8o13g/edit?usp=sharing)

This browser extension, initially implemented for Chromium browsers, uses [signify-ts](https://github.com/weboftrust/signify-ts) to connect to a [KERIA](https://github.com/weboftrust/keria) agent and retrieve user AIDs and their associated keys and credentials. Those AIDs and credentials are used to sign in to enabled websites. Once a signin is associated with a website, it's stored in chrome store for future use.

The primary goal of this extension is to provide a secure way to sign in to websites without disclosing private keys to untrusted websites. Websites developers should adopt [polaris-web]() library to send messages to the extension requesting signed headers that are needed to authenticate in a backend service. Additionally to the signed headers, the website may request to provide a credential (ACDC).

This browser extension adopts [Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3) to take advantage of the new security features and performance improvements.

## Architecture
The browser extension is composed of the following components:

### Background
The background script, known as service worker in Manifest v3, is responsible for handling messages received from the content script, popup, and external webpages that were already allowed to request signed headers from  the extension. The background script is also responsible for handling the communication with the KERIA agent. 

### Popup
It's the user interface of the browser extension. It can be accessed by clicking on the extension action icon in the browser toolbar.

### Content Script
The content script is injected in the active web page and is responsible for handling messages from the website, the background script and the popup.

### Dialog
The dialog is a html that is injected by the content script in the active web page. It's used to display messages to the user and request user interaction.

## Security considerations
The following rules are enforced by design to ensure the security of the extension:
* The extension only sends signed headers to the website if the user has previously created a signing association with that website.
* The extension only sends signed headers to the website if the website is the active tab on the browser.
* The passcode is temporarily stored in the extension and is zeroed out after a few minutes.
* Messages from content script are allowed if the content script belongs to the active tab.
* Direct messages from the website to the background script are only allowed for the active tab and if a signing association exists with the auto-signin flag enabled.
* Request minimum permission in the Manifest.
* All sensitive data is only accessed by the background script and popup, and never reaches the content script.
* Never run external scripts in the extension (`eval()`).

## Run for development:

### install packages:
```
npm install
```

In order to run the extension locally, we first need to build. 
We are using [vite](https://vitejs.dev/) frontend build tool. 
[vite.config.js](./vite.config.ts) file is configured to generate build for chrome/chromium or firefox.

### generate build for chrome:
The following command generates a build for chrome in [dist/chrome](./dist/chrome/) folder.
```
npm run build
```
See [this guide](https://medium.com/@aabroo.jalil/how-to-test-a-chrome-extension-locally-step-by-step-guide-852e4622d4c7) to run extension locally in chrome

### generate build for firefox:
The following command generates a build for firefox in [dist/firefox](./dist/firefox/) folder.
```
npm run build:firefox
```
See [this guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension) to run extension locally in firefox
