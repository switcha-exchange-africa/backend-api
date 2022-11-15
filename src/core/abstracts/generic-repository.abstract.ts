import { ClientSession, FilterQuery, UpdateQuery } from "mongoose";
import * as mongoose from "mongoose";
import { PaginationType } from "../types/database";



export abstract class IGenericRepository<T> {
  abstract find(fields: FilterQuery<T>, options?: { select?: string, isLean?: boolean });

  abstract findAllWithPagination(
    options: {
      query?: Record<string, any>,
      queryFields?: Record<string, any>,
      misc?: {
        populated?: any
      }
    });

  abstract findOne(key: FilterQuery<T>, session?: ClientSession, options?: {
    sort?: 'desc' | 'asc',
    populate?: any,
    select?: string | string[]

  }): Promise<mongoose.HydratedDocument<T>>;

  abstract create(payload: T | T[], session?: ClientSession);
  abstract delete(key: FilterQuery<T>, session?: ClientSession) 
  abstract deleteMany(key: FilterQuery<T>[], session?: ClientSession) 
  abstract update(key: FilterQuery<T>, payload: UpdateQuery<T>, session?: ClientSession);

  abstract aggregation(pipeline: any[]): Promise<any>
  abstract search(options: { query: PaginationType, populate?: string | string[] }) 


}
