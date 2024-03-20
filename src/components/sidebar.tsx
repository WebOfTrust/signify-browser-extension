import { useIntl, FormattedMessage } from "react-intl";
import { styled } from "styled-components";
import IdentifierIcon from "@components/shared/icons/identifier";
import CredentialIcon from "@components/shared/icons/credential";
import SigninIcon from "@components/shared/icons/signin";
import LockIcon from "@components/shared/icons/lock";

export const SIDEBAR_KEYS = {
  identifiers: "identifiers",
  credentials: "credentials",
  signin: "sign-ins",
};

export const SIDEBAR = [
  {
    id: SIDEBAR_KEYS.identifiers,
    icon: <IdentifierIcon size={6} />,
    title: <FormattedMessage id="identifiers.title" />,
  },
  {
    id: SIDEBAR_KEYS.credentials,
    icon: <CredentialIcon size={6} />,
    title: <FormattedMessage id="credentials.title" />,
  },
  {
    id: SIDEBAR_KEYS.signin,
    icon: <SigninIcon size={6} />,
    title: <FormattedMessage id="signins.title" />,
  },
];

interface ISidebar {
  active: any;
  onClickLink: (active: any) => void;
  disabled?: boolean;
  onSignout: () => void;
  title?: string;
  logo?: string;
}

interface IStyledMenu {
  $isActive?: boolean;
}

const StyledMenu = styled.div<IStyledMenu>`
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme?.colors?.secondary : ""};
  color: ${({ $isActive, theme }) => ($isActive ? theme?.colors?.subtext : "")};
  &:hover {
    background-color: ${({ theme }) => theme?.colors?.secondary};
    color: ${({ theme }) => theme?.colors?.subtext};
  }
`;

const StyledBottomMenu = styled.div`
  &:hover {
    background-color: ${({ theme }) => theme?.colors?.error};
    color: ${({ theme }) => theme?.colors?.subtext};
  }
`;

export function Sidebar(props: ISidebar): JSX.Element {
  const { formatMessage } = useIntl();
  return (
    <aside
      id="default-sidebar"
      className="fixed top left-0 z-40 w-48 h-[100%] transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <ul className="px-3 font-medium">
        <li className="cursor-pointer">
          <div>
            <a
              href="https://github.com/WebOfTrust/signify-browser-extension"
              className="flex items-center space-x-3 rtl:space-x-reverse"
            >
              <img src={props?.logo} className="h-8" alt="logo" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap">
                {props?.title}
              </span>
            </a>
          </div>
        </li>
      </ul>
      <div className="flex flex-col justify-between px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          {SIDEBAR.map((element, index) => (
            <li
              key={index}
              className={`text-xs ${
                props.disabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              aria-disabled={props.disabled}
            >
              <StyledMenu
                onClick={() => !props.disabled && props.onClickLink(element)}
                className={`flex items-center p-2 rounded-lg group `}
                $isActive={element.id === props.active?.id}
              >
                {element.icon}
                <span className="ms-3">{element.title}</span>
              </StyledMenu>
            </li>
          ))}
        </ul>
      </div>
      <ul className="px-3 font-medium">
        <li className="text-xs cursor-pointer">
          <StyledBottomMenu
            onClick={props.onSignout}
            className={`flex items-center p-2 rounded-lg group`}
          >
            <LockIcon size={6} />
            <span className="ms-3">
              {formatMessage({ id: "action.disconnect" })}
            </span>
          </StyledBottomMenu>
        </li>
      </ul>
    </aside>
  );
}
