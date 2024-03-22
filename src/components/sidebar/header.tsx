import { Box, Subtext } from "@components/ui";
import { styled } from "styled-components";

interface IHeader {
  title?: string;
  logo?: string;
}

const StyledLogoLink = styled.a`
  display: flex;
  align-items: center;
  column-gap: 8px;
  text-decoration-line: none;

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
      <StyledLogoLink
        target="_blank"
        href="https://github.com/WebOfTrust/signify-browser-extension"
      >
        <img src={props?.logo} alt="logo" />
        <Subtext $color="bodyColor">{props?.title}</Subtext>
      </StyledLogoLink>
    </Box>
  );
}
