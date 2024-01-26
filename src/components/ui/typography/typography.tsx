import React from "react";
import { styled } from "styled-components";

interface ITypography {
  children: JSX.Element | any;
  className?: string;
  $color: string;
}

interface IStyledTypography {
  $color: string;
}

const StyledTypography = styled.p<IStyledTypography>`
  color: ${({ $color, theme }) => theme?.colors?.[$color]};
`;

const StyledSubtext = styled.span<IStyledTypography>`
  color: ${({ $color, theme }) => theme?.colors?.[$color]};
`;

export function Text(props: ITypography): JSX.Element {
  return (
    <StyledTypography className={props.className} $color={props.$color}>
      {props.children}
    </StyledTypography>
  );
}

export function Subtext(props: ITypography): JSX.Element {
  return (
    <StyledSubtext className={props.className} $color={props.$color}>
      {props.children}
    </StyledSubtext>
  );
}
