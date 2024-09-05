import { styled } from "styled-components";
import { Flex } from "../flex";

interface IRadio {
  id?: string;
  component?: JSX.Element;
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const StyledRadio = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #61783e;
`;

const StyledRadioLabel = styled.label`
  cursor: pointer;
  width: 100%;
  margin-inline-start: 4px;
  font-weight: 500;
`;

export function Radio({
  id,
  component,
  checked,
  onClick,
  disabled,
}: IRadio): JSX.Element {
  return (
    <Flex
      onClick={disabled ? () => {} : onClick}
      alignItems="center"
      $cursorPointer
      borderWidth="1px"
      borderRadius="4px"
      borderColor={checked ? "green" : ""}
    >
      <StyledRadio
        checked={checked}
        id={id}
        type="radio"
        value=""
        name="bordered-radio"
        disabled={disabled}
      />
      <StyledRadioLabel htmlFor={id}>{component}</StyledRadioLabel>
    </Flex>
  );
}
