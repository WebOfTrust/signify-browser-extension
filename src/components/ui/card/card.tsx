import { styled } from "styled-components";

interface ICard {
  children?: JSX.Element;
}

const StyledCard = styled.div`
  background-color: ${(props) => props.theme?.colors?.cardBg};
  color: ${(props) => props.theme?.colors?.cardColor};
`;

export function Card({ children }: ICard): JSX.Element {
  return (
    <StyledCard className="m-auto max-w-sm px-4 py-2 border rounded-lg shadow">
      {children}
    </StyledCard>
  );
}
