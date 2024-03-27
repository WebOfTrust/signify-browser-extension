import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { Box, Text, Flex, NewButton, IconButton, Grid } from "@components/ui";
import SettingIcon from "@src/components/shared/icons/setting";
import { configService } from "@pages/background/services/config";
import { Config } from "@src/screens/config";
import { IVendorData } from "@config/types";
import { Signin as SigninComponent } from "./signin";

interface ISignin {
  vendorUrl?: string;
  vendorData?: IVendorData;
  passcode?: string;
  signinError?: string;
  handleConnect: (passcode: string) => void;
  isLoading?: boolean;
  logo?: string;
  title?: string;
  afterSetUrl?: () => void;
  showConfig: boolean;
  setShowConfig: (state: boolean) => void;
  handleSignup: () => void;
}

export function Signin(props: ISignin): JSX.Element {
  const { formatMessage } = useIntl();
  const [hasAgentAndBootUrls, setHasAgentAndBootUrls] = useState(false);

  const checkIfOnboarded = async () => {
    const response = await configService.getAgentAndVendorInfo();
    setHasAgentAndBootUrls(response.agentUrl && response.bootUrl);
  };

  useEffect(() => {
    checkIfOnboarded();
  }, []);

  return (
    <Grid>
      <Flex flexDirection="row" justifyContent="space-between" padding={2}>
        <Text fontWeight="bold" fontSize={3} $capitalize $color="bodyColor">
          {props.showConfig
            ? formatMessage({ id: "account.settings" })
            : props.title}
        </Text>
        <IconButton onClick={() => props.setShowConfig(true)}>
          <SettingIcon size={6} />
        </IconButton>
      </Flex>
      {props.showConfig ? (
        <Config
          handleBack={() => {
            props.setShowConfig(false);
            checkIfOnboarded();
          }}
          afterBootUrlUpdate={checkIfOnboarded}
          afterSetUrl={props?.afterSetUrl}
        />
      ) : (
        <SigninComponent
          signinError={props?.signinError}
          isLoading={props?.isLoading}
          handleConnect={props.handleConnect}
          logo={props.logo}
        />
      )}
      <Box fontSize={0} padding={2} bottom={2}>
        {hasAgentAndBootUrls ? (
          <Box textAlign="center">
            <NewButton onClick={props.handleSignup} $hoverUnderline>
              {formatMessage({ id: "account.onboard.cta" })}
            </NewButton>
          </Box>
        ) : null}
        <Box textAlign="center">
          <NewButton
            as="a"
            href={props?.vendorData?.docsUrl}
            target="_blank"
            $hoverUnderline
          >
            {formatMessage({ id: "account.docs" })}
          </NewButton>
          <strong> | </strong>
          <NewButton
            as="a"
            href={props?.vendorData?.supportUrl}
            $hoverUnderline
            target="_blank"
          >
            {formatMessage({ id: "account.support" })}
          </NewButton>
        </Box>
      </Box>
    </Grid>
  );
}
