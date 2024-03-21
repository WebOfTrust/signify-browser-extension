import { styled } from "styled-components";
import { Flex } from "@components/ui";

interface IStyledMenu {
  $isActive?: boolean;
}

export const StyledMenu = styled(Flex)<IStyledMenu>`
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme?.colors?.secondary : ""};
  color: ${({ $isActive, theme }) => ($isActive ? theme?.colors?.subtext : "")};
  &:hover {
    background-color: ${({ theme }) => theme?.colors?.secondary};
    color: ${({ theme }) => theme?.colors?.subtext};
  }
`;

export const StyledSidebar = styled.aside`
  position: fixed;
  left: 0px;
  z-index: 40;
  width: 192px;
  height: 100%;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  transform: translate(-100%, 0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1);
  @media (min-width: 640px) {
    transform: translate(0, 0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1);
  }
`;

export const StyledBottomMenu = styled(Flex)`
  &:hover {
    background-color: ${({ theme }) => theme?.colors?.error};
    color: ${({ theme }) => theme?.colors?.subtext};
  }
`;

export const StyledLiContainer = styled.li<{ disabled?: boolean }>`
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;
