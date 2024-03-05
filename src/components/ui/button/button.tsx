import { styled } from "styled-components";
import { Loader } from "@components/ui";

interface IButton {
  type?: "button" | "reset" | "submit" | undefined;
  handleClick?: () => void;
  isLoading?: boolean;
  className?: string;
  children?: JSX.Element | any;
}

const StyledButton = styled.button`
  background-color: ${(props) => props.theme?.colors?.primary};
  text-align: center;
`;

export function Button(props: IButton): JSX.Element {
  return (
    <StyledButton
      type={props.type}
      onClick={props.handleClick}
      className={props.className}
    >
      {props.isLoading ? <Loader size={4} /> : null}
      {props.children}
    </StyledButton>
  );
}
