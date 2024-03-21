import React, { isValidElement } from "react";
import styled from "styled-components";

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
`;

const StyledInput = styled.input<Pick<IInput, "error">>`
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
    <div>
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
    </div>
  );
};
