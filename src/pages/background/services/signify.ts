import browser from "webextension-polyfill";
import * as signinResource from "@pages/background/resource/signin";
import {
  SignifyClient,
  Tier,
  ready,
  randomPasscode,
  Saider,
  IssueCredentialResult,
  CredentialData,
} from "signify-ts";
import * as vleiWorkflows from "vlei-verifier-workflows";
import { sendMessage } from "@src/shared/browser/runtime-utils";
import { sendMessageTab, getCurrentTab } from "@src/shared/browser/tabs-utils";
import { userService } from "@pages/background/services/user";
import { configService } from "@pages/background/services/config";
import { sessionService } from "@pages/background/services/session";
import { IIdentifier, ISignin, ISessionConfig } from "@config/types";
import { SW_EVENTS } from "@config/event-types";
import {
  formatAsCredentialEdgeOrRuleObject,
  getSchemaFieldOfEdge,
  parseSchemaEdgeOrRuleSection,
  setNodeValueInEdge,
  waitOperation,
} from "@src/shared/signify-utils";
import { workflowLoader } from "@src/shared/workflow-loader";

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
          console.log("Timer expired, but extension is open. Resetting timer.");
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

  const generateAndStorePasscode = async () => {
    try {
      // Generate a new passcode and get config
      const result = await workflowLoader.generatePasscodeAndConfig();
      const { passcode, config } = result;

      // Get the configured URLs
      const agentUrl = await configService.getAgentUrl();
      const bootUrl = await configService.getBootUrl();

      if (!agentUrl || !bootUrl) {
        throw new Error("Agent URL or Boot URL not configured");
      }

      // Update the config with the URLs
      if (config && config.agents && config.agents.browser_extension) {
        config.agents.browser_extension.url = agentUrl;
        config.agents.browser_extension.boot_url = bootUrl;
      }

      // Store the passcode for later use
      await userService.setPasscode(passcode);

      console.log("Generated passcode and stored in user config", {
        agentUrl,
        bootUrl,
        passcodeLength: passcode ? passcode.length : 0,
      });

      return { passcode, success: true };
    } catch (error) {
      console.error("Error generating and storing passcode:", error);
      return { passcode: null, success: false, error };
    }
  };

  const bootAndConnect = async (
    agentUrl: string,
    bootUrl: string,
    passcode: string,
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

  const bootAndConnectWorkflow = async (
    agentUrl: string,
    bootUrl: string,
    passcode: string,
  ) => {
    try {
      console.log("Initializing workflow for boot and connect");
      await ready();

      // Load workflow and config from files (with fallback to defaults)
      const workflow = await workflowLoader.loadWorkflow("create-client");
      if (!workflow) {
        throw new Error("Failed to load workflow definition");
      }

      // Load config with runtime values
      const config = await workflowLoader.loadConfig("create-client-config", {
        agentUrl,
        bootUrl,
        passcode,
      });

      if (!config) {
        throw new Error("Failed to load config");
      }

      console.log("Starting workflow runner");
      // Run the workflow
      const workflowRunner = new vleiWorkflows.WorkflowRunner(workflow, config);

      try {
        await workflowRunner.runWorkflow();

        // Get the client from the workflow state
        const workflowState = vleiWorkflows.WorkflowState.getInstance();
        _client = workflowState.clients.get("browser_extension");

        if (!_client) {
          throw new Error("Workflow did not create a client");
        }

        // Set controller ID and timeout
        const state = await getState();
        await userService.setControllerId(state?.controller?.state?.i);
        setTimeoutAlarm();

        return { success: true };
      } catch (workflowError) {
        console.error("Error running workflow:", workflowError);
        // Fallback to direct bootAndConnect if workflow fails
        console.log("Falling back to direct bootAndConnect");
        return await bootAndConnect(agentUrl, bootUrl, passcode);
      }
    } catch (error) {
      console.error("Error in bootAndConnectWorkflow:", error);
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
        _client,
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
      if (res.aids?.length === 0) {
        break;
      }

      aids.push(...res.aids);
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
  const getCredential = async (
    credentialIdentifier: string,
    includeCESR: boolean = false,
  ) => {
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
      const cesr = await getCredential(signin.credential?.sad?.d, true);
      credentialResp.cesr = cesr;
    }

    const response = {
      credential: credentialResp,
      identifier: signin?.identifier,
    };

    if (config?.sessionOneTime) {
      const sreq = await _client?.createSignedRequest(aidName!, origin, {});
      let jsonHeaders: { [key: string]: string } = {};
      if (sreq?.headers) {
        for (const pair of sreq.headers.entries()) {
          jsonHeaders[pair[0]] = pair[1];
        }
      }
      response.headers = jsonHeaders;
    } else {
      const sessionInfo = await sessionService.create({
        tabId,
        origin,
        aidName: aidName!,
        signinId: signin.id,
        config,
      });
      if (sessionInfo?.expiry) {
        response.expiry = sessionInfo.expiry;
      }

      await sendMessageTab(tabId, {
        type: "tab",
        subtype: "session-info",
        data: response,
      });
    }

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
      session.signinId,
    );
    let credentialResp;
    if (signin?.credential) {
      credentialResp = { raw: signin.credential, cesr: null };
      const cesr = await getCredential(signin.credential?.sad?.d, true);
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
    tabId,
  }: {
    origin: string;
    credData: any;
    schemaSaid: string;
    tabId: number;
  }): Promise<any> => {
    // in case the client is not connected, try to connect
    const connected = await isConnected();
    // connected is false, it means the client session timed out or disconnected by user
    if (!connected) {
      validateClient();
    }

    const session = await sessionService.get({ tabId, origin });
    let { aid, registry, rules, edge } = await getCreateCredentialPrerequisites(
      session?.aidName!,
      schemaSaid,
    );
    if (isGroupAid(aid) === true) {
      throw new Error(
        `Attestation credential issuance by multisig identifier ${session.aidName} is not supported yet!`,
      );
    }

    let credArgs: CredentialData = {
      i: aid.prefix,
      ri: registry.regk,
      s: schemaSaid,
      a: credData,
      r: rules
        ? Object.keys(rules).length > 0
          ? Saider.saidify({ d: "", ...rules })[1]
          : undefined
        : undefined,
      e: edge
        ? Object.keys(edge).length > 0
          ? Saider.saidify({ d: "", ...edge })[1]
          : undefined
        : undefined,
    };
    console.log("create credential args: ", credArgs);
    let credResult = await createCredential(session.aidName, credArgs);
    if (credResult && _client) {
      await waitOperation(_client, credResult.op);
    }

    return credResult;
  };

  const getCreateCredentialPrerequisites = async (
    aidName: string,
    schemaSaid: string,
  ): Promise<{
    aid: any | undefined;
    schema: any;
    registry: any;
    rules: any;
    edge: any;
  }> => {
    const aid = await _client?.identifiers().get(aidName);

    let registries = await _client?.registries().list(aidName);
    if (registries == undefined || registries.length === 0) {
      throw new Error(`No credential registries found for the AID ${aidName}`);
    }

    let schema = await _client?.schemas().get(schemaSaid);
    if (!schema || schema?.title == "404 Not Found") {
      throw new Error(`Schema not found!`);
    }

    const edgeObject = parseSchemaEdgeOrRuleSection(schema.properties?.e);
    let edge = formatAsCredentialEdgeOrRuleObject(edgeObject);
    let edgeSchema = getSchemaFieldOfEdge(edge);
    if (edge && edgeSchema) {
      let filter = { "-s": edgeSchema, "-a-i": aid?.prefix };
      let creds = await _client
        ?.credentials()
        .list({ filter: filter, limit: 50 });
      if (creds && creds?.length > 0) {
        edge = setNodeValueInEdge(edge, creds[0]?.sad.d);
      }
    }

    let parsedRules = parseSchemaEdgeOrRuleSection(schema.properties?.r);
    let rules = formatAsCredentialEdgeOrRuleObject(parsedRules);

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
    args: CredentialData,
  ): Promise<IssueCredentialResult | undefined> => {
    const result = await _client?.credentials().issue(name, args);
    return result;
  };

  const isGroupAid = (aid: any): boolean => {
    return (
      aid.hasOwnProperty("group") &&
      typeof aid.group === "object" &&
      aid.group !== null
    );
  };

  return {
    connect,
    isConnected,
    disconnect,
    listIdentifiers,
    listCredentials,
    authorizeSelectedSignin,
    getSessionInfo,
    removeSessionInfo,
    getSignedHeaders,
    getState,
    getCredential,
    getControllerID,
    createAID,
    createCredential,
    createAttestationCredential,
    generatePasscode,
    generateAndStorePasscode,
    bootAndConnect,
    bootAndConnectWorkflow,
  };
};

export const signifyService = Signify();
