import styled, { css } from "styled-components";
import {
  alignSelf,
  alignItems,
  justifyContent,
  flexDirection,
  flex,
  FlexDirectionProps,
  JustifyContentProps,
  AlignItemsProps,
} from "styled-system";
import { Box } from "../box";

type TFlexCustomProps = {
  $flexGap?: number;
};

type TFlex = TFlexCustomProps &
  FlexDirectionProps &
  JustifyContentProps &
  AlignItemsProps;

export const Flex = styled(Box)<TFlex>`
  display: flex;
  ${alignSelf} ${alignItems} ${justifyContent} ${flexDirection} ${flex};
  ${({ $flexGap, flexDirection }) =>
    $flexGap
      ? flexDirection === "row"
        ? css`
            column-gap: ${$flexGap * 4}px;
          `
        : css`
            row-gap: ${$flexGap * 4}px;
          `
      : null}
`;

Flex.displayName = "Flex";
