import { styled } from "styled-components";
import PopupArrowIcon from "@src/components/shared/icons/popup-arrow";

interface IPopupPrompt {
  message: JSX.Element;
}

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme?.colors?.secondary};
  color: ${({ theme }) => theme?.colors?.subtext};
`;

export const PopupPrompt = ({ message }: IPopupPrompt): JSX.Element => {
  return (
    <StyledContainer className="absolute top-0 right-0 flex justify-center max-w-[280px] flex-row border  p-2 rounded">
      {message}
      <PopupArrowIcon className="ml-2 h-4 w-4 rounded border-green animate-bounce" />
    </StyledContainer>
  );
};
