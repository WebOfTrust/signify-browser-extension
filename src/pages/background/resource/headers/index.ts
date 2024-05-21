import browser from "webextension-polyfill";
import { getDomainSigninByIssueeName } from "@pages/background/resource/signin";
import { signifyService } from "@pages/background/services/signify";

export const getSignifyHeaders = async (
  wurl: string,
  headers?: browser.WebRequest.HttpHeaders
) => {
  const xAidName = headers?.find((header) => header.name === "x-aid-name");
  const rUrl = headers?.find((header) => header.name === "rurl");

  if (xAidName?.value) {
    const signin = await getDomainSigninByIssueeName(wurl, xAidName?.value);
    if (!signin?.autoSignin) {
      return headers;
    }
    try {
      const reqInit = { headers: headers } as RequestInit;
      const isign = await signifyService.getSignedHeaders({
        wurl,
        rurl: rUrl?.value!,
        reqInit,
        signin,
      });

      headers = headers?.filter((header) => header.name !== "x-aid-name");

      if (isign?.headers) {
        Object.entries(isign?.headers).forEach((entry) => {
          headers?.push({ name: entry[0], value: entry[1] });
        });
      }
    } catch (error: any) {}
  }

  return headers;
};
