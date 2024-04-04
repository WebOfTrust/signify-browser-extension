import {
  WEB_APP_PERMS,
  configService,
} from "@pages/background/services/config";
import { IHandler } from "@config/types";

export async function handleGetVendorData({ sendResponse }: IHandler) {
  const vendorData = await configService.getVendorData();
  sendResponse({ data: { vendorData } });
}

export async function handleAttemptSetVendorData({
  sendResponse,
  data,
  url,
}: IHandler) {
  const { vendorUrl } = data ?? {};
  await configService.setWebRequestedPermission(WEB_APP_PERMS.SET_VENDOR_URL, {
    origin: url,
    vendorUrl,
  });
  sendResponse({ data: { success: true } });
}
