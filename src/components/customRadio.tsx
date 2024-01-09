interface ICustomRadio {
  id?: string;
  component?: JSX.Element;
  checked: boolean;
  onClick: () => void;
}

export function CustomRadio({
  id,
  component,
  checked,
  onClick,
}: ICustomRadio): JSX.Element {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center border ${
        checked ? "border-green" : ""
      }`}
    >
      <input
        checked={checked}
        id={id}
        type="radio"
        value=""
        name="bordered-radio"
        className="w-4 h-4 dark:ring-offset-green  "
      />
      <label htmlFor={id} className="w-full ms-1 font-medium">
        {component}
      </label>
    </div>
  );
}
