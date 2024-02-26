const icon = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 12C20 7.58172 16.4183 4 12 4M12 20C14.5264 20 16.7792 18.8289 18.2454 17"
      stroke="white"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M4 12H14M14 12L11 9M14 12L11 15"
      stroke="white"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

interface ICustomSwitch {
  isChecked: boolean;
  handleToggle: () => void;
}

export function CustomSwitch({
  handleToggle,
  isChecked,
}: ICustomSwitch): JSX.Element {
  return (
    <button
      className={`w-12 h-6 rounded-full flex items-center transition duration-300 focus:outline-none shadow bg-gray-light ${
        isChecked ? "border border-green" : " "
      }`}
      onClick={handleToggle}
    >
      <div
        id="switch-toggle"
        className={` w-6 h-6 relative rounded-full transition duration-500 transform p-1 text-white ${
          isChecked
            ? "bg-green translate-x-full"
            : " bg-gray-light -translate-x-1"
        }`}
      >
        {icon}
      </div>
    </button>
  );
}
