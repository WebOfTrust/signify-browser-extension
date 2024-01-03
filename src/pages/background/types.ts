export interface IMessage<T> {
  type: string;
  subtype?: string;
  data?: T;
}
