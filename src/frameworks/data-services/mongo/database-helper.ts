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
    try {
      // try {

      await session.withTransaction(async () => {
        await transactionProcess(session);  // performs transaction

      })
    } catch (error) {
      Logger.error("--- ERROR FROM TRANSACTION --------")
      Logger.error(error)
      Logger.error(error.type)
      Logger.error(error.errorLabels)

      // // If we have no error labels rethrow the error
      // if (error.errorLabels == null) {
      //   throw error;
      // }

      // Our error contains UnknownTransactionCommitResult label
      if (error && error.errorLabels && error.errorLabels.includes("UnknownTransactionCommitResult")) {
        // Retry the transaction commit
        var exception = await retryUnknownTransactionCommit(session);
        // No error, commit as successful, break the while loop
        // Error has no errorLabels, rethrow the error
        if (exception.errorLabels == null) throw exception;

        // Error labels include TransientTransactionError label
        // Start while loop again, creating a new transaction


        // Rethrow the error
        throw exception;
      }
      if (error && error.errorLabels && error.errorLabels.includes("TransientTransactionError")) {
        // Retry the transaction commit
        var exception = await retryUnknownTransactionCommit(session);
        // No error, commit as successful, break the while loop
        // Error has no errorLabels, rethrow the error
        if (exception.errorLabels == null) throw exception;

        // Error labels include TransientTransactionError label
        // Start while loop again, creating a new transaction


        // Rethrow the error
        throw exception;
      }
      // await session.abortTransaction();
      // await session.endSession();

      // const exception2 = await retryUnknownTransactionCommit(session)
      return Promise.reject(error)
    } finally {
      await session.endSession();
      // await connection.close();
    }


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


function retryUnknownTransactionCommit(session) {
  while (true) {
    try {
      // Attempt to commit the transaction
      session.commitTransaction();
      break;
    } catch (err) {
      if (err.errorLabels != null
        && err.errorLabels.includes("UnknownTransactionCommitResult")) {
        // Keep retrying the transaction
        continue;
      }
      if (err.errorLabels != null
        && err.errorLabels.includes("TransientTransactionError")) {
        // Keep retrying the transaction
        continue;
      }
      // The transaction cannot be retried, 
      // return the exception
      return err;
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