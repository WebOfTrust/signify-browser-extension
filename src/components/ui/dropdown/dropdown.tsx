import React, { useState } from "react";
import styled from "styled-components";
import { Text } from "../typography";

interface IDropdownOption {
  label: string;
  value: string;
}

interface IDropdown {
  label?: string;
  options: IDropdownOption[];
  selectedOption?: IDropdownOption;
  onSelect: (option: IDropdownOption) => void;
  zIndex?: number;
}

const DropdownWrapper = styled.div<Pick<IDropdown, "zIndex">>`
  position: relative;
  display: inline-block;
  width: 100%;
  z-index: ${({ zIndex }) => 50 + (zIndex ?? 0)};
`;

const DropdownButton = styled.button`
  padding: 8px;
  border: none;
  cursor: pointer;
  width: 100%;
  border-radius: 4px;
  color: ${({ theme }) => theme?.colors?.bodyColor};
  background: ${({ theme }) => theme?.colors?.bodyBg};
  border: ${({ theme }) => `1px solid ${theme?.colors?.bodyBorder}`};
`;

const DropdownList = styled.ul`
  width: 100%;
  position: absolute;
  top: 100%;
  left: 0;
  list-style: none;
  padding: 0;
  margin: 0;
  background: ${({ theme }) => theme?.colors?.bodyBg};
  color: ${({ theme }) => theme?.colors?.bodyColor};
  border: ${({ theme }) => `1px solid ${theme?.colors?.bodyBorder}`};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled.li`
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme?.colors?.secondary};
    color: ${({ theme }) => theme?.colors?.subtext};
  }
`;

const DropdownLabel = styled(Text)`
  padding-bottom: 4px;
`;

export const Dropdown = ({
  label,
  selectedOption,
  options,
  onSelect,
  zIndex,
}: IDropdown) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDropdownClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: IDropdownOption) => {
    setIsOpen(false);
    onSelect(option);
  };

  return (
    <>
      {label ? (
        <DropdownLabel $color="" fontSize={1} fontWeight="bold">
          {label}
        </DropdownLabel>
      ) : (
        <></>
      )}
      <DropdownWrapper zIndex={zIndex}>
        <DropdownButton onClick={handleDropdownClick}>
          {selectedOption?.label}
        </DropdownButton>
        {isOpen && (
          <DropdownList>
            {options.map((option) => (
              <DropdownItem
                key={option?.value}
                onClick={() => handleOptionClick(option)}
              >
                {option?.label}
              </DropdownItem>
            ))}
          </DropdownList>
        )}
      </DropdownWrapper>
    </>
  );
};
