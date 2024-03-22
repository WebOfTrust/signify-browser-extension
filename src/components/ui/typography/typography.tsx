import { styled, css } from "styled-components";
import {
  typography,
  TypographyProps,
  maxWidth,
  MaxWidthProps,
} from "styled-system";

interface ITypography {
  children: JSX.Element | any;
  $color: string;
  $capitalize?: boolean;
  $breakWord?: boolean;
  $cursorPointer?: boolean;
}

type TText = TypographyProps & ITypography & MaxWidthProps;

export const Text = styled.p<TText>`
  margin: 0;
  ${typography}
  color: ${({ $color, theme }) => theme?.colors?.[$color]};
  ${({ $capitalize }) =>
    $capitalize &&
    css`
      text-transform: capitalize;
    `}
  ${({ $breakWord }) =>
    $breakWord &&
    css`
      overflow-wrap: break-word;
    `}
  ${({ $cursorPointer }) =>
    $cursorPointer &&
    css`
      cursor: pointer;
    `}
`;

export const Subtext = styled.span<TText>`
  ${typography}
  ${maxWidth}
  margin: 0;
  color: ${({ $color, theme }) => theme?.colors?.[$color]};
  ${({ $breakWord }) =>
    $breakWord &&
    css`
      overflow-wrap: break-word;
    `}
  ${({ $cursorPointer }) =>
    $cursorPointer &&
    css`
      cursor: pointer;
    `}
`;
