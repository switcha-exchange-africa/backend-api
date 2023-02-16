import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";
import { CUSTOM_TRANSACTION_TYPE } from "src/core/entities/transaction.entity";
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


      const [
        transactionsVolume,
        totalUsers,
        totalTransactionVolume,
        dailyUserData,
        weeklyUserData,
        monthlyUserData,
        yearlyUserData,
        totalDeposit,
        totalSwaps,
        totalWithdrawals,
        totalDepositAmount,
        totalSwapAMount
      ] = await Promise.all([
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
          }),
        this.data.transactions.find({ customTransactionType: CUSTOM_TRANSACTION_TYPE.DEPOSIT }, { isLean: true }),
        this.data.transactions.find({ customTransactionType: CUSTOM_TRANSACTION_TYPE.SWAP }, { isLean: true }),
        this.data.withdrawals.find({}, { isLean: true }),
        this.data.transactions.aggregation([
          {
            $match:
            {
              customTransactionType: CUSTOM_TRANSACTION_TYPE.DEPOSIT
            }
          },
          {
            $group: { _id: "$currency", total: { $sum: "$amount" } }
          }
        ]
        ),
        this.data.transactions.aggregation([
          {
            $match:
            {
              customTransactionType: CUSTOM_TRANSACTION_TYPE.SWAP
            }
          },
          {
            $group: { _id: "$currency", total: { $sum: "$amount" } }
          }
        ]
        )
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
          totalDeposit: totalDeposit.length,
          totalSwaps: totalSwaps.length,
          totalWithdrawals: totalWithdrawals.length,
          totalDepositAmount,
          totalSwapAMount
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


