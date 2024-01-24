import logo from "@assets/img/128_keri_logo.png";

interface IAppbar {}

export function Appbar(props: IAppbar): JSX.Element {
  return (
    <nav className="bg-white p-2">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
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
    </nav>
  );
}
