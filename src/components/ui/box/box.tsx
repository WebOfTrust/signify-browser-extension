import styled from "styled-components";
import {
  space,
  layout,
  typography,
  color,
  SpaceProps,
  TypographyProps,
} from "styled-system";

type TBox = SpaceProps & TypographyProps;

export const Box = styled.div<TBox>`
  ${space}
  ${layout}
  ${typography}
  ${color}
`;

Box.displayName = "Box";
