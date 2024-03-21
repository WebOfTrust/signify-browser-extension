import { styled } from "styled-components";
import { Button, Text, Subtext } from "@components/ui";
import SigninIcon from "@src/components/shared/icons/signin";
import { resetTabState } from "@pages/content";
import { ISignin } from "@config/types";

const StyledSigninItem = styled.div`
  background-color: ${(props) => props.theme?.colors?.cardBg};
  color: ${(props) => props.theme?.colors?.cardColor};
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
    <StyledSigninItem className="flex m-2 flex-row justify-between p-2 items-start border border-black rounded">
      <div className="max-w-[200px] break-words">
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
      </div>
      <div className="flex flex-col gap-y-2">
        <div className={`${signin?.autoSignin ? "visible" : "invisible"}`}>
          <Text $color="" textAlign="end" fontSize="8px" fontWeight="bold">
            Auto Sign in
          </Text>
          <div className="float-right">
            <SigninIcon size={6} />
          </div>
        </div>
        <Button
          handleClick={handleClick}
          className="text-white self-end font-medium rounded-full text-xs px-2 py-1"
        >
          <>Sign in</>
        </Button>
      </div>
    </StyledSigninItem>
  );
};
