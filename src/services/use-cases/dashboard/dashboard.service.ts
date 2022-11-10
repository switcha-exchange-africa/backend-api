import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";
import { IErrorReporter } from "src/core/types/error";
import { ResponseState } from "src/core/types/response";
import { UtilsServices } from "../utils/utils.service";

@Injectable()
export class DashboardServices {
  constructor(
    private data: IDataServices,
    private readonly utilsService: UtilsServices,

  ) { }

  async adminDashboard() {
    try {
      let today: any = new Date();
      today.setHours(0, 0, 0, 0)
      const first = today.getDate() - today.getDay();
      const last = first + 6;
      const firstday = new Date(today.setDate(first)).toUTCString();
      const lastday = new Date(today.setDate(last)).toUTCString();
      const firstDayMonth = new Date(today.setDate(1));
      const lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      lastDayMonth.setHours(23, 59, 59, 0);
      today = new Date().setHours(0, 0, 0, 0);
      const updateToday = new Date()
      const year = new Date(updateToday.setMonth(updateToday.getMonth() - 12))
      console.log("first", first)
      console.log("last", last)
      console.log("firstDay", firstday)
      console.log("lastday", lastday)
      console.log("last year", year)

      const [transactionsVolume, totalUsers, totalTransactionVolume, dailyUserData, weeklyUserData, monthlyUserData, yearlyUserData] = await Promise.all([
        this.data.transactions.aggregation([

          {
            $group: { _id: "$currency", total: { $sum: "$amount" } }
          }
        ]
        ),
        this.data.users.find({}),
        this.data.transactions.aggregation([

          {
            $group: { _id: null, total: { $sum: "$amount" } }
          }
        ]
        ),
        this.data.users.find(
          {
            createdAt: {
              $gte: today
            }
          }),
        this.data.users.find(
          {
            createdAt: {
              $gte: firstday,
              $lte: lastday
            }
          }),

        this.data.users.find(
          {
            createdAt: {
              $gte: firstDayMonth,
              $lte: lastDayMonth
            }
          }),
          this.data.users.find(
            {
              createdAt: {
                $gte: year,
                $lte: today
              }
            })
      ])

      return {
        message: `Aggregation data retrieved successfully`,
        data: {
          volumes: transactionsVolume,
          totalUsers: totalUsers.length,
          totalTransactionVolume: totalTransactionVolume,
          dailyUserData,
          weeklyUserData,
          monthlyUserData,
          yearlyUserData,
          totalDailyUser: dailyUserData.length,
          totalWeeklyUser: weeklyUserData.length,
          totalMonthlyUser: monthlyUserData.length,
          totalYearlyUser: yearlyUserData.length,

        },
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'GET ADMIN DASHBOARD',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
}


