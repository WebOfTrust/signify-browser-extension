import { signifyService } from "@pages/background/services/signify";
import { userService } from "@pages/background/services/user";
import { getDomainFromUrl } from "@shared/utils";
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
    data.passcode,
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
  try {
    console.log("Booting and connecting agent via workflow with:", {
      agentUrl: data.agentUrl,
      bootUrl: data.bootUrl,
      hasPasscode: !!data.passcode, // Don't log actual passcode
    });

    // Call the workflow method
    const resp = await signifyService.bootAndConnectWorkflow(
      data.agentUrl,
      data.bootUrl,
      data.passcode,
    );

    if (resp && "error" in resp && resp.error) {
      console.error("Error in boot connect workflow:", resp.error);
      sendResponse({
        error: {
          code: 404,
          message:
            resp.error instanceof Error
              ? resp.error.message
              : "Failed to connect to agent",
        },
      });
    } else {
      // Store the passcode for reconnection
      await userService.setPasscode(data.passcode);
      console.log("Successfully connected agent via workflow");
      sendResponse({ data: { success: true } });
    }
  } catch (error) {
    console.error("Unexpected error in handleBootConnectAgent:", error);
    sendResponse({
      error: {
        code: 500,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    });
  }
}

// Direct access methods for service functions
// These are added from signify.ts to ensure all functionality is preserved
export async function handleBootAndConnect({
  agentUrl,
  bootUrl,
  passcode,
}: {
  agentUrl: string;
  bootUrl: string;
  passcode: string;
}) {
  return await signifyService.bootAndConnect(agentUrl, bootUrl, passcode);
}

export async function handleConnect({
  agentUrl,
  passcode,
}: {
  agentUrl: string;
  passcode: string;
}) {
  return await signifyService.connect(agentUrl, passcode);
}

export async function handleIsConnected() {
  return await signifyService.isConnected();
}

export async function handleDisconnect() {
  return await signifyService.disconnect();
}

export async function handleGeneratePasscode({ sendResponse, data }: IHandler) {
  try {
    console.log("Generating passcode through workflow");

    // Use our method that generates a passcode and prepares the workflow config
    const result = await signifyService.generateAndStorePasscode();

    if (result.success && result.passcode) {
      console.log("Successfully generated passcode");
      sendResponse({ data: { passcode: result.passcode } });
    } else {
      console.error("Failed to generate passcode");
      sendResponse({
        error: {
          message: "Failed to generate passcode",
        },
      });
    }
  } catch (error) {
    console.error("Error in handleGeneratePasscode:", error);
    sendResponse({
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate passcode",
      },
    });
  }
}

export async function handleGetAuthData({
  sendResponse,
  tabId,
  url,
  data,
}: IHandler) {
  try {
    const resp = await signifyService.authorizeSelectedSignin({
      tabId: tabId!,
      signin: data.signin,
      origin: getDomainFromUrl(url!),
      config: data.config,
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

export async function handleGetSessionInfo({
  sendResponse,
  tabId,
  url,
}: IHandler) {
  try {
    const resp = await signifyService.getSessionInfo({
      tabId: tabId!,
      origin: getDomainFromUrl(url!),
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

export async function handleClearSession({
  sendResponse,
  tabId,
  url,
}: IHandler) {
  try {
    const resp = await signifyService.removeSessionInfo({
      tabId: tabId!,
      origin: getDomainFromUrl(url!),
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
