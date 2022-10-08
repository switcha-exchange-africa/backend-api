/**
 * Rules for MONGODB Multi Document Transactions
 * All data modeling rules still applies
 * Transactions should be the most common operation
 * Pass in the session to all statements 
 * Implement retry logic , transactions can always abort
 * Plan for DDL operations
 */
import { Logger } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import * as mongoose from 'mongoose';

/**
 * Source: https://docs.mongodb.com/manual/reference/method/Session.commitTransaction/
 */
const databaseHelper = {
  runTransactionWithRetry: async (txnFunc: any, session: ClientSession) => {
    try {
      Logger.log("-------- runTransactionWithRetry function ----------")
      await session.startTransaction()
      await txnFunc(session)
        ;  // performs transaction

      // commit transaction
      await session.commitTransaction(); // Uses write concern set at transaction start.
      Logger.log("-------- runTransactionWithRetry function ----------")
      Logger.log("Transaction commited.............")
      // let retries = 1
      // while (retries < 3) {
      //   if (retries < 1) break
      //   try {

      //   } catch (error: any) {
      //     if (error.hasOwnProperty("errorLabels") && error.errorLabels.includes("TransientTransactionError")) {
      //       Logger.error("TransientTransactionError, retrying transaction ...");
      //       retries++
      //       continue;
      //     } else if (error.hasOwnProperty("errorLabels") && error.errorLabels.includes("UnknownTransactionCommitResult")) {
      //       Logger.error("UnknownTransactionCommitResult, retrying commit operation ...");
      //       retries++
      //       continue;
      //     } else {
      //       await session.abortTransaction();
      //       throw new Error(error)
      //       //  break;
      //       // throw new Error(error);
      //     }

      //   }
      // }
    } catch (err) {
      await session.abortTransaction();
      throw new Error(err);
    }

  },
  executeTransaction: async (transactionProcess: any, connection: mongoose.Connection) => {
    const session = await connection.startSession();
    try {
      Logger.log("-------- runTransactionWithRetry function ----------")
      await session.startTransaction()
      await transactionProcess(session);  // performs transaction

      // commit transaction
      await session.commitTransaction(); // Uses write concern set at transaction start.
      Logger.log("-------- runTransactionWithRetry function ----------")
      Logger.log("Transaction commited.............")
      // await databaseHelper.runTransactionWithRetry(transactionProcess, session);

    } catch (error: any) {
      await session.abortTransaction();

      throw new Error(error);
    } finally {
      session.endSession();
      // connection.close()
      // .then(() => {
      //   console.log("Connection Closed")
      // })
    }

  },
  executeTransactionWithStartTransaction: async (transactionProcess: any, connection: mongoose.Connection) => {
    const session = await connection.startSession();
    // try {
    session.withTransaction(async () => {
      await transactionProcess(session);  // performs transaction
      Logger.log("-------- Transaction Commited  ----------")

    })
    // await session.startTransaction()
    // await transactionProcess(session);  // performs transaction

    // // commit transaction
    // await session.commitTransaction(); // Uses write concern set at transaction start.
    // Logger.log("-------- runTransactionWithRetry function ----------")
    // Logger.log("Transaction commited.............")
    // // await databaseHelper.runTransactionWithRetry(transactionProcess, session);

    // } catch (error: any) {
    //   await session.abortTransaction();

    //   throw new Error(error);
    // } finally {
    //   session.endSession();
    //   // connection.close()
    //   // .then(() => {
    //   //   console.log("Connection Closed")
    //   // })
    // }

  },
  executeTransactionII: async (transactionProcess: any) => {
    const session = await mongoose.startSession();
    try {
      Logger.log("-------- runTransactionWithRetry function ----------")
      await session.startTransaction()
      await transactionProcess(session);  // performs transaction

      // commit transaction
      await session.commitTransaction(); // Uses write concern set at transaction start.
      Logger.log("-------- runTransactionWithRetry function ----------")
      Logger.log("Transaction commited.............")
      // await databaseHelper.runTransactionWithRetry(transactionProcess, session);
    } catch (error: any) {
      await session.abortTransaction();

      throw new Error(error);
    } finally {
      await session.endSession();
    }

  },
  runTransactionWithRetryII: async (txnFunc: any) => {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
      await txnFunc(session);
    } catch (error) {
      console.log('Transaction aborted. Caught exception during transaction.');

      // If transient error, retry the whole transaction
      if (error.errorLabels && error.errorLabels.indexOf('TransientTransactionError') >= 0) {
        console.log('TransientTransactionError, retrying transaction ...');
        await databaseHelper.runTransactionWithRetryII(txnFunc);
      } else {
        session.abortTransaction();
        console.log("runTransactionWithRetry error: ");
        throw error;
      }
    }
  }

}

export default databaseHelper



// async function commitWithRetry(session) {
//   try {
//     await session.commitTransaction();
//     console.log('Transaction committed.');
//   } catch (error) {
//     if (
//       error.errorLabels &&
//       error.errorLabels.indexOf('UnknownTransactionCommitResult') >= 0
//     ) {
//       console.log('UnknownTransactionCommitResult, retrying commit operation ...');
//       await commitWithRetry(session);
//     } else {
//       console.log('Error during commit ...');
//       throw error;
//     }
//   }
// }