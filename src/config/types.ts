export interface ObjectOfArrays<T> {
  [key: string]: T[];
}

export interface IMessage<T> {
  type: string;
  subtype?: string;
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
  credential?: {
    issueeName?: string;
    sad: { d: string };
    schema?: {
      title: string;
    };
  };
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
  sad: { a: { i: string }, d: string };
  schema: {
    title: string;
    credentialType: string;
    description: string;
  };
  status: {
    et: string;
  };
}
