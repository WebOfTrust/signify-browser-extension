export const senderIsPopup = (sender: chrome.runtime.MessageSender) => {
  const origin = "chrome-extension://" + chrome.runtime.id;
  const popupPath = origin + "/src/pages/popup/index.html";
  return sender.origin === origin && sender.url === popupPath;
};
