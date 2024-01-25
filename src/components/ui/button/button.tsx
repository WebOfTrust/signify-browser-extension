import { styled } from "styled-components";
import { Loader } from "@components/loader";

interface IButton {
  handleClick: () => void;
  isLoading?: boolean;
  className?: string;
  children?: JSX.Element;
}

const ButtonStyled = styled.button`
  background-color: ${(props) => props.theme?.colors?.primary};
  text-align: center;
`;

export function Button(props: IButton): JSX.Element {
  return (
    <ButtonStyled onClick={props.handleClick} className={props.className}>
      {props.isLoading ? <Loader size={4} /> : null}
      {props.children}
    </ButtonStyled>
  );
}
