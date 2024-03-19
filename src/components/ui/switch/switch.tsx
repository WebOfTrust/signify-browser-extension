import { styled } from "styled-components";

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
`;

const StyledSwitchDiv = styled.div<Pick<ISwitch, "isChecked">>`
  background-color: ${({ isChecked, theme }) =>
    isChecked ? theme?.colors?.primary : theme?.colors?.bodyBg};
  border: ${({ isChecked, theme }) =>
    isChecked ? "unset" : `1px solid ${theme?.colors?.primary}`};
  color: ${({ isChecked, theme }) =>
    isChecked ? theme?.colors?.bodyBg : theme?.colors?.bodyColor};
`;

export function Switch({
  handleToggle,
  isChecked,
  icon,
}: ISwitch): JSX.Element {
  return (
    <StyledSwitch
      isChecked={isChecked}
      className={`w-12 h-6 rounded-full flex items-center transition duration-300 focus:outline-none shadow`}
      onClick={handleToggle}
    >
      <StyledSwitchDiv
        id="switch-toggle"
        isChecked={isChecked}
        className={` w-6 h-6 relative rounded-full transition duration-500 transform p-1 ${
          isChecked ? "translate-x-full" : " -translate-x-1"
        }`}
      >
        {icon}
      </StyledSwitchDiv>
    </StyledSwitch>
  );
}
