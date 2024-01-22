import { useState, useEffect } from "react";
import { Loader } from "@components/loader";

export function CreateIdentifierCard(props): JSX.Element {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    setNameError(props.error);
  }, [props.error]);
  const onBlurName = () => {
    if (!name) {
      setNameError("Name can not be empty");
    } else {
      setNameError("");
    }
  };

  const onCreateIdentifier = async () => {
    let hasError = false;
    if (!name) {
      setNameError("Name can not be empty");
      hasError = true;
    }
    props.handleCreateIdentifier(name);
  };

  return (
    <>
      <div className=" max-w-xs m-4 flex flex-col gap-y-4">
        <div>
          <input
            type="text"
            id="vendor_url"
            className={`bg-gray-50 border text-black border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
              nameError ? " text-red border-red" : ""
            } `}
            placeholder="Enter unique name for identifier"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={onBlurName}
          />
          {nameError ? <p className="text-red">{nameError}</p> : null}
        </div>
        <div className=" flex flex-row justify-center mt-2">
          <button
            type="button"
            onClick={onCreateIdentifier}
            className="text-white bg-green flex flex-row gap-x-1 font-medium rounded-full text-sm px-5 py-2 text-center"
          >
            {props.isLoading ? <Loader size={4} /> : null}
            <p className="font-medium text-md">Create</p>
          </button>
        </div>
      </div>
    </>
  );
}
