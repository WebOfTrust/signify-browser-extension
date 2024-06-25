export interface ObjectOfArrays<T> {
  [key: string]: T[];
}

export interface ObjectOfObject<T> {
  [key: string]: T;
}

export interface IHandler {
  sendResponse: (response?: any) => void;
  tabId?: number;
  url?: string;
  data?: any;
}
export interface IMessage<T> {
  type: string;
  data?: T;
}

export interface IVendorData {
  title: string;
  logo?: string;
  icon?: string;
  onboardingUrl: string;
  docsUrl: string;
  supportUrl: string;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      error: string;
      heading: string;
      text: string;
      subtext: string;
      white: string;
      black: string;
      bodyBg: string;
      bodyBorder: string;
      bodyColor: string;
      cardColor: string;
      cardBg: string;
    };
  };
}

export interface ISignin {
  id: string;
  domain: string;
  identifier?: {
    name?: string;
    prefix?: string;
  };
  credential?: ICredential;
  createdAt: number;
  updatedAt: number;
  autoSignin?: boolean;
}

export interface IIdentifier {
  name?: string;
  prefix: string;
}

export interface ICredential {
  issueeName: string;
  ancatc: string[];
  sad: { a: { i: string }; d: string };
  schema: {
    title: string;
    credentialType: string;
    description: string;
  };
  status: {
    et: string;
  };
  cesr?: string;
}

export interface ISignature {
  headers: HeadersInit;
  credential?: ICredential;
  identifier?: {
    name?: string;
    prefix?: string;
  };
  autoSignin?: boolean;
}

export interface ISession {
  tabId: number;
  expiry: number;
  origin: string;
  aidName: string;
}
