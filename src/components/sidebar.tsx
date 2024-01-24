import logo from "@assets/img/128_keri_logo.png";

const SIDEBAR = [
  {
    id: "Identifiers",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
        />
      </svg>
    ),
    title: "Identifiers",
  },
  {
    id: "Credentials",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
        />
      </svg>
    ),
    title: "Credentials",
  },
  {
    id: "Sign Ins",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
        />
      </svg>
    ),
    title: "Sign Ins",
  },
];

interface ISidebar {
  active: string;
  onClickLink: (active: string) => void;
  disabled?: boolean;
  onSignout: () => void;
}

export function Sidebar(props: ISidebar): JSX.Element {
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
              <img src={logo} className="h-8" alt="logo" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                KERI
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
              className={`${
                props.disabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              aria-disabled={props.disabled}
            >
              <div
                onClick={() => !props.disabled && props.onClickLink(element.id)}
                className={`flex items-center p-2 rounded-lg hover:bg-gray-dark hover:text-gray-light group ${
                  element.id === props.active
                    ? " bg-gray-dark text-gray-light"
                    : ""
                }`}
              >
                {element.icon}
                <span className="ms-3">{element.title}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ul className="px-3 font-medium">
        <li className="cursor-pointer">
          <div
            onClick={props.onSignout}
            className={`flex items-center p-2 rounded-lg hover:bg-red hover:text-gray-light group`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>

            <span className="ms-3">Disconnect</span>
          </div>
        </li>
      </ul>
    </aside>
  );
}
