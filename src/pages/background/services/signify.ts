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
      // _client?.state() did not throw exception, so connected agent is valid
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
      throw new Error("Client not connected");
    }
  };
  const getState = async () => {
    validateClient();
    const data = await browser.storage.local.get("is-invalid");
    if(data["is-invalid"]){
      throw new Error("Unable to connect with Signify Client");
    }
    return await _client?.state();
  };

  const listIdentifiers = async () => {
    await getState();
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
    await getState();
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

  const signHeaders = async (aidName = "", origin: string) => {
    await getState();
    const hab = await _client?.identifiers().get(aidName);
    const keeper = _client?.manager!.get(hab);

    const authenticator = new Authenticater(
      keeper.signers[0],
      keeper.signers[0].verfer
    );

    const headers = new Headers();
    headers.set("Signify-Resource", hab.prefix);
    headers.set(
      "Signify-Timestamp",
      new Date().toISOString().replace("Z", "000+00:00")
    );
    headers.set("Origin", origin);

    const fields = [
      // '@method',
      // '@path',
      "signify-resource",
      "signify-timestamp",
      "origin",
    ];

    const signed_headers = authenticator.sign(headers, "", "", fields);
    resetTimeoutAlarm();
    let jsonHeaders: { [key: string]: string } = {};
    for (const pair of signed_headers.entries()) {
      jsonHeaders[pair[0]] = pair[1];
    }
    return jsonHeaders;
  };

  const getSignedHeaders = async ({
    url,
    signin,
  }: {
    url: string;
    signin: ISignin;
  }): Promise<ISignature> => {
    const origin = getDomainFromUrl(url);
    const signedHeaders = await signHeaders(
      signin.identifier
        ? signin.identifier?.name
        : signin.credential?.issueeName,
      origin
    );

    if (signin.credential) {
      const cesr = await getCredentialWithCESR(signin.credential?.sad?.d);
      signin.credential.cesr = cesr;
    }

    return {
      headers: signedHeaders,
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
    await getState();
    let res = await _client?.identifiers().create(name);
    return await res?.op();
  };

  return {
    connect,
    isConnected,
    disconnect,
    listIdentifiers,
    listCredentials,
    signHeaders,
    createAID,
    generatePasscode,
    bootAndConnect,
    getControllerID,
    getSignedHeaders,
  };
};

export const signifyService = Signify();
