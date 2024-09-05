import browser from "webextension-polyfill";
import { SignifyClient, Tier, ready, randomPasscode } from "signify-ts";
import * as signinResource from "@pages/background/resource/signin";
import { sendMessage } from "@src/shared/browser/runtime-utils";
import { sendMessageTab, getCurrentTab } from "@src/shared/browser/tabs-utils";
import { userService } from "@pages/background/services/user";
import { configService } from "@pages/background/services/config";
import { sessionService } from "@pages/background/services/session";
import { IIdentifier, ISignin, ISessionConfig } from "@config/types";
import { SW_EVENTS } from "@config/event-types";

const PASSCODE_TIMEOUT = 5;

const Signify = () => {
  let _client: SignifyClient | null;

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name == "passcode-timeout") {
      try {
        const response = await sendMessage({
          type: SW_EVENTS.check_popup_open,
        });
        if (response.data.isOpened) {
          console.log("Timer expired, but extsenion is open. Resetting timer.");
          resetTimeoutAlarm();
        }
      } catch (error) {
        console.log("Timer expired, client and passcode zeroed out");
        _client = null;
        await userService.removeControllerId();
        await userService.removePasscode();
      }
    }
  });

  const setTimeoutAlarm = () => {
    browser.alarms.create("passcode-timeout", {
      delayInMinutes: PASSCODE_TIMEOUT,
    });
  };

  const resetTimeoutAlarm = async () => {
    await browser.alarms.clear("passcode-timeout");
    setTimeoutAlarm();
  };

  const generatePasscode = () => {
    return randomPasscode();
  };

  const bootAndConnect = async (
    agentUrl: string,
    bootUrl: string,
    passcode: string
  ) => {
    try {
      await ready();
      _client = new SignifyClient(agentUrl, passcode, Tier.low, bootUrl);
      await _client.boot();
      await _client.connect();
      const state = await getState();
      await userService.setControllerId(state?.controller?.state?.i);
      setTimeoutAlarm();
    } catch (error) {
      console.error(error);
      _client = null;
      return { error };
    }
  };

  const connect = async (agentUrl: string, passcode: string) => {
    try {
      await ready();
      _client = new SignifyClient(agentUrl, passcode, Tier.low);
      await _client.connect();
      const state = await getState();
      await userService.setControllerId(state?.controller?.state?.i);
      setTimeoutAlarm();
    } catch (error) {
      console.error(error);
      _client = null;
      return { error };
    }
  };

  const isConnected = async () => {
    const passcode = await userService.getPasscode();
    const url = await configService.getAgentUrl();
    if (url && passcode && !_client) {
      await connect(url, passcode);
      await resetTimeoutAlarm();
    }

    try {
      // _client.state() did not throw exception, so connected agent is valid
      const state = await getState();
      console.log("Signify client is connected", _client);
      return _client && state?.controller?.state?.i ? true : false;
    } catch (error) {
      console.log(
        _client
          ? "Signify client is not valid, unable to connect"
          : "Signify client is not connected",
        _client
      );
      return false;
    }
  };

  const validateClient = () => {
    if (!_client) {
      throw new Error("Signify Client not connected");
    }
  };
  const getState = async () => {
    validateClient();
    return await _client?.state();
  };

  const listIdentifiers = async () => {
    validateClient();
    let aids: IIdentifier[] = [];
    let start = 0;
    let total = 0;
    do {
      const res = await _client?.identifiers().list(start);
      if (res.aids?.length) {
        aids.push(...res.aids);
      }
      total = res.total;
      start = aids.length;
    } while (aids.length < total);
    return aids;
  };

  const listCredentials = async () => {
    validateClient();
    return await _client?.credentials().list();
  };

  // credential identifier => credential.sad.d
  const getCredentialWithCESR = async (credentialIdentifier: string) => {
    validateClient();
    try {
      return await _client?.credentials().get(credentialIdentifier, true);
    } catch (error) {
      console.error(error);
    }
  };

  const disconnect = async () => {
    _client = null;
    await userService.removeControllerId();
    await userService.removePasscode();
  };

  /**
   * @param tabId - tabId of the tab from where the request is being made -- required
   * @param origin - origin url from where request is being made -- required
   * @param signin - signin object containing identifier or credential -- required
   * @param config - configuration object containing sessionTime and maxReq -- required
   * @returns Promise<Request> - returns a signed headers request object
   */
  const authorizeSelectedSignin = async ({
    tabId,
    signin,
    origin,
    config,
  }: {
    tabId: number;
    signin: ISignin;
    origin: string;
    config: ISessionConfig;
  }): Promise<any> => {
    let aidName = signin.identifier
      ? signin.identifier?.name
      : signin.credential?.issueeName;
    let credentialResp;
    if (signin.credential) {
      credentialResp = { raw: signin.credential, cesr: null };
      const cesr = await getCredentialWithCESR(signin.credential?.sad?.d);
      credentialResp.cesr = cesr;
    }

    const response = {
      credential: credentialResp,
      identifier: signin?.identifier,
      // autoSignin: signin?.autoSignin,
    };

    const sessionInfo = await sessionService.create({
      tabId,
      origin,
      aidName: aidName!,
      signinId: signin.id,
      config
    });
    if (sessionInfo?.expiry) {
      response.expiry = sessionInfo.expiry;
    }
    await sendMessageTab(tabId, {
      type: "tab",
      subtype: "session-info",
      data: response,
    });

    resetTimeoutAlarm();
    return response;
  };

  /**
   * @param tabId - tabId of the tab from where the request is being made -- required
   * @param origin - origin url from where request is being made -- required
   * @returns Promise<Request> - returns a signed headers request object
   */
  const getSessionInfo = async ({
    tabId,
    origin,
  }: {
    tabId: number;
    origin: string;
  }): Promise<any> => {
    const session = await sessionService.get({ tabId, origin });
    if (!session) {
      return null;
    }
    const signin = await signinResource.getDomainSigninById(
      origin,
      session.signinId
    );
    let credentialResp;
    if (signin?.credential) {
      credentialResp = { raw: signin.credential, cesr: null };
      const cesr = await getCredentialWithCESR(signin.credential?.sad?.d);
      credentialResp.cesr = cesr;
    }
    const resp = {
      credential: credentialResp,
      identifier: signin?.identifier,
      expiry: session.expiry,
    };
    await sendMessageTab(tabId, {
      type: "tab",
      subtype: "session-info",
      data: resp,
    });

    resetTimeoutAlarm();
    return resp;
  };

  /**
   * @param tabId - tabId of the tab from where the request is being made -- required
   * @param origin - origin url from where request is being made -- required
   * @returns Promise<Request> - returns null
   */
  const removeSessionInfo = async ({
    tabId,
    origin,
  }: {
    tabId: number;
    origin: string;
  }): Promise<any> => {
    await sessionService.remove(tabId);
    await sendMessageTab(tabId, {
      type: "tab",
      subtype: "session-info",
      data: null,
    });

    resetTimeoutAlarm();
  };

  /**
   * @param origin - origin url from where request is being made -- required
   * @param rurl - resource url that the request is being made to -- required
   * @param method - http method of the request -- default GET
   * @param headers - headers object of the request -- default empty
   * @param signin - signin object containing identifier or credential -- required
   * @returns Promise<Request> - returns a signed headers request object
   */
  const getSignedHeaders = async ({
    origin,
    rurl,
    method = "GET",
    headers = new Headers({}),
    tabId,
  }: {
    origin: string;
    rurl: string;
    method?: string;
    headers?: Headers;
    tabId: number;
  }): Promise<any> => {
    // in case the client is not connected, try to connect
    const connected = await isConnected();
    // connected is false, it means the client session timed out or disconnected by user
    if (!connected) {
      validateClient();
    }

    const session = await sessionService.get({ tabId, origin });
    await sessionService.incrementRequestCount(tabId);
    if (!session) {
      throw new Error("Session not found");
    }
    const sreq = await _client?.createSignedRequest(session.aidName, rurl, {
      method,
      headers,
    });
    resetTimeoutAlarm();
    console.log("sreq", sreq);
    let jsonHeaders: { [key: string]: string } = {};
    for (const pair of sreq?.headers?.entries()) {
      jsonHeaders[pair[0]] = pair[1];
    }

    return {
      headers: jsonHeaders,
    };
  };

  const getControllerID = async (): Promise<string> => {
    validateClient();
    const controllerId = await userService.getControllerId();
    return controllerId;
  };

  const createAID = async (name: string) => {
    validateClient();
    let res = await _client?.identifiers().create(name);
    return await res?.op();
  };

  return {
    connect,
    isConnected,
    disconnect,
    listIdentifiers,
    listCredentials,
    createAID,
    generatePasscode,
    bootAndConnect,
    getControllerID,
    getSignedHeaders,
    authorizeSelectedSignin,
    getSessionInfo,
    removeSessionInfo,
  };
};

export const signifyService = Signify();
