import { SignifyClient, Tier, ready, Authenticater } from "signify-ts";

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

  const signHeaders = async (aidName: string, method:string, path:string, origin: string) => {
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
      '@method',
      '@path',
      'signify-resource',
      'signify-timestamp',
      'origin'
    ];

    const signed_headers = authenticator.sign(
      headers,
      method,
      path,
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
