import LoaderIcon from "@components/shared/icons/loader";

interface ILoader {
  color?: string;
  size?: number;
}

export const Loader = ({ color = "currentColor", size = 3 }: ILoader) => {
  return (
    <LoaderIcon
      className={`animate-spin h-${size} w-${size}`}
      fillColor={color}
    />
  );
};
