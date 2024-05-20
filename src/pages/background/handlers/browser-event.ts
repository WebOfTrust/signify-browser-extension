import browser from "webextension-polyfill";
import { getSignifyHeaders } from "@pages/background/resource/headers";

export const onBeforeSendHeadersHandler = async (
  details: browser.WebRequest.OnBeforeSendHeadersDetailsType
): Promise<browser.WebRequest.BlockingResponseOrPromise | void> => {
  console.log("details", details);
  let headers = await getSignifyHeaders(
    details.originUrl!,
    details.requestHeaders
  );

  return { requestHeaders: headers };
};
