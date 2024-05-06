import browser from "webextension-polyfill";
import { getDomainSigninByIssueeName } from "@pages/background/resource/signin";
import { signifyService } from "@pages/background/services/signify";

export const getSignifyHeaders = async (
  url: string,
  headers?: browser.WebRequest.HttpHeaders
) => {
  const xAidName = headers?.find((header) => header.name === "x-aid-name");

  if (xAidName?.value) {
    const signin = await getDomainSigninByIssueeName(url, xAidName?.value);
    if (!signin?.autoSignin) {
      return headers;
    }
    const resp = await signifyService.signHeaders(xAidName?.value, url!);
    headers = headers?.filter((header) => header.name !== "x-aid-name");
    Object.entries(resp).forEach((entry) => {
      headers?.push({ name: entry[0], value: entry[1] });
    });
  }

  return headers;
};
