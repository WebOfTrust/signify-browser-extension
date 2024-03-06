export const senderIsPopup = (sender: chrome.runtime.MessageSender) => {
  return (
    (sender.url?.startsWith("moz-extension://") ||
      sender.url?.startsWith("chrome-extension://")) &&
    sender.url?.endsWith("/src/pages/popup/index.html") &&
    sender.id === chrome.runtime.id
  );
};

export const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch (err) {
    return false;
  }
};

export const getCurrentTab = (): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]);
    });
  });
};

export const getCurrentDomain = async () => {
  const currentTab = await getCurrentTab();
  console.log("Current tab: ", currentTab);
  return currentTab ? new URL(currentTab.url!) : null;
};

export const obfuscateString = (inputString: string) => {
  const prefixLength = 12;
  const suffixLength = 8;

  if (inputString.length <= prefixLength + suffixLength) {
    return inputString;
  }

  const prefix = inputString.slice(0, prefixLength);
  const suffix = inputString.slice(-suffixLength);

  return `${prefix}...${suffix}`;
};

export const removeSlash = (site = "") => {
  return site.replace(/\/$/, "");
};

export const hasWhiteSpace = (s: string) => {
  return s.indexOf(" ") >= 0;
};

export const removeWhiteSpace = (s: string, replace = "") => {
  return s.replace(/\s/g, replace);
};

export const setActionIcon = async (iconUrl: string) => {
  try {
    const imageBlob = await fetch(iconUrl).then((r) => r.blob());
    const bitmap = await createImageBitmap(imageBlob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d");
    context?.drawImage(bitmap, 0, 0);
    const imageData = context?.getImageData(0, 0, bitmap.width, bitmap.height);
    chrome.action.setIcon({ imageData: imageData });
  } catch (error) {}
};
