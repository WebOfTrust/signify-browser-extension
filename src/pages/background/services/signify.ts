import { SignifyClient, Tier, ready, Authenticater, randomPasscode, b } from "signify-ts";
import { userService } from "@pages/background/services/user";
import { configService } from "@pages/background/services/config";
import { IIdentifier } from "@config/types";

const PASSCODE_TIMEOUT = 5;

const Signify = () => {
  let _client: SignifyClient | null;

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name == "passcode-timeout") {
      
      try {
        const response = await chrome.runtime.sendMessage({type: "popup", subtype: "isOpened"});
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
    chrome.alarms.create("passcode-timeout", {
      delayInMinutes: PASSCODE_TIMEOUT,
    });
  };

  const resetTimeoutAlarm = async () => {
    await chrome.alarms.clear("passcode-timeout");
    setTimeoutAlarm();
  };

  const generatePasscode =  () => {
    return randomPasscode();
  };

  const bootAndConnect = async (agentUrl: string, bootUrl: string, passcode: string) => {
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

    console.log(
      _client
        ? "Signify client is connected"
        : "Signify client is not connected", _client
    );
    return _client ? true : false;
  };

  const validateClient = () => {
    if (!_client) {
      throw new Error("Client not connected");
    }
  };
  const getState = async () => {
    validateClient();
    return await _client?.state();
  };

  const listIdentifiers = async () => {
    validateClient();
    let aids: IIdentifier[] = []
    let start = 0;
    let total = 0;
    do {
      const res = await _client?.identifiers().list(start);
      if(res.aids?.length){
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

  const disconnect = async () => {
    _client = null;
    await userService.removeControllerId();
    await userService.removePasscode();
  };

  const signHeaders = async (aidName = "", origin: string) => {
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
    return signed_headers;
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
    signHeaders,
    createAID,
    generatePasscode,
    bootAndConnect,
    getControllerID,
  };
};

export const signifyService = Signify();
