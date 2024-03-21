import { styled } from "styled-components";
import { Flex, Box } from "@components/ui";
import PopupArrowIcon from "@src/components/shared/icons/popup-arrow";

interface IPopupPrompt {
  message: JSX.Element;
}

const StyledContainer = styled(Flex)`
  background-color: ${({ theme }) => theme?.colors?.secondary};
  color: ${({ theme }) => theme?.colors?.subtext};
`;

export const PopupPrompt = ({ message }: IPopupPrompt): JSX.Element => {
  return (
    <StyledContainer
      position="absolute"
      top={0}
      right={0}
      justifyContent="center"
      flexDirection="row"
      border="1px"
      padding={2}
      borderRadius="4px"
      maxWidth="280px"
    >
      {message}
      <Box marginLeft={2}>
        <PopupArrowIcon size={4} />
      </Box>
    </StyledContainer>
  );
};
