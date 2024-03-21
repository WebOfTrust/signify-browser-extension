import styled from "styled-components";
import {
  space,
  layout,
  typography,
  opacity,
  OpacityProps,
  color,
  position,
  PositionProps,
  border,
  BorderProps,
  SpaceProps,
  TypographyProps,
  LayoutProps,
} from "styled-system";

type TBox = SpaceProps &
  TypographyProps &
  LayoutProps &
  BorderProps &
  PositionProps &
  OpacityProps;

export const MainBox = styled.main<TBox>`
  ${space}
  ${layout}
  ${typography}
  ${color}
  ${border}
`;

MainBox.displayName = "MainBox";

export const Box = styled.div<TBox>`
  ${space}
  ${layout}
  ${typography}
  ${color}
  ${border}
  ${position}
  ${opacity}
`;

Box.displayName = "Box";
