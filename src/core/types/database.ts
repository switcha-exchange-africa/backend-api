export type OptionalQuery<T> = {
  [K in keyof T]?: T[K];
};

export type PaginationType = {
  perpage: string,
  page: string,
  dateFrom: string,
  dateTo: string,
  sortBy: string,
  orderBy: string,
}