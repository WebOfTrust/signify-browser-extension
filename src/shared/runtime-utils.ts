import browser from "webextension-polyfill";
import { IEventMessage } from "@config/event-types";

export const sendMessage = async <
  T = "Custom Error! No type parameter was supplied for data"
>({
  type,
  data,
}: IEventMessage<T>) => {
  return browser.runtime.sendMessage({
    type,
    data,
  });
};
