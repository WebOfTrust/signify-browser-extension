import browser from "webextension-polyfill";
import { signifyService } from "@pages/background/services/signify";

export const getSignifyHeaders = async (
  url: string,
  headers?: browser.WebRequest.HttpHeaders
) => {
  const xAppendSignifyHeader = headers?.find(
    (header) => header.name === "x-append-signify-headers"
  );
  const xAidName = headers?.find((header) => header.name === "x-aid-name");

  if (xAppendSignifyHeader?.value === "true" && xAidName?.value) {
    const resp = await signifyService.signHeaders(xAidName?.value, url!);
    headers = headers?.filter(
      (header) =>
        header.name !== "x-aid-name" &&
        header.name !== "x-append-signify-headers"
    );
    Object.entries(resp).forEach((entry) => {
      headers?.push({ name: entry[0], value: entry[1] });
    });
  }

  return headers;
};
