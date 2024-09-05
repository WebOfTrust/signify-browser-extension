import { browserStorageService } from "@pages/background/services/browser-storage";
import { ObjectOfObject, ISession } from "@config/types";

const SESSION_ENUMS = {
  EXPIRY_IN_MINS: 30,
  MAX_REQUESTS: 50,
  SESSIONS: "sessions",
};

type IObjectSessions = ObjectOfObject<ISession>;

const Session = () => {
  const getSessionsObject = async (): Promise<IObjectSessions> => {
    const sessionsObj = (await browserStorageService.getValue(
      SESSION_ENUMS.SESSIONS
    )) as IObjectSessions;
    return sessionsObj ?? {};
  };

  const get = async ({ tabId, origin }: Pick<ISession, "origin" | "tabId">) => {
    const sessions = await getSessionsObject();
    if (!sessions[tabId]) {
      return null;
    }
    const session = sessions[tabId];
    if (session.origin !== origin) {
      throw new Error("Session origin mismatch");
    }
    if (
      session?.maxReq &&
      session?.currentReq !== undefined &&
      session?.currentReq !== null &&
      session?.currentReq >= 0
    ) {
      if (session?.currentReq >= session.maxReq) {
        await remove(tabId);
        throw new Error("Session max request limit reached");
      }
    }

    if (session.expiry < new Date().getTime()) {
      await remove(tabId);
      throw new Error("Session expired");
    }
    return session;
  };

  const create = async ({
    signinId,
    tabId,
    origin,
    aidName,
    config,
  }: Pick<
    ISession,
    "origin" | "aidName" | "tabId" | "signinId"
  >): Promise<ISession> => {
    const sessions = await getSessionsObject();
    const expiry = new Date();
    // expiry.setSeconds(expiry.getSeconds() + 50);
    const sessionTime = config?.sessionTime
      ? Math.min(config.sessionTime, SESSION_ENUMS.EXPIRY_IN_MINS)
      : SESSION_ENUMS.EXPIRY_IN_MINS;
    expiry.setMinutes(expiry.getMinutes() + sessionTime);

    const sessionMaxRequests = config?.maxReq
      ? Math.min(SESSION_ENUMS.MAX_REQUESTS, config?.maxReq)
      : undefined;
    sessions[tabId] = {
      origin,
      aidName,
      tabId,
      expiry: expiry.getTime(),
      signinId,
      maxReq: sessionMaxRequests,
      currentReq: 0,
    };
    await browserStorageService.setValue(SESSION_ENUMS.SESSIONS, sessions);
    return get({ tabId, origin });
  };

  const incrementRequestCount = async (id: number) => {
    const sessions = await getSessionsObject();
    if (
      sessions[id] &&
      sessions[id]?.currentReq !== undefined &&
      sessions[id]?.currentReq !== null &&
      sessions[id]?.currentReq >= 0
    ) {
      sessions[id].currentReq = sessions[id].currentReq + 1;
    }
    await browserStorageService.setValue(SESSION_ENUMS.SESSIONS, sessions);
  };

  const remove = async (id: number) => {
    const sessions = await getSessionsObject();
    if (sessions[id]) {
      delete sessions[id];
    }
    await browserStorageService.setValue(SESSION_ENUMS.SESSIONS, sessions);
  };

  return {
    get,
    create,
    remove,
    incrementRequestCount,
  };
};

export const sessionService = Session();
