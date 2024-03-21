import { styled } from "styled-components";
import {
  typography,
  TypographyProps,
  maxWidth,
  MaxWidthProps,
} from "styled-system";

interface ITypography {
  children: JSX.Element | any;
  className?: string;
  $color: string;
}

type TText = TypographyProps & ITypography & MaxWidthProps;

export const Text = styled.p<TText>`
  ${typography}
  color: ${({ $color, theme }) => theme?.colors?.[$color]};
`;

export const Subtext = styled.span<TText>`
  ${typography}
  ${maxWidth}
  color: ${({ $color, theme }) => theme?.colors?.[$color]};
`;
