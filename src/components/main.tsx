import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { getCurrentTab, sendMessageTab } from "@shared/tabs-utils";
import { Text, MainBox, Box } from "@components/ui";
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

const StyledMainContainer = styled(Box)`
  background-color: ${(props) => props.theme?.colors?.secondary};
  color: ${(props) => props.theme?.colors?.text};
`;

export function Main(props: IMain): JSX.Element {
  const [activeSidebar, setActiveSidebar] = useState(SIDEBAR[0]);
  const [currentTabState, setCurrentTabState] = useState(TAB_STATE.NONE);

  const fetchTabState = async () => {
    const tab = await getCurrentTab();
    const { data } = await sendMessageTab(tab.id!, {
      type: "tab",
      subtype: "get-tab-state",
    });
    if (!data) return;

    if (data?.tabState) {
      setCurrentTabState(data?.tabState);
      if (
        data?.tabState === TAB_STATE.SELECT_IDENTIFIER ||
        data?.tabState === TAB_STATE.SELECT_CREDENTIAL ||
        data?.tabState === TAB_STATE.SELECT_ID_CRED
      ) {
        setActiveSidebar(
          data?.tabState === TAB_STATE.SELECT_IDENTIFIER ||
            data?.tabState === TAB_STATE.SELECT_ID_CRED
            ? SIDEBAR[0]
            : SIDEBAR[1]
        );
      }
      if (data?.tabState === TAB_STATE.SELECT_AUTO_SIGNIN) {
        setActiveSidebar(SIDEBAR[2]);
      }
    }
  };

  useEffect(() => {
    fetchTabState();
  }, []);

  const renderItems = () => {
    switch (activeSidebar?.id) {
      case SIDEBAR_KEYS.credentials:
        if (
          currentTabState === TAB_STATE.SELECT_CREDENTIAL ||
          currentTabState === TAB_STATE.SELECT_ID_CRED
        )
          return <SelectCredential />;

        return <CredentialList />;
      case SIDEBAR_KEYS.signin:
        return <SigninList />;

      default:
        if (
          currentTabState === TAB_STATE.SELECT_IDENTIFIER ||
          currentTabState === TAB_STATE.SELECT_ID_CRED
        )
          return <SelectIdentifier />;

        return <IdentifierList />;
    }
  };

  return (
    <MainBox width="640px">
      <Sidebar
        active={activeSidebar}
        onClickLink={setActiveSidebar}
        onSignout={props.handleDisconnect}
        logo={props?.logo}
        title={props?.title}
      />
      <StyledMainContainer
        padding={2}
        borderRadius={1}
        marginRight={3}
        marginTop={3}
        marginLeft="192px"
      >
        <div>
          <Text fontSize={3} fontWeight="bold" $color="subtext" $capitalize>
            {activeSidebar?.title}
          </Text>
          <Box margin={3} maxHeight="576px" overflow="auto">
            {renderItems()}
          </Box>
        </div>
      </StyledMainContainer>
    </MainBox>
  );
}
