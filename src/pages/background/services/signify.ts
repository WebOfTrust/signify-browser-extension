import browser from "webextension-polyfill";
import {
  SignifyClient,
  Tier,
  ready,
  Authenticater,
  randomPasscode,
} from "signify-ts";
import { sendMessage } from "@src/shared/browser/runtime-utils";
import { userService } from "@pages/background/services/user";
import { configService } from "@pages/background/services/config";
import { getDomainFromUrl } from "@shared/utils";
import { IIdentifier, ISignin, ISignature } from "@config/types";
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
   *
   * @param wurl - webapp url to get the origin from -- required
   * @param rurl - resource url that the request is being made to -- required
   * @param reqInit - request init object -- default {}
   * @param signin - signin object containing identifier or credential -- required
   * @returns Promise<Request> - returns a signed headers request object
   */
  const getSignedHeaders = async ({
    wurl,
    rurl,
    reqInit = {},
    signin,
  }: {
    wurl: string;
    rurl: string;
    reqInit?: RequestInit;
    signin: ISignin;
  }): Promise<ISignature> => {
    // in case the client is not connected, try to connect
    const connected = await isConnected();
    // connected is false, it means the client session timed out or disconnected by user
    if (!connected) {
      validateClient();
    }
    const origin = getDomainFromUrl(wurl);
    let heads = new Headers(reqInit.headers);
    heads.set("Origin", origin);
    const req = { ...reqInit, headers: heads };

    let aidName = signin.identifier
      ? signin.identifier?.name
      : signin.credential?.issueeName;
    const sreq = await _client?.createSignedRequest(aidName!, rurl, req);
    resetTimeoutAlarm();
    let jsonHeaders: { [key: string]: string } = {};
    for (const pair of sreq?.headers?.entries()) {
      jsonHeaders[pair[0]] = pair[1];
    }
    if (signin.credential) {
      const cesr = await getCredentialWithCESR(signin.credential?.sad?.d);
      signin.credential.cesr = cesr;
    }

    return {
      headers: jsonHeaders,
      credential: signin?.credential,
      identifier: signin?.identifier,
      autoSignin: signin?.autoSignin,
    };
  };

  const getControllerID = async (): Promise<string> => {
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
  };
};

export const signifyService = Signify();
