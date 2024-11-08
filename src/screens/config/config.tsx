import { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { configService } from "@pages/background/services/config";
import { useLocale, languageCodeMap } from "@src/_locales";
import { isValidUrl } from "@shared/utils";
import { setActionIcon } from "@shared/browser/action-utils";
import { Box, Button, Dropdown, Input, Text, Flex } from "@components/ui";

const langMap = Object.entries(languageCodeMap).map((s) => ({
  label: s[1],
  value: s[0],
}));

export function Config(props: any): JSX.Element {
  const [vendorUrl, setVendorUrl] = useState("");
  const [vendorUrlError, setVendorUrlError] = useState("");
  const [agentUrl, setAgentUrl] = useState("");
  const [agentUrlError, setAgentUrlError] = useState("");

  const [bootUrl, setBootUrl] = useState("");
  const [bootUrlError, setBootUrlError] = useState("");

  const [hasOnboarded, setHasOnboarded] = useState();

  const { formatMessage } = useIntl();
  const { changeLocale, currentLocale } = useLocale();
  const validUrlMsg = formatMessage({ id: "config.error.enterUrl" });
  const invalidVendorUrlError = formatMessage({
    id: "config.error.invalidVendorUrl",
  });

  const getVendorInfo = async () => {
    const response = await configService.getAgentAndVendorInfo();
    setVendorUrl(response.vendorUrl);
    setAgentUrl(response.agentUrl);
    setBootUrl(response.bootUrl);
    setHasOnboarded(response.hasOnboarded);
  };

  useEffect(() => {
    getVendorInfo();
  }, []);

  const checkErrorVendorUrl = () => {
    if (!vendorUrl || !isValidUrl(vendorUrl)) {
      setVendorUrlError(validUrlMsg);
      return true;
    } else {
      setVendorUrlError("");
      return false;
    }
  };

  const validateAgentUrl = () => {
    if (!agentUrl || !isValidUrl(agentUrl)) {
      setAgentUrlError(validUrlMsg);
      return false;
    }
    setAgentUrlError("");
    return true;
  };

  const validateBootUrl = () => {
    if (!bootUrl || !isValidUrl(bootUrl)) {
      setBootUrlError(validUrlMsg);
      return false;
    }
    setBootUrlError("");
    return true;
  };

  const handleSetAgentUrl = async () => {
    await configService.setAgentUrl(agentUrl);
    setAgentUrl(agentUrl);
    setAgentUrlError("");

    if (!hasOnboarded) {
      await configService.setHasOnboarded(true);
    }
    return true;
  };

  const handleSetBootUrl = async () => {
    await configService.setBootUrl(bootUrl);
    setBootUrl(bootUrl);
    setBootUrlError("");
    
    props.afterBootUrlUpdate();
    return true;
  };

  const handleSetVendorUrl = async () => {
    let hasError = checkErrorVendorUrl();
    try {
      const resp = await (await fetch(vendorUrl)).json();
      if (resp?.agentUrl) {
        setAgentUrl(resp?.agentUrl);
      }
      if (resp?.bootUrl) {
        setBootUrl(resp?.bootUrl);
      }
      await configService.setVendorData(resp);
      if (resp?.icon) {
        await setActionIcon(resp?.icon);
      }
    } catch (error) {
      setVendorUrlError(invalidVendorUrlError);
      hasError = true;
    }
    if (!hasError) {
      await configService.setVendorUrl(vendorUrl);
      props.afterSetUrl();
    }
  };

  const handleLoadVendorUrl = async () => {
    const hasError = checkErrorVendorUrl();
    if (hasError) return;
    await handleSetVendorUrl();
  };

  const handleSave = async () => {
    const agentUrlSuccess = validateAgentUrl();
    const bootUrlSuccess = validateBootUrl();

    if (!agentUrlSuccess || !bootUrlSuccess) return;

    await handleSetAgentUrl();
    await handleSetBootUrl();
    props.handleBack();
  };

  return (
    <>
      <Box paddingX={3} position="relative" marginBottom={2}>
        <Input
          id="vendor_url"
          label={formatMessage({ id: "config.vendorUrl.label" })}
          error={vendorUrlError}
          placeholder={formatMessage({ id: "config.vendorUrl.placeholder" })}
          value={vendorUrl}
          onChange={(e) => setVendorUrl(e.target.value)}
          onBlur={checkErrorVendorUrl}
        />
        <Box position="absolute" right="16px" bottom="-28px">
          <Button handleClick={handleLoadVendorUrl}>
            <Text $color="">{formatMessage({ id: "action.load" })}</Text>
          </Button>
        </Box>
      </Box>
      <Box>
        <Box paddingX={3}>
          <Input
            id="agent_url"
            label={`${formatMessage({ id: "config.agentUrl.label" })} *`}
            error={agentUrlError}
            placeholder={formatMessage({ id: "config.agentUrl.placeholder" })}
            value={agentUrl}
            onChange={(e) => setAgentUrl(e.target.value)}
            onBlur={() => validateAgentUrl()}
          />
        </Box>
        <Box paddingX={3}>
          <Input
            id="boot_url"
            label={`${formatMessage({ id: "config.bootUrl.label" })} *`}
            error={bootUrlError}
            placeholder={formatMessage({ id: "config.bootUrl.placeholder" })}
            value={bootUrl}
            onChange={(e) => setBootUrl(e.target.value)}
            onBlur={() => validateBootUrl()}
          />
        </Box>
        <Box paddingX={3}>
          <Dropdown
            label={formatMessage({ id: "config.language.label" })}
            selectedOption={langMap.find((s) => s.value === currentLocale)}
            options={langMap}
            onSelect={(option) => changeLocale(option.value)}
          />
        </Box>
        <Flex
          fontSize={0}
          flexDirection="row"
          justifyContent="center"
          paddingX={3}
          marginTop={1}
        >
          <Button handleClick={handleSave}>
            <Text $color="">{formatMessage({ id: "action.save" })}</Text>
          </Button>
        </Flex>
      </Box>
    </>
  );
}
