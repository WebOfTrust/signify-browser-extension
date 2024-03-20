import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { Text } from "@components/ui";
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
  const [hasOnboarded, setHasOnboarded] = useState(false);

  const checkIfOnboarded = async () => {
    const _hasOnboarded = await configService.getHasOnboarded();
    setHasOnboarded(_hasOnboarded);
  };

  useEffect(() => {
    checkIfOnboarded();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="flex flex-row justify-between p-2">
        <Text className="text-xl capitalize font-bold" $color="bodyColor">
          {props.showConfig
            ? formatMessage({ id: "account.settings" })
            : props.title}
        </Text>
        <button onClick={() => props.setShowConfig(true)}>
          <SettingIcon size={6} />
        </button>
      </div>
      {props.showConfig ? (
        <Config
          handleBack={() => {
            props.setShowConfig(false);
            checkIfOnboarded();
          }}
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
      <div className="text-xs absolute bottom-2 w-full">
        {hasOnboarded ? (
          <div className=" text-center">
            <button
              onClick={props.handleSignup}
              className="font-medium hover:underline"
            >
              {formatMessage({ id: "account.onboard.cta" })}
            </button>
          </div>
        ) : null}
        <div className=" text-center">
          <a
            href={props?.vendorData?.docsUrl}
            target="_blank"
            className="font-medium hover:underline"
          >
            {formatMessage({ id: "account.docs" })}
          </a>
          <strong> | </strong>
          <a
            href={props?.vendorData?.supportUrl}
            className="font-medium hover:underline"
            target="_blank"
          >
            {formatMessage({ id: "account.support" })}
          </a>
        </div>
      </div>
    </div>
  );
}
