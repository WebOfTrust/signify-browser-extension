import { styled } from "styled-components";
import toast from "react-hot-toast";
import { CS_EVENTS } from "@config/event-types";
import { ISignin } from "@config/types";
import { sendMessage } from "@src/shared/browser/runtime-utils";
import { Box, Button, Text, Subtext, Flex } from "@components/ui";
import SigninIcon from "@components/shared/icons/signin";
import { resetTabState } from "@pages/content";

const StyledSigninItem = styled(Flex)`
  border: 1px solid;
  background-color: ${(props) => props.theme?.colors?.cardBg};
  color: ${(props) => props.theme?.colors?.cardColor};
`;

const AutoSigninTag = styled(Box)<{ visible?: boolean }>`
  visibility: ${({ visible }) => (visible ? "visible" : "hidden")};
`;

// TODO do not pass the full signins stored object (only AID name, schema name, web url)
export const SigninItem = ({
  signin,
  requestId,
  rurl
}: {
  signin: ISignin;
  requestId: string;
  rurl: string;
}): JSX.Element => {
  const handleClick = async () => {
    const { data, error } = await sendMessage<{ rurl: string, signin: ISignin }>({
      type: CS_EVENTS.authentication_get_signed_headers,
      data: {
        rurl,
        signin: signin,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      resetTabState();
      // Communicate headers to web page
      window.postMessage({ type: "/signify/reply", requestId, payload: data }, "*");
    }
  };

  return (
    <StyledSigninItem
      flexDirection="row"
      justifyContent="space-between"
      padding={2}
      margin={2}
      alignItems="start"
      borderRadius="4px"
      borderColor="black"
    >
      <Box maxWidth="180px" $breakWord>
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
