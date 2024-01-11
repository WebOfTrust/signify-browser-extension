import { useEffect, useState } from "react";
import { Sidebar } from "@components/sidebar";
import { SelectIdentifier } from "@components/selectIdentifier";
import { SelectCredential } from "@components/selectCredential";
import { APP_STATE } from "@pages/popup/constants";
import { IdentifierList } from "@components/identifierList";
import { CredentialList } from "@components/credentialList";
import { SigninList } from "@components/signinList";

interface IMain {
  handleDisconnect: () => void;
}

export function Main(props: IMain): JSX.Element {
  const [activeSidebar, setActiveSidebar] = useState("Identifiers");
  const [tabState, setTabState] = useState(APP_STATE.DEFAULT);

  const fetchTabState = async () => {
    const { data } = await chrome.runtime.sendMessage({
      type: "tab",
      subtype: "get-tab-state",
    });

    if (!data) return;

    if (data?.appState) {
      setTabState(data?.appState);
      if (
        data?.appState === APP_STATE.SELECT_IDENTIFIER ||
        data?.appState === APP_STATE.SELECT_CREDENTIAL
      ) {
        setActiveSidebar(
          data?.appState === APP_STATE.SELECT_IDENTIFIER
            ? "Identifiers"
            : "Credentials"
        );
      }
    }
  };

  useEffect(() => {
    fetchTabState();
  }, []);

  const renderItems = () => {
    if (tabState === APP_STATE.SELECT_IDENTIFIER) return <SelectIdentifier />;

    if (tabState === APP_STATE.SELECT_CREDENTIAL) return <SelectCredential />;

    switch (activeSidebar) {
      case "Credentials":
        return <CredentialList />;
      case "Sign Ins":
        return <SigninList />;

      default:
        return <IdentifierList />;
    }
  };

  const isSidebarDisabled = () => {
    return (
      tabState === APP_STATE.SELECT_IDENTIFIER ||
      tabState === APP_STATE.SELECT_CREDENTIAL
    );
  };

  return (
    <main className="w-[640px]">
      <Sidebar
        active={activeSidebar}
        onClickLink={setActiveSidebar}
        onSignout={props.handleDisconnect}
        disabled={isSidebarDisabled()}
      />
      <div className="rounded p-2 sm:ml-48 sm:mt-4 bg-gray-dark text-gray-light mr-4">
        <div className="">
          <p className="text-xl capitalize font-bold">{activeSidebar}</p>
          <div className="m-5 max-h-[576px] overflow-auto">{renderItems()}</div>
        </div>
      </div>
    </main>
  );
}
