import { SignifyClient, Tier, ready, Authenticater } from "signify-ts";
import { userService } from "@pages/background/services/user";
import { configService } from "@pages/background/services/config";

const PASSCODE_TIMEOUT = 5 * 60 * 1000;

const Signify = () => {
  let _client: SignifyClient | null;

  const connect = async (url: string, passcode: string) => {
    await ready();
    _client = new SignifyClient(url, passcode, Tier.low);
    await _client.connect();
    setTimeout(async () => {
      console.log("Timer expired, client and passcode zeroed out");
      _client = null;
      await userService.removePasscode();
    }, PASSCODE_TIMEOUT);
  }

  const isConnected = async () => {
    const passcode = await userService.getPasscode();
    const url = await configService.getUrl();
    if (url && passcode && !_client) {
      await connect(url, passcode);
    }

    console.log(_client ? "Signify client is connected" :  "Signify client is not connected");
    return _client ? true : false
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
    await userService.removePasscode();
  };

  const signHeaders = async (aidName: string, origin: string) => {
    const hab = await _client?.identifiers().get(aidName);
    const keeper = _client?.manager!.get(hab);

    const authenticator = new Authenticater(
        keeper.signers[0],
        keeper.signers[0].verfer
    );

    const headers = new Headers();
    headers.set('Signify-Resource', hab.prefix);
    headers.set(
        'Signify-Timestamp',
        new Date().toISOString().replace('Z', '000+00:00')
    );
    headers.set('Origin', origin);

    const fields = [
      // '@method',
      // '@path',
      'signify-resource',
      'signify-timestamp',
      'origin'
    ];

    const signed_headers = authenticator.sign(
      headers,
      "",
      "",
      fields
    ); 

    return signed_headers;
  };

  return {
    connect,
    isConnected,
    disconnect,
    listIdentifiers,
    listCredentials,
    signHeaders
  };
};

export const signifyService = Signify();
