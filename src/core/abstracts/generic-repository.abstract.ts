import { ClientSession, FilterQuery, UpdateQuery } from "mongoose";

export abstract class IGenericRepository<T> {
  abstract find(fields: FilterQuery<T>, options?: { select?: string, isLean?: boolean });

  abstract findAllWithPagination(
    options: {
      query?: Record<string, any>,
      queryFields?: Record<string, any>
    });

  abstract findOne(key: FilterQuery<T>, session?: ClientSession);

  abstract create(payload: T | T[], session?: ClientSession);

  abstract update(key: FilterQuery<T>, payload: UpdateQuery<T>, session?: ClientSession);
}
