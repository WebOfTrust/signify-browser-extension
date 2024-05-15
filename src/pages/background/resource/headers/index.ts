import browser from "webextension-polyfill";
import { getDomainSigninByIssueeName } from "@pages/background/resource/signin";
import { signifyService } from "@pages/background/services/signify";
import { Header } from "@src/components/sidebar/header";

export const getSignifyHeaders = async (
  wurl: string,
  rurl: string,
  headers?: browser.WebRequest.HttpHeaders
) => {
  const xAidName = headers?.find((header) => header.name === "x-aid-name");

  if (xAidName?.value) {
    const signin = await getDomainSigninByIssueeName(wurl, xAidName?.value);
    if (!signin?.autoSignin) {
      return headers;
    }
    try {
      const reqInit = { headers: headers } as RequestInit;
      const isign = await signifyService.getSignedHeaders({wurl, rurl, reqInit, signin});
      headers = headers ? Array.from(headers).concat(isign.headers.map(([name, value]) => ({ name, value }))) : [];
      headers.push({ name: "x-aid-name", value: xAidName?.value })
    } catch (error: any) {}
  }

  return headers;
};
