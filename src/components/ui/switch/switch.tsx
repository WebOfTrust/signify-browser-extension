import { styled, css } from "styled-components";

interface ISwitch {
  isChecked: boolean;
  handleToggle: () => void;
  icon?: JSX.Element;
}

const StyledSwitch = styled.button<Pick<ISwitch, "isChecked">>`
  background-color: ${(props) => props.theme?.colors?.bodyBg};
  border-color: ${(props) => props.theme?.colors?.primary};
  border-width: 1px;
  opacity: ${({ isChecked }) => (isChecked ? 1 : 0.6)};
  width: 48px;
  height: 24px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  transition-duration: 300ms;
`;

const StyledSwitchDiv = styled.div<Pick<ISwitch, "isChecked">>`
  background-color: ${({ isChecked, theme }) =>
    isChecked ? theme?.colors?.primary : theme?.colors?.bodyBg};
  border: ${({ isChecked, theme }) =>
    isChecked ? "unset" : `1px solid ${theme?.colors?.primary}`};
  color: ${({ isChecked, theme }) =>
    isChecked ? theme?.colors?.bodyBg : theme?.colors?.bodyColor};
  width: 24px;
  height: 24px;
  position: relative;
  border-radius: 9999px;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  transition-duration: 500ms;
  padding: 4px;
  transform: translate(0, 0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1);

  ${({ isChecked }) =>
    isChecked
      ? css`
          --sc-translate-x: 100%;
          transform: translate(var(--sc-translate-x), 0) rotate(0) skewX(0)
            skewY(0) scaleX(1) scaleY(1);
        `
      : css`
          --sc-translate-x: -4px;
          transform: translate(var(--sc-translate-x), 0) rotate(0) skewX(0)
            skewY(0) scaleX(1) scaleY(1);
        `}}
`;

export function Switch({
  handleToggle,
  isChecked,
  icon,
}: ISwitch): JSX.Element {
  return (
    <StyledSwitch
      isChecked={isChecked}
      // {` transition duration-300`}
      onClick={handleToggle}
    >
      <StyledSwitchDiv
        id="switch-toggle"
        isChecked={isChecked}
        // {`transform ${
        //   isChecked ? "translate-x-full" : " -translate-x-1"
        // }`}
      >
        {icon}
      </StyledSwitchDiv>
    </StyledSwitch>
  );
}
