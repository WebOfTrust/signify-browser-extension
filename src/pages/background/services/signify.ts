import { SignifyClient, Tier, ready } from "signify-ts";

const Signify = () => {
  let _client: SignifyClient | null;

  const connect = async (url: string, passcode: string, boot_url: string) => {
    await ready();
    _client = new SignifyClient(url, passcode, Tier.low, boot_url);
    await _client.connect();
  };

  const isConnected = async () => {
    console.log("_client is connected", _client);
    return _client ? true : false

    // const state =  await _client?.state();
    // return state;
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
    return await _client?.identifiers().list();
  };

  const listCredentials = async () => {
    validateClient();
    return await _client?.credentials().list();
  };

  const disconnect = async () => {
    _client = null;
  };

  return {
    connect,
    isConnected,
    disconnect,
    listIdentifiers,
    listCredentials,
  };
};

export const signifyService = Signify();
