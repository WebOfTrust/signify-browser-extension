import styled, { css } from "styled-components";
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

interface IBoxCustomProps {
  $breakWord?: boolean;
  $hoverableOpacity?: boolean;
  $float?: string;
}

type TBox = IBoxCustomProps &
  SpaceProps &
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
  ${({ $breakWord }) =>
    $breakWord &&
    css`
      overflow-wrap: break-word;
    `}
  ${({ $hoverableOpacity }) =>
    $hoverableOpacity &&
    css`
      opacity: 0.8;
      &:hover {
        opacity: 1;
      }
    `}
  ${({ $float }) =>
    $float &&
    css`
      float: ${$float === "right" ? "right" : "left"};
    `}
`;

Box.displayName = "Box";
