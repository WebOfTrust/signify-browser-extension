import { signifyService } from "@pages/background/services/signify";
import { userService } from "@pages/background/services/user";
import { IHandler } from "@config/types";

export async function handleCheckAgentConnection({
  sendResponse,
  url,
}: IHandler) {
  const isConnected = await signifyService.isConnected();
  sendResponse({ data: { isConnected, tabUrl: url } });
}

export async function handleDisconnectAgent({ sendResponse }: IHandler) {
  await signifyService.disconnect();
  sendResponse({ data: { isConnected: false } });
}

export async function handleConnectAgent({ sendResponse, data }: IHandler) {
  const resp = (await signifyService.connect(
    data.agentUrl,
    data.passcode
  )) as any;
  if (resp?.error) {
    // TODO: improve error messages
    // Current messages are not descrptive enough e.g
    // bran must be 21 characters
    // agent does not exist for controller <controller-id>
    // using custom error message for now instead of resp?.error?.message

    sendResponse({
      error: {
        code: 404,
        message: resp?.error?.message,
      },
    });
  } else {
    await userService.setPasscode(data.passcode);
    sendResponse({ data: { success: true } });
  }
}

export async function handleBootConnectAgent({ sendResponse, data }: IHandler) {
  const resp = (await signifyService.bootAndConnect(
    data.agentUrl,
    data.bootUrl,
    data.passcode
  )) as any;
  if (resp?.error) {
    sendResponse({
      error: {
        code: 404,
        message: resp?.error?.message,
      },
    });
  } else {
    await userService.setPasscode(data.passcode);
    sendResponse({ data: { success: true } });
  }
}

export async function handleGeneratePasscode({ sendResponse, data }: IHandler) {
  const passcode = signifyService.generatePasscode();
  sendResponse({ data: { passcode } });
}

export async function handleGetSignedHeaders({
  sendResponse,
  url,
  data,
}: IHandler) {
  try {
    const resp = await signifyService.getSignedHeaders({
      wurl: url!,
      rurl: data?.rurl,
      reqInit: data?.reqInit,
      signin: data.signin,
    });

    sendResponse({
      data: resp,
    });
  } catch (error: any) {
    sendResponse({
      error: { code: 503, message: error?.message },
    });
  }
}
