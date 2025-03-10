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
import * as backgroundWorkflowLoader from '../utils/background-workflow-loader';
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
      const result = await backgroundWorkflowLoader.generatePasscodeAndConfig();
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
      console.log("Directly booting and connecting agent");
      await ready();
      
      // Generate a valid bran (browser authentication record number)
      // Must be exactly 21 characters
      const generateValidBran = () => {
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 21; i++) {
          result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
      };
      
      const validBran = generateValidBran();
      
      // Create client with the valid bran
      _client = new SignifyClient(agentUrl, passcode, Tier.low, {
        bran: validBran
      });
      
      await _client.connect();
      const state = await getState();
      await userService.setControllerId(state?.controller?.state?.i);
      setTimeoutAlarm();
      return { success: true };
    } catch (error) {
      console.error("Error in bootAndConnect:", error);
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
      
      // Generate a valid bran (browser authentication record number)
      // Must be exactly 21 characters
      const generateValidBran = () => {
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 21; i++) {
          result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
      };
      
      const validBran = generateValidBran();
      
      // Load client workflow using our background-compatible loader
      const workflow = await backgroundWorkflowLoader.loadWorkflow("create-client-workflow");
      if (!workflow) {
        console.warn("Failed to load workflow, falling back to direct connection");
        return await bootAndConnect(agentUrl, bootUrl, passcode);
      }

      // Load config with runtime values using our background-compatible loader
      const config = await backgroundWorkflowLoader.loadConfig("create-client-config", {
        agentUrl,
        bootUrl,
        passcode,
        bran: validBran
      });

      if (!config) {
        console.warn("Failed to load config, falling back to direct connection");
        return await bootAndConnect(agentUrl, bootUrl, passcode);
      }
      
      // Add the bran to the config
      if (!config.bran) {
        config.bran = validBran;
      }

      console.log("Starting client workflow runner");
      // Run the workflow with the background-compatible configuration
      const workflowRunner = new vleiWorkflows.WorkflowRunner(workflow, config);

      try {
        await workflowRunner.runWorkflow();

        // Get the client from the workflow state
        const workflowState = vleiWorkflows.WorkflowState.getInstance();
        
        // Look for gleif-agent-1 instead of browser_extension
        _client = workflowState.clients.get("gleif-agent-1");

        if (!_client) {
          console.warn("Workflow did not create a client for gleif-agent-1, falling back to direct connection");
          return await bootAndConnect(agentUrl, bootUrl, passcode);
        }

        // Set controller ID and timeout
        const state = await getState();
        await userService.setControllerId(state?.controller?.state?.i);
        setTimeoutAlarm();

        return { success: true };
      } catch (workflowError) {
        console.error("Error running client workflow:", workflowError);
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

  /**
   * Create a new AID with the given name
   * This is a wrapper function that uses the workflow-based approach when possible
   * @returns A promise that resolves to an object with success or error information
   */
  const createAID = async (name: string): Promise<{ success?: boolean; error?: any }> => {
    try {
      // Check if called from workflow to prevent infinite recursion
      const callerInfo = new Error().stack || '';
      const isCalledFromWorkflow = callerInfo.includes('createAIDWorkflow');
      
      // Only use workflow approach if not already called from it
      if (!isCalledFromWorkflow) {
        try {
          // Try to use the workflow-based approach first
          return await createAIDWorkflow(name);
        } catch (workflowError) {
          // If the workflow approach fails, fall back to direct API call
          console.warn("Falling back to direct AID creation");
        }
      }
      
      // Direct API approach as fallback
      // Ensure client is connected
      if (!_client) {
        throw new Error("Client must be connected before creating an AID");
      }
      
      // Use direct API call
      await _client.identifiers().create(name);
      return { success: true };
    } catch (error) {
      console.error("Error creating AID:", error);
      return { error };
    }
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

  /**
   * Create an AID using the workflow approach
   * @param name The name for the AID
   * @returns A promise that resolves to an object with success or error information
   */
  const createAIDWorkflow = async (name: string): Promise<{ success?: boolean; error?: any }> => {
    try {
      console.log("Initializing workflow for AID creation");
      
      // First, verify the client is connected
      if (!_client) {
        throw new Error("Client must be connected before creating an AID");
      }
      
      // Generate a valid bran (browser authentication record number)
      const generateValidBran = () => {
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 21; i++) {
          result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
      };
      
      const validBran = generateValidBran();
      
      // Load AID creation workflow
      const workflow = await backgroundWorkflowLoader.loadWorkflow("create-aid-workflow");
      if (!workflow) {
        console.warn("Failed to load AID workflow, falling back to direct creation");
        return await createAID(name);
      }
      
      // Get the current agent URL - safely checking for undefined values
      let agentUrl = "";
      if (_client && _client.controller && _client.controller.connection) {
        agentUrl = _client.controller.connection.url;
      } else {
        // Get from config service as fallback
        agentUrl = await configService.getAgentUrl() || "";
      }
      
      if (!agentUrl) {
        throw new Error("Cannot determine agent URL for AID creation");
      }
      
      // Get passcode from user service
      const passcode = await userService.getPasscode();
      
      if (!passcode) {
        throw new Error("No passcode available for AID creation");
      }
      
      // Load config with runtime values
      const config = await backgroundWorkflowLoader.loadConfig("create-client-config", {
        agentUrl,
        bootUrl: "", // Not needed for AID creation
        passcode,
        bran: validBran,
        aidName: name // Add the AID name to the config
      });
      
      if (!config) {
        console.warn("Failed to load config, falling back to direct creation");
        return await createAID(name);
      }
      
      // Modify the workflow to use the provided AID name
      if (workflow.workflow && workflow.workflow.steps && workflow.workflow.steps.gleif_aid) {
        workflow.workflow.steps.gleif_aid.aid = name;
        workflow.workflow.steps.gleif_aid.description = `Creating AID: ${name}`;
      }
      
      // Run the workflow
      console.log("Starting AID workflow runner");
      const workflowRunner = new vleiWorkflows.WorkflowRunner(workflow, config);
      
      try {
        await workflowRunner.runWorkflow();
        console.log(`AID ${name} created successfully via workflow`);
        return { success: true };
      } catch (workflowError) {
        console.error("Error running AID workflow");
        console.log("Falling back to direct AID creation");
        return await createAID(name);
      }
    } catch (error) {
      console.error("Error in createAIDWorkflow");
      return { error };
    }
  };

  return {
    isConnected,
    connect,
    disconnect,
    getState,
    listIdentifiers,
    listCredentials,
    getCredential,
    authorizeSelectedSignin,
    getSignedHeaders,
    createAttestationCredential,
    getCreateCredentialPrerequisites,
    getSessionInfo,
    removeSessionInfo,
    getControllerID,
    createAID,
    createCredential,
    generateAndStorePasscode,
    bootAndConnect,
    bootAndConnectWorkflow,
    createAIDWorkflow,
  };
};

export const signifyService = Signify();
