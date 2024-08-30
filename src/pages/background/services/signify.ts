import browser from "webextension-polyfill";
import { SignifyClient, Tier, ready, randomPasscode, Saider, IssueCredentialResult, CredentialData } from "signify-ts";
import { sendMessage } from "@src/shared/browser/runtime-utils";
import { userService } from "@pages/background/services/user";
import { configService } from "@pages/background/services/config";
import { sessionService } from "@pages/background/services/session";
import { IIdentifier, ISignin } from "@config/types";
import { SW_EVENTS } from "@config/event-types";
import { formatAsCredentialEdgeOrRuleObject, getSchemaFieldOfEdge, parseSchemaEdgeOrRuleSection, setNodeValueInEdge, waitOperation } from "@src/shared/signify-utils";

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
  const getCredential = async (credentialIdentifier: string, includeCESR: boolean = false) => {
    validateClient();
    return await _client?.credentials().get(credentialIdentifier, includeCESR);
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
   * @returns Promise<Request> - returns a signed headers request object
   */
  const authorizeSelectedSignin = async ({
    tabId,
    signin,
    origin,
  }: {
    tabId: number;
    signin: ISignin;
    origin: string;
  }): Promise<any> => {
    let aidName = signin.identifier
      ? signin.identifier?.name
      : signin.credential?.issueeName;
    let credentialResp;
    if (signin.credential) {
      credentialResp = { raw: signin.credential, cesr: null };
      const cesr = await getCredential(signin.credential?.sad?.d, true);
      credentialResp.cesr = cesr;
    }
    await sessionService.create({ tabId, origin, aidName: aidName! });
    resetTimeoutAlarm();
    return {
      credential: credentialResp,
      identifier: signin?.identifier,
      autoSignin: signin?.autoSignin,
    };
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
    const sreq = await _client?.createSignedRequest(session.aidName, rurl, {
      method,
      headers,
    });
    resetTimeoutAlarm();
    console.log("sreq", sreq);
    let jsonHeaders: { [key: string]: string } = {};
    if (sreq?.headers) {
      for (const pair of sreq.headers.entries()) {
        jsonHeaders[pair[0]] = pair[1];
      }
    }

    return {
      headers: jsonHeaders,
    };
  };

  /**
  * Create a data attestation credential, it is an untargeted ACDC credential i.e. there is no issuee.
  * 
  * @param origin - origin url from where request is being made -- required
  * @param credData - credential data object containing the credential attributes -- required
  * @param schemaSaid - SAID of the schema -- required
  * @param signin - signin object containing identifier or credential -- required
  * @returns Promise<Request> - returns a signed headers request object
  */
  const createAttestationCredential = async ({
    origin,
    credData,
    schemaSaid,
    tabId
  }: {
    origin: string;
    credData: any,
    schemaSaid: string,
    tabId: number;
  }): Promise<any> => {
    // in case the client is not connected, try to connect
    const connected = await isConnected();
    // connected is false, it means the client session timed out or disconnected by user
    if (!connected) {
      validateClient();
    }

    const session = await sessionService.get({ tabId, origin });
    let { aid, registry, rules, edge } = await getCreateCredentialPrerequisites(session.aidName, schemaSaid);    
    if (isGroupAid(aid) === true) {
      throw new Error(`Attestation credential issuance by multisig identifier ${session.aidName} is not supported yet!`);
    }
    
    let credArgs: CredentialData = {
      i: aid.prefix,
      ri: registry.regk,
      s: schemaSaid,
      a: credData,
      r: rules
        ? Object.keys(rules).length > 0
          ? Saider.saidify({ d: '', ...rules })[1]
          : undefined
        : undefined,
      e: edge
        ? Object.keys(edge).length > 0
          ? Saider.saidify({ d: '', ...edge })[1]
          : undefined
        : undefined
    }
    console.log("create credential args: ", credArgs);
    let credResult = await createCredential(session.aidName, credArgs)
    if (credResult && _client) {
      await waitOperation(_client, credResult.op)
    }

    return credResult;
  };

  const getCreateCredentialPrerequisites = async (aidName: string, schemaSaid: string):
    Promise<{ aid: any | undefined; schema: any; registry: any, rules: any, edge: any }> => {
    const aid = await _client?.identifiers().get(aidName);

    let registries = await _client?.registries().list(aidName)
    if (registries == undefined || registries.length === 0) {
      throw new Error(`No credential registries found for the AID ${aidName}`);
    }

    let schema = await _client?.schemas().get(schemaSaid)
    if (!schema || schema?.title == '404 Not Found') {
      throw new Error(`Schema not found!`);
    }

    const edgeObject = parseSchemaEdgeOrRuleSection(schema.properties?.e)
    let edge = formatAsCredentialEdgeOrRuleObject(edgeObject)
    let edgeSchema = getSchemaFieldOfEdge(edge)
    if (edge && edgeSchema) {
      let filter = { '-s': edgeSchema, '-a-i': aid?.prefix }
      let creds = await _client?.credentials().list({ filter: filter, limit: 50 })
      if (creds && creds?.length > 0) {
        edge = setNodeValueInEdge(edge, creds[0]?.sad.d)
      }
    }

    let parsedRules = parseSchemaEdgeOrRuleSection(schema.properties?.r)
    let rules = formatAsCredentialEdgeOrRuleObject(parsedRules)

    return { aid, schema, registry: registries[0], rules, edge };
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

  const createCredential = async (
    name: string,
    args: CredentialData
  ): Promise<IssueCredentialResult | undefined> => {
    const result = await _client?.credentials().issue(name, args)
    return result
  }

  const isGroupAid = (aid: any): boolean => {
    return (
      aid.hasOwnProperty('group') &&
      typeof aid.group === 'object' &&
      aid.group !== null
    )
  }

  return {
    connect,
    isConnected,
    disconnect,
    listIdentifiers,
    listCredentials,
    getCredential,
    createAID,
    generatePasscode,
    bootAndConnect,
    getControllerID,
    getSignedHeaders,
    authorizeSelectedSignin,
    createAttestationCredential
  };
};

export const signifyService = Signify();
