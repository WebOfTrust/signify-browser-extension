import { CustomSwitch } from "@components/customSwitch";

export function SigninCard({
  signin,
  handleDelete,
  handleAutoSignin,
}): JSX.Element {
  return (
    <div className="m-auto max-w-sm px-4 py-2 bg-white border border-gray-200 rounded-lg shadow text-gray-900">
      <div className="flex flex-row justify-between">
        <div>
          <p className="font-bold text-gray-dark">Website</p>
          <p className="font-normal text-md text-gray">{signin?.domain}</p>
        </div>
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
      </div>

      <div className="flex flex-row justify-between">
        <div>
          <p className="font-bold text-gray-dark">
            {signin?.identifier ? "Identifier Alias" : "Credential"}
          </p>
          <p className="font-normal text-md text-gray">
            {signin?.identifier?.name}
          </p>
        </div>
        <div>
          <p className="font-bold text-gray-dark">Last Used</p>
          <p className="font-normal text-md text-gray">
            {new Date(signin?.updatedAt).toDateString()}
          </p>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div>
          <p className="font-bold text-gray-dark">Auto Sign in</p>
          <CustomSwitch
            isChecked={signin.autoSignin}
            handleToggle={handleAutoSignin}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleDelete}
            className="text-white bg-green hover:bg-red font-medium rounded-full text-xs px-2 py-1 text-center"
          >
            {"Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
