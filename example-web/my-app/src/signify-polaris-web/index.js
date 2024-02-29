import { pubsub } from "./pubsub";

var extensionId = "";

window.addEventListener(
  "message",
  async (event) => {
    // Accept messages only from same window
    if (event.source !== window) {
      return;
    }

    if (event.data.type && event.data.type === "signify-extension") {
      console.log("Content script loaded from polaris-web");
      extensionId = event.data.data.extensionId;
      pubsub.publish("signify-extension-loaded", extensionId);
    }

    if (event.data.type && event.data.type === "signify-signature") {
      pubsub.publish("signify-signature", event.data.data);
    }
  },
  false
);

const requestAid = () => {
  window.postMessage({ type: "select-identifier" }, "*");
};

const requestCredential = () => {
  window.postMessage({ type: "select-credential" }, "*");
};

const requestAidORCred = () => {
  window.postMessage({ type: "select-aid-or-credential" }, "*");
};

const requestAutoSignin = async () => {
  window.postMessage(
    {
      type: "fetch-resource",
      subtype: "auto-signin-signature",
    },
    "*"
  );
  //   const { data, error } = await chrome.runtime.sendMessage(extensionId, {
  //     type: "fetch-resource",
  //     subtype: "auto-signin-signature",
  //   });
  //   if (error) {
  //     window.postMessage({ type: "select-auto-signin" }, "*");
  //   } else {
  //     pubsub.publish("signify-signature", data);
  //   }
};

const isExtensionInstalled = (func) => {
  const timeout = setTimeout(() => {
    func(false);
  }, 1000);
  pubsub.subscribe("signify-extension-loaded", (_event, data) => {
    func(data);
    clearTimeout(timeout);
    pubsub.unsubscribe("signify-extension-loaded");
  });
};

const trySettingVendorUrl = async (vendorUrl) => {
  window.postMessage(
    {
      type: "vendor-info",
      subtype: "attempt-set-vendor-url",
      data: {
        vendorUrl,
      },
    },
    "*"
  );
  //   await chrome.runtime.sendMessage(extensionId, {
  //     type: "vendor-info",
  //     subtype: "attempt-set-vendor-url",
  //     data: {
  //       vendorUrl,
  //     },
  //   });
};

const subscribeToSignature = (func) => {
  pubsub.subscribe("signify-signature", (_event, data) => func(data));
};

const unsubscribeFromSignature = () => {
  pubsub.unsubscribe("signify-signature");
};

export {
  requestAid,
  requestCredential,
  requestAidORCred,
  requestAutoSignin,
  subscribeToSignature,
  unsubscribeFromSignature,
  isExtensionInstalled,
  trySettingVendorUrl,
};
