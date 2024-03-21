import styled from "styled-components";
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

type TFlex = FlexDirectionProps & JustifyContentProps & AlignItemsProps;

export const Flex = styled(Box)<TFlex>`
  display: flex;
  ${alignSelf} ${alignItems} ${justifyContent} ${flexDirection} ${flex};
`;

Flex.displayName = "Flex";
