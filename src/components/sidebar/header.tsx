import { Box } from "@components/ui";
import { styled } from "styled-components";

interface IHeader {
  title?: string;
  logo?: string;
}

const StyledLogoLink = styled.a`
  display: flex;
  align-items: center;

  & > img {
    height: 32px;
  }

  & > span {
    align-self: center;
    font-size: 24px;
    line-height: 32px;
    font-weight: 600;
    white-space: nowrap;
  }
`;

export function Header(props: IHeader): JSX.Element {
  return (
    <Box>
      <StyledLogoLink href="https://github.com/WebOfTrust/signify-browser-extension">
        <img src={props?.logo} alt="logo" />
        <span>{props?.title}</span>
      </StyledLogoLink>
    </Box>
  );
}
