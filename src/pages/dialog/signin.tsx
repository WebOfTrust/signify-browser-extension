export const SigninItem = ({ signin }): JSX.Element => {
  return (
    <div className="flex m-2 flex-row justify-between p-2 items-start border border-black rounded">
      <div>
        <p className=" text-start text-sm font-bold">{signin.domain}</p>
        <p className=" text-sm text-start font-normal text-gray">
          <strong>{signin?.identifier?.name}</strong> (
          {signin?.identifier?.prefix?.substr(0, 12)}...)
        </p>
        <p className=" text-start text-xs font-bold">
          {new Date(signin.updatedAt).toDateString()}
        </p>
      </div>
      <button
        type="button"
        className="text-white bg-green font-medium rounded-full text-sm px-2 py-1 text-center me-2 mb-2"
      >
        Sign in
      </button>
    </div>
  );
};
