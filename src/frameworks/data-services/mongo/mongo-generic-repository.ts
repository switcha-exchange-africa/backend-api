import { ClientSession, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { IGenericRepository } from 'src/core/abstracts';
import { convertDate, isEmpty } from 'src/lib/utils';
import * as mongoose from "mongoose";
import { PaginationType } from 'src/core/types/database';

export class MongoGenericRepository<T> implements IGenericRepository<T> {
  private _repository: Model<T>;
  private _populateOnFind: string[];

  constructor(repository: Model<T>, populateOnFind: string[] = []) {
    this._repository = repository;
    this._populateOnFind = populateOnFind;
  }


  async create(payload: T | T[], session?: ClientSession) {
    try {
      if (Array.isArray(payload)) {
        const data = session ? this._repository.insertMany(payload, { session }) : this._repository.insertMany(payload);
        return Promise.resolve(data);
      }
      const instance = new this._repository(payload);
      const data = session ? await instance.save({ session }) : await instance.save();
      return Promise.resolve(data);
    } catch (e) {
      return Promise.reject(e);
    }
  }


  async update(key: FilterQuery<T>, payload: UpdateQuery<T>, session?: ClientSession) {
    try {
      const result = await this._repository.findOneAndUpdate({ ...key }, { ...payload }, { new: true }).session(session || null);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async delete(key: FilterQuery<T>, session?: ClientSession) {
    try {
      const result = await this._repository.deleteOne({ ...key }).session(session || null);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async deleteMany(key: FilterQuery<T>[], session?: ClientSession) {
    try {
      const result = await this._repository.deleteMany({ ...key }).session(session || null);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    }
  }


  async find(fields: FilterQuery<T>, options?: { select?: string, isLean?: boolean }) {
    try {
      const data = options?.isLean ? await this._repository.find(fields).populate(this._populateOnFind).select(options?.select).lean() : await this._repository.find(fields).select(options?.select)
      return Promise.resolve(data);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async findOne(key: FilterQuery<T>, session?: ClientSession, options?: {
    sort?: 'desc' | 'asc',
    populate?: any
    select?: string | string[]
  }): Promise<mongoose.HydratedDocument<T>> {
    try {
      const populated = !isEmpty(options) ? options.populate || [] : this._populateOnFind
      const result = await this._repository
        .findOne(key)
        .populate(populated)
        .sort(options && options.sort === 'desc' ? { createdAt: -1 } : { createdAt: 1 })
        .select(options && options?.select ? options?.select : [])
        .session(session || null);

      return Promise.resolve(result as mongoose.HydratedDocument<T>);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async aggregation(pipeline: any[]): Promise<any> {
    try {
      const result = await this._repository.aggregate(pipeline)
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async findAllWithPagination(options: {
    query?: Record<string, any>,
    queryFields?: Record<string, any>,
    misc?: {
      populated?: any
      select?: string | string[]
    }
  }) {
    try {
      const { query, queryFields } = options
      const perpage = Number(query.perpage) || 10;
      const page = Number(query.page) || 1;
      const dateFrom: any = query.dateFrom || 'Jan 1 1970';
      const dateTo: any = query.dateTo || `${Date()}`;
      const sortBy: any = query.sortBy || 'createdAt';
      const orderBy = query.orderBy || '-1';
      const sortQuery = { [sortBy]: orderBy };
      var andArr = [];

      let myDateFrom: any;
      let myDateTo: any;

      myDateFrom = convertDate(dateFrom);
      myDateTo = convertDate(dateTo);
      const queryObj: any = { ...query, ...queryFields };
      const excludedFields = ['page', 'perpage', 'dateFrom', 'dateTo', 'search', 'sortBy', 'orderBy'];
      excludedFields.forEach((el) => delete queryObj[el]);

      for (const key of Object.keys(queryObj)) {
        if (key == 'createdAt') {
          andArr.push({ [key]: { $gte: myDateFrom, $lt: myDateTo } });
        } else {
          andArr.push({
            [key]: String(queryObj[key])
          });
          // andArr.push({ [key]: queryObj[key] })
        }
      }
      // https://stackoverflow.com/questions/35832113/and-expression-must-be-a-nonempty-array
      const searchQuery = {
        $and: andArr
      };
      const populated = !isEmpty(options) && options.misc ? options.misc.populated || [] : this._populateOnFind || []
      const selected = !isEmpty(options) && options.misc ? options.misc.select || [] : []


      const filterQuery = isEmpty(andArr) ? {} : searchQuery;
      const total = await this._repository.countDocuments(filterQuery as any);
      console.log("FILTER QUERY", filterQuery)
      const data = await this._repository
        .find(filterQuery as any)
        .populate(populated)
        .limit(perpage)
        .skip(page * perpage - perpage)
        .sort(sortQuery)
        .select(selected)
        .lean();
      return Promise.resolve({
        data,
        pagination: {
          hasPrevious: page > 1,
          prevPage: page - 1,
          hasNext: page < Math.ceil(total / perpage),
          next: page + 1,
          currentPage: Number(page),
          total: total,
          pageSize: perpage,
          lastPage: Math.ceil(total / perpage)
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async search(options: { query: PaginationType, populate?: string | string[] }) {
    try {
      const { q } = options?.query
      const perpage = Number(options?.query.perpage) || 10;
      const page = Number(options?.query.page) || 1;

      const searchRecord = {
        $text: {
          $search: q,
          $language: 'en',
          $caseSensitive: false
        }
      } as FilterQuery<T>;
      const total = await this._repository.countDocuments(searchRecord);
      const data = await this._repository
        .find(searchRecord, { score: { $meta: 'textScore' } })
        .populate(options?.populate)
        .limit(perpage)
        .skip(page * perpage - perpage)
        .sort({ score: { $meta: 'textScore' } });
      return Promise.resolve({
        data,
        pagination: {
          hasPrevious: page > 1,
          prevPage: page - 1,
          hasNext: page < Math.ceil(total / perpage),
          next: page + 1,
          currentPage: Number(page),
          total: total,
          pageSize: perpage,
          lastPage: Math.ceil(total / perpage)
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
