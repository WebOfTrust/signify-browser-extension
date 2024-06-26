import { browserStorageService } from "@pages/background/services/browser-storage";
import { ObjectOfObject, ISession } from "@config/types";

const SESSION_ENUMS = {
  EXPIRY_IN_MINS: 5,
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

  const get = async ({
    tabId,
    origin,
  }: Pick<ISession, "origin" | "tabId">) => {
    const sessions = await getSessionsObject();
    if (!sessions[tabId]) {
      throw new Error("Session not found");
    }
    const session = sessions[tabId];
    if (session.origin !== origin) {
      throw new Error("Session origin mismatch");
    }
    if (session.expiry < new Date().getTime()) {
      await remove(tabId);
      throw new Error("Session expired");
    }
    return session;
  };

  const create = async ({
    tabId,
    origin,
    aidName,
  }: Pick<ISession, "origin" | "aidName" | "tabId">): Promise<ISession> => {
    const sessions = await getSessionsObject();
    const expiry = new Date();
    // expiry.setSeconds(expiry.getSeconds() + 20);
    expiry.setMinutes(expiry.getMinutes() + SESSION_ENUMS.EXPIRY_IN_MINS);
    sessions[tabId] = {
      origin,
      aidName,
      tabId,
      expiry: expiry.getTime(),
    };
    await browserStorageService.setValue(SESSION_ENUMS.SESSIONS, sessions);
    return get({ tabId, origin });
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
  };
};

export const sessionService = Session();
