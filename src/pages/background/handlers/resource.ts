import * as signinResource from "@pages/background/resource/signin";
import { signifyService } from "@pages/background/services/signify";
import { IHandler, IIdentifier, ICredential } from "@config/types";
import { getCurrentUrl } from "@pages/background/utils";

export async function handleFetchAutoSigninSignature({
  sendResponse,
  url,
}: IHandler) {
  // Validate that message comes from a page that has a signin
  const signins = await signinResource.getDomainSignins(url);
  const autoSignin = signins?.find((signin) => signin.autoSignin);
  if (!signins?.length || !autoSignin) {
    sendResponse({
      error: { code: 404, message: "auto signin not found" },
    });
    return;
  }
  const resp = await signifyService.getSignedHeaders({
    url: url!,
    signin: autoSignin,
  });

  sendResponse({
    data: resp,
  });
}

export async function handleFetchSignifyHeaders({
  sendResponse,
  url,
  data,
}: IHandler) {
  const { aidName } = data ?? {};
  const signin = await signinResource.getDomainSigninByIssueeName(url!, aidName);
  if (!signin?.autoSignin) {
    sendResponse({
      data: {},
    });
    return;
  }

  const resp = await signifyService.signHeaders(aidName, url!);
  sendResponse({
    data: resp,
  });
}

export async function handleFetchTabSignin({ sendResponse, url }: IHandler) {
  const signins = await signinResource.getDomainSignins(url);
  const autoSigninObj = signins?.find((signin) => signin.autoSignin);
  sendResponse({ data: { signins: signins ?? [], autoSigninObj } });
}

export async function handleFetchIdentifiers({ sendResponse }: IHandler) {
  const identifiers = await signifyService.listIdentifiers();
  sendResponse({ data: { aids: identifiers ?? [] } });
}

export async function handleFetchSignins({ sendResponse, url }: IHandler) {
  const signins = await signinResource.getSignins();
  sendResponse({
    data: {
      signins,
    },
  });
}

export async function handleFetchCredentials({ sendResponse }: IHandler) {
  var credentials = await signifyService.listCredentials();
  const indentifiers = await signifyService.listIdentifiers();
  console.log(indentifiers);
  // Add holder name to credential
  credentials?.forEach((credential: ICredential) => {
    const issueePrefix = credential.sad.a.i;
    const aidIssuee = indentifiers.find((aid: IIdentifier) => {
      return aid.prefix === issueePrefix;
    });
    credential.issueeName = aidIssuee?.name!;
  });

  sendResponse({ data: { credentials: credentials ?? [] } });
}

export async function handleCreateIdentifier({ sendResponse, data }: IHandler) {
  try {
    const resp = await signifyService.createAID(data.name);
    sendResponse({ data: { ...(resp ?? {}) } });
  } catch (error: any) {
    const errorMsg = JSON.parse(error?.message ?? "");
    sendResponse({
      error: { code: 404, message: errorMsg?.title },
    });
  }
}

export async function handleCreateSignin({ sendResponse, data }: IHandler) {
  const signins = await signinResource.getSignins();
  const currentUrl = await getCurrentUrl();
  const { identifier, credential } = data;
  let signinExists = false;
  if (identifier && identifier.prefix) {
    signinExists = Boolean(
      signins?.find(
        (signin) =>
          signin.domain === currentUrl?.origin &&
          signin?.identifier?.prefix === identifier.prefix
      )
    );
  }

  if (credential && credential.sad.d) {
    signinExists = Boolean(
      signins?.find(
        (signin) =>
          signin.domain === currentUrl?.origin &&
          signin?.credential?.sad?.d === credential.sad.d
      )
    );
  }

  if (signinExists) {
    sendResponse({ data: { signins: signins } });
  } else {
    const signinObj = signinResource.newSigninObject({
      identifier,
      credential,
      domain: currentUrl!.origin,
    });
    if (signins && signins?.length) {
      await signinResource.updateSignins([...signins, signinObj]);
    } else {
      await signinResource.updateSignins([signinObj]);
    }
    const storageSignins = await signinResource.getSignins();
    sendResponse({ data: { signins: storageSignins } });
  }
}

export async function handleUpdateAutoSignin({ sendResponse, data }: IHandler) {
  const resp = await signinResource.updateDomainAutoSignin(data?.signin);
  sendResponse({
    data: {
      ...resp,
    },
  });
}

export async function handleDeleteSignin({ sendResponse, data }: IHandler) {
  const resp = await signinResource.deleteSigninById(data?.id);
  sendResponse({
    data: {
      ...resp,
    },
  });
}
