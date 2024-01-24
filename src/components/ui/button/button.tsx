import { styled } from "styled-components";
import { Loader } from "@components/loader";

interface IButton {
  text: string;
  handleClick: () => void;
  isLoading?: boolean;
  className?: string;
}

const ButtonStyled = styled.button`
  background-color: ${(props) => props.theme.colors?.primary};
  text-align: center;
  padding: 10px 20px;
`;

export function Button(props: IButton): JSX.Element {
  return (
    <ButtonStyled
      type="button"
      onClick={props.handleClick}
      className={props.className}
    >
      {props.isLoading ? <Loader size={4} /> : null}
      <p className="font-medium text-md">{props.text}</p>
    </ButtonStyled>
  );
}
