import { useEffect, useState } from "react";
import { Sidebar } from "@components/sidebar";
import { SelectIdentifier } from "@components/selectIdentifier";
import { SelectCredential } from "@components/selectCredential";
import { TAB_STATE } from "@pages/popup/constants";
import { IdentifierList } from "@components/identifierList";
import { CredentialList } from "@components/credentialList";
import { SigninList } from "@components/signinList";

interface IMain {
  handleDisconnect: () => void;
}

export function Main(props: IMain): JSX.Element {
  const [activeSidebar, setActiveSidebar] = useState("Identifiers");
  const [tabState, setTabState] = useState(TAB_STATE.DEFAULT);

  const fetchTabState = async () => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function (tabs) {
        const { data } = await chrome.tabs.sendMessage(tabs[0].id!, {
          type: "tab",
          subtype: "get-tab-state",
        });
        if (!data) return;

        if (data?.appState) {
          setTabState(data?.appState);
          if (
            data?.appState === TAB_STATE.SELECT_IDENTIFIER ||
            data?.appState === TAB_STATE.SELECT_CREDENTIAL ||
            data?.appState === TAB_STATE.SELECT_ID_CRED
          ) {
            setActiveSidebar(
              data?.appState === TAB_STATE.SELECT_IDENTIFIER ||
                data?.appState === TAB_STATE.SELECT_ID_CRED
                ? "Identifiers"
                : "Credentials"
            );
          }
          if (data?.appState === TAB_STATE.SELECT_AUTO_SIGNIN) {
            setActiveSidebar("Sign Ins");
          }
        }
      }
    );
  };

  useEffect(() => {
    fetchTabState();
  }, []);

  const renderItems = () => {
    switch (activeSidebar) {
      case "Credentials":
        if (
          tabState === TAB_STATE.SELECT_CREDENTIAL ||
          tabState === TAB_STATE.SELECT_ID_CRED
        )
          return <SelectCredential />;

        return <CredentialList />;
      case "Sign Ins":
        return <SigninList />;

      default:
        if (
          tabState === TAB_STATE.SELECT_IDENTIFIER ||
          tabState === TAB_STATE.SELECT_ID_CRED
        )
          return <SelectIdentifier />;

        return <IdentifierList />;
    }
  };

  const isSidebarDisabled = () => {
    return (
      tabState === TAB_STATE.SELECT_IDENTIFIER ||
      tabState === TAB_STATE.SELECT_CREDENTIAL
    );
  };

  return (
    <main className="w-[640px]">
      <Sidebar
        active={activeSidebar}
        onClickLink={setActiveSidebar}
        onSignout={props.handleDisconnect}
        // disabled={isSidebarDisabled()}
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
