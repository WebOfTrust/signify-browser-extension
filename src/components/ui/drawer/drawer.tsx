import { styled, css } from "styled-components";
import { Text } from "../typography";

interface IDrawer {
  header: any;
  handleClose?: () => void;
  isOpen?: boolean;
  children?: JSX.Element;
}

const StyledDrawer = styled.div<Pick<IDrawer, "isOpen">>`
  position: fixed;
  overflow: hidden;
  z-index: 50;
  inset: 0px;
  background-color: #1f1f205c;
  transform: translate(0, 0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1);
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  ${({ isOpen }) =>
    isOpen
      ? css`
          transition-property: opacity;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
          opacity: 1;
          transform: translate(0, 0) rotate(0) skewX(0) skewY(0) scaleX(1)
            scaleY(1);
        `
      : css`
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
          transition-delay: 150ms;
          opacity: 0;
          transform: translate(100%, 0) rotate(0) skewX(0) skewY(0) scaleX(1)
            scaleY(1);
        `}}
`;

const StyledDrawerSection = styled.section<Pick<IDrawer, "isOpen">>`
  border-top-width: 1px;
  border-left-width: 1px;
  border-bottom-width: 1px;
  border-bottom-left-radius: 1rem;
  border-top-left-radius: 1rem;
  border-top-color: white;
  border-bottom-color: white;
  border-left-color: white;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
  transition-duration: 500ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  transform: translate(0, 0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1);
  width: 100vw;
  max-width: 320px;
  position: absolute;
  right: 0px;
  height: 100%;
  background-color: ${(props) => props.theme?.colors?.secondary};
  ${({ isOpen }) =>
    isOpen
      ? css`
          --sc-translate-x: 0px;
          transform: translate(var(--sc-translate-x), 0) rotate(0) skewX(0)
            skewY(0) scaleX(1) scaleY(1);
        `
      : css`
          --sc-translate-x: 100%;
          transform: translate(var(--sc-translate-x), 0) rotate(0) skewX(0)
            skewY(0) scaleX(1) scaleY(1);
        `}}
`;

const StyledDrawerArticle = styled.article`
  position: relative;
  width: 100vw;
  max-width: 320px;
  padding-bottom: 40px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  height: 100%;
`;

const StyledDrawerBackdrop = styled.section`
  width: 100vw;
  height: 100%;
  cursor: pointer;
`;

export function Drawer({ children, isOpen, handleClose, header }: IDrawer) {
  return (
    <StyledDrawer isOpen={isOpen}>
      <StyledDrawerSection isOpen={isOpen}>
        <StyledDrawerArticle>
          <Text $color="" fontWeight="bold" fontSize={3}>
            {header}
          </Text>
          {children}
        </StyledDrawerArticle>
      </StyledDrawerSection>
      <StyledDrawerBackdrop onClick={handleClose}></StyledDrawerBackdrop>
    </StyledDrawer>
  );
}
