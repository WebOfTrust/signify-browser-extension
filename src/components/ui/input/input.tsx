import React, { isValidElement } from "react";
import styled from "styled-components";
import { Flex } from "../flex";

interface IInput {
  label?: string;
  placeholder?: string;
  error?: string | JSX.Element;
  id: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  type?: string;
}

const StyledInputLabel = styled.label`
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  width: fit-content;
`;

const StyledInput = styled.input<Pick<IInput, "error">>`
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  -o-box-sizing: border-box;
  -ms-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 4px;
  display: block;
  font-size: 14px;
  line-height: 20px;
  width: 100%;
  padding: 8px;
  border: ${({ theme, error }) =>
    `1px solid ${error ? theme?.colors?.error : theme?.colors?.bodyBorder}`};
  background-color: ${({ theme }) => theme?.colors?.bodyBg};
  color: ${({ theme, error }) =>
    error ? theme?.colors?.error : theme?.colors?.bodyColor};
`;

const StyledInputError = styled.p`
  color: ${({ theme }) => theme?.colors?.error};
  font-size: 12px;
  margin: 0;
`;

export const Input = ({
  label,
  placeholder,
  error,
  id,
  required,
  value,
  onChange,
  onBlur,
  type = "text",
}: IInput) => {
  return (
    <Flex flexDirection="column" $flexGap={1}>
      {label ? (
        <StyledInputLabel htmlFor={id}>{label}</StyledInputLabel>
      ) : (
        <></>
      )}
      <StyledInput
        type={type}
        id={id}
        error={error}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error ? (
        isValidElement(error) ? (
          error
        ) : (
          <StyledInputError>{error}</StyledInputError>
        )
      ) : null}
    </Flex>
  );
};
