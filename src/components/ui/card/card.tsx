import { styled } from "styled-components";
import { Box } from "../box";

interface ICard {
  children?: JSX.Element;
}

const StyledCard = styled(Box)`
  background-color: ${(props) => props.theme?.colors?.cardBg};
  color: ${(props) => props.theme?.colors?.cardColor};
`;

export function Card({ children }: ICard): JSX.Element {
  return (
    <StyledCard
      margin="auto"
      maxWidth="384px"
      paddingX={3}
      paddingY={2}
      borderWidth="1px"
      borderRadius="8px"
    >
      {children}
    </StyledCard>
  );
}
