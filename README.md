# Signify Browser Extension

A secure browser extension for website authentication using KERIA agents and signify-ts.

## Table of Contents
- [Overview](#overview)
- [Quick Start Guide](#quick-start-guide)
- [Architecture](#architecture)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## Overview
This browser extension was initially developed as part of Provenant's [Bounty PB311.1](https://docs.google.com/document/d/1mq82RDRGfoOMCs8sR8Cuj_hMC5i1_aP7e6DVqp8o13g/edit?usp=sharing)

This browser extension, initially implemented for Chromium browsers, uses [signify-ts](https://github.com/weboftrust/signify-ts) to connect to a [KERIA](https://github.com/weboftrust/keria) agent and retrieve user AIDs and their associated keys and credentials. Those AIDs and credentials are used to sign in to enabled websites. Once a signin is associated with a website, it's stored in chrome store for future use.

The primary goal of this extension is to provide a secure way to sign in to websites without disclosing private keys to untrusted websites. Websites developers should adopt [polaris-web]() library to send messages to the extension requesting signed headers that are needed to authenticate in a backend service. Additionally to the signed headers, the website may request to provide a credential (ACDC).

This browser extension adopts [Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3) to take advantage of the new security features and performance improvements.


## Quick Start Guide

### 1. Installation

```bash
#install dependencies
npm install
```

### 2. Build
In order to run the extension locally, we first need to build. 
We are using [vite](https://vitejs.dev/) frontend build tool. 
[vite.config.js](./vite.config.ts) file is configured to generate build for chrome/chromium or firefox.

### generate build for chrome:
The following command generates a build for chrome in [dist/chrome](./dist/chrome/) folder.
```bash
npm run build
```
See [this guide](https://medium.com/@aabroo.jalil/how-to-test-a-chrome-extension-locally-step-by-step-guide-852e4622d4c7) to run extension locally in chrome

### generate build for firefox:
The following command generates a build for firefox in [dist/firefox](./dist/firefox/) folder.
```bash
npm run build:firefox
```
See [this guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension) to run extension locally in firefox

### 3. Setup KERIA agent

Start up a KERIA agent (the path of least resistance is probably [through the docker image from the repo](https://github.com/WebOfTrust/keria?tab=readme-ov-file#run-with-docker))
Note down the boot and agent URLs!

### 4. Configure extension
1. Install extension into target browser (whose build steps are described below).  In Chrome you can do that [by following these instructions](https://support.google.com/chrome/a/answer/2714278?hl=en#:~:text=Step%202%3A%20Test%20the%20app%20or%20extension)
2. Click on Extension.  First time you should see this: ![image](https://github.com/user-attachments/assets/57119d20-bf5c-467a-84dd-4b3ce938b39d).
3. Fill in bootURL and agentURL with the boot and agent ports of the KERIA agent you started and click "save"
4. From there it should tell you to enter your passcode: ![image](https://github.com/user-attachments/assets/61c786a0-fd3d-462d-a15d-e8bd068a2a78) since you don't have a passcode yet you'll click on the dialogue that says _Don't have a KERIA agent?_
5. That will bring you to a screen with a button called "Generate Passcode".  Click that and save the value, this is the passcode for this particular extension.  In a production setting this would be the master secret that the user must keep secure.  Enter it into the box that appears.  ![image](https://github.com/user-attachments/assets/b42a27a5-d40d-417f-9896-c78b4c0f98b6)
6. If successful, you'll be taken to the main landing page ![image](https://github.com/user-attachments/assets/2be997e5-1135-436b-9a9b-9c09bf6d9852)


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


## Troubleshooting
* There are three places things are logged.  Look here first when developing.
  * KERIA's log console.  If using the docker images these should be set up to scroll as events occur
  * Error log on the extension manager itself.  This will print stack traces when the extension logs unresolvable errors
  * Console of the web worker run by the extension.
