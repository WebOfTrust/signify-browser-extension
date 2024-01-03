export const senderIsPopup = (sender: chrome.runtime.MessageSender) => {
  const origin = "chrome-extension://" + chrome.runtime.id;
  const popupPath = origin + "/src/pages/popup/index.html";
  return sender.origin === origin && sender.url === popupPath;
};

export const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch (err) {
    return false;
  }
};
