export type OptionalQuery<T> = {
  [K in keyof T]?: T[K];
};