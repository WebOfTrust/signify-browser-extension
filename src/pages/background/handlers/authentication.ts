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
  const origin = url!;
  const signedHeaders = await signifyService.signHeaders(
    data.signin.identifier
      ? data.signin.identifier.name
      : data.signin.credential.issueeName,
    origin
  );
  let jsonHeaders: { [key: string]: string } = {};
  for (const pair of signedHeaders.entries()) {
    jsonHeaders[pair[0]] = pair[1];
  }
  sendResponse({
    data: {
      headers: jsonHeaders,
      credential: data.signin.credential ? data.signin.credential : null,
    },
  });
}
