import styled, { keyframes } from "styled-components";

const bounce = keyframes`
    0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8,0,1,1);
    }
    50% {
        transform: none;
        animation-timing-function: cubic-bezier(0,0,0.2,1);
    }
`;

export const BounceAnimationSvg = styled.svg`
  animation: ${bounce} 1s infinite;
`;
