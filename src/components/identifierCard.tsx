interface IIdentifier {}

export function IdentifierCard({ aid }): JSX.Element {
  return (
    <div className="m-auto max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow text-gray-900">
      <div className="mb-3 flex flex-row justify-between">
        <div>
          <p className=" mb-1 font-bold text-gray-dark">Alias:</p>
          <p className="font-normal text-gray">{aid.name}</p>
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
            d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
          />
        </svg>
      </div>

      <div className="mb-3">
        <p className=" mb-1 font-bold text-gray-dark">ID:</p>
        <p className="font-normal text-gray">{aid.prefix}</p>
      </div>
      <div className="mb-3 flex flex-row justify-between">
        <div className="">
          <p className=" mb-1 font-bold text-gray-dark">
            Credentials Received:
          </p>
          <p className="font-normal text-gray">13</p>
        </div>
        <div className="">
          <p className=" mb-1 font-bold text-gray-dark">Last Used:</p>
          <p className="font-normal text-gray">November 08, 2023</p>
        </div>
      </div>
    </div>
  );
}
