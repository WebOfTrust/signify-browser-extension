import styled, { keyframes } from "styled-components";

const spin = keyframes`
    to {
        transform: rotate(360deg);
    }
`;

export const SpinAnimationSvg = styled.svg`
  animation: ${spin} 1s linear infinite;
`;
