import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { Text } from "@components/ui";
import { Sidebar, SIDEBAR, SIDEBAR_KEYS } from "@components/sidebar";
import { SelectIdentifier } from "@components/selectIdentifier";
import { SelectCredential } from "@components/selectCredential";
import { TAB_STATE } from "@pages/popup/constants";
import { IdentifierList } from "@components/identifierList";
import { CredentialList } from "@components/credentialList";
import { SigninList } from "@components/signinList";

interface IMain {
  handleDisconnect: () => void;
  logo?: string;
  title?: string;
}

const StyledMainContainer = styled.div`
  background-color: ${(props) => props.theme?.colors?.secondary};
  color: ${(props) => props.theme?.colors?.text};
`;

export function Main(props: IMain): JSX.Element {
  const [activeSidebar, setActiveSidebar] = useState(SIDEBAR[0]);
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
                ? SIDEBAR[0]
                : SIDEBAR[1]
            );
          }
          if (data?.appState === TAB_STATE.SELECT_AUTO_SIGNIN) {
            setActiveSidebar(SIDEBAR[2]);
          }
        }
      }
    );
  };

  useEffect(() => {
    fetchTabState();
  }, []);

  const renderItems = () => {
    switch (activeSidebar?.id) {
      case SIDEBAR_KEYS.credentials:
        if (
          tabState === TAB_STATE.SELECT_CREDENTIAL ||
          tabState === TAB_STATE.SELECT_ID_CRED
        )
          return <SelectCredential />;

        return <CredentialList />;
      case SIDEBAR_KEYS.signin:
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
        logo={props?.logo}
        title={props?.title}
        // disabled={isSidebarDisabled()}
      />
      <StyledMainContainer className="rounded p-2 sm:ml-48 sm:mt-4 mr-4">
        <div className="">
          <Text $color="subtext" className="text-xl capitalize font-bold">
            {activeSidebar?.title}
          </Text>
          <div className="m-5 max-h-[576px] overflow-auto">{renderItems()}</div>
        </div>
      </StyledMainContainer>
    </main>
  );
}
