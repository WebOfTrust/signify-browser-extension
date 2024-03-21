import { styled } from "styled-components";
import { Box, Button, Text, Subtext, Flex } from "@components/ui";
import SigninIcon from "@src/components/shared/icons/signin";
import { resetTabState } from "@pages/content";
import { ISignin } from "@config/types";

const StyledSigninItem = styled(Flex)`
  background-color: ${(props) => props.theme?.colors?.cardBg};
  color: ${(props) => props.theme?.colors?.cardColor};
`;

const AutoSigninTag = styled(Box)<{ visible?: boolean }>`
  visibility: ${({ visible }) => (visible ? "visible" : "hidden")};
`;

// TODO do not pass the full signins stored object (only AID name, schema name, web url)
export const SigninItem = ({ signin }: { signin: ISignin }): JSX.Element => {
  const handleClick = async () => {
    const headers = await chrome.runtime.sendMessage({
      type: "authentication",
      subtype: "get-signed-headers",
      data: {
        signin: signin,
      },
    });
    resetTabState();
    // Communicate headers to web page
    window.postMessage({ type: "signify-signature", data: headers.data }, "*");
  };

  return (
    <StyledSigninItem
      flexDirection="row"
      justifyContent="space-between"
      padding={2}
      margin={2}
      alignItems="start"
      borderRadius="4px"
      borderWidth="1px"
      borderColor="black"
    >
      <Box maxWidth="200px" $breakWord>
        <Text fontWeight="bold" fontSize={1} textAlign="start" $color="heading">
          URL:{" "}
          <Subtext fontWeight="normal" $color="text">
            {signin.domain}
          </Subtext>
        </Text>
        {signin?.identifier ? (
          <Text textAlign="start" fontSize={1} $color="heading">
            <strong>AID: </strong>{" "}
            <Subtext fontWeight="normal" $color="text">
              {signin?.identifier?.name}
            </Subtext>
          </Text>
        ) : (
          <></>
        )}
        {signin?.credential ? (
          <Text
            fontWeight="normal"
            textAlign="start"
            fontSize={1}
            $color="heading"
          >
            <strong>Cred: </strong>{" "}
            <Subtext fontWeight="normal" $color="text">
              {signin?.credential?.schema?.title}
            </Subtext>
          </Text>
        ) : (
          <></>
        )}
        <Text fontWeight="bold" textAlign="start" fontSize={0} $color="heading">
          Last used:{" "}
          <Subtext fontWeight="normal" $color="text">
            {new Date(signin.updatedAt).toDateString()}
          </Subtext>
        </Text>
      </Box>
      <Flex flexDirection="column" $flexGap={2}>
        <AutoSigninTag visible={signin?.autoSignin}>
          <Text $color="" textAlign="end" fontSize="8px" fontWeight="bold">
            Auto Sign in
          </Text>
          <Box $float="right">
            <SigninIcon size={6} />
          </Box>
        </AutoSigninTag>
        <Button handleClick={handleClick}>
          <>Sign in</>
        </Button>
      </Flex>
    </StyledSigninItem>
  );
};
