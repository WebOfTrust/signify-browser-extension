export const isValidUrl = (str: string) => {
  try {
    return new URL(str);
  } catch (err) {
    return false;
  }
};

export const obfuscateString = (inputString: string) => {
  const prefixLength = 12;
  const suffixLength = 8;

  if (inputString.length <= prefixLength + suffixLength) {
    return inputString;
  }

  const prefix = inputString.slice(0, prefixLength);
  const suffix = inputString.slice(-suffixLength);

  return `${prefix}...${suffix}`;
};

export const getDomainFromUrl = (url: string): string => {
  const parsedUrl = new URL(url);
  return `${parsedUrl.protocol}//${parsedUrl.hostname}${
    parsedUrl.port ? ":" + parsedUrl.port : ""
  }`;
};

export const getHostnameFromUrl = (url: string): string => {
  const parsedUrl = new URL(url);
  return parsedUrl?.hostname;
};

export const removeSlash = (site = "") => {
  return site.replace(/\/$/, "");
};

export const hasWhiteSpace = (s: string) => {
  return s.indexOf(" ") >= 0;
};

export const removeWhiteSpace = (s: string, replace = "") => {
  return s.replace(/\s/g, replace);
};

export const getImageFromUrl = async (iconUrl: string) => {
  try {
    const imageBlob = await fetch(iconUrl).then((r) => r.blob());
    const bitmap = await createImageBitmap(imageBlob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d");
    context?.drawImage(bitmap, 0, 0);
    const imageData = context?.getImageData(0, 0, bitmap.width, bitmap.height);
    return imageData;
  } catch (error) {}
};
