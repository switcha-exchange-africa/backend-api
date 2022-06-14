import { ConsoleLogger, ConsoleLoggerOptions, Injectable } from '@nestjs/common';
import { LOGS_LEVEL } from 'src/configuration';
import { CustomLoggerEntity, CustomLoggerErrorType, CustomLoggerMethod, CustomLoggerOperationType } from 'src/core/entities/CustomLogger';
import { EventEmitter2 } from '@nestjs/event-emitter';


@Injectable()
class CustomLogger extends ConsoleLogger {

  constructor(
    context: string,
    options: ConsoleLoggerOptions,
    private emitter: EventEmitter2

  ) {

    super(
      context,
      {
        ...options,
        logLevels: LOGS_LEVEL()
      }
    );

  }

  log(
    message: string,
    context?: string,
    payload?: {
      endpoint?: string;
      statusCode?: string;
      method?: CustomLoggerMethod;
      operation?: string;
      type?: string;
      error?: CustomLoggerErrorType;
      operationType?: CustomLoggerOperationType;
      userId?: string;
      walletId?: string;
      ip?: string;
    }
  ) {
    super.log.apply(this, [message, context]);
    this.emitter.emit("log.entry", { ...payload, message, context, level: 'log' } as CustomLoggerEntity)

  }
  error(
    message: string,
    stack?: string,
    context?: string,
    payload?: {

      endpoint?: string;
      statusCode?: string;
      method?: CustomLoggerMethod;
      operation?: string;
      type?: string;
      error?: CustomLoggerErrorType;
      operationType?: CustomLoggerOperationType;
      userId?: string;
      walletId?: string;
      ip?: string;
      stack?: string
    }
  ) {
    super.error.apply(this, [message, stack, context]);
    this.emitter.emit("log.entry", { ...payload, message, stack, context, level: 'error' } as CustomLoggerEntity)

  }
  warn(
    message: string,
    context?: string,
    payload?: {
      endpoint?: string;
      statusCode?: string;
      method?: CustomLoggerMethod;
      operation?: string;
      type?: string;
      error?: CustomLoggerErrorType;
      operationType?: CustomLoggerOperationType;
      userId?: string;
      walletId?: string;
      ip?: string;
      stack?: string
    }
  ) {
    super.warn.apply(this, [message, context]);
    this.emitter.emit("log.entry", { ...payload, message, context, level: 'warn' } as CustomLoggerEntity)

  }
  debug(
    message: string,
    context?: string,
    payload?: {
      endpoint?: string;
      statusCode?: string;
      method?: CustomLoggerMethod;
      operation?: string;
      type?: string;
      error?: CustomLoggerErrorType;
      operationType?: CustomLoggerOperationType;
      userId?: string;
      walletId?: string;
      ip?: string;
      stack?: string
    }
  ) {
    super.debug.apply(this, [message, context]);
    this.emitter.emit("log.entry", { ...payload, message, context, level: 'debug' } as CustomLoggerEntity)

  }
  verbose(
    message: string,
    context?: string,
    payload?: {
      message: string;
      context?: string;
      endpoint?: string;
      statusCode?: string;
      method?: CustomLoggerMethod;
      operation?: string;
      type?: string;
      error?: CustomLoggerErrorType;
      operationType?: CustomLoggerOperationType;
      userId?: string;
      walletId?: string;
      ip?: string;
      stack?: string
    }
  ) {
    super.debug.apply(this, [message, context]);
    this.emitter.emit("log.entry", { ...payload, message, context, level: 'verbose' } as CustomLoggerEntity)

  }
}

export default CustomLogger;