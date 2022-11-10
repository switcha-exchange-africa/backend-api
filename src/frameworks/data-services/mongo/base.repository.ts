// import { Model, FilterQuery, UpdateQuery, ClientSession } from 'mongoose';
// import { Request } from 'express';
// import utils from '../../utils';

// /**
//  * @param I - interface of object
//  * @param D - mongoose document of object
//  * @param _model - model instance of @param D
//  * @func create  - save to DB
//  * @func find - query from DB
//  * @func findOne - query a single document from DB
//  * @func update - update a document from DB
//  * @func delete - delete a document from DB
//  */
// export abstract class BaseRepository<D, I> {
//     public readonly _model: Model<D>;

//     constructor(model: Model<D>) {
//         this._model = model;
//     }
//     /** create  functionality*/

//     async create(payload: I | I[], session?: ClientSession) {
//         try {
//             const instance = new this._model(payload);
//             const data = session ? await instance.save({ session }) : await instance.save();
//             return Promise.resolve(data);
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }
//     async insertMany(payload: I | I[], session?: ClientSession) {
//         try {
//             const data = session ? this._model.insertMany(payload, { session }) : this._model.insertMany(payload);
//             return Promise.resolve(data);
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }

//     /** find functionality */
//     async find(req: Request, fields?: any, populate: any = [], queryFields?: Record<string, any>) {
//         try {
//             const { query } = req;
//             const perpage = Number(query.perpage) || 10;
//             const page = Number(query.page) || 1;
//             const dateFrom: any = query.dateFrom || 'Jan 1 1970';
//             const dateTo: any = query.dateTo || `${Date()}`;
//             const search = query.search || '';
//             const sortBy: any = query.sortBy || 'createdAt';
//             const orderBy = query.orderBy || '-1';
//             const sortQuery = { [sortBy]: orderBy };
//             var andArr = [];

//             let myDateFrom: any;
//             let myDateTo: any;

//             myDateFrom = utils.convertDate(dateFrom);
//             myDateTo = utils.convertDate(dateTo);

//             const queryObj: any = { ...query, ...queryFields };

//             const excludedFields = ['page', 'perpage', 'dateFrom', 'dateTo', 'search', 'sortBy', 'orderBy'];
//             excludedFields.forEach((el) => delete queryObj[el]);

//             for (const key of Object.keys(queryObj)) {
//                 if (key == 'createdAt') {
//                     andArr.push({ [key]: { $gte: myDateFrom, $lt: myDateTo } });
//                 } else {
//                     andArr.push({ [key]: new RegExp(String(queryObj[key])) });
//                     // andArr.push({ [key]: queryObj[key] })
//                 }
//             }

//             var searchFields = fields.map((field: any) => ({ [field]: new RegExp(String(search), 'i') }));

//             andArr.push({ $or: searchFields });

//             const searchQuery = {
//                 $and: andArr
//             };

//             const total = await this._model.countDocuments(searchQuery as any);
//             const data = await this._model
//                 .find(searchQuery as any)
//                 .populate(populate || '')
//                 .limit(perpage)
//                 .skip(page * perpage - perpage)
//                 .sort(sortQuery);

//             return Promise.resolve({
//                 data,
//                 pagination: {
//                     hasPrevious: page > 1,
//                     prevPage: page - 1,
//                     hasNext: page < Math.ceil(total / perpage),
//                     next: page + 1,
//                     currentPage: Number(page),
//                     total: total,
//                     pageSize: perpage,
//                     lastPage: Math.ceil(total / perpage)
//                 }
//             });
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }
//     async findAllQueryV2(
//         fields: FilterQuery<D>,
//         options?: {
//             select?: string;
//             isLean?: boolean;
//             isCount?: boolean;
//         }
//     ) {
//         try {
//             const data = options?.isLean ? await this._model.find(fields).select(options?.select).lean() : await this._model.find(fields).select(options?.select);
//             const result = options?.isCount ? await this._model.countDocuments(fields) : data;
//             return Promise.resolve(result);
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }
//     async findAllQuery(
//         fields: FilterQuery<D>,
//         options?: {
//             select?: string | string[];
//             isLean?: boolean;
//         }
//     ) {
//         try {
//             const data = options?.isLean ? await this._model.find(fields).select(options?.select).lean() : await this._model.find(fields).select(options?.select);
//             return Promise.resolve(data);
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }
//     /** find v2 */
//     async findV2(query: Record<string, any>, queryFields: Record<string, any>, populate?: string | string[]) {
//         try {
//             const perpage = Number(query.perpage) || 10;
//             const page = Number(query.page) || 1;
//             const dateFrom: any = query.dateFrom || 'Jan 1 1970';
//             const dateTo: any = query.dateTo || `${Date()}`;
//             const sortBy: any = query.sortBy || 'createdAt';
//             const orderBy = query.orderBy || '-1';
//             const sortQuery = { [sortBy]: orderBy };
//             var andArr = [];

//             let myDateFrom: any;
//             let myDateTo: any;

//             myDateFrom = utils.convertDate(dateFrom);
//             myDateTo = utils.convertDate(dateTo);

//             const queryObj: any = { ...query, ...queryFields };
//             const excludedFields = ['page', 'perpage', 'dateFrom', 'dateTo', 'search', 'sortBy', 'orderBy'];
//             excludedFields.forEach((el) => delete queryObj[el]);

//             for (const key of Object.keys(queryObj)) {
//                 if (key == 'createdAt') {
//                     andArr.push({ [key]: { $gte: myDateFrom, $lt: myDateTo } });
//                 } else {
//                     andArr.push({
//                         [key]: String(queryObj[key])
//                     });
//                     // andArr.push({ [key]: queryObj[key] })
//                 }
//             }
//             // https://stackoverflow.com/questions/35832113/and-expression-must-be-a-nonempty-array
//             const searchQuery = {
//                 $and: andArr
//             };

//             const filterQuery = utils.isEmpty(andArr) ? {} : searchQuery;
//             const total = await this._model.countDocuments(filterQuery as any);

//             console.log(filterQuery);
//             const data = await this._model
//                 .find(filterQuery as any)
//                 .populate(populate || '')
//                 .limit(perpage)
//                 .skip(page * perpage - perpage)
//                 .sort(sortQuery);

//             return Promise.resolve({
//                 data,
//                 pagination: {
//                     hasPrevious: page > 1,
//                     prevPage: page - 1,
//                     hasNext: page < Math.ceil(total / perpage),
//                     next: page + 1,
//                     currentPage: Number(page),
//                     total: total,
//                     pageSize: perpage,
//                     lastPage: Math.ceil(total / perpage)
//                 }
//             });
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }
//     /** update functionality */
//     async update(key: FilterQuery<D>, payload: UpdateQuery<D>, session?: ClientSession) {
//         try {
//             const result = await this._model.findOneAndUpdate({ ...key }, { ...payload }, { new: true }).session(session || null);
//             return Promise.resolve(result);
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }

//     async updateOne(key: FilterQuery<D>, payload: UpdateQuery<D>, session?: ClientSession) {
//         try {
//             const result = await this._model.findOneAndUpdate({ ...key }, { ...payload }, { new: true }).session(session || null);
//             return Promise.resolve(result);
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }

//     /** findOne functionality */
//     async findOne(key: FilterQuery<D>, populate?: string | string[], session?: ClientSession | null, options?: { select?: string | string[] }) {
//         try {
//             const result = await this._model
//                 .findOne(key)
//                 .populate(populate || '')
//                 .select(options?.select || '')
//                 .session(session || null);
//             return Promise.resolve(result);
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }
//     async findById(_id: string, populate?: string) {
//         try {
//             const result = await this._model.findById(_id).populate(populate || '');
//             return Promise.resolve(result);
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }
//     /** delete functionality */
//     async delete(key: FilterQuery<D>, session?: ClientSession) {
//         try {
//             const result = await this._model.findOneAndDelete({ ...key }).session(session || null);
//             return Promise.resolve(result);
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }

//     async deleteMany(key: FilterQuery<D>) {
//         try {
//             const result = await this._model.deleteMany({ ...key });
//             return Promise.resolve(result);
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }

//     async aggregate(aggregate: any) {
//         try {
//             const pipeline = await this._model.aggregate(aggregate);
//             return Promise.resolve(pipeline);
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }
//     async aggregationWithPagination(query: Record<string, any>, pipeline: any) {
//         try {
//             const perpage = Number(query.perpage) || 10;
//             const page = Number(query.page) || 1;
//             // const dateFrom: any = query.dateFrom || 'Jan 1 1970';
//             // const dateTo: any = query.dateTo || `${Date()}`;
//             // const sortBy: any = query.sortBy || 'createdAt';
//             // const orderBy = query.orderBy || '-1';
//             const sortQuery = {
//                 createdAt: -1
//             };
//             const skip = page * perpage - perpage;
//             pipeline.push({ $skip: skip }, { $limit: perpage }, { $sort: sortQuery });

//             const data = await this._model.aggregate(pipeline);
//             return Promise.resolve({
//                 data,
//                 pagination: {
//                     hasPrevious: page > 1,
//                     prevPage: page - 1,
//                     hasNext: page < Math.ceil(data?.length / perpage),
//                     next: page + 1,
//                     currentPage: Number(page),
//                     total: data?.length,
//                     pageSize: perpage,
//                     lastPage: Math.ceil(data?.length / perpage)
//                 }
//             });
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }
//     async search(query: Record<string, any>, search: any, populate?: string | string[]) {
//         try {
//             const perpage = Number(query.perpage) || 10;
//             const page = Number(query.page) || 1;

//             const searchRecord = {
//                 $text: {
//                     $search: search,
//                     $language: 'en',
//                     $caseSensitive: false
//                 }
//             } as FilterQuery<D>;
//             const total = await this._model.countDocuments(searchRecord);
//             const data = await this._model
//                 .find(searchRecord, { score: { $meta: 'textScore' } })
//                 .populate(populate || '')
//                 .limit(perpage)
//                 .skip(page * perpage - perpage)
//                 .sort({ score: { $meta: 'textScore' } });
//             return Promise.resolve({
//                 data,
//                 pagination: {
//                     hasPrevious: page > 1,
//                     prevPage: page - 1,
//                     hasNext: page < Math.ceil(total / perpage),
//                     next: page + 1,
//                     currentPage: Number(page),
//                     total: total,
//                     pageSize: perpage,
//                     lastPage: Math.ceil(total / perpage)
//                 }
//             });
//         } catch (e) {
//             return Promise.reject(e);
//         }
//     }
//     // async duration() {
//     //     try {
//     //         let today: any = new Date();
//     //         today.setHours(0, 0, 0, 0)
//     //         const first = today.getDate() - today.getDay();
//     //         const last = first + 6;
//     //         const firstday = new Date(today.setDate(first)).toUTCString();
//     //         const lastday = new Date(today.setDate(last)).toUTCString();
//     //         const firstDayMonth = new Date(today.setDate(1));
//     //         const lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
//     //         lastDayMonth.setHours(23, 59, 59, 0);
//     //         today = new Date().setHours(0, 0, 0, 0);
//     //         const [tDay, weekly, monthly] = await Promise.all([
//     //             await this._model.find(
//     //                 {
//     //                     createdAt: {
//     //                         $gte: today
//     //                     }
//     //                 }),
//     //             await this._model.find(
//     //                 {
//     //                     createdAt: {
//     //                         $gte: firstday,
//     //                         $lte: lastday
//     //                     }
//     //                 }),

//     //             await this._model.find(
//     //                 {
//     //                     createdAt: {
//     //                         $gte: firstDayMonth,
//     //                         $lte: lastDayMonth
//     //                     }
//     //                 })
//     //         ]);
//     //         return Promise.resolve({ tDay, weekly, monthly })
//     //     } catch (e) {
//     //         return Promise.reject(e)
//     //     }
//     // }
//     // async queryDuration(filter: FilterQuery<D>) {
//     //     try {
//     //         var today: any = new Date().setHours(0, 0, 0, 0);
//     //         const first = today.getDate() - today.getDay();
//     //         const firstDayWeek = new Date(today.setDate(first));
//     //         const lastDayWeek = new Date(today.setDate(first + 6));
//     //         const firstDayMonth = new Date(today.setDate(1));
//     //         const lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
//     //         lastDayWeek.setHours(23, 59, 59, 0);
//     //         lastDayMonth.setHours(23, 59, 59, 0);
//     //         today = new Date().setHours(0, 0, 0, 0);
//     //         const pipeline = [{
//     //             $match: { ...filter }
//     //         }, {
//     //             $group: {
//     //                 "_id": "",
//     //                 "today": {
//     //                     $push: {
//     //                         $cond: {
//     //                             if: {
//     //                                 $gte: ["$createdAt", new Date(today)]
//     //                             },
//     //                             then: "$$ROOT",
//     //                             else: ''
//     //                         }
//     //                     }
//     //                 },
//     //                 "week": {
//     //                     $push: {
//     //                         $cond: [{
//     //                             $and: [{
//     //                                 $gte: ["$createdAt", new Date(firstDayWeek)]
//     //                             },
//     //                             {
//     //                                 $lte: ["$createdAt", new Date(lastDayWeek)]
//     //                             }
//     //                             ]
//     //                         },
//     //                             "$$ROOT",
//     //                             ''
//     //                         ]
//     //                     }
//     //                 },
//     //                 "month": {
//     //                     $push: {
//     //                         $cond: [{
//     //                             $and: [{
//     //                                 $gte: ["$createdAt", new Date(firstDayMonth)]
//     //                             },
//     //                             {
//     //                                 $lte: ["$createdAt", new Date(lastDayMonth)]
//     //                             }
//     //                             ]
//     //                         },
//     //                             "$$ROOT",
//     //                             ''
//     //                         ]
//     //                     }
//     //                 }
//     //             }
//     //         }]

//     //         const data = await this._model.aggregate(pipeline);
//     //         console.log(data)
//     //         return Promise.resolve(data);
//     //     } catch (e) {

//     //     }
//     // }
// }
