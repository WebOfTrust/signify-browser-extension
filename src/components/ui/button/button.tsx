import { styled, css } from "styled-components";
import { buttonStyle, ButtonStyleProps } from "styled-system";
import { Loader } from "../loader";

interface IButton {
  type?: "button" | "reset" | "submit" | undefined;
  handleClick?: () => void;
  isLoading?: boolean;
  children?: JSX.Element | any;
  disabled?: boolean;
}

type TNewButtonCustomProps = {
  $cursorPointer?: boolean;
  $underline?: boolean;
  $hoverUnderline?: boolean;
};

const StyledButton = styled.button`
  border: none;
  cursor: pointer;
  background-color: ${(props) =>
    props.disabled ? "grey" : props.theme?.colors?.primary};
  text-align: center;
  font-weight: 500;
  border-radius: 9999px;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-size: 14px;
  line-height: 20px;
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 2px;
  padding-bottom: 2px;
`;

const CustomButton = styled.button<ButtonStyleProps & TNewButtonCustomProps>`
  ${buttonStyle}
  height: fit-content;
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  ${({ $underline }) =>
    $underline &&
    css`
      text-decoration-line: underline;
    `}
  ${({ $hoverUnderline }) =>
    $hoverUnderline &&
    css`
      &:hover {
        text-decoration-line: underline;
      }
    `}  
  ${({ $cursorPointer }) =>
    $cursorPointer &&
    css`
      cursor: pointer;
    `}
`;

export const IconButton = styled.button<ButtonStyleProps>`
  ${buttonStyle}
  height: fit-content;
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
`;

const determineElementType = (as: string) => {
  switch (as) {
    case "button":
      return "button";
    case "a":
      return "a";
    default:
      return "div"; // Default to a div if "as" prop is not recognized
  }
};

export const NewButton = styled(CustomButton).attrs((props: any) => ({
  as: determineElementType(props.as || "button"),
}))``;

export function Button(props: IButton): JSX.Element {
  return (
    <StyledButton
      disabled={props.disabled}
      type={props.type}
      onClick={props.handleClick}
    >
      {props.isLoading ? <Loader size={4} /> : null}
      {props.children}
    </StyledButton>
  );
}
